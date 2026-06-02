import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X, Loader2, ClipboardList } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { searchApi, type SearchParams } from '../api/search';
import { useProjects } from '../hooks/useProjects';
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/common/Badge';
import { formatDate } from '../utils/formatters';
import type { IssueStatus, IssuePriority, IssueType } from '../types';

const STATUS_OPTIONS: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'TESTING', 'UAT', 'DONE'];
const PRIORITY_OPTIONS: IssuePriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TYPE_OPTIONS: IssueType[] = ['TASK', 'STORY', 'BUG', 'EPIC'];

const EMPTY: SearchParams = {
  projectId: undefined,
  status: '',
  priority: '',
  type: '',
  assigneeId: undefined,
  q: '',
};

export function AdvancedSearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: projects = [] } = useProjects();

  const [params, setParams] = useState<SearchParams>(EMPTY);
  const [submitted, setSubmitted] = useState<SearchParams | null>(null);

  const { data: results = [], isLoading, isFetching } = useQuery({
    queryKey: ['advanced-search', submitted],
    queryFn: () => searchApi.advancedSearch(submitted!),
    enabled: submitted !== null,
    staleTime: 0,
  });

  const hasFilters = Object.values(params).some((v) => v !== '' && v !== undefined && v !== null);

  const handleSearch = () => setSubmitted({ ...params });

  const handleClear = () => {
    setParams(EMPTY);
    setSubmitted(null);
  };

  const set = (key: keyof SearchParams, value: string | number | undefined) =>
    setParams((p) => ({ ...p, [key]: value }));

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('search.title')}</h1>
            <p className="text-sm text-gray-500">{t('search.subtitle')}</p>
          </div>
        </div>

        {/* Filter panel */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          {/* Text search */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">{t('search.keyword')}</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={params.q ?? ''}
                onChange={(e) => set('q', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                placeholder={t('search.keywordPlaceholder')}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Grid of selects */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Project */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">{t('search.project')}</label>
              <select
                value={params.projectId ?? ''}
                onChange={(e) => set('projectId', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('search.allProjects')}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.status')}</label>
              <select
                value={params.status ?? ''}
                onChange={(e) => set('status', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('search.any')}</option>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.priority')}</label>
              <select
                value={params.priority ?? ''}
                onChange={(e) => set('priority', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('search.any')}</option>
                {PRIORITY_OPTIONS.map((p) => <option key={p} value={p}>{t(`priority.${p}`)}</option>)}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.type')}</label>
              <select
                value={params.type ?? ''}
                onChange={(e) => set('type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('search.any')}</option>
                {TYPE_OPTIONS.map((tp) => <option key={tp} value={tp}>{t(`type.${tp}`)}</option>)}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              {hasFilters && (
                <button onClick={handleClear} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700">
                  <X className="w-3.5 h-3.5" /> {t('search.clearFilters')}
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
            >
              {(isLoading || isFetching) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {t('search.search')}
            </button>
          </div>
        </div>

        {/* Results */}
        {submitted !== null && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                {t('search.results')}
                {!isLoading && (
                  <span className="text-xs text-gray-400 font-normal">
                    — {results.length} {t('search.found')}
                  </span>
                )}
              </h2>
            </div>

            {isLoading || isFetching ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl py-16 flex flex-col items-center text-center">
                <ClipboardList className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-gray-500 text-sm">{t('search.noResults')}</p>
                <p className="text-gray-400 text-xs mt-1">{t('search.noResultsHint')}</p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span>{t('issue.titleLabel')}</span>
                  <span className="w-20 text-center">{t('issue.status')}</span>
                  <span className="w-16 text-center">{t('issue.priority')}</span>
                  <span className="w-16 text-center">{t('issue.type')}</span>
                  <span className="w-28">{t('search.project')}</span>
                  <span className="w-24 text-right">{t('issue.updated')}</span>
                </div>
                <div className="divide-y divide-gray-100">
                  {results.map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => navigate(`/issues/${issue.id}`)}
                      className="w-full grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 items-center px-4 py-3 hover:bg-blue-50/40 text-left group transition-colors"
                    >
                      {/* Title */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-mono text-gray-400 shrink-0">{issue.issueKey ?? `#${issue.id}`}</span>
                          {issue.labels && (
                            <div className="flex gap-1 flex-wrap">
                              {issue.labels.split(',').map((l) => l.trim()).filter(Boolean).map((lbl) => (
                                <span key={lbl} className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">{lbl}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">{issue.title}</p>
                      </div>
                      <div className="w-20 flex justify-center"><StatusBadge status={issue.status} /></div>
                      <div className="w-16 flex justify-center"><PriorityBadge priority={issue.priority} /></div>
                      <div className="w-16 flex justify-center"><TypeBadge type={issue.type} /></div>
                      <div className="w-28 text-xs text-gray-500 truncate">{issue.projectName}</div>
                      <div className="w-24 text-right text-xs text-gray-400">{formatDate(issue.updatedAt)}</div>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
                  {t('search.showing', { count: results.length })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
