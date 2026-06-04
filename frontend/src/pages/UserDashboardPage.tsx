import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Loader2, FolderKanban, ListTodo, Zap, AlertTriangle,
  Clock, Plus, TrendingUp, ArrowRight, ClipboardList,
  CheckCircle2, Target, Activity,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { useUserDashboard } from '../hooks/useDashboard';
import { useAuthStore } from '../store/authStore';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';

// ── Color tokens ──────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  TODO:        '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  TESTING:     '#a855f7',
  UAT:         '#f59e0b',
  DONE:        '#22c55e',
};

// ── KPI card ──────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon, accent, onClick,
}: {
  label: string; value: number; sub?: string;
  icon: React.ReactNode; accent: string; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left w-full overflow-hidden hover:shadow-md hover:border-gray-200 transition-all`}
    >
      {/* accent strip */}
      <div className={`absolute top-0 left-0 w-1 h-full ${accent} rounded-l-2xl`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent.replace('bg-', 'bg-').replace('-600', '-50').replace('-500', '-50')}`}>
          {icon}
        </div>
        <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors" />
      </div>
      <p className="text-3xl font-bold text-gray-900 tabular-nums">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </button>
  );
}

// ── Custom tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { fill: string } }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full" style={{ background: p.payload.fill }} />
        <span className="text-gray-700 font-medium">{p.name}</span>
        <span className="text-gray-900 font-bold">{p.value}</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function UserDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading } = useUserDashboard();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const today = now.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const d = data!;
  const total = d.totalAssigned;
  const completionPct = total > 0 ? Math.round((d.doneCount / total) * 100) : 0;

  const pieData = [
    { name: t('status.TODO'),        value: d.todoCount,        fill: STATUS_COLORS.TODO        },
    { name: t('status.IN_PROGRESS'), value: d.inProgressCount,  fill: STATUS_COLORS.IN_PROGRESS },
    { name: t('status.TESTING'),     value: d.testingCount,     fill: STATUS_COLORS.TESTING     },
    { name: t('status.DONE'),        value: d.doneCount,        fill: STATUS_COLORS.DONE        },
  ].filter((i) => i.value > 0);

  const barData = [
    { name: 'Chờ xử lý',   count: d.todoCount,        fill: STATUS_COLORS.TODO        },
    { name: 'Đang thực hiện', count: d.inProgressCount, fill: STATUS_COLORS.IN_PROGRESS },
    { name: 'Kiểm thử',    count: d.testingCount,     fill: STATUS_COLORS.TESTING     },
    { name: 'Hoàn thành',  count: d.doneCount,        fill: STATUS_COLORS.DONE        },
  ];

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* ── Hero header ── */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          {/* decorative circles */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -right-4 w-32 h-32 bg-white/5 rounded-full" />

          <div className="relative flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-blue-200 text-sm font-medium mb-1">{today}</p>
              <h1 className="text-2xl font-bold mb-1">{greeting}, {user?.fullName?.split(' ').slice(-1)[0]} 👋</h1>
              <p className="text-blue-200 text-sm">
                {d.inProgressCount > 0
                  ? `Bạn đang có ${d.inProgressCount} issue đang thực hiện${d.overdueCount > 0 ? ` và ${d.overdueCount} quá hạn` : ''}.`
                  : 'Chưa có issue nào đang thực hiện.'}
              </p>
              {/* mini kpi row inside hero */}
              <div className="flex items-center gap-5 mt-4">
                {[
                  { label: 'Dự án',        val: d.totalProjects    },
                  { label: 'Được giao',     val: d.totalAssigned    },
                  { label: 'Hoàn thành',    val: completionPct, suffix: '%' },
                ].map((k) => (
                  <div key={k.label}>
                    <p className="text-2xl font-bold">{k.val}{k.suffix}</p>
                    <p className="text-xs text-blue-200">{k.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate('/projects/new')}
              className="flex-shrink-0 flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors backdrop-blur-sm"
            >
              <Plus className="w-4 h-4" />
              {t('dashboard.createNew')}
            </button>
          </div>
        </div>

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label={t('dashboard.myProjects')}
            value={d.totalProjects}
            icon={<FolderKanban className="w-5 h-5 text-blue-600" />}
            accent="bg-blue-500"
            onClick={() => navigate('/projects')}
          />
          <KpiCard
            label={t('dashboard.totalAssigned')}
            value={d.totalAssigned}
            sub={`${completionPct}% hoàn thành`}
            icon={<ListTodo className="w-5 h-5 text-violet-600" />}
            accent="bg-violet-500"
            onClick={() => navigate('/my-issues')}
          />
          <KpiCard
            label={t('dashboard.inProgress')}
            value={d.inProgressCount}
            icon={<Zap className="w-5 h-5 text-orange-500" />}
            accent="bg-orange-500"
            onClick={() => navigate('/my-issues')}
          />
          <KpiCard
            label={t('dashboard.overdue')}
            value={d.overdueCount}
            sub={d.overdueCount > 0 ? 'Cần xử lý ngay' : 'Tất cả đúng hạn ✓'}
            icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
            accent={d.overdueCount > 0 ? 'bg-red-500' : 'bg-green-500'}
            onClick={() => navigate('/my-issues')}
          />
        </div>

        {/* ── Main charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Donut chart — status distribution */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Phân bổ theo trạng thái</h2>
            </div>

            {total === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <ClipboardList className="w-10 h-10 mb-2 text-gray-200" />
                <p className="text-sm">{t('dashboard.noAssigned')}</p>
              </div>
            ) : (
              <>
                <div className="h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* center label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{completionPct}%</span>
                    <span className="text-xs text-gray-400">hoàn thành</span>
                  </div>
                </div>
                {/* Legend */}
                <div className="space-y-1.5 mt-2">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.fill }} />
                        <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                      </div>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {item.value} <span className="text-gray-400 font-normal">({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Bar chart — issue counts by status */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Số lượng theo trạng thái</h2>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    cursor={{ fill: '#f9fafb' }}
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
                          <span className="text-gray-700 font-bold">{payload[0].value} issue</span>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={22}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* completion ring */}
            <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800 flex items-center gap-3">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${completionPct}%` }} />
              </div>
              <span className="text-xs font-semibold text-green-600 shrink-0">{completionPct}%</span>
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            </div>
          </div>

          {/* Recent issues */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-gray-400" />
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t('dashboard.recentIssues')}</h2>
              </div>
              <button onClick={() => navigate('/my-issues')} className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1">
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {d.recentIssues.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                <ClipboardList className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">{t('dashboard.noAssigned')}</p>
              </div>
            ) : (
              <div className="space-y-1.5 flex-1 overflow-y-auto">
                {d.recentIssues.slice(0, 6).map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => navigate(`/issues/${issue.id}`)}
                    className="w-full text-left flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[11px] font-mono text-gray-300 shrink-0">{issue.issueKey ?? `#${issue.id}`}</span>
                        <StatusBadge status={issue.status} />
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 truncate group-hover:text-blue-600 font-medium">{issue.title}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <PriorityBadge priority={issue.priority} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Summary footer bar ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {t('dashboard.summaryLine', { done: d.doneCount, total, overdue: d.overdueCount })}
              </p>
              <p className="text-xs text-gray-400">Cập nhật lúc {now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/my-issues')}
              className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 font-medium transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <ListTodo className="w-4 h-4" />
              Issue của tôi
            </button>
            <button
              onClick={() => navigate('/projects')}
              className="flex items-center gap-1.5 text-sm bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors px-3 py-1.5 rounded-lg"
            >
              <TrendingUp className="w-4 h-4" />
              {t('dashboard.viewReport')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
