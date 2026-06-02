import { useState } from 'react';
import { Link2, Plus, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useIssueLinks, useAddIssueLink, useDeleteIssueLink } from '../../hooks/useIssueFeatures';
import type { IssueLinkType } from '../../types';
import { StatusBadge } from '../common/Badge';

interface Props {
  issueId: number;
}

const LINK_TYPE_OPTIONS: { value: IssueLinkType; label: string }[] = [
  { value: 'BLOCKS', label: 'blocks' },
  { value: 'IS_BLOCKED_BY', label: 'is blocked by' },
  { value: 'RELATES_TO', label: 'relates to' },
  { value: 'DUPLICATES', label: 'duplicates' },
  { value: 'IS_DUPLICATED_BY', label: 'is duplicated by' },
  { value: 'CLONES', label: 'clones' },
  { value: 'IS_CLONED_BY', label: 'is cloned by' },
];

const LINK_TYPE_COLORS: Record<string, string> = {
  BLOCKS: 'text-red-600 bg-red-50',
  IS_BLOCKED_BY: 'text-orange-600 bg-orange-50',
  RELATES_TO: 'text-blue-600 bg-blue-50',
  DUPLICATES: 'text-purple-600 bg-purple-50',
  IS_DUPLICATED_BY: 'text-purple-600 bg-purple-50',
  CLONES: 'text-gray-600 bg-gray-100',
  IS_CLONED_BY: 'text-gray-600 bg-gray-100',
};

export function IssueLinksSection({ issueId }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: links = [], isLoading } = useIssueLinks(issueId);
  const addLink = useAddIssueLink(issueId);
  const deleteLink = useDeleteIssueLink(issueId);

  const [open, setOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [linkType, setLinkType] = useState<IssueLinkType>('RELATES_TO');
  const [targetIssueId, setTargetIssueId] = useState('');

  const handleAdd = () => {
    const id = Number(targetIssueId.trim());
    if (!id || isNaN(id)) return;
    addLink.mutate({ targetIssueId: id, linkType }, {
      onSuccess: () => {
        setTargetIssueId('');
        setShowForm(false);
      },
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
      >
        <div className="flex items-center gap-2">
          <Link2 className="w-4 h-4 text-gray-500" />
          <span>{t('issue.links')}</span>
          {links.length > 0 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
              {links.length}
            </span>
          )}
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <p className="px-4 py-3 text-xs text-gray-400">{t('common.loading')}</p>
          ) : links.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-400">{t('issue.noLinks')}</p>
          ) : (
            links.map((link) => (
              <div key={link.id} className="flex items-center gap-2 px-4 py-2.5 group">
                <span className={`text-xs font-medium px-1.5 py-0.5 rounded whitespace-nowrap ${LINK_TYPE_COLORS[link.linkType] ?? 'text-gray-600 bg-gray-100'}`}>
                  {LINK_TYPE_OPTIONS.find((o) => o.value === link.linkType)?.label ?? link.linkType}
                </span>
                <button
                  onClick={() => navigate(`/issues/${link.issueId}`)}
                  className="flex items-center gap-2 flex-1 min-w-0 hover:text-blue-600 text-left"
                >
                  <span className="text-xs font-mono text-gray-400 shrink-0">{link.issueKey}</span>
                  <span className="text-sm text-gray-800 truncate group-hover:text-blue-600">{link.issueTitle}</span>
                </button>
                <StatusBadge status={link.issueStatus} />
                <button
                  onClick={() => deleteLink.mutate(link.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded transition-all"
                  title={t('common.delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}

          {/* Add form */}
          {showForm ? (
            <div className="px-4 py-3 bg-gray-50 space-y-2">
              <div className="flex gap-2">
                <select
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value as IssueLinkType)}
                  className="text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  {LINK_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder={t('issue.targetIssueId')}
                  value={targetIssueId}
                  onChange={(e) => setTargetIssueId(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowForm(false); }}
                  className="flex-1 text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!targetIssueId || addLink.isPending}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {t('common.add')}
                </button>
                <button
                  onClick={() => { setShowForm(false); setTargetIssueId(''); }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center gap-1.5 px-4 py-2.5 text-xs text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('issue.addLink')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
