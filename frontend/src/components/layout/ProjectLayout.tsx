import { NavLink, Outlet, useParams, Link } from 'react-router-dom';
import { Kanban, List, ChevronRight, Settings, Users, BarChart2, Puzzle, Tag, LineChart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProject } from '../../hooks/useProjects';
import { Loader2 } from 'lucide-react';

export function ProjectLayout() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);
  const { data: project, isLoading } = useProject(id);

  return (
    <div className="flex h-full">
      {/* Project Sidebar */}
      <div
        className="flex flex-col bg-white border-r border-gray-200 flex-shrink-0"
        style={{ width: '200px' }}
      >
        {/* Project Name */}
        <div className="px-3 py-4 border-b border-gray-100">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">{t('common.loading')}</span>
            </div>
          ) : (
            <div>
              <Link
                to={`/projects/${id}/board`}
                className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition-colors block truncate"
              >
                {project?.name ?? 'Project'}
              </Link>
              <p className="text-xs text-gray-400 mt-0.5">{project?.key}</p>
            </div>
          )}
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-2 py-3 space-y-1">
          <NavLink
            to={`/projects/${id}/dashboard`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <BarChart2 className="w-4 h-4" />
            {t('nav.dashboard')}
          </NavLink>
          <NavLink
            to={`/projects/${id}/board`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Kanban className="w-4 h-4" />
            {t('projectNav.board')}
          </NavLink>
          <NavLink
            to={`/projects/${id}/backlog`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <List className="w-4 h-4" />
            {t('projectNav.backlog')}
          </NavLink>
          <NavLink
            to={`/projects/${id}/members`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <Users className="w-4 h-4" />
            {t('projectNav.members')}
          </NavLink>
          <NavLink
            to={`/projects/${id}/components`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Puzzle className="w-4 h-4" />
            {t('projectNav.components')}
          </NavLink>
          <NavLink
            to={`/projects/${id}/versions`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Tag className="w-4 h-4" />
            {t('projectNav.versions')}
          </NavLink>
          <NavLink
            to={`/projects/${id}/reports`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <LineChart className="w-4 h-4" />
            {t('projectNav.reports')}
          </NavLink>
          <NavLink
            to={`/projects/${id}/settings`}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <Settings className="w-4 h-4" />
            {t('projectNav.settings')}
          </NavLink>
        </nav>
      </div>

      {/* Breadcrumb + Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 px-6 py-3 border-b border-gray-200 bg-white text-sm text-gray-500">
          <Link to="/projects" className="hover:text-blue-600 transition-colors">
            Projects
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium">{project?.name ?? '...'}</span>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
