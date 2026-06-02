import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MessageSquare, Clock, Layers, Wifi } from 'lucide-react';
import type { Issue } from '../../types';
import { Avatar } from '../common/Avatar';
import { TypeIcon, PriorityIcon } from '../common/Badge';
import { useSettingsStore } from '../../store/settingsStore';

interface IssueCardProps {
  issue: Issue;
  onClick: (issue: Issue) => void;
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

export function IssueCard({ issue, onClick }: IssueCardProps) {
  const cardFields = useSettingsStore((s) => s.cardFields);

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: issue.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onClick(issue)}
      className={`issue-card select-none ${isDragging ? 'dragging' : ''}`}
    >
      {/* Issue key */}
      {cardFields.issueKey && issue.issueKey && (
        <span className="text-xs text-gray-400 font-mono block mb-1">{issue.issueKey}</span>
      )}

      {/* Title */}
      <p className="text-sm text-gray-900 font-medium leading-snug mb-2 line-clamp-2">
        {issue.title}
      </p>

      {/* Progress bar */}
      {cardFields.progress && issue.progressPercent != null && issue.progressPercent > 0 && (
        <div className="w-full bg-gray-100 rounded-full h-1 mb-2">
          <div
            className="bg-blue-500 h-1 rounded-full"
            style={{ width: `${Math.min(100, issue.progressPercent)}%` }}
          />
        </div>
      )}

      {/* Last comment snippet */}
      {cardFields.lastComment && issue.lastCommentContent && (
        <div className="flex items-start gap-1.5 mb-2 bg-gray-50 rounded-md px-2 py-1.5">
          <MessageSquare className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <span className="text-[10px] text-gray-500 font-medium">{issue.lastCommentAuthor}: </span>
            <span className="text-[10px] text-gray-500 line-clamp-2">{issue.lastCommentContent}</span>
          </div>
        </div>
      )}

      {/* Labels */}
      {cardFields.labels && issue.labels && (
        <div className="flex flex-wrap gap-1 mb-2">
          {issue.labels.split(',').filter(Boolean).map((l) => (
            <span key={l} className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">
              {l.trim()}
            </span>
          ))}
        </div>
      )}

      {/* Estimate */}
      {cardFields.estimate && issue.originalEstimateHours != null && (
        <div className="flex items-center gap-1 mb-1.5 text-[10px] text-gray-400">
          <Clock className="w-3 h-3" />
          {issue.originalEstimateHours}h
        </div>
      )}

      {/* Module */}
      {cardFields.module && issue.module && (
        <div className="flex items-center gap-1 mb-1.5 text-[10px] text-gray-400">
          <Layers className="w-3 h-3" />
          {issue.module}
        </div>
      )}

      {/* Environment */}
      {cardFields.environment && issue.environment && (
        <div className="mb-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${envColor[issue.environment] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
            {issue.environment}
          </span>
        </div>
      )}

      {/* Workflow step */}
      {cardFields.workflowStep && issue.currentStepName && (
        <div className="mb-2">
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
        </div>
      )}

      {/* Footer row: type · priority · severity · id | due · assignee */}
      <div className="flex items-center justify-between gap-2 mt-1">
        <div className="flex items-center gap-1.5">
          {cardFields.type && <TypeIcon type={issue.type} />}
          {cardFields.priority && <PriorityIcon priority={issue.priority} />}
          {cardFields.severity && issue.severity && issue.severity !== 'MINOR' && (
            <span title={issue.severity} className={`w-2 h-2 rounded-full flex-shrink-0 ${severityDot[issue.severity]}`} />
          )}
          {cardFields.issueId && (
            <span className="text-xs text-gray-400">#{issue.id}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {cardFields.dueDate && issue.dueDate && (
            <span className={`text-xs font-medium flex items-center gap-0.5 ${isOverdue(issue.dueDate) ? 'text-red-600' : 'text-gray-400'}`}>
              <Wifi className="w-2.5 h-2.5 rotate-90" />
              {formatDueDateShort(issue.dueDate)}
            </span>
          )}
          {cardFields.assignee && issue.assignee && (
            <Avatar user={issue.assignee} size="xs" />
          )}
        </div>
      </div>
    </div>
  );
}

// Ghost/overlay card shown while dragging
export function IssueCardOverlay({ issue }: { issue: Issue }) {
  return (
    <div className="issue-card shadow-2xl rotate-2 cursor-grabbing">
      {issue.issueKey && (
        <span className="text-xs text-gray-400 font-mono block mb-1">{issue.issueKey}</span>
      )}
      <p className="text-sm text-gray-900 font-medium leading-snug mb-3 line-clamp-2">
        {issue.title}
      </p>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <TypeIcon type={issue.type} />
          <PriorityIcon priority={issue.priority} />
          <span className="text-xs text-gray-400">#{issue.id}</span>
        </div>
        {issue.assignee && <Avatar user={issue.assignee} size="xs" />}
      </div>
    </div>
  );
}
