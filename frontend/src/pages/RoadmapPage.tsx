import { useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CalendarDays, Layers, Tag, Zap } from 'lucide-react';
import { useSprints } from '../hooks/useSprints';
import { useVersions } from '../hooks/useIssueFeatures';
import { useIssues } from '../hooks/useIssues';
import type { Sprint, Issue } from '../types';

/* ────────────── constants ────────────── */
const DAY_W   = 32;   // px per day
const ROW_H   = 40;   // px per row
const LABEL_W = 200;  // px for left label column
const MONTHS  = ['Th.1','Th.2','Th.3','Th.4','Th.5','Th.6','Th.7','Th.8','Th.9','Th.10','Th.11','Th.12'];

type ViewMode = 'sprint' | 'version' | 'epic';

/* ────────────── date helpers ────────────── */
function addDays(d: Date, n: number) {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}
function diffDays(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}
function toDate(s?: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}
function fmtLabel(d: Date) {
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}

/* ────────────── bar configs ────────────── */
const SPRINT_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  PLANNING:  { bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8' },
  ACTIVE:    { bg: '#dcfce7', border: '#86efac', text: '#15803d' },
  COMPLETED: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },
};
const VERSION_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  UNRELEASED: { bg: '#fef9c3', border: '#fde047', text: '#854d0e' },
  RELEASED:   { bg: '#dcfce7', border: '#86efac', text: '#15803d' },
  ARCHIVED:   { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },
};
const STATUS_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  TODO:        { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },
  IN_PROGRESS: { bg: '#dbeafe', border: '#93c5fd', text: '#1d4ed8' },
  TESTING:     { bg: '#fef3c7', border: '#fcd34d', text: '#92400e' },
  UAT:         { bg: '#f5f3ff', border: '#c4b5fd', text: '#6d28d9' },
  DONE:        { bg: '#dcfce7', border: '#86efac', text: '#15803d' },
};

/* ────────────── sub-components ────────────── */
interface GanttBar {
  id: string | number;
  label: string;
  sublabel?: string;
  start: Date;
  end: Date;
  color: { bg: string; border: string; text: string };
}

