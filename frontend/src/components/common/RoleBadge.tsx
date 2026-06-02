import type { ProjectRole } from '../../types';

const ROLE_CONFIG: Record<ProjectRole, { label: string; className: string }> = {
  OWNER:     { label: 'Owner',     className: 'bg-purple-100 text-purple-700' },
  MANAGER:   { label: 'Manager',   className: 'bg-blue-100 text-blue-700' },
  DEVELOPER: { label: 'Developer', className: 'bg-green-100 text-green-700' },
  TESTER:    { label: 'Tester',    className: 'bg-yellow-100 text-yellow-700' },
  VIEWER:    { label: 'Viewer',    className: 'bg-gray-100 text-gray-600' },
};

export function RoleBadge({ role }: { role: ProjectRole }) {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.VIEWER;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
