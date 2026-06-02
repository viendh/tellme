import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine,
} from 'recharts';
import { TrendingDown, CheckCircle2, Circle } from 'lucide-react';
import { useBurndown } from '../../hooks/useSprints';
import type { Sprint } from '../../types';

interface BurndownChartProps {
  sprint: Sprint;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      {payload.map((p: { name: string; color: string; value: number }) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-600 dark:text-gray-400">{p.name}:</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

export function BurndownChart({ sprint }: BurndownChartProps) {
  const { data: points = [], isLoading } = useBurndown(sprint.id);

  if (isLoading) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="animate-pulse text-gray-400 text-sm">Đang tải biểu đồ...</div>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="h-48 flex flex-col items-center justify-center gap-2">
        <TrendingDown className="w-8 h-8 text-gray-200 dark:text-gray-700" />
        <p className="text-sm text-gray-400 dark:text-gray-500">Chưa có dữ liệu burndown</p>
        <p className="text-xs text-gray-400 dark:text-gray-600">Sprint cần có start date để hiển thị</p>
      </div>
    );
  }

  const total   = points[0]?.remaining + points[0]?.completed;
  const lastPt  = points[points.length - 1];
  const done    = lastPt?.completed ?? 0;
  const remain  = lastPt?.remaining ?? 0;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
  const today   = new Date().toISOString().slice(0, 10);
  const todayFmt = formatDate(today);

  const chartData = points.map((p) => ({
    ...p,
    date: formatDate(p.date),
    'Thực tế':    p.remaining,
    'Lý tưởng':   p.ideal,
  }));

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{done}</span>
          <span className="text-xs text-gray-400">hoàn thành</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Circle className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{remain}</span>
          <span className="text-xs text-gray-400">còn lại</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{pct}%</span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
            formatter={(v) => <span className="text-gray-600 dark:text-gray-400">{v}</span>}
          />
          {/* Ideal line */}
          <Line
            type="monotone" dataKey="Lý tưởng" stroke="#cbd5e1"
            strokeWidth={1.5} strokeDasharray="4 4" dot={false}
          />
          {/* Actual line */}
          <Line
            type="monotone" dataKey="Thực tế" stroke="#3b82f6"
            strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }}
          />
          {/* Today marker */}
          <ReferenceLine
            x={todayFmt} stroke="#f97316"
            strokeDasharray="3 3"
            label={{ value: 'Hôm nay', position: 'top', fontSize: 10, fill: '#f97316' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
