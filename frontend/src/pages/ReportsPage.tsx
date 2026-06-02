import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart2, AlertTriangle, Users, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { ExportButton } from '../components/common/ExportButton';
import { exportToExcel, exportToPdf, mapIssuesToRows, ISSUE_EXPORT_COLUMNS } from '../utils/exportUtils';
import {
  useOverdueReport,
  useWorkloadReport,
  useCreatedVsResolvedReport,
  useResolutionTimeReport,
} from '../hooks/useIssueFeatures';
import { StatusBadge, PriorityBadge, TypeBadge } from '../components/common/Badge';
import { formatDate } from '../utils/formatters';

type ReportTab = 'overdue' | 'workload' | 'cvr' | 'resolution';

export function ReportsPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);

  const [tab, setTab] = useState<ReportTab>('overdue');
  const [cvrDays, setCvrDays] = useState(30);

  const TABS: { key: ReportTab; label: string; icon: React.ComponentType<any> }[] = [
    { key: 'overdue', label: t('report.overdue'), icon: AlertTriangle },
    { key: 'workload', label: t('report.workload'), icon: Users },
    { key: 'cvr', label: t('report.createdVsResolved'), icon: TrendingUp },
    { key: 'resolution', label: t('report.resolutionTime'), icon: Clock },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BarChart2 className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('report.title')}</h1>
            <p className="text-sm text-gray-500">{t('report.subtitle')}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                tab === key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'overdue' && <OverdueReport projectId={id} />}
        {tab === 'workload' && <WorkloadReport projectId={id} />}
        {tab === 'cvr' && <CreatedVsResolvedReport projectId={id} days={cvrDays} onDaysChange={setCvrDays} />}
        {tab === 'resolution' && <ResolutionTimeReport projectId={id} />}
      </div>
    </div>
  );
}

// ─── Overdue Issues ───────────────────────────────────────────────────────────

