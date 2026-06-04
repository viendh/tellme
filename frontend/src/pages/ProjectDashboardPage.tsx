import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Loader2, Zap, CheckCircle2, Bug, ArrowRight, ExternalLink,
  Users, BarChart2, ListTodo, Target, Activity, CalendarDays,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useProjectDashboard } from '../hooks/useDashboard';
import { Avatar } from '../components/common/Avatar';
import { formatDate } from '../utils/formatters';

// ── Color tokens ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  TODO:        '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  TESTING:     '#a855f7',
  UAT:         '#f59e0b',
  DONE:        '#22c55e',
};
const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH:     '#f97316',
  MEDIUM:   '#eab308',
  LOW:      '#94a3b8',
};
const TYPE_COLORS: Record<string, string> = {
  BUG:   '#ef4444',
  TASK:  '#3b82f6',
  STORY: '#22c55e',
  EPIC:  '#a855f7',
};

// ── Shared tooltip ────────────────────────────────────────────────────────────

function ChartTip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { fill?: string; color?: string } }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  const fill = p.payload.fill ?? p.payload.color ?? '#6b7280';
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: fill }} />
        <span className="text-gray-700 font-medium">{p.name}</span>
        <span className="text-gray-900 font-bold">{p.value}</span>
      </div>
    </div>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function Card({ title, icon, action, children }: {
  title: string;
  icon: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── Status chip ───────────────────────────────────────────────────────────────

function StatusChip({ label, value, color, bg, onClick }: {
  label: string; value: number; color: string; bg: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 ${bg} rounded-xl px-3 py-3 text-center transition-all hover:opacity-80 hover:shadow-sm border border-transparent hover:border-gray-200`}
    >
      <p className={`text-2xl font-bold ${color} tabular-nums`}>{value}</p>
      <p className={`text-xs mt-0.5 font-medium ${color} opacity-70`}>{label}</p>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
  const toBacklog = () => navigate(`/projects/${id}/backlog`);
  const toBoard   = () => navigate(`/projects/${id}/board`);
  const toMembers = () => navigate(`/projects/${id}/members`);

  const sprintPct = data.activeSprint && data.activeSprint.totalIssues > 0
    ? Math.round((data.activeSprint.doneIssues / data.activeSprint.totalIssues) * 100)
    : 0;

  // Charts data
  const statusPie = [
    { name: t('status.TODO'),        value: data.todoCount,        fill: STATUS_COLORS.TODO        },
    { name: t('status.IN_PROGRESS'), value: data.inProgressCount,  fill: STATUS_COLORS.IN_PROGRESS },
    { name: t('status.TESTING'),     value: data.testingCount,     fill: STATUS_COLORS.TESTING     },
    { name: t('status.UAT'),         value: data.uatCount,         fill: STATUS_COLORS.UAT         },
    { name: t('status.DONE'),        value: data.doneCount,        fill: STATUS_COLORS.DONE        },
  ].filter((i) => i.value > 0);

  const typeBars = [
    { name: t('type.BUG'),   count: data.bugCount,   fill: TYPE_COLORS.BUG   },
    { name: t('type.TASK'),  count: data.taskCount,  fill: TYPE_COLORS.TASK  },
    { name: t('type.STORY'), count: data.storyCount, fill: TYPE_COLORS.STORY },
    { name: t('type.EPIC'),  count: data.epicCount,  fill: TYPE_COLORS.EPIC  },
  ];

  const priorityBars = [
    { name: t('priority.CRITICAL'), count: data.criticalCount, fill: PRIORITY_COLORS.CRITICAL },
    { name: t('priority.HIGH'),     count: data.highCount,     fill: PRIORITY_COLORS.HIGH     },
    { name: t('priority.MEDIUM'),   count: data.mediumCount,   fill: PRIORITY_COLORS.MEDIUM   },
    { name: t('priority.LOW'),      count: data.lowCount,      fill: PRIORITY_COLORS.LOW      },
  ];

  const donePct = total > 0 ? Math.round((data.doneCount / total) * 100) : 0;

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="p-6 max-w-7xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('dashboard.projectTitle')}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
              {total} issues · {donePct}% hoàn thành
            </p>
          </div>
          <button
            onClick={toBoard}
            className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Zap className="w-4 h-4" />
            Mở Board
          </button>
        </div>

        {/* ── Status chips row ── */}
        <div className="flex gap-2">
          <StatusChip label={t('status.TODO')}        value={data.todoCount}        color="text-gray-600"   bg="bg-gray-100 dark:bg-gray-800"    onClick={toBacklog} />
          <StatusChip label={t('status.IN_PROGRESS')} value={data.inProgressCount}  color="text-blue-700"   bg="bg-blue-50 dark:bg-blue-900/20"  onClick={toBoard}   />
          <StatusChip label={t('status.TESTING')}     value={data.testingCount}     color="text-purple-700" bg="bg-purple-50 dark:bg-purple-900/20" onClick={toBoard}   />
          <StatusChip label={t('status.UAT')}         value={data.uatCount}         color="text-amber-700"  bg="bg-amber-50 dark:bg-amber-900/20" onClick={toBoard}   />
          <StatusChip label={t('status.DONE')}        value={data.doneCount}        color="text-green-700"  bg="bg-green-50 dark:bg-green-900/20" onClick={toBacklog} />
        </div>

        {/* ── 3-column main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* ── LEFT column: donut + type + priority ── */}
          <div className="lg:col-span-4 space-y-5">

            {/* Status donut */}
            <Card
              title="Trạng thái"
              icon={<Target className="w-4 h-4 text-blue-500" />}
              action={<button onClick={toBacklog} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">Backlog <ExternalLink className="w-3 h-3" /></button>}
            >
              {total === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">{t('dashboard.noActivity')}</p>
              ) : (
                <>
                  <div className="relative h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={statusPie} cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={2} dataKey="value" stroke="none">
                          {statusPie.map((e, i) => <Cell key={i} fill={e.fill} />)}
                        </Pie>
                        <Tooltip content={<ChartTip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">{donePct}%</span>
                      <span className="text-xs text-gray-400">done</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    {statusPie.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                          <span className="text-gray-500 dark:text-gray-400 truncate max-w-[70px]">{item.name}</span>
                        </div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300 ml-1">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* Type breakdown */}
            <Card
              title={t('dashboard.byType')}
              icon={<BarChart2 className="w-4 h-4 text-gray-400" />}
              action={<button onClick={toBacklog} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">Xem <ExternalLink className="w-3 h-3" /></button>}
            >
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typeBars} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} width={44} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs font-bold text-gray-800">{payload[0].value}</div>;
                    }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16}>
                      {typeBars.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Priority breakdown */}
            <Card
              title={t('dashboard.byPriority')}
              icon={<Activity className="w-4 h-4 text-gray-400" />}
            >
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityBars} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} width={52} />
                    <Tooltip cursor={{ fill: '#f9fafb' }} content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs font-bold text-gray-800">{payload[0].value}</div>;
                    }} />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={16}>
                      {priorityBars.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* ── CENTER + RIGHT columns ── */}
          <div className="lg:col-span-8 space-y-5">

            {/* Active sprint */}
            <Card
              title={t('dashboard.activeSprint')}
              icon={<Zap className="w-4 h-4 text-yellow-500" />}
            >
              {data.activeSprint ? (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <button onClick={toBoard} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors">
                        {data.activeSprint.name}
                      </button>
                      {data.activeSprint.goal && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{data.activeSprint.goal}</p>}
                      {(data.activeSprint.startDate || data.activeSprint.endDate) && (
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                          {data.activeSprint.startDate && (
                            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />{formatDate(data.activeSprint.startDate)}</span>
                          )}
                          {data.activeSprint.endDate && (
                            <span className="flex items-center gap-1">→ {formatDate(data.activeSprint.endDate)}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <button onClick={toBoard} className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      {t('dashboard.viewBoard')} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all bg-gradient-to-r from-green-400 to-green-500" style={{ width: `${sprintPct}%` }} />
                    </div>
                    <span className="text-sm font-bold text-green-600 shrink-0">{sprintPct}%</span>
                  </div>

                  {/* Mini stat grid */}
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'Tổng', value: data.activeSprint.totalIssues,     color: 'text-gray-700 dark:text-gray-200', bg: 'bg-gray-50 dark:bg-gray-800' },
                      { label: 'Đang TH', value: data.activeSprint.inProgressIssues, color: 'text-blue-700', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                      { label: 'Hoàn thành', value: data.activeSprint.doneIssues, color: 'text-green-700', bg: 'bg-green-50 dark:bg-green-900/20' },
                      { label: 'Còn lại', value: data.activeSprint.totalIssues - data.activeSprint.doneIssues, color: 'text-orange-700', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                    ].map((s) => (
                      <button key={s.label} onClick={toBoard} className={`${s.bg} rounded-xl p-3 text-center hover:opacity-80 transition-opacity`}>
                        <p className={`text-xl font-bold ${s.color} tabular-nums`}>{s.value}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                      </button>
                    ))}
                  </div>

                  {/* Sprint progress bar chart */}
                  {data.activeSprint.totalIssues > 0 && (
                    <div className="mt-4">
                      <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                        {[
                          { value: data.activeSprint.doneIssues, fill: '#22c55e' },
                          { value: data.activeSprint.inProgressIssues, fill: '#3b82f6' },
                          { value: data.activeSprint.totalIssues - data.activeSprint.doneIssues - data.activeSprint.inProgressIssues, fill: '#e2e8f0' },
                        ].map((seg, i) => (
                          seg.value > 0 && (
                            <div
                              key={i}
                              className="h-full transition-all flex items-center justify-center"
                              style={{ width: `${(seg.value / data.activeSprint!.totalIssues) * 100}%`, background: seg.fill }}
                            >
                              {(seg.value / data.activeSprint!.totalIssues) > 0.08 && (
                                <span className="text-[10px] font-bold text-white">{seg.value}</span>
                              )}
                            </div>
                          )
                        ))}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Done</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" />In Progress</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200" />Todo</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <CheckCircle2 className="w-10 h-10 mb-2 text-gray-200" />
                  <p className="text-sm">{t('dashboard.noActiveSprint')}</p>
                  <button onClick={toBacklog} className="mt-2 text-xs text-blue-500 hover:text-blue-700">Tạo sprint mới →</button>
                </div>
              )}
            </Card>

            {/* Member workload */}
            {data.memberWorkload.length > 0 && (
              <Card
                title={t('dashboard.memberWorkload')}
                icon={<Users className="w-4 h-4 text-gray-400" />}
                action={<button onClick={toMembers} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">{t('dashboard.viewMembers')} <ExternalLink className="w-3 h-3" /></button>}
              >
                <div className="space-y-3">
                  {data.memberWorkload.map((mw) => {
                    const donePct2 = mw.totalIssues > 0 ? Math.round((mw.doneIssues / mw.totalIssues) * 100) : 0;
                    const inProgressPct = mw.totalIssues > 0 ? Math.round((mw.inProgressIssues / mw.totalIssues) * 100) : 0;
                    const todoPct = 100 - donePct2 - inProgressPct;
                    return (
                      <button key={mw.user.id} onClick={toMembers} className="w-full text-left group">
                        <div className="flex items-center gap-3 mb-1.5">
                          <Avatar user={mw.user} size="xs" />
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1 truncate group-hover:text-blue-600 transition-colors">{mw.user.fullName}</span>
                          <span className="text-xs text-gray-500 shrink-0">
                            {mw.totalIssues} issues · <span className="text-green-600 font-medium">{donePct2}%</span> done
                          </span>
                        </div>
                        {/* Stacked bar */}
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                          <div className="h-full bg-green-500 transition-all" style={{ width: `${donePct2}%` }} />
                          <div className="h-full bg-blue-400 transition-all" style={{ width: `${inProgressPct}%` }} />
                          <div className="h-full bg-gray-200 dark:bg-gray-700 transition-all" style={{ width: `${todoPct}%` }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Recent activity */}
            <Card
              title={t('dashboard.recentActivity')}
              icon={<Bug className="w-4 h-4 text-gray-400" />}
            >
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">{t('dashboard.noActivity')}</p>
              ) : (
                <div className="space-y-1">
                  {data.recentActivity.slice(0, 8).map((log) => (
                    <button
                      key={log.id}
                      onClick={() => navigate(`/issues/${log.issueId}`)}
                      className="w-full text-left flex items-start gap-3 py-2 px-2 -mx-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all group"
                    >
                      <Avatar user={log.user} size="xs" className="flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-700 dark:text-gray-300 group-hover:text-gray-900">
                          <span className="font-medium">{log.user.fullName}</span>
                          {' '}{log.action}
                          {log.fieldName && (
                            <span className="text-gray-500 dark:text-gray-400"> ({log.fieldName}
                              {log.oldValue && <> <span className="line-through text-red-400">{log.oldValue}</span></>}
                              {log.newValue && <> → <span className="text-green-600">{log.newValue}</span></>}
                            )</span>
                          )}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(log.createdAt)}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-blue-400 flex-shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Overall progress bar */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <ListTodo className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {data.doneCount} / {total} issues hoàn thành · {data.criticalCount + data.highCount > 0 ? `${data.criticalCount + data.highCount} critical/high cần chú ý` : 'Không có issue nghiêm trọng ✓'}
                </p>
                <div className="h-1.5 bg-blue-200 dark:bg-blue-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${donePct}%` }} />
                </div>
              </div>
              <span className="text-lg font-bold text-blue-700 dark:text-blue-300 shrink-0">{donePct}%</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
