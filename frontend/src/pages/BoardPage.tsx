import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Loader2, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIssues, useCreateIssue } from '../hooks/useIssues';
import { useSprints } from '../hooks/useSprints';
import { useProjectMembers } from '../hooks/useProjects';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { IssueDetail } from '../components/issue/IssueDetail';
import { IssueForm } from '../components/issue/IssueForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import type { Issue } from '../types';

export function BoardPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: issues = [], isLoading, isError, refetch } = useIssues(id);
  const { data: sprints = [] } = useSprints(id);
  const { data: members = [] } = useProjectMembers(id);
  const createIssue = useCreateIssue(id);

  const activeSprint = sprints.find((s) => s.status === 'ACTIVE');
  const boardIssues = activeSprint
    ? issues.filter((i) => i.sprint?.id === activeSprint.id)
    : issues;

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  const handleCreateIssue = (data: Parameters<typeof createIssue.mutate>[0]) => {
    createIssue.mutate(
      { ...data, sprintId: activeSprint?.id },
      { onSuccess: () => setShowCreateModal(false) }
    );
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main board area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-900">
              {activeSprint ? (
                <span>
                  {t('board.title')} —{' '}
                  <span className="text-blue-600">{activeSprint.name}</span>
                </span>
              ) : (
                `${t('board.title')} — ${t('board.allIssues')}`
              )}
            </h2>
            {activeSprint?.goal && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {t('board.goal')}: {activeSprint.goal}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              {t('board.addIssue')}
            </Button>
          </div>
        </div>

        {/* Board content */}
        {isLoading && (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <p className="text-red-600 font-medium">{t('board.failedLoad')}</p>
              <button
                onClick={() => refetch()}
                className="text-blue-600 text-sm mt-2 hover:underline"
              >
                {t('board.tryAgain')}
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="flex-1 overflow-hidden">
            <KanbanBoard issues={boardIssues} onIssueClick={handleIssueClick} />
          </div>
        )}
      </div>

      {/* Issue detail panel */}
      {selectedIssue && (
        <div
          className="border-l border-gray-200 bg-white overflow-hidden flex-shrink-0"
          style={{ width: '420px' }}
        >
          <IssueDetail
            issueId={selectedIssue.id}
            onClose={() => setSelectedIssue(null)}
          />
        </div>
      )}

      {/* Create issue modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t('issue.create')}
        size="lg"
      >
        <IssueForm
          projectId={id}
          sprints={sprints}
          members={members}
          onSubmit={handleCreateIssue}
          onCancel={() => setShowCreateModal(false)}
          loading={createIssue.isPending}
          defaultSprintId={activeSprint?.id}
        />
      </Modal>
    </div>
  );
}
