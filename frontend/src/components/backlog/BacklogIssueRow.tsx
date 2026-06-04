import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Clock, Layers } from 'lucide-react';
import type { Issue } from '../../types';
import { TypeIcon, PriorityIcon, StatusBadge } from '../common/Badge';
import { Avatar } from '../common/Avatar';
import { useSettingsStore } from '../../store/settingsStore';

interface BacklogIssueRowProps {
  issue: Issue;
  onClick: () => void;
  depth?: number;
}

const severityDot: Record<string, string> = {
  MAJOR: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

const envColor: Record<string, string> = {
  DEV:  'bg-slate-100 text-slate-600 border-slate-200',
  UAT:  'bg-amber-50 text-amber-700 border-amber-200',
  PROD: 'bg-red-50 text-red-700 border-red-200',
};

function formatDueDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function isOverdue(dateStr: string): boolean {
  return new Date(dateStr) < new Date();
}

const BASE_PX = 16;
const INDENT_PX = 28;

export function BacklogIssueRow({ issue, onClick, depth = 0 }: BacklogIssueRowProps) {
  const cardFields = useSettingsStore((s) => s.cardFields);

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: issue.id });

  const isChild = depth > 0;
  const paddingLeft = BASE_PX + depth * INDENT_PX;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    paddingLeft: `${paddingLeft}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`pr-4 py-2 border-b border-gray-50 cursor-pointer select-none ${
        isChild ? 'bg-gray-50/60 hover:bg-blue-50/40' : 'hover:bg-gray-50'
      } ${isDragging ? 'shadow-lg bg-white' : ''}`}
    >
      {/* ── Main row ── */}
      <div className="flex items-center gap-3">
        {isChild && (
          <span className="flex-shrink-0 text-gray-300 text-xs leading-none -ml-1 mr-0.5">↳</span>
        )}

        {cardFields.type && <TypeIcon type={issue.type} />}

        {/* Title + key */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {cardFields.issueKey && issue.issueKey && (
            <span className="text-xs text-gray-400 font-mono flex-shrink-0">{issue.issueKey}</span>
          )}
          <span className={`text-sm truncate ${isChild ? 'text-gray-600' : 'text-gray-800'}`}>
            {issue.title}
          </span>
        </div>

        {/* Right-side chips — fixed-width columns with dividers */}
        <div className="flex items-center flex-shrink-0 divide-x divide-gray-100">

          {/* Col: Workflow step */}
          {cardFields.workflowStep && (
            <div className="px-2 flex justify-center min-w-[80px]">
              {issue.currentStepName ? (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold border"
                  style={{
                    background: (issue.currentStepColor ?? '#6b7280') + '20',
                    color: issue.currentStepColor ?? '#6b7280',
                    borderColor: (issue.currentStepColor ?? '#6b7280') + '50',
                  }}
                >
                  {issue.currentStepName}
                </span>
              ) : <span className="text-gray-200 text-xs">—</span>}
            </div>
          )}

          {/* Col: Environment */}
          {cardFields.environment && (
            <div className="px-2 flex justify-center w-14">
              {issue.environment ? (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${envColor[issue.environment] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {issue.environment}
                </span>
              ) : <span className="text-gray-200 text-xs">—</span>}
            </div>
          )}

          {/* Col: Module */}
          {cardFields.module && (
            <div className="px-2 flex justify-center min-w-[64px]">
              {issue.module ? (
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Layers className="w-3 h-3" />{issue.module}
                </span>
              ) : <span className="text-gray-200 text-xs">—</span>}
            </div>
          )}

          {/* Col: Estimate */}
          {cardFields.estimate && (
            <div className="px-2 flex justify-center w-14">
              {issue.originalEstimateHours != null ? (
                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock className="w-3 h-3" />{issue.originalEstimateHours}h
                </span>
              ) : <span className="text-gray-200 text-xs">—</span>}
            </div>
          )}

          {/* Col: Labels */}
          {cardFields.labels && (
            <div className="px-2 flex justify-center min-w-[60px]">
              {issue.labels ? (
                <div className="flex gap-1">
                  {issue.labels.split(',').filter(Boolean).slice(0, 2).map((l) => (
                    <span key={l} className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
                      {l.trim()}
                    </span>
                  ))}
                </div>
              ) : <span className="text-gray-200 text-xs">—</span>}
            </div>
          )}

          {/* Col: Progress */}
          {cardFields.progress && (
            <div className="px-2 flex justify-center w-16">
              {issue.progressPercent != null && issue.progressPercent > 0 ? (
                <div className="w-14 bg-gray-100 rounded-full h-1">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${Math.min(100, issue.progressPercent)}%` }} />
                </div>
              ) : <span className="text-gray-200 text-xs">—</span>}
            </div>
          )}

          {/* Col: Due date */}
          {cardFields.dueDate && (
            <div className="px-2 flex justify-center w-14">
              {issue.dueDate ? (
                <span className={`text-xs font-medium ${isOverdue(issue.dueDate) ? 'text-red-600' : 'text-gray-400'}`}>
                  {formatDueDateShort(issue.dueDate)}
                </span>
              ) : <span className="text-gray-200 text-xs">—</span>}
            </div>
          )}

          {/* Col: Severity */}
          {cardFields.severity && (
            <div className="px-2 flex justify-center w-8">
              {issue.severity && issue.severity !== 'MINOR' ? (
                <span title={issue.severity} className={`w-2 h-2 rounded-full ${severityDot[issue.severity]}`} />
              ) : <span className="text-gray-200 text-xs">—</span>}
            </div>
          )}

          {/* Col: Priority */}
          {cardFields.priority && (
            <div className="px-2 flex justify-center w-8">
              <PriorityIcon priority={issue.priority} />
            </div>
          )}

          {/* Col: Status — always visible */}
          <div className="px-2 flex justify-center w-28">
            <StatusBadge status={issue.status} />
          </div>

          {/* Col: Issue ID */}
          {cardFields.issueId && (
            <div className="px-2 flex justify-center w-12">
              <span className="text-xs text-gray-400 font-mono">#{issue.id}</span>
            </div>
          )}

          {/* Col: Assignee — always visible */}
          <div className="px-2 flex justify-center w-9">
            {cardFields.assignee ? (
              issue.assignee
                ? <Avatar user={issue.assignee} size="xs" />
                : <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-300" />
            ) : <div className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* ── Last comment row (below title, only if enabled) ── */}
      {cardFields.lastComment && issue.lastCommentContent && (
        <div className="flex items-start gap-1.5 mt-1.5 ml-7 bg-gray-50 rounded px-2 py-1">
          <MessageSquare className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="text-[10px] text-gray-500 line-clamp-1">
            <span className="font-medium">{issue.lastCommentAuthor}:</span>{' '}
            {issue.lastCommentContent}
          </span>
        </div>
      )}
    </div>
  );
}
