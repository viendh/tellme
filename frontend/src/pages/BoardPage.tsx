import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Loader2, RefreshCw, X, Rows3, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useIssues, useCreateIssue } from '../hooks/useIssues';
import { useSprints } from '../hooks/useSprints';
import { useProjectMembers } from '../hooks/useProjects';
import { KanbanBoard } from '../components/board/KanbanBoard';
import { IssueDetail } from '../components/issue/IssueDetail';
import { IssueForm } from '../components/issue/IssueForm';
import { Modal } from '../components/common/Modal';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import type { Issue, IssueType, IssuePriority } from '../types';

type SwimlaneMode = 'none' | 'assignee' | 'priority';

const PRIORITY_COLORS: Record<IssuePriority, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-200',
  HIGH:     'bg-orange-100 text-orange-700 border-orange-200',
  MEDIUM:   'bg-yellow-100 text-yellow-700 border-yellow-200',
  LOW:      'bg-gray-100 text-gray-600 border-gray-200',
};

const TYPE_ICONS: Record<IssueType, string> = {
  BUG:   '🐛', TASK: '✅', STORY: '📖', EPIC: '⚡',
};

export function BoardPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);

  const [selectedIssue, setSelectedIssue]   = useState<Issue | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // ── Filters ──
  const [filterAssignees, setFilterAssignees] = useState<Set<number>>(new Set());
  const [filterTypes,     setFilterTypes]     = useState<Set<IssueType>>(new Set());
  const [filterPriorities,setFilterPriorities]= useState<Set<IssuePriority>>(new Set());
  const [filterText,      setFilterText]      = useState('');
  const [swimlane,        setSwimlane]        = useState<SwimlaneMode>('none');

  const { data: issues = [], isLoading, isError, refetch } = useIssues(id);
  const { data: sprints = [] } = useSprints(id);
  const { data: members = [] } = useProjectMembers(id);
  const createIssue = useCreateIssue(id);

  const activeSprint  = sprints.find((s) => s.status === 'ACTIVE');
  const sprintIssues  = activeSprint
    ? issues.filter((i) => i.sprint?.id === activeSprint.id)
    : issues;

  // ── Apply filters ──
  const filteredIssues = useMemo(() => {
    return sprintIssues.filter((i) => {
      if (filterAssignees.size > 0 && (!i.assignee || !filterAssignees.has(i.assignee.id))) return false;
      if (filterTypes.size > 0     && !filterTypes.has(i.type))       return false;
      if (filterPriorities.size > 0 && !filterPriorities.has(i.priority)) return false;
      if (filterText) {
        const q = filterText.toLowerCase();
        if (!i.title.toLowerCase().includes(q) && !(i.issueKey ?? '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [sprintIssues, filterAssignees, filterTypes, filterPriorities, filterText]);

  const hasFilters = filterAssignees.size > 0 || filterTypes.size > 0 || filterPriorities.size > 0 || filterText;

  const clearFilters = () => {
    setFilterAssignees(new Set());
    setFilterTypes(new Set());
    setFilterPriorities(new Set());
    setFilterText('');
  };

  const toggleSet = <T,>(set: Set<T>, val: T): Set<T> => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  };

  const handleCreateIssue = (data: Parameters<typeof createIssue.mutate>[0]) => {
    createIssue.mutate(
      { ...data, sprintId: activeSprint?.id },
      { onSuccess: () => setShowCreateModal(false) }
    );
  };

  // ── Assignees that actually appear on the board ──
  const boardAssignees = useMemo(() => {
    const seen = new Map<number, Issue['assignee']>();
    sprintIssues.forEach((i) => { if (i.assignee) seen.set(i.assignee.id, i.assignee); });
    return [...seen.values()];
  }, [sprintIssues]);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {activeSprint
                ? <span>{t('board.title')} — <span className="text-blue-600">{activeSprint.name}</span></span>
                : `${t('board.title')} — ${t('board.allIssues')}`}
            </h2>
            {activeSprint?.goal && (
              <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded">
                {t('board.goal')}: {activeSprint.goal}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => refetch()} className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <RefreshCw className="w-4 h-4" />
            </button>
            <Button size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />{t('board.addIssue')}
            </Button>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="flex items-center gap-3 px-6 py-2.5 bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 flex-wrap">

          {/* Search */}
          <input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Tìm issue..."
            className="h-7 pl-3 pr-8 text-xs border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-36"
          />

          {/* Assignee filters */}
          {boardAssignees.length > 0 && (
            <div className="flex items-center gap-1">
              {boardAssignees.map((user) => user && (
                <button
                  key={user.id}
                  onClick={() => setFilterAssignees((prev) => toggleSet(prev, user.id))}
                  title={user.fullName}
                  className={`rounded-full transition-all ${filterAssignees.has(user.id) ? 'ring-2 ring-blue-500 ring-offset-1' : 'opacity-50 hover:opacity-100'}`}
                >
                  <Avatar user={user} size="xs" />
                </button>
              ))}
            </div>
          )}

          {/* Type filters */}
          <div className="flex items-center gap-1">
            {(['BUG','TASK','STORY','EPIC'] as IssueType[]).map((type) => (
              <button
                key={type}
                onClick={() => setFilterTypes((prev) => toggleSet(prev, type))}
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium transition-all ${
                  filterTypes.has(type)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300'
                }`}
              >
                <span>{TYPE_ICONS[type]}</span>{type}
              </button>
            ))}
          </div>

          {/* Priority filters */}
          <div className="flex items-center gap-1">
            {(['CRITICAL','HIGH','MEDIUM','LOW'] as IssuePriority[]).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriorities((prev) => toggleSet(prev, p))}
                className={`text-[11px] px-2 py-0.5 rounded-full border font-medium transition-all ${
                  filterPriorities.has(p)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : `${PRIORITY_COLORS[p]} opacity-70 hover:opacity-100`
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

          {/* Swimlane toggle */}
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-0.5">
            <button
              onClick={() => setSwimlane('none')}
              title="Không nhóm"
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                swimlane === 'none' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
            </button>
            <button
              onClick={() => setSwimlane('assignee')}
              title="Nhóm theo người thực hiện"
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                swimlane === 'assignee' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              <Rows3 className="w-3 h-3" />
              Assignee
            </button>
            <button
              onClick={() => setSwimlane('priority')}
              title="Nhóm theo độ ưu tiên"
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium transition-all ${
                swimlane === 'priority' ? 'bg-blue-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
              }`}
            >
              <Rows3 className="w-3 h-3" />
              Priority
            </button>
          </div>

          {/* Result count + clear */}
          <div className="ml-auto flex items-center gap-2">
            {hasFilters && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {filteredIssues.length} / {sprintIssues.length} issues
              </span>
            )}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-[11px] text-red-500 hover:text-red-700 px-2 py-0.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <X className="w-3 h-3" />Xóa bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* ── Board ── */}
        {isLoading && (
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
        {isError && (
          <div className="flex items-center justify-center flex-1">
            <div className="text-center">
              <p className="text-red-600 font-medium">{t('board.failedLoad')}</p>
              <button onClick={() => refetch()} className="text-blue-600 text-sm mt-2 hover:underline">{t('board.tryAgain')}</button>
            </div>
          </div>
        )}
        {!isLoading && !isError && (
          <div className="flex-1 overflow-hidden">
            <KanbanBoard issues={filteredIssues} onIssueClick={setSelectedIssue} swimlaneBy={swimlane} />
          </div>
        )}
      </div>

      {/* ── Issue detail panel ── */}
      {selectedIssue && (
        <div className="border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden flex-shrink-0" style={{ width: '420px' }}>
          <IssueDetail issueId={selectedIssue.id} onClose={() => setSelectedIssue(null)} />
        </div>
      )}

      {/* ── Create modal ── */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t('issue.create')} size="lg">
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