function GanttRow({
  bar, viewStart, viewDays,
}: { bar: GanttBar; viewStart: Date; viewDays: number }) {
  const startOffset = diffDays(viewStart, bar.start);
  const duration    = Math.max(1, diffDays(bar.start, bar.end) + 1);

  const left  = Math.max(0, startOffset) * DAY_W;
  const width = Math.min(
    duration - Math.max(0, -startOffset),
    viewDays  - Math.max(0, startOffset),
  ) * DAY_W;

  if (width <= 0) {
    return (
      <div className="flex" style={{ height: ROW_H }}>
        <div className="border-b border-gray-100 dark:border-gray-800 flex items-center px-3" style={{ width: LABEL_W, flexShrink: 0 }}>
          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{bar.label}</p>
            {bar.sublabel && <p className="text-[10px] text-gray-400 truncate">{bar.sublabel}</p>}
          </div>
        </div>
        <div className="flex-1 relative border-b border-gray-100 dark:border-gray-800" />
      </div>
    );
  }

  return (
    <div className="flex" style={{ height: ROW_H }}>
      {/* Label */}
      <div className="border-b border-r border-gray-200 dark:border-gray-700 flex items-center px-3 bg-white dark:bg-gray-900" style={{ width: LABEL_W, flexShrink: 0 }}>
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{bar.label}</p>
          {bar.sublabel && <p className="text-[10px] text-gray-400 truncate">{bar.sublabel}</p>}
        </div>
      </div>
      {/* Timeline */}
      <div className="flex-1 relative border-b border-gray-100 dark:border-gray-800 overflow-hidden">
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-md flex items-center px-2 overflow-hidden cursor-default select-none group"
          style={{
            left:        left,
            width:       width,
            height:      ROW_H - 12,
            background:  bar.color.bg,
            border:      `1.5px solid ${bar.color.border}`,
          }}
          title={`${bar.label}: ${fmtLabel(bar.start)} → ${fmtLabel(bar.end)}`}
        >
          <span className="text-[10px] font-medium truncate" style={{ color: bar.color.text }}>
            {bar.label}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ────────────── main page ────────────── */
export function RoadmapPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);

  const [mode,       setMode]       = useState<ViewMode>('sprint');
  const [monthStart, setMonthStart] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });
  const [spanMonths, setSpanMonths] = useState(3);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: sprints  = [] } = useSprints(id);
  const { data: versions = [] } = useVersions(id);
  const { data: issues   = [] } = useIssues(id);

  const epics = useMemo(() => issues.filter((i: Issue) => i.type === 'EPIC'), [issues]);

  /* view window */
  const viewStart = useMemo(() => {
    const d = new Date(monthStart); d.setDate(1); return d;
  }, [monthStart]);

  const viewEnd = useMemo(() => {
    const d = new Date(viewStart);
    d.setMonth(d.getMonth() + spanMonths);
    d.setDate(0); // last day of previous month
    return d;
  }, [viewStart, spanMonths]);

  const viewDays = diffDays(viewStart, viewEnd) + 1;
  const today    = new Date();
  const todayOffset = diffDays(viewStart, today);

  /* month headers */
  const monthHeaders = useMemo(() => {
    const headers: { label: string; days: number }[] = [];
    const cur = new Date(viewStart);
    while (cur <= viewEnd) {
      const daysInMonth = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
      const startDay    = cur.getDate();
      const daysVisible = Math.min(daysInMonth - startDay + 1, viewDays - diffDays(viewStart, cur));
      headers.push({ label: `${MONTHS[cur.getMonth()]} ${cur.getFullYear()}`, days: daysVisible });
      cur.setMonth(cur.getMonth() + 1);
      cur.setDate(1);
    }
    return headers;
  }, [viewStart, viewEnd, viewDays]);

  /* day headers (every 7th) */
  const dayTicks = useMemo(() => {
    const ticks: { offset: number; label: string }[] = [];
    for (let i = 0; i < viewDays; i += 7) {
      ticks.push({ offset: i, label: fmtLabel(addDays(viewStart, i)) });
    }
    return ticks;
  }, [viewStart, viewDays]);

  /* convert data to GanttBars */
  const bars: GanttBar[] = useMemo(() => {
    if (mode === 'sprint') {
      return sprints
        .filter((s: Sprint) => s.startDate || s.endDate)
        .map((s: Sprint) => {
          const start = toDate(s.startDate) ?? toDate(s.endDate) ?? new Date();
          const end   = toDate(s.endDate)   ?? toDate(s.startDate) ?? new Date();
          const c     = SPRINT_COLORS[s.status] ?? SPRINT_COLORS.PLANNING;
          return { id: s.id, label: s.name, sublabel: s.goal ?? undefined, start, end, color: c };
        });
    }
    if (mode === 'version') {
      return versions
        .filter((v: any) => v.startDate || v.releaseDate)
        .map((v: any) => {
          const start = toDate(v.startDate)   ?? toDate(v.releaseDate) ?? new Date();
          const end   = toDate(v.releaseDate) ?? toDate(v.startDate)  ?? new Date();
          const c     = VERSION_COLORS[v.status] ?? VERSION_COLORS.UNRELEASED;
          return { id: v.id, label: v.name, sublabel: v.description ?? undefined, start, end, color: c };
        });
    }
    // epic
    return epics
      .filter((e: Issue) => e.startDate || e.dueDate)
      .map((e: Issue) => {
        const start = toDate(e.startDate) ?? toDate(e.dueDate) ?? new Date();
        const end   = toDate(e.dueDate)   ?? toDate(e.startDate) ?? new Date();
        const c     = STATUS_COLORS[e.status] ?? STATUS_COLORS.TODO;
        return { id: e.id, label: e.title, sublabel: e.issueKey ?? undefined, start, end, color: c };
      });
  }, [mode, sprints, versions, epics]);

  const goBack    = () => { const d = new Date(monthStart); d.setMonth(d.getMonth() - 1); setMonthStart(d); };
  const goForward = () => { const d = new Date(monthStart); d.setMonth(d.getMonth() + 1); setMonthStart(d); };
  const goToday   = () => { const d = new Date(); d.setDate(1); setMonthStart(d); };

  const navBtn = 'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors';
  const modeBtn = (m: ViewMode) =>
    `flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
      mode === m ? 'bg-blue-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950">

      {/* ── Toolbar ── */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 flex-wrap">
        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button onClick={() => setMode('sprint')}  className={modeBtn('sprint')}>
            <Layers className="w-3.5 h-3.5" />Sprint
          </button>
          <button onClick={() => setMode('version')} className={modeBtn('version')}>
            <Tag className="w-3.5 h-3.5" />Version
          </button>
          <button onClick={() => setMode('epic')}    className={modeBtn('epic')}>
            <Zap className="w-3.5 h-3.5" />Epic
          </button>
        </div>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

        {/* Navigation */}
        <button onClick={goBack}    className={navBtn}><ChevronLeft  className="w-4 h-4" /></button>
        <button onClick={goToday}   className={navBtn}><CalendarDays className="w-4 h-4" />Hôm nay</button>
        <button onClick={goForward} className={navBtn}><ChevronRight className="w-4 h-4" /></button>

        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-32">
          {MONTHS[viewStart.getMonth()]} {viewStart.getFullYear()}
          {' → '}
          {MONTHS[viewEnd.getMonth()]} {viewEnd.getFullYear()}
        </span>

        <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

        {/* Span selector */}
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          Hiển thị:
          {[1,2,3,6].map((m) => (
            <button
              key={m}
              onClick={() => setSpanMonths(m)}
              className={`px-2 py-1 rounded transition-colors ${spanMonths === m ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {m}T
            </button>
          ))}
        </div>

        <div className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          {bars.length} mục
        </div>
      </div>

      {/* ── Gantt area ── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {bars.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <CalendarDays className="w-12 h-12 text-gray-200 dark:text-gray-700" />
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              {mode === 'sprint'  && 'Chưa có Sprint nào có ngày bắt đầu / kết thúc'}
              {mode === 'version' && 'Chưa có Version nào có ngày'}
              {mode === 'epic'    && 'Chưa có Epic nào có ngày bắt đầu / hạn'}
            </p>
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-auto">
            <div style={{ minWidth: LABEL_W + viewDays * DAY_W }}>

              {/* ── Month header ── */}
              <div className="flex sticky top-0 z-20">
                {/* Label column header */}
                <div className="bg-gray-50 dark:bg-gray-800 border-b border-r border-gray-200 dark:border-gray-700 flex items-center px-3"
                  style={{ width: LABEL_W, flexShrink: 0, height: 32 }}>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    {mode === 'sprint' ? 'Sprint' : mode === 'version' ? 'Version' : 'Epic'}
                  </span>
                </div>
                {/* Month cells */}
                <div className="flex flex-1 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  {monthHeaders.map((m, i) => (
                    <div key={i}
                      className="border-r border-gray-200 dark:border-gray-700 flex items-center justify-center text-[11px] font-semibold text-gray-500 dark:text-gray-400"
                      style={{ width: m.days * DAY_W, height: 32 }}>
                      {m.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Day ticks header ── */}
              <div className="flex sticky top-8 z-10">
                <div className="bg-white dark:bg-gray-900 border-b border-r border-gray-200 dark:border-gray-700"
                  style={{ width: LABEL_W, flexShrink: 0, height: 20 }} />
                <div className="flex-1 relative bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800" style={{ height: 20 }}>
                  {dayTicks.map((tick) => (
                    <span key={tick.offset}
                      className="absolute top-1 text-[9px] text-gray-400 dark:text-gray-600 select-none"
                      style={{ left: tick.offset * DAY_W + 2 }}>
                      {tick.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Rows ── */}
              <div className="relative">
                {/* Today line */}
                {todayOffset >= 0 && todayOffset < viewDays && (
                  <div className="absolute top-0 bottom-0 z-10 pointer-events-none"
                    style={{ left: LABEL_W + todayOffset * DAY_W + DAY_W / 2, width: 2, background: '#ef4444', opacity: 0.7 }}>
                    <div className="absolute -top-1 -translate-x-1/2 text-[9px] text-red-500 font-bold whitespace-nowrap">今</div>
                  </div>
                )}

                {/* Vertical day guides (every 7) */}
                {dayTicks.map((tick) => (
                  <div key={tick.offset}
                    className="absolute top-0 bottom-0 border-l border-gray-100 dark:border-gray-800 pointer-events-none"
                    style={{ left: LABEL_W + tick.offset * DAY_W }} />
                ))}

                {/* Data rows */}
                {bars.map((bar) => (
                  <GanttRow key={bar.id} bar={bar} viewStart={viewStart} viewDays={viewDays} />
                ))}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-4 px-6 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
        <span className="text-[11px] text-gray-400 font-medium">Chú thích:</span>
        {mode === 'sprint' && Object.entries(SPRINT_COLORS).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1.5 text-[11px]" style={{ color: c.text }}>
            <span className="w-3 h-3 rounded-sm inline-block border" style={{ background: c.bg, borderColor: c.border }} />
            {k}
          </span>
        ))}
        {mode === 'version' && Object.entries(VERSION_COLORS).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1.5 text-[11px]" style={{ color: c.text }}>
            <span className="w-3 h-3 rounded-sm inline-block border" style={{ background: c.bg, borderColor: c.border }} />
            {k}
          </span>
        ))}
        {mode === 'epic' && Object.entries(STATUS_COLORS).map(([k, c]) => (
          <span key={k} className="flex items-center gap-1.5 text-[11px]" style={{ color: c.text }}>
            <span className="w-3 h-3 rounded-sm inline-block border" style={{ background: c.bg, borderColor: c.border }} />
            {k.replace('_',' ')}
          </span>
        ))}
        <span className="flex items-center gap-1.5 text-[11px] text-red-500 ml-2">
          <span className="w-0.5 h-3 bg-red-500 inline-block" />Hôm nay
        </span>
      </div>
    </div>
  );
}
