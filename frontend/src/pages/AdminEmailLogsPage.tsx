import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Trash2, RefreshCw, Mail, AlertCircle, CheckCircle,
  Search, X, ExternalLink, Bug, Copy, Check, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useConfirm } from '../context/ConfirmContext';
import { adminApi } from '../api/admin';
import { Button } from '../components/common/Button';
import { formatDateTime } from '../utils/formatters';
import type { EmailLog, EmailLogStatus, EmailLogType } from '../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const EMAIL_TYPE_COLORS: Record<EmailLogType, string> = {
  ISSUE_ASSIGNED: 'bg-blue-100 text-blue-700',
  STATUS_CHANGED: 'bg-purple-100 text-purple-700',
  COMMENT_ADDED:  'bg-yellow-100 text-yellow-700',
  ISSUE_CREATED:  'bg-green-100 text-green-700',
};

function typeLabel(type: EmailLogType, t: (k: string) => string) {
  const parts = type.split('_').map((w) => w.charAt(0) + w.slice(1).toLowerCase());
  return t(`emailLogs.type${parts.join('')}`);
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handle}
      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Đã chép' : 'Copy'}
    </button>
  );
}

// ─── Error detail modal ───────────────────────────────────────────────────────

function ErrorDetailModal({ log, onClose }: { log: EmailLog; onClose: () => void }) {
  const { t } = useTranslation();
  const [stackExpanded, setStackExpanded] = useState(false);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <Bug className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">{t('emailLogs.errorDetail')}</h2>
              <p className="text-xs text-gray-400">{formatDateTime(log.sentAt)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-400 mb-1">{t('emailLogs.colRecipient')}</p>
              <p className="text-gray-800 font-mono text-xs break-all">{log.recipient}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-medium text-gray-400 mb-1">{t('emailLogs.colType')}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EMAIL_TYPE_COLORS[log.emailType]}`}>
                {typeLabel(log.emailType, t)}
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 col-span-2">
              <p className="text-xs font-medium text-gray-400 mb-1">{t('emailLogs.colSubject')}</p>
              <p className="text-gray-800 text-sm">{log.subject}</p>
            </div>
            {log.issueId && (
              <div className="bg-gray-50 rounded-xl p-3 col-span-2">
                <p className="text-xs font-medium text-gray-400 mb-1">{t('emailLogs.colIssue')}</p>
                <Link
                  to={`/issues/${log.issueId}`}
                  onClick={onClose}
                  className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  #{log.issueId} — {log.issueTitle}
                </Link>
              </div>
            )}
          </div>

          {/* Error message */}
          {log.errorMessage && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">
                  {t('emailLogs.errorMessage')}
                </p>
                <CopyButton text={log.errorMessage} />
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <p className="text-sm text-red-700 font-mono leading-relaxed break-all whitespace-pre-wrap">
                  {log.errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Stack trace */}
          {log.errorStack && (
            <div>
              <button
                onClick={() => setStackExpanded((v) => !v)}
                className="w-full flex items-center justify-between mb-2 group"
              >
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-700 transition-colors">
                  {t('emailLogs.stackTrace')}
                </p>
                <span className="flex items-center gap-1 text-xs text-gray-400 group-hover:text-gray-600">
                  {stackExpanded
                    ? <><ChevronUp className="w-3.5 h-3.5" />{t('emailLogs.collapse')}</>
                    : <><ChevronDown className="w-3.5 h-3.5" />{t('emailLogs.expand')}</>
                  }
                </span>
              </button>

              {stackExpanded && (
                <div className="bg-gray-900 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
                    <span className="text-xs text-gray-400">Stack trace</span>
                    <CopyButton text={log.errorStack} />
                  </div>
                  <pre className="text-xs text-green-400 font-mono p-4 overflow-x-auto max-h-64 leading-relaxed whitespace-pre-wrap break-all">
                    {log.errorStack}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* No error info fallback */}
          {!log.errorMessage && !log.errorStack && (
            <div className="text-center py-8 text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{t('emailLogs.noErrorInfo')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminEmailLogsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const confirm = useConfirm();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<EmailLogStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<EmailLogType | ''>('');
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ['admin', 'email-logs', statusFilter, typeFilter, search],
    queryFn: () => adminApi.getEmailLogs({
      status: statusFilter || undefined,
      emailType: typeFilter || undefined,
      search: search || undefined,
    }),
  });

  const deleteOne = useMutation({
    mutationFn: (id: number) => adminApi.deleteEmailLog(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'email-logs'] });
      toast.success(t('emailLogs.deleted'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const clearAll = useMutation({
    mutationFn: () => adminApi.clearEmailLogs(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'email-logs'] });
      toast.success(t('emailLogs.cleared'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const handleClearAll = async () => {
    const ok = await confirm({
      title: t('emailLogs.clearTitle'),
      description: t('emailLogs.clearConfirm'),
      confirmLabel: t('emailLogs.clearAll'),
      variant: 'danger',
    });
    if (!ok) return;
    clearAll.mutate();
  };

  const sentCount = logs.filter((l) => l.status === 'SENT').length;
  const failedCount = logs.filter((l) => l.status === 'FAILED').length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('emailLogs.title')}</h1>
          <p className="text-gray-500 mt-1">{t('emailLogs.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4" />
            {t('emailLogs.refresh')}
          </Button>
          {logs.length > 0 && (
            <Button variant="danger" onClick={handleClearAll} loading={clearAll.isPending}>
              <Trash2 className="w-4 h-4" />
              {t('emailLogs.clearAll')}
            </Button>
          )}
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">{t('emailLogs.sent')}: {sentCount}</span>
        </div>
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium text-red-700">{t('emailLogs.failed')}: {failedCount}</span>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-600">{t('emailLogs.total')}: {logs.length}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('emailLogs.searchPlaceholder')}
            className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as EmailLogStatus | '')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">{t('emailLogs.allStatuses')}</option>
          <option value="SENT">{t('emailLogs.statusSent')}</option>
          <option value="FAILED">{t('emailLogs.statusFailed')}</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as EmailLogType | '')}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">{t('emailLogs.allTypes')}</option>
          <option value="ISSUE_ASSIGNED">{t('emailLogs.typeIssueAssigned')}</option>
          <option value="STATUS_CHANGED">{t('emailLogs.typeStatusChanged')}</option>
          <option value="COMMENT_ADDED">{t('emailLogs.typeCommentAdded')}</option>
          <option value="ISSUE_CREATED">{t('emailLogs.typeIssueCreated')}</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Mail className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">{t('emailLogs.empty')}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="divide-x divide-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-40">{t('emailLogs.colTime')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{t('emailLogs.colRecipient')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">{t('emailLogs.colSubject')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-36">{t('emailLogs.colType')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-24">{t('emailLogs.colStatus')}</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 w-20">{t('emailLogs.colIssue')}</th>
                <th className="w-20 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className={`transition-colors divide-x divide-gray-100 ${log.status === 'FAILED' ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-gray-50'}`}
                >
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {formatDateTime(log.sentAt)}
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-mono text-xs">{log.recipient}</td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-gray-800 truncate" title={log.subject}>{log.subject}</p>
                    {log.status === 'FAILED' && log.errorMessage && (
                      <p className="text-red-500 text-xs mt-0.5 truncate" title={log.errorMessage}>
                        {log.errorMessage}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${EMAIL_TYPE_COLORS[log.emailType]}`}>
                      {typeLabel(log.emailType, t)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {log.status === 'SENT' ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {t('emailLogs.statusSent')}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {t('emailLogs.statusFailed')}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {log.issueId ? (
                      <Link
                        to={`/issues/${log.issueId}`}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                        title={log.issueTitle}
                      >
                        <ExternalLink className="w-3 h-3" />
                        #{log.issueId}
                      </Link>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {log.status === 'FAILED' && (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title={t('emailLogs.viewError')}
                        >
                          <Bug className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteOne.mutate(log.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Error detail modal */}
      {selectedLog && (
        <ErrorDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
      )}
    </div>
  );
}
