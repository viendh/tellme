import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Zap, CheckCircle2, Bug, BookOpen, ClipboardList, Star, ArrowRight, ExternalLink } from 'lucide-react';
import { useProjectDashboard } from '../hooks/useDashboard';
import { Avatar } from '../components/common/Avatar';
import { formatDate } from '../utils/formatters';

function StatCard({
  label,
  value,
  color,
  onClick,
}: {
  label: string;
  value: number;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg p-4 text-center border w-full transition-all ${color} ${
        onClick ? 'hover:opacity-80 hover:shadow-md cursor-pointer' : 'cursor-default'
      }`}
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1 font-medium opacity-80">{label}</p>
    </button>
  );
}

function HBar({
  label,
  value,
  total,
  colorClass,
  labelColor = 'text-gray-700',
  onClick,
}: {
  label: string;
  value: number;
  total: number;
  colorClass: string;
  labelColor?: string;
  onClick?: () => void;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      disabled={!onClick || value === 0}
      className={`w-full flex items-center gap-3 rounded-lg px-2 py-1 -mx-2 transition-colors ${
        onClick && value > 0 ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
      }`}
    >
      <span className={`text-sm w-24 text-right shrink-0 ${labelColor}`}>{label}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-gray-800 w-8 text-right">{value}</span>
    </button>
  );
}

export function ProjectDashboardPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const id = Number(projectId);
  const { data, isLoading } = useProjectDashboard(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) return null;

  const total = data.totalIssues;
  const sprintPct = data.activeSprint && data.activeSprint.totalIssues > 0
    ? Math.round((data.activeSprint.doneIssues / data.activeSprint.totalIssues) * 100)
    : 0;

  const toBacklog = () => navigate(`/projects/${id}/backlog`);
  const toBoard = () => navigate(`/projects/${id}/board`);
  const toMembers = () => navigate(`/projects/${id}/members`);

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{t('dashboard.projectTitle')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t('dashboard.projectSubtitle', { total })}</p>
        </div>

        {/* Status overview cards — click → backlog or board */}
        <div className="grid grid-cols-5 gap-3">
          <StatCard label={t('status.TODO')}        value={data.todoCount}        color="bg-gray-50 border-gray-200 text-gray-600"    onClick={toBacklog} />
          <StatCard label={t('status.IN_PROGRESS')} value={data.inProgressCount}  color="bg-blue-50 border-blue-200 text-blue-700"   onClick={toBoard} />
          <StatCard label={t('status.TESTING')}     value={data.testingCount}     color="bg-purple-50 border-purple-200 text-purple-700" onClick={toBoard} />
          <StatCard label={t('status.UAT')}         value={data.uatCount}         color="bg-yellow-50 border-yellow-200 text-yellow-700" onClick={toBoard} />
          <StatCard label={t('status.DONE')}        value={data.doneCount}        color="bg-green-50 border-green-200 text-green-700"  onClick={toBacklog} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Type + Priority breakdown */}
          <div className="lg:col-span-1 space-y-6">
            {/* By Type — click → backlog */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-gray-400" />
                  {t('dashboard.byType')}
                </h2>
                <button onClick={toBacklog} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                  {t('dashboard.viewAll')} <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                <HBar label={t('type.BUG')}   value={data.bugCount}   total={total} colorClass="bg-red-400"    labelColor="text-red-600"    onClick={toBacklog} />
                <HBar label={t('type.TASK')}  value={data.taskCount}  total={total} colorClass="bg-blue-400"                                onClick={toBacklog} />
                <HBar label={t('type.STORY')} value={data.storyCount} total={total} colorClass="bg-green-400"                               onClick={toBacklog} />
                <HBar label={t('type.EPIC')}  value={data.epicCount}  total={total} colorClass="bg-purple-400"                              onClick={toBacklog} />
              </div>
            </div>

            {/* By Priority — click → backlog */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Star className="w-4 h-4 text-gray-400" />
                  {t('dashboard.byPriority')}
                </h2>
                <button onClick={toBacklog} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                  {t('dashboard.viewAll')} <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-2">
                <HBar label={t('priority.CRITICAL')} value={data.criticalCount} total={total} colorClass="bg-red-500"    labelColor="text-red-600"    onClick={toBacklog} />
                <HBar label={t('priority.HIGH')}     value={data.highCount}     total={total} colorClass="bg-orange-400" labelColor="text-orange-600" onClick={toBacklog} />
                <HBar label={t('priority.MEDIUM')}   value={data.mediumCount}   total={total} colorClass="bg-yellow-400"                              onClick={toBacklog} />
                <HBar label={t('priority.LOW')}      value={data.lowCount}      total={total} colorClass="bg-gray-300"                               onClick={toBacklog} />
              </div>
            </div>
          </div>

          {/* Sprint + Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Sprint — click name or button → board */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                {t('dashboard.activeSprint')}
              </h2>
              {data.activeSprint ? (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <button
                        onClick={toBoard}
                        className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left"
                      >
                        {data.activeSprint.name}
                      </button>
                      {data.activeSprint.goal && (
                        <p className="text-xs text-gray-500 mt-0.5">{data.activeSprint.goal}</p>
                      )}
                    </div>
                    <button
                      onClick={toBoard}
                      className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
                    >
                      {t('dashboard.viewBoard')} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    {data.activeSprint.startDate && <span>{t('common.from')}: {formatDate(data.activeSprint.startDate)}</span>}
                    {data.activeSprint.endDate && <span>{t('common.to')}: {formatDate(data.activeSprint.endDate)}</span>}
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{t('dashboard.sprintProgress')}</span>
                    <span className="font-semibold text-gray-800">
                      {data.activeSprint.doneIssues} / {data.activeSprint.totalIssues} {t('dashboard.done')} ({sprintPct}%)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${sprintPct}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                    <button onClick={toBoard} className="bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors">
                      <p className="text-lg font-bold text-gray-700">{data.activeSprint.totalIssues}</p>
                      <p className="text-xs text-gray-400">{t('dashboard.total')}</p>
                    </button>
                    <button onClick={toBoard} className="bg-blue-50 rounded-lg p-2 hover:bg-blue-100 transition-colors">
                      <p className="text-lg font-bold text-blue-600">{data.activeSprint.inProgressIssues}</p>
                      <p className="text-xs text-gray-400">{t('status.IN_PROGRESS')}</p>
                    </button>
                    <button onClick={toBoard} className="bg-green-50 rounded-lg p-2 hover:bg-green-100 transition-colors">
                      <p className="text-lg font-bold text-green-600">{data.activeSprint.doneIssues}</p>
                      <p className="text-xs text-gray-400">{t('status.DONE')}</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-gray-400">
                  <CheckCircle2 className="w-8 h-8 mb-2 text-gray-200" />
                  <p className="text-sm">{t('dashboard.noActiveSprint')}</p>
                </div>
              )}
            </div>

            {/* Recent Activity — click → issue detail */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Bug className="w-4 h-4 text-gray-400" />
                {t('dashboard.recentActivity')}
              </h2>
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">{t('dashboard.noActivity')}</p>
              ) : (
                <div className="space-y-1">
                  {data.recentActivity.map((log) => (
                    <button
                      key={log.id}
                      onClick={() => navigate(`/issues/${log.issueId}`)}
                      className="w-full text-left flex items-start gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                    >
                      <Avatar user={log.user} size="xs" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 group-hover:text-gray-900">
                          <span className="font-medium">{log.user.fullName}</span>
                          {' '}{log.action}
                          {log.fieldName && (
                            <span className="text-gray-500"> ({log.fieldName}
                              {log.oldValue && <> <span className="line-through text-red-400">{log.oldValue}</span></>}
                              {log.newValue && <> → <span className="text-green-600">{log.newValue}</span></>}
                            )</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(log.createdAt)}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-blue-400 flex-shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Member Workload — click → members page */}
        {data.memberWorkload.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-gray-400" />
                {t('dashboard.memberWorkload')}
              </h2>
              <button onClick={toMembers} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                {t('dashboard.viewMembers')} <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.memberWorkload.map((mw) => {
                const pct = total > 0 ? Math.round((mw.totalIssues / total) * 100) : 0;
                const donePct = mw.totalIssues > 0 ? Math.round((mw.doneIssues / mw.totalIssues) * 100) : 0;
                return (
                  <button
                    key={mw.user.id}
                    onClick={toMembers}
                    className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors w-full text-left group"
                  >
                    <Avatar user={mw.user} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">
                          {mw.user.fullName}
                        </span>
                        <span className="text-xs text-gray-500 ml-2 shrink-0">
                          {mw.totalIssues} {t('dashboard.issues')} · {donePct}% {t('dashboard.done')}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
