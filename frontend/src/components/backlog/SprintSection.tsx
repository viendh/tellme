import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Play,
  CheckCircle,
  Trash2,
  Plus,
} from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Issue, Sprint } from '../../types';
import { BacklogIssueRow } from './BacklogIssueRow';
import { Button } from '../common/Button';
import { formatDate } from '../../utils/formatters';
import { buildOrderedIssues } from '../../utils/issueTree';

interface SprintSectionProps {
  sprint: Sprint;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onStartSprint: (id: number) => void;
  onCompleteSprint: (id: number) => void;
  onDeleteSprint: (id: number) => void;
  onCreateIssue: (sprintId: number) => void;
  startLoading?: boolean;
  completeLoading?: boolean;
}

export function SprintSection({
  sprint,
  issues,
  onIssueClick,
  onStartSprint,
  onCompleteSprint,
  onDeleteSprint,
  onCreateIssue,
  startLoading = false,
  completeLoading = false,
}: SprintSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: `sprint-${sprint.id}` });

  const orderedNodes = buildOrderedIssues(issues);

  const statusColor =
    sprint.status === 'ACTIVE'
      ? 'bg-green-100 text-green-700'
      : sprint.status === 'COMPLETED'
      ? 'bg-gray-100 text-gray-500'
      : 'bg-blue-100 text-blue-700';

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 select-none"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{sprint.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
            {sprint.status}
          </span>
          {sprint.startDate && sprint.endDate && (
            <span className="text-xs text-gray-400 hidden sm:block">
              {formatDate(sprint.startDate)} – {formatDate(sprint.endDate)}
            </span>
          )}
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ml-1">
            {issues.length} issues
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto" onClick={(e) => e.stopPropagation()}>
          {sprint.status === 'PLANNING' && (
            <>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => onCreateIssue(sprint.id)}
              >
                <Plus className="w-3.5 h-3.5" />
                Issue
              </Button>
              <Button
                size="xs"
                variant="primary"
                onClick={() => onStartSprint(sprint.id)}
                loading={startLoading}
              >
                <Play className="w-3.5 h-3.5" />
                Start
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => {
                  if (confirm('Delete this sprint?')) onDeleteSprint(sprint.id);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </>
          )}
          {sprint.status === 'ACTIVE' && (
            <>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => onCreateIssue(sprint.id)}
              >
                <Plus className="w-3.5 h-3.5" />
                Issue
              </Button>
              <Button
                size="xs"
                variant="secondary"
                onClick={() => onCompleteSprint(sprint.id)}
                loading={completeLoading}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Complete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Issues */}
      {!collapsed && (
        <div
          ref={setNodeRef}
          className={`border-t border-gray-100 ${isOver ? 'bg-blue-50' : ''}`}
        >
          <SortableContext
            id={`sprint-${sprint.id}`}
            items={orderedNodes.map((n) => n.issue.id)}
            strategy={verticalListSortingStrategy}
          >
            {orderedNodes.length === 0 ? (
              <div className="px-4 py-4 text-center text-sm text-gray-400">
                No issues. Drag issues here or create a new one.
              </div>
            ) : (
              <div>
                {orderedNodes.map(({ issue, depth }) => (
                  <BacklogIssueRow
                    key={issue.id}
                    issue={issue}
                    depth={depth}
                    onClick={() => onIssueClick(issue)}
                  />
                ))}
              </div>
            )}
          </SortableContext>
        </div>
      )}
    </div>
  );
}
