import { Link } from 'react-router-dom';
import { Plus, Loader2, FolderKanban } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../hooks/useProjects';
import { Button } from '../components/common/Button';
import { formatDate } from '../utils/formatters';
import type { ProjectStatus, ProjectPriority } from '../types';

const STATUS_COLORS: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-500',
  PLANNING: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
  UAT: 'bg-yellow-100 text-yellow-700',
  GO_LIVE: 'bg-orange-100 text-orange-700',
  CLOSED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-gray-100 text-gray-400',
};

const PRIORITY_DOT: Record<ProjectPriority, string> = {
  LOW: 'bg-gray-400',
  MEDIUM: 'bg-yellow-400',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500',
};

export function ProjectsPage() {
  const { t } = useTranslation();
  const { data: projects = [], isLoading, isError, refetch } = useProjects();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('projects.title')}</h1>
          <p className="text-gray-500 mt-1">{t('projects.subtitle')}</p>
        </div>
        <Link to="/projects/new">
          <Button>
            <Plus className="w-4 h-4" />
            {t('projects.new')}
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {isError && (
        <div className="text-center py-20">
          <p className="text-red-600 font-medium">{t('projects.failedLoad')}</p>
          <p className="text-gray-500 text-sm mt-1 mb-4">{t('projects.failedLoadDesc')}</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('board.tryAgain')}
          </button>
        </div>
      )}

      {!isLoading && !isError && projects.length === 0 && (
        <div className="text-center py-20">
          <FolderKanban className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('projects.empty')}</h3>
          <p className="text-gray-500 mb-6">{t('projects.emptyDesc')}</p>
          <Link to="/projects/new">
            <Button>
              <Plus className="w-4 h-4" />
              {t('projects.create')}
            </Button>
          </Link>
        </div>
      )}

      {!isLoading && !isError && projects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const status = (project.status ?? 'PLANNING') as ProjectStatus;
            const priority = project.priority as ProjectPriority | undefined;
            const progress = project.progressPercent;

            return (
              <Link
                key={project.id}
                to={`/projects/${project.id}/board`}
                className="block bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-base group-hover:bg-blue-700 transition-colors shrink-0">
                    {project.key.slice(0, 2)}
                  </div>
                  <div className="flex items-center gap-2">
                    {priority && (
                      <span
                        title={t(`priority.${priority}`)}
                        className={`w-2 h-2 rounded-full ${PRIORITY_DOT[priority]}`}
                      />
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status]}`}>
                      {t(`projectStatus.${status}`)}
                    </span>
                  </div>
                </div>

                {/* Name + key */}
                <h3 className="font-semibold text-gray-900 text-base mb-0.5 group-hover:text-blue-600 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs font-mono text-gray-400 mb-2">{project.key}</p>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                )}

                {/* Progress bar */}
                {progress != null && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{t('createProject.progressPercent')}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    {project.projectType && (
                      <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs">
                        {t(`projectType.${project.projectType}`)}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(project.createdAt)}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
