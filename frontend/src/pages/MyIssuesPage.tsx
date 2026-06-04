import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Loader2, ClipboardList, ArrowRight, Search, CheckSquare, X, ChevronDown,
  Clock, Layers, MessageSquare, CalendarDays,
} from 'lucide-react';
import { ExportButton } from '../components/common/ExportButton';
import { exportToExcel, exportToPdf, ISSUE_EXPORT_COLUMNS, mapIssuesToRows } from '../utils/exportUtils';
import { useMyIssues } from '../hooks/useIssues';
import { useQueryClient } from '@tanstack/react-query';
import { issueKeys } from '../hooks/useIssues';
import { issuesApi } from '../api/issues';
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/common/Badge';
import { Avatar } from '../components/common/Avatar';
import { formatDate } from '../utils/formatters';
import { useSettingsStore } from '../store/settingsStore';
import toast from 'react-hot-toast';
import type { IssueStatus, IssuePriority } from '../types';

const STATUS_TABS: { value: IssueStatus | 'ALL'; label: string }[] = [
  { value: 'ALL',         label: 'Tất cả' },
  { value: 'TODO',        label: 'Chờ xử lý' },
  { value: 'IN_PROGRESS', label: 'Đang thực hiện' },
  { value: 'TESTING',     label: 'Kiểm thử' },
  { value: 'UAT',         label: 'UAT' },
  { value: 'DONE',        label: 'Hoàn thành' },
];

