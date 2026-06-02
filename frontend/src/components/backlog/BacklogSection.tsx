import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Issue } from '../../types';
import { BacklogIssueRow } from './BacklogIssueRow';
import { Button } from '../common/Button';
import { buildOrderedIssues } from '../../utils/issueTree';

interface BacklogSectionProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onCreateIssue: () => void;
}

export function BacklogSection({ issues, onIssueClick, onCreateIssue }: BacklogSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id: 'backlog' });

  const orderedNodes = buildOrderedIssues(issues);

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
        <h3 className="font-semibold text-gray-900 text-sm">Backlog</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {issues.length} issues
        </span>
        <div className="ml-auto">
          <Button
            size="xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              onCreateIssue();
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Create Issue
          </Button>
        </div>
      </div>

      {/* Issues */}
      {!collapsed && (
        <div
          ref={setNodeRef}
          className={`border-t border-gray-100 ${isOver ? 'bg-blue-50' : ''}`}
        >
          <SortableContext
            id="backlog"
            items={orderedNodes.map((n) => n.issue.id)}
            strategy={verticalListSortingStrategy}
          >
            {orderedNodes.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-gray-400">
                No issues in backlog. Drag issues here or create a new one.
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
