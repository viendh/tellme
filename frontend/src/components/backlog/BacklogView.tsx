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
import { Plus } from 'lucide-react';
import type { Issue, Sprint } from '../../types';
import { SprintSection } from './SprintSection';
import { BacklogSection } from './BacklogSection';
import { Button } from '../common/Button';
import { useStartSprint, useCompleteSprint, useDeleteSprint } from '../../hooks/useSprints';
import { usePatchIssueSprint } from '../../hooks/useIssues';
import { BacklogIssueRow } from './BacklogIssueRow';

interface BacklogViewProps {
  projectId: number;
  sprints: Sprint[];
  allIssues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onCreateSprint: () => void;
  onCreateIssue: (sprintId?: number) => void;
}

export function BacklogView({
  projectId,
  sprints,
  allIssues,
  onIssueClick,
  onCreateSprint,
  onCreateIssue,
}: BacklogViewProps) {
  const [activeIssue, setActiveIssue] = useState<Issue | null>(null);

  const startSprint = useStartSprint(projectId);
  const completeSprint = useCompleteSprint(projectId);
  const deleteSprint = useDeleteSprint(projectId);
  const patchSprint = usePatchIssueSprint();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const getIssuesBySprint = useCallback(
    (sprintId: number) => allIssues.filter((i) => i.sprint?.id === sprintId),
    [allIssues]
  );

  const backlogIssues = allIssues.filter((i) => !i.sprint);

  const handleDragStart = (event: DragStartEvent) => {
    const issue = allIssues.find((i) => i.id === event.active.id);
    setActiveIssue(issue ?? null);
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // No optimistic updates needed for backlog, handled on end
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveIssue(null);

    if (!over) return;

    const issueId = active.id as number;
    const overId = over.id as string;

    // Determine target sprint
    let targetSprintId: number | null = null;

    if (overId === 'backlog') {
      targetSprintId = null;
    } else if (overId.startsWith('sprint-')) {
      targetSprintId = Number(overId.replace('sprint-', ''));
    } else {
      // Dropped on an issue — figure out which container it's in
      const overIssue = allIssues.find((i) => i.id === Number(overId));
      if (overIssue) {
        targetSprintId = overIssue.sprint?.id ?? null;
      }
    }

    const currentIssue = allIssues.find((i) => i.id === issueId);
    if (!currentIssue) return;

    const currentSprintId = currentIssue.sprint?.id ?? null;
    if (currentSprintId === targetSprintId) return;

    patchSprint.mutate({ id: issueId, data: { sprintId: targetSprintId } });
  };

  const sortedSprints = [...sprints].sort((a, b) => {
    const order = { ACTIVE: 0, PLANNING: 1, COMPLETED: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Sprint sections */}
        {sortedSprints.map((sprint) => (
          <SprintSection
            key={sprint.id}
            sprint={sprint}
            issues={getIssuesBySprint(sprint.id)}
            onIssueClick={onIssueClick}
            onStartSprint={(id) => startSprint.mutate(id)}
            onCompleteSprint={(id) => completeSprint.mutate(id)}
            onDeleteSprint={(id) => deleteSprint.mutate(id)}
            onCreateIssue={(sprintId) => onCreateIssue(sprintId)}
            startLoading={startSprint.isPending}
            completeLoading={completeSprint.isPending}
          />
        ))}

        {/* Backlog section */}
        <BacklogSection
          issues={backlogIssues}
          onIssueClick={onIssueClick}
          onCreateIssue={() => onCreateIssue(undefined)}
        />

        {/* Create sprint button */}
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={onCreateSprint}>
            <Plus className="w-4 h-4" />
            Create Sprint
          </Button>
        </div>
      </div>

      <DragOverlay>
        {activeIssue && (
          <div className="bg-white shadow-2xl rounded-md border border-gray-200 pointer-events-none">
            <BacklogIssueRow issue={activeIssue} onClick={() => {}} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