const STATUS_OPTIONS: IssueStatus[]  = ['TODO', 'IN_PROGRESS', 'TESTING', 'UAT', 'DONE'];
const PRIORITY_OPTIONS: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const envColor: Record<string, string> = {
  DEV:  'bg-slate-100 text-slate-600 border-slate-200',
  UAT:  'bg-amber-50  text-amber-700  border-amber-200',
  PROD: 'bg-red-50    text-red-700    border-red-200',
};
const severityDot: Record<string, string> = {
  MAJOR:    'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

function isOverdue(dateStr: string) { return new Date(dateStr) < new Date(); }
function dueFmt(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}

export function MyIssuesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: issues = [], isLoading } = useMyIssues();
  const cardFields = useSettingsStore((s) => s.cardFields);

  const [activeStatus, setActiveStatus]     = useState<IssueStatus | 'ALL'>('ALL');
  const [search, setSearch]                 = useState('');
  const [selected, setSelected]             = useState<Set<number>>(new Set());
  const [bulkLoading, setBulkLoading]       = useState(false);
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [showPriorityDrop, setShowPriorityDrop] = useState(false);

  const filtered = issues.filter((issue) => {
    const matchStatus = activeStatus === 'ALL' || issue.status === activeStatus;
    const matchSearch = !search
      || issue.title.toLowerCase().includes(search.toLowerCase())
      || (issue.issueKey ?? '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const countByStatus = (status: IssueStatus | 'ALL') =>
    status === 'ALL' ? issues.length : issues.filter((i) => i.status === status).length;

  const allVisibleSelected = filtered.length > 0 && filtered.every((i) => selected.has(i.id));
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) filtered.forEach((i) => next.delete(i.id));
      else filtered.forEach((i) => next.add(i.id));
      return next;
    });
  };
  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelected(new Set());

  const handleExportExcel = () => {
    exportToExcel('my-issues', 'Issue của tôi', ISSUE_EXPORT_COLUMNS, mapIssuesToRows(filtered));
  };
  const handleExportPdf = () => {
    exportToPdf('my-issues', 'Issue của tôi', `${filtered.length} issues · ${new Date().toLocaleDateString('vi-VN')}`, ISSUE_EXPORT_COLUMNS, mapIssuesToRows(filtered));
  };

  const applyBulkUpdate = async (data: { status?: IssueStatus; priority?: IssuePriority }) => {
    setBulkLoading(true);
    setShowStatusDrop(false);
    setShowPriorityDrop(false);
    try {
      await Promise.all([...selected].map((id) => issuesApi.update(id, data)));
      queryClient.invalidateQueries({ queryKey: issueKeys.all });
      toast.success(t('myIssues.bulkSuccess', { count: selected.size }));
      clearSelection();
    } catch {
      toast.error(t('myIssues.bulkError'));
    } finally {
      setBulkLoading(false);
    }
  };

  /* ── Build dynamic grid columns — fixed px so header & rows always align ── */
  const colDefs = [
    { key: 'checkbox',    always: true,                    width: '40px'  },
    { key: 'title',       always: true,                    width: '1fr'   },
    { key: 'workflow',    always: cardFields.workflowStep, width: '120px' },
    { key: 'environment', always: cardFields.environment,  width: '72px'  },
    { key: 'status',      always: true,                    width: '120px' },
    { key: 'priority',    always: cardFields.priority,     width: '100px' },
    { key: 'type',        always: cardFields.type,         width: '80px'  },
    { key: 'dueDate',     always: cardFields.dueDate,      width: '130px' },
    { key: 'estimate',    always: cardFields.estimate,     width: '110px' },
    { key: 'assignee',    always: cardFields.assignee,     width: '120px' },
    { key: 'updated',     always: true,                    width: '110px' },
  ].filter((c) => c.always);
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: colDefs.map((c) => c.width).join(' '),
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* ── Header ── */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('myIssues.title')}</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">{t('myIssues.subtitle', { count: issues.length })}</p>
        </div>
        <ExportButton
          onExportExcel={handleExportExcel}
          onExportPdf={handleExportPdf}
          disabled={filtered.length === 0}
          count={filtered.length}
        />
      </div>

      {/* ── Bulk action bar ── */}
      {someSelected && (
        <div className="mb-4 flex items-center gap-3 px-4 py-2.5 bg-blue-600 text-white rounded-xl shadow-md">
          <CheckSquare className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium flex-1">{t('myIssues.selected', { count: selected.size })}</span>

          <div className="relative">
            <button onClick={() => { setShowStatusDrop((v) => !v); setShowPriorityDrop(false); }} disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 rounded-lg text-sm font-medium disabled:opacity-50">
              {t('myIssues.bulkStatus')}<ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showStatusDrop && (
              <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1 min-w-36">
                {STATUS_OPTIONS.map((s) => (
                  <button key={s} onClick={() => applyBulkUpdate({ status: s })}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    {t(`status.${s}`)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setShowPriorityDrop((v) => !v); setShowStatusDrop(false); }} disabled={bulkLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-400 rounded-lg text-sm font-medium disabled:opacity-50">
              {t('myIssues.bulkPriority')}<ChevronDown className="w-3.5 h-3.5" />
            </button>
            {showPriorityDrop && (
              <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1 min-w-36">
                {PRIORITY_OPTIONS.map((p) => (
                  <button key={p} onClick={() => applyBulkUpdate({ priority: p })}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    {t(`priority.${p}`)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={clearSelection} className="p-1.5 hover:bg-blue-500 rounded-lg" title={t('myIssues.clearSelection')}>
            <X className="w-4 h-4" />
          </button>
          {bulkLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        </div>
      )}

      {/* ── Search + Tabs ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden mb-4">
        <div className="px-4 pt-3 pb-2.5 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('myIssues.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
        <div className="flex gap-1 px-4 py-2.5 overflow-x-auto">
          {STATUS_TABS.map((tab) => {
            const count = countByStatus(tab.value);
            const isActive = activeStatus === tab.value;
            return (
              <button key={tab.value} onClick={() => setActiveStatus(tab.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Issue list ── */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center py-12">
          <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-3">
            <ClipboardList className="w-7 h-7 text-gray-200 dark:text-gray-600" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('myIssues.empty')}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('myIssues.emptyDesc')}</p>
        </div>
      ) : (
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
          onClick={() => { setShowStatusDrop(false); setShowPriorityDrop(false); }}
        >
          {/* ── Table header ── */}
          <div
            style={gridStyle}
            className="grid bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-[11px] font-semibold text-gray-400 uppercase tracking-wide items-center divide-x divide-gray-200 dark:divide-gray-700"
          >
            <div className="flex items-center px-4 py-2.5">
              <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer" />
            </div>
            <span className="pl-3 py-2.5">{t('issue.titleLabel')}</span>
            {cardFields.workflowStep && <span className="text-center px-3 py-2.5 whitespace-nowrap overflow-hidden text-ellipsis">Workflow</span>}
            {cardFields.environment && <span className="text-center px-3 py-2.5 whitespace-nowrap overflow-hidden text-ellipsis">Env</span>}
            <span className="text-center px-3 py-2.5 whitespace-nowrap overflow-hidden text-ellipsis">{t('issue.status')}</span>
            {cardFields.priority  && <span className="text-center px-3 py-2.5 whitespace-nowrap overflow-hidden text-ellipsis">{t('issue.priority')}</span>}
            {cardFields.type      && <span className="text-center px-3 py-2.5 whitespace-nowrap overflow-hidden text-ellipsis">{t('issue.type')}</span>}
            {cardFields.dueDate   && <span className="text-center px-3 py-2.5 whitespace-nowrap overflow-hidden text-ellipsis">{t('issue.dueDate')}</span>}
            {cardFields.estimate  && <span className="text-center px-3 py-2.5 whitespace-nowrap overflow-hidden text-ellipsis">{t('issue.estimate')}</span>}
            {cardFields.assignee  && <span className="text-center px-3 py-2.5 whitespace-nowrap overflow-hidden text-ellipsis">{t('issue.assignee')}</span>}
            <span className="text-right px-3 py-2.5 whitespace-nowrap">{t('issue.updated')}</span>
          </div>

          {/* ── Rows ── */}
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {filtered.map((issue) => {
              const isSelected = selected.has(issue.id);
              const overdue = issue.dueDate && isOverdue(issue.dueDate);
              return (
                <div
                  key={issue.id}
                  style={gridStyle}
                  className={`grid items-stretch transition-colors group cursor-pointer border-b border-gray-100 dark:border-gray-800 divide-x divide-gray-200 dark:divide-gray-700 ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-blue-50/40 dark:hover:bg-gray-800/60'
                  }`}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                >
                  {/* Checkbox */}
                  <div className="flex items-center justify-center">
                    <input type="checkbox" checked={isSelected}
                      onChange={() => toggleOne(issue.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded text-blue-600 cursor-pointer" />
                  </div>

                  {/* ── Title cell — rich info ── */}
                  <div className="min-w-0 pl-3 py-3">
                    {/* Key + project */}
                    <div className="flex items-center gap-2 mb-0.5">
                      {cardFields.issueKey && issue.issueKey && (
                        <span className="text-[11px] font-mono text-gray-300 dark:text-gray-600 shrink-0">{issue.issueKey}</span>
                      )}
                      {!cardFields.issueKey && cardFields.issueId && (
                        <span className="text-[11px] font-mono text-gray-300 dark:text-gray-600 shrink-0">#{issue.id}</span>
                      )}
                      {issue.projectName && (
                        <span onClick={(e) => { e.stopPropagation(); navigate(`/projects/${issue.projectId}/board`); }}
                          className="text-xs text-blue-500 hover:text-blue-700 hover:underline shrink-0">{issue.projectKey}</span>
                      )}
                    </div>

                    {/* Title */}
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {issue.title}
                    </p>

                    {/* Progress bar */}
                    {cardFields.progress && issue.progressPercent != null && issue.progressPercent > 0 && (
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1 mt-1.5 max-w-xs">
                        <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${Math.min(100, issue.progressPercent)}%` }} />
                      </div>
                    )}

                    {/* Inline chips row */}
                    {(cardFields.labels && issue.labels) ||
                     (cardFields.module && issue.module) ||
                     (cardFields.severity && issue.severity && issue.severity !== 'MINOR') ? (
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        {cardFields.severity && issue.severity && issue.severity !== 'MINOR' && (
                          <span title={issue.severity} className={`w-2 h-2 rounded-full flex-shrink-0 ${severityDot[issue.severity]}`} />
                        )}
                        {cardFields.module && issue.module && (
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-400 dark:text-gray-500">
                            <Layers className="w-3 h-3" />{issue.module}
                          </span>
                        )}
                        {cardFields.labels && issue.labels && issue.labels.split(',').filter(Boolean).slice(0, 3).map((l) => (
                          <span key={l} className="text-[10px] px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-full">
                            {l.trim()}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {/* Last comment */}
                    {cardFields.lastComment && issue.lastCommentContent && (
                      <div className="flex items-start gap-1 mt-1.5 bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
                        <MessageSquare className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">
                          <span className="font-medium">{issue.lastCommentAuthor}:</span>{' '}{issue.lastCommentContent}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Workflow step */}
                  {cardFields.workflowStep && (
                    <div className="flex items-center justify-center px-3 py-3">
                      {issue.currentStepName ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                          style={{ background: (issue.currentStepColor ?? '#6b7280') + '20', color: issue.currentStepColor ?? '#6b7280', borderColor: (issue.currentStepColor ?? '#6b7280') + '50' }}>
                          {issue.currentStepName}
                        </span>
                      ) : <span className="text-gray-200 dark:text-gray-700 text-xs">—</span>}
                    </div>
                  )}

                  {/* Environment */}
                  {cardFields.environment && (
                    <div className="flex items-center justify-center px-3 py-3">
                      {issue.environment ? (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${envColor[issue.environment] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {issue.environment}
                        </span>
                      ) : <span className="text-gray-200 dark:text-gray-700 text-xs">—</span>}
                    </div>
                  )}

                  {/* Status — always */}
                  <div className="flex items-center justify-center px-3 py-3">
                    <StatusBadge status={issue.status} />
                  </div>

                  {/* Priority */}
                  {cardFields.priority && (
                    <div className="flex items-center justify-center px-3 py-3">
                      <PriorityBadge priority={issue.priority} />
                    </div>
                  )}

                  {/* Type */}
                  {cardFields.type && (
                    <div className="flex items-center justify-center px-3 py-3">
                      <TypeBadge type={issue.type} />
                    </div>
                  )}

                  {/* Due date */}
                  {cardFields.dueDate && (
                    <div className="flex items-center justify-center px-3 py-3">
                      {issue.dueDate ? (
                        <span className={`flex items-center gap-0.5 text-xs font-medium ${overdue ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>
                          <CalendarDays className="w-3 h-3" />{dueFmt(issue.dueDate)}
                        </span>
                      ) : <span className="text-gray-200 dark:text-gray-700 text-xs">—</span>}
                    </div>
                  )}

                  {/* Estimate */}
                  {cardFields.estimate && (
                    <div className="flex items-center justify-center px-3 py-3">
                      {issue.originalEstimateHours != null ? (
                        <span className="flex items-center gap-0.5 text-xs text-gray-400 dark:text-gray-500">
                          <Clock className="w-3 h-3" />{issue.originalEstimateHours}h
                        </span>
                      ) : <span className="text-gray-200 dark:text-gray-700 text-xs">—</span>}
                    </div>
                  )}

                  {/* Assignee */}
                  {cardFields.assignee && (
                    <div className="flex items-center justify-center px-3 py-3">
                      {issue.assignee
                        ? <Avatar user={issue.assignee} size="xs" />
                        : <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-600" />}
                    </div>
                  )}

                  {/* Updated — always */}
                  <div className="flex items-center justify-end gap-1 text-xs text-gray-400 dark:text-gray-500 px-3 py-3">
                    <span>{formatDate(issue.updatedAt)}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-200 dark:text-gray-600 group-hover:text-blue-400 flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-xs text-gray-400 dark:text-gray-500">
            {t('myIssues.showing', { shown: filtered.length, total: issues.length })}
          </div>
        </div>
      )}
    </div>
  );
}
