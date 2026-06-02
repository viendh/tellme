import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Loader2, FolderKanban, ListTodo, Zap, AlertTriangle,
  Clock, Play, FlaskConical, CheckCircle2, Plus, TrendingUp, ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { useUserDashboard } from '../hooks/useDashboard';
import { useAuthStore } from '../store/authStore';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { formatDate } from '../utils/formatters';

function Wave({ stroke }: { stroke: string }) {
  return (
    <svg viewBox="0 0 200 36" className="w-full h-8" preserveAspectRatio="none">
      <path
        d="M0,18 C25,6 50,30 75,18 C100,6 125,30 150,18 C175,6 200,30 200,18"
        fill="none"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  wave,
  onClick,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  wave: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left w-full hover:shadow-md hover:border-gray-200 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-gray-400 transition-colors mt-1" />
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
      <div className="mt-3">
        <Wave stroke={wave} />
      </div>
    </button>
  );
}

function StatusRow({
  icon,
  iconBg,
  label,
  value,
  total,
  barColor,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: number;
  total: number;
  barColor: string;
  onClick?: () => void;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <button
      onClick={onClick}
      disabled={value === 0}
      className={`w-full flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-xl transition-colors ${
        value > 0 ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default opacity-70'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm font-semibold text-gray-500">
            {value} <span className="text-gray-300 font-normal">({pct}%)</span>
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </button>
  );
}

export function UserDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data, isLoading } = useUserDashboard();

  const today = new Date().toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const d = data!;
  const total = d.totalAssigned;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dashboard.greeting', { name: user?.fullName })} 👋
          </h1>
          <p className="text-gray-400 mt-1 text-sm">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-500 bg-white shadow-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            {today}
          </div>
          <button
            onClick={() => navigate('/projects/new')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t('dashboard.createNew')}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label={t('dashboard.myProjects')}
          value={d.totalProjects}
          icon={<FolderKanban className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
          wave="#3b82f6"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          label={t('dashboard.totalAssigned')}
          value={d.totalAssigned}
          icon={<ListTodo className="w-5 h-5 text-violet-600" />}
          iconBg="bg-violet-50"
          wave="#7c3aed"
          onClick={() => navigate('/my-issues')}
        />
        <StatCard
          label={t('dashboard.inProgress')}
          value={d.inProgressCount}
          icon={<Zap className="w-5 h-5 text-orange-500" />}
          iconBg="bg-orange-50"
          wave="#f97316"
          onClick={() => navigate('/my-issues')}
        />
        <StatCard
          label={t('dashboard.overdue')}
          value={d.overdueCount}
          icon={<AlertTriangle className="w-5 h-5 text-red-500" />}
          iconBg="bg-red-50"
          wave="#ef4444"
          onClick={() => navigate('/my-issues')}
        />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Task breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <ClipboardList className="w-4 h-4 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-800">{t('dashboard.taskBreakdown')}</h2>
          </div>

          <div className="space-y-1">
            <StatusRow
              icon={<Clock className="w-4 h-4 text-blue-500" />}
              iconBg="bg-blue-50"
              label={t('status.TODO')}
              value={d.todoCount}
              total={total}
              barColor="bg-blue-400"
              onClick={d.todoCount > 0 ? () => navigate('/my-issues') : undefined}
            />
            <StatusRow
              icon={<Play className="w-4 h-4 text-violet-500" />}
              iconBg="bg-violet-50"
              label={t('status.IN_PROGRESS')}
              value={d.inProgressCount}
              total={total}
              barColor="bg-violet-400"
              onClick={d.inProgressCount > 0 ? () => navigate('/my-issues') : undefined}
            />
            <StatusRow
              icon={<FlaskConical className="w-4 h-4 text-orange-500" />}
              iconBg="bg-orange-50"
              label={t('status.TESTING')}
              value={d.testingCount}
              total={total}
              barColor="bg-orange-400"
              onClick={d.testingCount > 0 ? () => navigate('/my-issues') : undefined}
            />
            <StatusRow
              icon={<CheckCircle2 className="w-4 h-4 text-green-500" />}
              iconBg="bg-green-50"
              label={t('status.DONE')}
              value={d.doneCount}
              total={total}
              barColor="bg-green-400"
              onClick={d.doneCount > 0 ? () => navigate('/my-issues') : undefined}
            />
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {t('dashboard.totalTasks', { count: total })}
          </div>
        </div>

        {/* Recent issues */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <ListTodo className="w-4 h-4 text-gray-400" />
            <h2 className="text-base font-semibold text-gray-800">{t('dashboard.recentIssues')}</h2>
          </div>

          {d.recentIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <ClipboardList className="w-10 h-10 text-gray-200" />
              </div>
              <p className="text-sm font-medium text-gray-500">{t('dashboard.noAssigned')}</p>
              <p className="text-xs text-gray-400 mt-1">{t('dashboard.noAssignedDesc')}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {d.recentIssues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => navigate(`/issues/${issue.id}`)}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-gray-300 shrink-0">{issue.issueKey ?? `#${issue.id}`}</span>
                      <StatusBadge status={issue.status} />
                    </div>
                    <p className="text-sm text-gray-700 truncate group-hover:text-blue-600 font-medium">{issue.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(issue.updatedAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PriorityBadge priority={issue.priority} />
                    <ArrowRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-blue-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer summary bar */}
      <div className="mt-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm text-blue-700">
            {t('dashboard.summaryLine', { done: d.doneCount, total, overdue: d.overdueCount })}
          </p>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-800 whitespace-nowrap shrink-0"
        >
          <TrendingUp className="w-4 h-4" />
          {t('dashboard.viewReport')}
        </button>
      </div>
    </div>
  );
}