function OverdueReport({ projectId }: { projectId: number }) {
  const { t } = useTranslation();
  const { data: issues = [], isLoading } = useOverdueReport(projectId);

  if (isLoading) return <LoadingSpinner />;

  const handleExportExcel = () =>
    exportToExcel('overdue-issues', 'Issue quá hạn', ISSUE_EXPORT_COLUMNS, mapIssuesToRows(issues));
  const handleExportPdf = () =>
    exportToPdf('overdue-issues', 'Báo cáo Issue Quá hạn', `${issues.length} issues · ${new Date().toLocaleDateString('vi-VN')}`, ISSUE_EXPORT_COLUMNS, mapIssuesToRows(issues));

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          {t('report.overdue')}
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{issues.length} {t('report.issues')}</span>
          {issues.length > 0 && (
            <ExportButton onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} count={issues.length} />
          )}
        </div>
      </div>
      {issues.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-sm">{t('report.noOverdue')}</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('report.key')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('report.summary')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('report.type')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('report.priority')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('report.status')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('report.dueDate')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">{t('report.assignee')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {issues.map((issue) => (
              <tr key={issue.id} className="hover:bg-red-50 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{issue.issueKey}</td>
                <td className="px-4 py-2.5 max-w-xs">
                  <span className="truncate block text-gray-900">{issue.title}</span>
                </td>
                <td className="px-4 py-2.5"><TypeBadge type={issue.type} /></td>
                <td className="px-4 py-2.5"><PriorityBadge priority={issue.priority} /></td>
                <td className="px-4 py-2.5"><StatusBadge status={issue.status} /></td>
                <td className="px-4 py-2.5 text-red-600 font-medium text-xs">
                  {issue.dueDate ? formatDate(issue.dueDate) : '—'}
                </td>
                <td className="px-4 py-2.5 text-gray-600">{issue.assignee?.fullName ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Workload Report ──────────────────────────────────────────────────────────

function WorkloadReport({ projectId }: { projectId: number }) {
  const { t } = useTranslation();
  const { data: rows = [], isLoading } = useWorkloadReport(projectId);

  if (isLoading) return <LoadingSpinner />;

  const maxTotal = Math.max(...rows.map((r: any) => r.total as number), 1);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            {t('report.workload')}
          </h2>
        </div>
        {rows.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">{t('report.noData')}</div>
        ) : (
          <div className="p-4 space-y-4">
            {rows.map((row: any) => (
              <div key={row.userId} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                      {(row.userName as string).charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{row.userName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="text-blue-600 font-medium">{row.total} {t('report.total')}</span>
                    <span className="text-green-600">{row.done} {t('status.DONE')}</span>
                    <span className="text-amber-600">{row.inProgress} {t('status.IN_PROGRESS')}</span>
                    {row.overdue > 0 && <span className="text-red-600 font-medium">{row.overdue} {t('report.overdue')}</span>}
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-2 flex overflow-hidden">
                  <div
                    className="bg-green-500 h-2 transition-all"
                    style={{ width: `${(row.done / maxTotal) * 100}%` }}
                  />
                  <div
                    className="bg-blue-400 h-2 transition-all"
                    style={{ width: `${(row.inProgress / maxTotal) * 100}%` }}
                  />
                  <div
                    className="bg-gray-300 h-2 transition-all"
                    style={{ width: `${(row.todo / maxTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-1.5"><div className="w-3 h-2 bg-green-500 rounded-full" />{t('status.DONE')}</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-2 bg-blue-400 rounded-full" />{t('status.IN_PROGRESS')}</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-2 bg-gray-300 rounded-full" />{t('status.TODO')}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Created vs Resolved ──────────────────────────────────────────────────────

function CreatedVsResolvedReport({
  projectId,
  days,
  onDaysChange,
}: {
  projectId: number;
  days: number;
  onDaysChange: (d: number) => void;
}) {
  const { t } = useTranslation();
  const { data, isLoading } = useCreatedVsResolvedReport(projectId, days);

  if (isLoading) return <LoadingSpinner />;

  const labels: string[] = data?.labels ?? [];
  const created: number[] = data?.created ?? [];
  const resolved: number[] = data?.resolved ?? [];
  const maxVal = Math.max(...created, ...resolved, 1);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-500" />
          {t('report.createdVsResolved')}
        </h2>
        <select
          value={days}
          onChange={(e) => onDaysChange(Number(e.target.value))}
          className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
        >
          <option value={7}>{t('report.last7Days')}</option>
          <option value={14}>{t('report.last14Days')}</option>
          <option value={30}>{t('report.last30Days')}</option>
          <option value={90}>{t('report.last90Days')}</option>
        </select>
      </div>

      {labels.length === 0 ? (
        <div className="py-12 text-center text-gray-500 text-sm">{t('report.noData')}</div>
      ) : (
        <div className="p-6">
          {/* Simple bar chart */}
          <div className="flex items-end gap-1 h-40 overflow-x-auto pb-4">
            {labels.map((label, i) => {
              const step = Math.max(1, Math.ceil(labels.length / 15));
              const showLabel = i % step === 0;
              return (
                <div key={label} className="flex flex-col items-center gap-0.5 flex-1 min-w-6">
                  <div className="flex items-end gap-0.5 w-full h-32">
                    <div
                      className="bg-blue-400 rounded-t flex-1 transition-all"
                      style={{ height: `${(created[i] / maxVal) * 100}%` }}
                      title={`${t('report.created')}: ${created[i]}`}
                    />
                    <div
                      className="bg-green-400 rounded-t flex-1 transition-all"
                      style={{ height: `${(resolved[i] / maxVal) * 100}%` }}
                      title={`${t('report.resolved')}: ${resolved[i]}`}
                    />
                  </div>
                  {showLabel && (
                    <span className="text-xs text-gray-400 whitespace-nowrap rotate-45 origin-top-left"
                      style={{ fontSize: '9px' }}>
                      {label.slice(5)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 bg-blue-400 rounded" />{t('report.created')}</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-2 bg-green-400 rounded" />{t('report.resolved')}</div>
          </div>
          {/* Summary numbers */}
          <div className="mt-3 flex gap-6 text-sm">
            <div>
              <span className="text-gray-500">{t('report.totalCreated')}: </span>
              <span className="font-semibold text-blue-600">{created.reduce((a, b) => a + b, 0)}</span>
            </div>
            <div>
              <span className="text-gray-500">{t('report.totalResolved')}: </span>
              <span className="font-semibold text-green-600">{resolved.reduce((a, b) => a + b, 0)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Resolution Time Report ───────────────────────────────────────────────────

function ResolutionTimeReport({ projectId }: { projectId: number }) {
  const { t } = useTranslation();
  const { data, isLoading } = useResolutionTimeReport(projectId);

  if (isLoading) return <LoadingSpinner />;

  if (!data || data.count === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg py-12 text-center text-gray-500 text-sm">
        {t('report.noResolutionData')}
      </div>
    );
  }

  const maxAvg = Math.max(...data.byType.map((r: any) => r.avgHours as number), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-500" />
          {t('report.resolutionTime')}
        </h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <p className="text-xs text-purple-600 font-medium mb-1">{t('report.avgResolutionTime')}</p>
            <p className="text-3xl font-bold text-purple-700">{data.avgHours}h</p>
            <p className="text-xs text-purple-500 mt-1">{t('report.based_on', { count: data.count })}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-xs text-blue-600 font-medium mb-1">{t('report.resolvedIssues')}</p>
            <p className="text-3xl font-bold text-blue-700">{data.count}</p>
          </div>
        </div>

        {/* By Type */}
        {data.byType.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">{t('report.byType')}</h3>
            <div className="space-y-3">
              {data.byType.map((row: any) => (
                <div key={row.type}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">{t(`type.${row.type}`)}</span>
                      <span className="text-xs text-gray-400">({row.count} {t('report.issues')})</span>
                    </div>
                    <span className="text-sm font-medium text-purple-600">{row.avgHours}h</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-purple-400 h-2 rounded-full transition-all"
                      style={{ width: `${(row.avgHours / maxAvg) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );
}
