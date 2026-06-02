import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTranslation } from 'react-i18next';
import type { Issue, IssueStatus } from '../../types';
import { IssueCard } from './IssueCard';

const columnColors: Record<IssueStatus, string> = {
  TODO:        'bg-gray-400',
  IN_PROGRESS: 'bg-blue-500',
  TESTING:     'bg-amber-500',
  UAT:         'bg-purple-500',
  DONE:        'bg-green-500',
};

interface KanbanColumnProps {
  status: IssueStatus;
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  compact?: boolean;
  hideHeader?: boolean;
}

export function KanbanColumn({ status, issues, onIssueClick, compact = false, hideHeader = false }: KanbanColumnProps) {
  const { t } = useTranslation();
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={`${compact ? '' : 'kanban-column'} transition-colors ${isOver ? 'bg-blue-50 dark:bg-blue-900/10 ring-2 ring-blue-200 dark:ring-blue-800 rounded-lg' : ''}`}>

      {/* Column header — hidden in swimlane rows */}
      {!hideHeader && (
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2.5 h-2.5 rounded-full ${columnColors[status]}`} />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
            {t(`status.${status}`)}
          </h3>
          <span className="ml-auto bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs font-medium rounded-full px-2 py-0.5">
            {issues.length}
          </span>
        </div>
      )}

      {/* Cards */}
      <SortableContext id={status} items={issues.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={`flex flex-col gap-2 ${compact ? 'min-h-10' : 'min-h-16'}`}>
          {issues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} onClick={onIssueClick} />
          ))}
          {issues.length === 0 && (
            <div className={`flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-md ${compact ? 'h-8' : 'h-16'}`}>
              {!compact && <p className="text-xs text-gray-400">{t('board.dropHere')}</p>}
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}
