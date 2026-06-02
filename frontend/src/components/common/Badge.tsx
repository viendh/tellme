import type { IssueStatus, IssuePriority, IssueType } from '../../types';

// Status Badge
const statusConfig: Record<IssueStatus, { label: string; className: string }> = {
  TODO: { label: 'To Do', className: 'bg-gray-100 text-gray-700' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
  TESTING: { label: 'Testing', className: 'bg-amber-100 text-amber-700' },
  UAT: { label: 'UAT', className: 'bg-purple-100 text-purple-700' },
  DONE: { label: 'Done', className: 'bg-green-100 text-green-700' },
};

// Priority Badge
const priorityConfig: Record<IssuePriority, { label: string; className: string }> = {
  LOW: { label: 'Low', className: 'bg-gray-100 text-gray-600' },
  MEDIUM: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700' },
  HIGH: { label: 'High', className: 'bg-orange-100 text-orange-700' },
  CRITICAL: { label: 'Critical', className: 'bg-red-100 text-red-700' },
};

// Type Badge
const typeConfig: Record<IssueType, { label: string; className: string }> = {
  EPIC: { label: 'Epic', className: 'bg-purple-100 text-purple-700' },
  STORY: { label: 'Story', className: 'bg-green-100 text-green-700' },
  TASK: { label: 'Task', className: 'bg-blue-100 text-blue-700' },
  BUG: { label: 'Bug', className: 'bg-red-100 text-red-700' },
};

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: IssuePriority;
  className?: string;
}

export function PriorityBadge({ priority, className = '' }: PriorityBadgeProps) {
  const config = priorityConfig[priority];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

interface TypeBadgeProps {
  type: IssueType;
  className?: string;
}

export function TypeBadge({ type, className = '' }: TypeBadgeProps) {
  const config = typeConfig[type];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
}

// Type Icon (small colored square/dot for use in cards)
const typeIconColors: Record<IssueType, string> = {
  EPIC: 'bg-purple-500',
  STORY: 'bg-green-500',
  TASK: 'bg-blue-500',
  BUG: 'bg-red-500',
};

interface TypeIconProps {
  type: IssueType;
}

export function TypeIcon({ type }: TypeIconProps) {
  return (
    <div
      title={type}
      className={`w-3 h-3 rounded-sm flex-shrink-0 ${typeIconColors[type]}`}
    />
  );
}

// Priority dot
const priorityDotColors: Record<IssuePriority, string> = {
  LOW: 'text-gray-400',
  MEDIUM: 'text-yellow-500',
  HIGH: 'text-orange-500',
  CRITICAL: 'text-red-500',
};

interface PriorityIconProps {
  priority: IssuePriority;
}

export function PriorityIcon({ priority }: PriorityIconProps) {
  return (
    <span title={priority} className={`text-sm font-bold ${priorityDotColors[priority]}`}>
      {priority === 'CRITICAL' ? '!!!' : priority === 'HIGH' ? '!!' : priority === 'MEDIUM' ? '!' : '–'}
    </span>
  );
}
