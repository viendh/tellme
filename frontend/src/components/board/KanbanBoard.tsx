import { useState, useCallback, useMemo } from 'react';
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay,
  PointerSensor, useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Issue, IssueStatus, IssuePriority } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { IssueCardOverlay } from './IssueCard';
import { Avatar } from '../common/Avatar';
import { usePatchIssueStatus } from '../../hooks/useIssues';

const STATUSES: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'TESTING', 'UAT', 'DONE'];

const STATUS_LABELS: Record<IssueStatus, string> = {
  TODO:        'Chờ xử lý',
  IN_PROGRESS: 'Đang thực hiện',
  TESTING:     'Kiểm thử',
  UAT:         'UAT',
  DONE:        'Hoàn thành',
};

const PRIORITY_ORDER: IssuePriority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const PRIORITY_COLORS: Record<IssuePriority, { dot: string; bg: string; text: string }> = {
  CRITICAL: { dot: 'bg-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',    text: 'text-red-700 dark:text-red-400' },
  HIGH:     { dot: 'bg-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-400' },
  MEDIUM:   { dot: 'bg-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-400' },
  LOW:      { dot: 'bg-gray-400',   bg: 'bg-gray-50 dark:bg-gray-800',     text: 'text-gray-600 dark:text-gray-400' },
};

type SwimlaneMode = 'none' | 'assignee' | 'priority';

interface KanbanBoardProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  swimlaneBy?: SwimlaneMode;
}

