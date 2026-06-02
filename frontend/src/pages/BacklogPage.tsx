import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Loader2, TrendingDown, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIssues, useCreateIssue } from '../hooks/useIssues';
import { useSprints, useCreateSprint } from '../hooks/useSprints';
import { useProjectMembers } from '../hooks/useProjects';
import { BacklogView } from '../components/backlog/BacklogView';
import { BurndownChart } from '../components/backlog/BurndownChart';
import { IssueDetail } from '../components/issue/IssueDetail';
import { IssueForm } from '../components/issue/IssueForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import type { Issue } from '../types';

interface CreateSprintForm {
  name: string;
  goal: string;
  startDate: string;
  endDate: string;
}

export function BacklogPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);

  const [selectedIssue, setSelectedIssue]   = useState<Issue | null>(null);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [defaultSprintId, setDefaultSprintId] = useState<number | undefined>();
  const [showBurndown, setShowBurndown]       = useState(false);

  const [sprintForm, setSprintForm] = useState<CreateSprintForm>({
    name: '',
    goal: '',
    startDate: '',
    endDate: '',
  });

  const { data: issues = [], isLoading: issuesLoading } = useIssues(id);
  const { data: sprints = [], isLoading: sprintsLoading } = useSprints(id);
  const activeSprint = sprints.find((s) => s.status === 'ACTIVE');
  const { data: members = [] } = useProjectMembers(id);
  const createIssue = useCreateIssue(id);
  const createSprint = useCreateSprint(id);

  const isLoading = issuesLoading || sprintsLoading;

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
  };

  const handleOpenCreateIssue = (sprintId?: number) => {
    setDefaultSprintId(sprintId);
    setShowIssueModal(true);
  };

  const handleCreateIssue = (data: Parameters<typeof createIssue.mutate>[0]) => {
    createIssue.mutate(data, {
      onSuccess: () => setShowIssueModal(false),
    });
  };

  const handleCreateSprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sprintForm.name.trim()) return;
    createSprint.mutate(
      {
        name: sprintForm.name.trim(),
        goal: sprintForm.goal.trim() || undefined,
        startDate: sprintForm.startDate || undefined,
        endDate: sprintForm.endDate || undefined,
      },
      {
        onSuccess: () => {
          setShowSprintModal(false);
          setSprintForm({ name: '', goal: '', startDate: '', endDate: '' });
        },
      }
    );
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main backlog area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 className="font-semibold text-gray-900 dark:text-white">{t('backlog.title')}</h2>
          <div className="flex items-center gap-2">
            {activeSprint && (
              <button
                onClick={() => setShowBurndown((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  showBurndown
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Burndown
              </button>
            )}
            <Button size="sm" variant="secondary" onClick={() => setShowSprintModal(true)}>
              <Plus className="w-4 h-4" />{t('backlog.createSprint')}
            </Button>
            <Button size="sm" onClick={() => handleOpenCreateIssue(undefined)}>
              <Plus className="w-4 h-4" />{t('backlog.addIssue')}
            </Button>
          </div>
        </div>

        {/* Burndown panel */}
        {showBurndown && activeSprint && (
          <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Burndown — <span className="text-blue-600">{activeSprint.name}</span>
                </h3>
                {activeSprint.startDate && activeSprint.endDate && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {activeSprint.startDate} → {activeSprint.endDate}
                  </p>
                )}
              </div>
              <button onClick={() => setShowBurndown(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
            <BurndownChart sprint={activeSprint} />
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <BacklogView
              projectId={id}
              sprints={sprints}
              allIssues={issues}
              onIssueClick={handleIssueClick}
              onCreateSprint={() => setShowSprintModal(true)}
              onCreateIssue={handleOpenCreateIssue}
            />
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

      {/* Create Issue Modal */}
      <Modal
        isOpen={showIssueModal}
        onClose={() => setShowIssueModal(false)}
        title={t('issue.create')}
        size="lg"
      >
        <IssueForm
          projectId={id}
          sprints={sprints}
          members={members}
          onSubmit={handleCreateIssue}
          onCancel={() => setShowIssueModal(false)}
          loading={createIssue.isPending}
          defaultSprintId={defaultSprintId}
        />
      </Modal>

      {/* Create Sprint Modal */}
      <Modal
        isOpen={showSprintModal}
        onClose={() => setShowSprintModal(false)}
        title={t('backlog.createSprint')}
        size="md"
      >
        <form onSubmit={handleCreateSprint} className="p-6 space-y-4">
          <Input
            label={t('sprint.name')}
            required
            value={sprintForm.name}
            onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })}
            placeholder="Sprint 1"
            autoFocus
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{t('sprint.goal')}</label>
            <textarea
              value={sprintForm.goal}
              onChange={(e) => setSprintForm({ ...sprintForm, goal: e.target.value })}
              placeholder={t('sprint.goalPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={t('sprint.startDate')}
              type="date"
              value={sprintForm.startDate}
              onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })}
            />
            <Input
              label={t('sprint.endDate')}
              type="date"
              value={sprintForm.endDate}
              onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowSprintModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={createSprint.isPending}>
              {t('sprint.create')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
