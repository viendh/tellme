import { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { Issue, IssueStatus } from '../../types';
import { KanbanColumn } from './KanbanColumn';
import { IssueCardOverlay } from './IssueCard';
import { usePatchIssueStatus } from '../../hooks/useIssues';

const STATUSES: IssueStatus[] = ['TODO', 'IN_PROGRESS', 'TESTING', 'UAT', 'DONE'];

interface KanbanBoardProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
}

export function KanbanBoard({ issues, onIssueClick }: KanbanBoardProps) {
  const [localIssues, setLocalIssues] = useState<Issue[]>(issues);
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);
  const patchStatus = usePatchIssueStatus();

  // Sync when parent issues change
  useState(() => {
    setLocalIssues(issues);
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const getIssuesByStatus = useCallback(
    (status: IssueStatus) =>
      localIssues
        .filter((i) => i.status === status)
        .sort((a, b) => a.position - b.position),
    [localIssues]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const issue = localIssues.find((i) => i.id === event.active.id);
    setActiveIssue(issue ?? null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as number;
    const overId = over.id;

    // If over a column (status string)
    const overIsColumn = STATUSES.includes(overId as IssueStatus);
    const overStatus = overIsColumn
      ? (overId as IssueStatus)
      : localIssues.find((i) => i.id === overId)?.status;

    const activeIssueLocal = localIssues.find((i) => i.id === activeId);
    if (!activeIssueLocal || !overStatus) return;
    if (activeIssueLocal.status === overStatus) return;

    setLocalIssues((prev) =>
      prev.map((issue) =>
        issue.id === activeId ? { ...issue, status: overStatus } : issue
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) {
      setLocalIssues(issues);
      return;
    }

    const activeId = active.id as number;
    const overId = over.id;

    const activeIssueLocal = localIssues.find((i) => i.id === activeId);
    if (!activeIssueLocal) return;

    const overIsColumn = STATUSES.includes(overId as IssueStatus);
    const newStatus = overIsColumn
      ? (overId as IssueStatus)
      : localIssues.find((i) => i.id === overId)?.status ?? activeIssueLocal.status;

    // Reorder within same column
    if (!overIsColumn && activeIssueLocal.status === newStatus) {
      const columnIssues = getIssuesByStatus(newStatus);
      const oldIndex = columnIssues.findIndex((i) => i.id === activeId);
      const newIndex = columnIssues.findIndex((i) => i.id === overId);
      if (oldIndex !== newIndex) {
        const reordered = arrayMove(columnIssues, oldIndex, newIndex);
        setLocalIssues((prev) => {
          const others = prev.filter((i) => i.status !== newStatus);
          return [...others, ...reordered.map((i, idx) => ({ ...i, position: idx }))];
        });
      }
    }

    // Call API if status changed
    const originalIssue = issues.find((i) => i.id === activeId);
    if (originalIssue && originalIssue.status !== newStatus) {
      patchStatus.mutate(
        { id: activeId, data: { status: newStatus } },
        {
          onError: () => {
            setLocalIssues(issues);
          },
        }
      );
    }
  };

  // Keep local issues in sync with prop changes
  const issuesKey = issues.map((i) => `${i.id}-${i.status}`).join(',');
  const [lastIssuesKey, setLastIssuesKey] = useState(issuesKey);
  if (issuesKey !== lastIssuesKey) {
    setLastIssuesKey(issuesKey);
    setLocalIssues(issues);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto pb-4 px-6 pt-4">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            issues={getIssuesByStatus(status)}
            onIssueClick={onIssueClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeIssue && <IssueCardOverlay issue={activeIssue} />}
      </DragOverlay>
    </DndContext>
  );
}