export function KanbanBoard({ issues, onIssueClick, swimlaneBy = 'none' }: KanbanBoardProps) {
  const [localIssues, setLocalIssues] = useState<Issue[]>(issues);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const patchStatus = usePatchIssueStatus();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const getIssuesByStatus = useCallback(
    (status: IssueStatus, subset?: Issue[]) =>
      (subset ?? localIssues).filter((i) => i.status === status).sort((a, b) => a.position - b.position),
    [localIssues]
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveIssue(localIssues.find((i) => i.id === event.active.id) ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as number;
    const overIsColumn = STATUSES.includes(over.id as IssueStatus);
    const overStatus = overIsColumn ? (over.id as IssueStatus) : localIssues.find((i) => i.id === over.id)?.status;
    const activeIssueLocal = localIssues.find((i) => i.id === activeId);
    if (!activeIssueLocal || !overStatus || activeIssueLocal.status === overStatus) return;
    setLocalIssues((prev) => prev.map((i) => i.id === activeId ? { ...i, status: overStatus } : i));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);
    if (!over) { setLocalIssues(issues); return; }
    const activeId = active.id as number;
    const overIsColumn = STATUSES.includes(over.id as IssueStatus);
    const activeIssueLocal = localIssues.find((i) => i.id === activeId);
    if (!activeIssueLocal) return;
    const newStatus = overIsColumn
      ? (over.id as IssueStatus)
      : (localIssues.find((i) => i.id === over.id)?.status ?? activeIssueLocal.status);

    if (!overIsColumn && activeIssueLocal.status === newStatus) {
      const col = getIssuesByStatus(newStatus);
      const oldIdx = col.findIndex((i) => i.id === activeId);
      const newIdx = col.findIndex((i) => i.id === over.id);
      if (oldIdx !== newIdx) {
        const reordered = arrayMove(col, oldIdx, newIdx);
        setLocalIssues((prev) => [...prev.filter((i) => i.status !== newStatus), ...reordered.map((i, idx) => ({ ...i, position: idx }))]);
      }
    }
    const original = issues.find((i) => i.id === activeId);
    if (original && original.status !== newStatus) {
      patchStatus.mutate({ id: activeId, data: { status: newStatus } }, { onError: () => setLocalIssues(issues) });
    }
  };

  // Sync local state when props change
  const issuesKey = issues.map((i) => `${i.id}-${i.status}`).join(',');
  const [lastKey, setLastKey] = useState(issuesKey);
  if (issuesKey !== lastKey) { setLastKey(issuesKey); setLocalIssues(issues); }

  // ── Swimlane groups ──
  const swimlaneGroups = useMemo(() => {
    if (swimlaneBy === 'none') return null;

    if (swimlaneBy === 'assignee') {
      const unassigned = localIssues.filter((i) => !i.assignee);
      const byUser = new Map<number, { user: Issue['assignee']; issues: Issue[] }>();
      localIssues.filter((i) => i.assignee).forEach((i) => {
        const uid = i.assignee!.id;
        if (!byUser.has(uid)) byUser.set(uid, { user: i.assignee, issues: [] });
        byUser.get(uid)!.issues.push(i);
      });
      const groups: { key: string; label: React.ReactNode; issues: Issue[] }[] = [];
      byUser.forEach(({ user, issues: ui }) => {
        groups.push({
          key: `user-${user!.id}`,
          label: (
            <div className="flex items-center gap-2">
              <Avatar user={user!} size="xs" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user!.fullName}</span>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-2">{ui.length}</span>
            </div>
          ),
          issues: ui,
        });
      });
      if (unassigned.length > 0) {
        groups.push({
          key: 'unassigned',
          label: (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600" />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Chưa giao</span>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-2">{unassigned.length}</span>
            </div>
          ),
          issues: unassigned,
        });
      }
      return groups;
    }

    // by priority
    return PRIORITY_ORDER
      .filter((p) => localIssues.some((i) => i.priority === p))
      .map((p) => {
        const c = PRIORITY_COLORS[p];
        return {
          key: `priority-${p}`,
          label: (
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
              <span className={`text-sm font-medium ${c.text}`}>{p}</span>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-2">
                {localIssues.filter((i) => i.priority === p).length}
              </span>
            </div>
          ),
          issues: localIssues.filter((i) => i.priority === p),
        };
      });
  }, [swimlaneBy, localIssues]);

  const dndContent = swimlaneBy === 'none' ? (
    /* ── Standard board ── */
    <div className="flex gap-4 h-full overflow-x-auto pb-4 px-6 pt-4">
      {STATUSES.map((status) => (
        <KanbanColumn key={status} status={status} issues={getIssuesByStatus(status)} onIssueClick={onIssueClick} />
      ))}
    </div>
  ) : (
    /* ── Swimlane board ── */
    <div className="overflow-auto h-full px-6 pt-4 pb-4">
      {/* Sticky status header */}
      <div className="flex gap-0 mb-2 sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 pb-2">
        <div className="w-36 flex-shrink-0" />
        {STATUSES.map((s) => (
          <div key={s} className="flex-1 min-w-[180px] px-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${s === 'TODO' ? 'bg-gray-400' : s === 'IN_PROGRESS' ? 'bg-blue-500' : s === 'TESTING' ? 'bg-amber-500' : s === 'UAT' ? 'bg-purple-500' : 'bg-green-500'}`} />
              <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {STATUS_LABELS[s]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Swimlane rows */}
      {swimlaneGroups?.map((group) => (
        <div key={group.key} className="flex gap-0 mb-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Lane label */}
          <div className="w-36 flex-shrink-0 flex items-start pt-3 px-3 border-r border-gray-100 dark:border-gray-800">
            {group.label}
          </div>
          {/* Columns within lane */}
          {STATUSES.map((status) => {
            const laneIssues = group.issues.filter((i) => i.status === status).sort((a, b) => a.position - b.position);
            return (
              <div key={status} className="flex-1 min-w-[180px] border-r last:border-r-0 border-gray-50 dark:border-gray-800 p-2">
                <KanbanColumn
                  key={`${group.key}-${status}`}
                  status={status}
                  issues={laneIssues}
                  onIssueClick={onIssueClick}
                  compact
                  hideHeader
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}
      onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      {dndContent}
      <DragOverlay>
        {activeIssue && <IssueCardOverlay issue={activeIssue} />}
      </DragOverlay>
    </DndContext>
  );
}
