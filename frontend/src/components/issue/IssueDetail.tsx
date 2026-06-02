import { useState, useEffect, useRef } from 'react';
import { X, Trash2, ExternalLink, Loader2, ChevronDown, ChevronRight, Plus, Eye, ThumbsUp, Copy, ArrowRight, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useIssue, useUpdateIssue, useDeleteIssue, useSubtasks, useCreateIssue } from '../../hooks/useIssues';
import { useToggleWatch, useToggleVote, useCloneIssue, useMoveIssue, useUpdateLabels } from '../../hooks/useIssueFeatures';
import { useConfirm } from '../../context/ConfirmContext';
import { useSprints } from '../../hooks/useSprints';
import { useProjects } from '../../hooks/useProjects';
import { Modal } from '../common/Modal';
import { IssueForm } from './IssueForm';
import { Avatar } from '../common/Avatar';
import { StatusBadge, PriorityBadge, TypeBadge } from '../common/Badge';
import { AttachmentSection } from './AttachmentSection';
import { CommentSection } from './CommentSection';
import { ActivityFeed } from './ActivityFeed';
import { AssigneeSelect } from './AssigneeSelect';
import { Select } from '../common/Select';
import { IssueLinksSection } from './IssueLinksSection';
import { WorklogSection } from './WorklogSection';
import { WorkflowPanel } from './WorkflowPanel';
import { formatDate } from '../../utils/formatters';
import type { IssueStatus, IssuePriority, IssueType, User } from '../../types';

interface IssueDetailProps {
  issueId: number;
  onClose: () => void;
}

export function IssueDetail({ issueId, onClose }: IssueDetailProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { data: issue, isLoading } = useIssue(issueId);
  const updateIssue = useUpdateIssue(issueId);
  const deleteIssue = useDeleteIssue();
  const toggleWatch = useToggleWatch(issueId);
  const toggleVote = useToggleVote(issueId);
  const cloneIssue = useCloneIssue(issueId);
  const moveIssue = useMoveIssue(issueId);
  const updateLabels = useUpdateLabels(issueId);

  const projectId = issue?.projectId ?? 0;
  const { data: sprints = [] } = useSprints(projectId);
  const { data: allProjects = [] } = useProjects();

  const { data: subtasks = [] } = useSubtasks(issueId);
  const createSubtask = useCreateIssue(projectId, issueId);

  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveTargetProjectId, setMoveTargetProjectId] = useState('');

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [detailsForm, setDetailsForm] = useState({
    severity: '' as '' | 'MINOR' | 'MAJOR' | 'CRITICAL',
    environment: '' as '' | 'DEV' | 'UAT' | 'PROD',
    module: '',
    dueDate: '',
    startDate: '',
    originalEstimateHours: '',
    remainingEstimateHours: '',
    timeSpentHours: '',
    progressPercent: '',
    slaHours: '',
    businessImpact: '',
    rootCause: '',
  });
  const [labelsValue, setLabelsValue] = useState('');
  const [editingLabels, setEditingLabels] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (issue) {
      setTitleValue(issue.title);
      setDescValue(issue.description ?? '');
      setDetailsForm({
        severity: issue.severity ?? '',
        environment: issue.environment ?? '',
        module: issue.module ?? '',
        dueDate: issue.dueDate ?? '',
        startDate: issue.startDate ?? '',
        originalEstimateHours: issue.originalEstimateHours != null ? String(issue.originalEstimateHours) : '',
        remainingEstimateHours: issue.remainingEstimateHours != null ? String(issue.remainingEstimateHours) : '',
        timeSpentHours: issue.timeSpentHours != null ? String(issue.timeSpentHours) : '',
        progressPercent: issue.progressPercent != null ? String(issue.progressPercent) : '',
        slaHours: issue.slaHours != null ? String(issue.slaHours) : '',
        businessImpact: issue.businessImpact ?? '',
        rootCause: issue.rootCause ?? '',
      });
      setLabelsValue(issue.labels ?? '');
    }
  }, [issue]);

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus();
  }, [editingTitle]);

  useEffect(() => {
    if (editingDesc && descRef.current) descRef.current.focus();
  }, [editingDesc]);

  const handleSubtaskCreate = (data: Parameters<typeof createSubtask.mutate>[0]) => {
    createSubtask.mutate(
      { ...data, parentIssueId: issueId },
      { onSuccess: () => setShowSubtaskModal(false) }
    );
  };

  const handleTitleSave = () => {
    if (!titleValue.trim() || titleValue === issue?.title) {
      setEditingTitle(false);
      setTitleValue(issue?.title ?? '');
      return;
    }
    updateIssue.mutate({ title: titleValue.trim() });
    setEditingTitle(false);
  };

  const handleDescSave = () => {
    if (descValue === issue?.description) {
      setEditingDesc(false);
      return;
    }
    updateIssue.mutate({ description: descValue.trim() || undefined });
    setEditingDesc(false);
  };

  const handleStatusChange = (status: string) => {
    updateIssue.mutate({ status: status as IssueStatus });
  };

  const handlePriorityChange = (priority: string) => {
    updateIssue.mutate({ priority: priority as IssuePriority });
  };

  const handleTypeChange = (type: string) => {
    updateIssue.mutate({ type: type as IssueType });
  };

  const handleAssigneeChange = (user: User | null) => {
    updateIssue.mutate({
      assigneeId: user ? user.id : null,
    });
  };

  const handleSprintChange = (sprintId: string) => {
    updateIssue.mutate({
      sprintId: sprintId ? Number(sprintId) : null,
    });
  };

  const handleDetailsSave = () => {
    updateIssue.mutate({
      severity: detailsForm.severity || undefined,
      environment: detailsForm.environment || undefined,
      module: detailsForm.module.trim() || undefined,
      dueDate: detailsForm.dueDate || undefined,
      startDate: detailsForm.startDate || undefined,
      originalEstimateHours: detailsForm.originalEstimateHours !== '' ? Number(detailsForm.originalEstimateHours) : undefined,
      remainingEstimateHours: detailsForm.remainingEstimateHours !== '' ? Number(detailsForm.remainingEstimateHours) : undefined,
      timeSpentHours: detailsForm.timeSpentHours !== '' ? Number(detailsForm.timeSpentHours) : undefined,
      progressPercent: detailsForm.progressPercent !== '' ? Number(detailsForm.progressPercent) : undefined,
      slaHours: detailsForm.slaHours !== '' ? Number(detailsForm.slaHours) : undefined,
      businessImpact: detailsForm.businessImpact.trim() || undefined,
      rootCause: detailsForm.rootCause.trim() || undefined,
    });
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: t('issue.deleteTitle'),
      description: t('issue.deleteConfirm'),
      variant: 'danger',
    });
    if (!ok) return;
    deleteIssue.mutate(issueId, {
      onSuccess: () => {
        onClose();
        navigate(-1);
      },
    });
  };

  const handleMove = () => {
    if (!moveTargetProjectId) return;
    moveIssue.mutate(Number(moveTargetProjectId), {
      onSuccess: () => {
        setShowMoveModal(false);
        onClose();
      },
    });
  };

  const handleLabelsSave = () => {
    updateLabels.mutate(labelsValue);
    setEditingLabels(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">{t('issue.notFound')}</p>
      </div>
    );
  }

  const statusOptions = [
    { value: 'TODO', label: t('status.TODO') },
    { value: 'IN_PROGRESS', label: t('status.IN_PROGRESS') },
    { value: 'TESTING', label: t('status.TESTING') },
    { value: 'UAT', label: t('status.UAT') },
    { value: 'DONE', label: t('status.DONE') },
  ];

  const priorityOptions = [
    { value: 'LOW', label: t('priority.LOW') },
    { value: 'MEDIUM', label: t('priority.MEDIUM') },
    { value: 'HIGH', label: t('priority.HIGH') },
    { value: 'CRITICAL', label: t('priority.CRITICAL') },
  ];

  const typeOptions = [
    { value: 'TASK', label: t('type.TASK') },
    { value: 'STORY', label: t('type.STORY') },
    { value: 'BUG', label: t('type.BUG') },
    { value: 'EPIC', label: t('type.EPIC') },
  ];

  const sprintOptions = [
    { value: '', label: t('common.backlog') },
    ...sprints.map((s) => ({ value: s.id.toString(), label: s.name })),
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <TypeBadge type={issue.type} />
          {issue.issueKey ? (
            <span className="text-xs bg-gray-100 text-gray-500 font-mono px-2 py-0.5 rounded">
              {issue.issueKey}
            </span>
          ) : (
            <span className="text-xs text-gray-400 font-mono">
              #{issue.id}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {/* Watch button */}
          <button
            onClick={() => toggleWatch.mutate()}
            disabled={toggleWatch.isPending}
            className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-md transition-colors ${
              issue.watching
                ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title={issue.watching ? t('issue.unwatch') : t('issue.watch')}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{issue.watchCount ?? 0}</span>
          </button>
          {/* Vote button */}
          <button
            onClick={() => toggleVote.mutate()}
            disabled={toggleVote.isPending}
            className={`flex items-center gap-1 px-2 py-1.5 text-xs rounded-md transition-colors ${
              issue.voted
                ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title={issue.voted ? t('issue.unvote') : t('issue.vote')}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{issue.voteCount ?? 0}</span>
          </button>
          {/* Clone button */}
          <button
            onClick={() => cloneIssue.mutate()}
            disabled={cloneIssue.isPending}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
            title={t('issue.clone')}
          >
            <Copy className="w-4 h-4" />
          </button>
          {/* Move button */}
          <button
            onClick={() => setShowMoveModal(true)}
            className="p-2 text-gray-400 hover:text-blue-600 rounded-md hover:bg-gray-100"
            title={t('issue.move')}
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/issues/${issueId}`)}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title={t('issue.openFullPage')}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 rounded-md hover:bg-gray-100"
            title={t('issue.deleteTitle')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4 space-y-6">
          {/* Title */}
          <div>
            {editingTitle ? (
              <input
                ref={titleRef}
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleSave();
                  if (e.key === 'Escape') {
                    setTitleValue(issue.title);
                    setEditingTitle(false);
                  }
                }}
                className="w-full text-lg font-semibold text-gray-900 border border-blue-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <h1
                className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => setEditingTitle(true)}
              >
                {issue.title}
              </h1>
            )}
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.status')}</label>
              <Select
                options={statusOptions}
                value={issue.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.priority')}</label>
              <Select
                options={priorityOptions}
                value={issue.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.type')}</label>
              <Select
                options={typeOptions}
                value={issue.type}
                onChange={(e) => handleTypeChange(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.assignee')}</label>
              <AssigneeSelect
                projectId={projectId}
                value={issue.assignee ?? null}
                onChange={handleAssigneeChange}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.sprint')}</label>
              <Select
                options={sprintOptions}
                value={issue.sprint?.id.toString() ?? ''}
                onChange={(e) => handleSprintChange(e.target.value)}
              />
            </div>
          </div>

          {/* Reporter & Dates */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t('issue.reporter')}</p>
              <div className="flex items-center gap-2">
                <Avatar user={issue.reporter} size="xs" />
                <span className="text-gray-700">{issue.reporter.fullName}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t('issue.created')}</p>
              <p className="text-gray-700">{formatDate(issue.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t('issue.updated')}</p>
              <p className="text-gray-700">{formatDate(issue.updatedAt)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t('issue.priority')}</p>
              <PriorityBadge priority={issue.priority} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-2">{t('issue.description')}</label>
            {editingDesc ? (
              <div>
                <textarea
                  ref={descRef}
                  value={descValue}
                  onChange={(e) => setDescValue(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-blue-400 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleDescSave}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                  >
                    {t('common.save')}
                  </button>
                  <button
                    onClick={() => {
                      setDescValue(issue.description ?? '');
                      setEditingDesc(false);
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="text-sm text-gray-700 cursor-pointer hover:bg-gray-50 rounded-md px-3 py-2 min-h-16 border border-transparent hover:border-gray-200 transition-colors whitespace-pre-wrap"
                onClick={() => setEditingDesc(true)}
              >
                {issue.description || (
                  <span className="text-gray-400 italic">{t('issue.clickToAdd')}</span>
                )}
              </div>
            )}
          </div>

          {/* Labels */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              <label className="text-xs font-medium text-gray-500">{t('issue.labels')}</label>
            </div>
            {editingLabels ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={labelsValue}
                  onChange={(e) => setLabelsValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleLabelsSave();
                    if (e.key === 'Escape') { setLabelsValue(issue.labels ?? ''); setEditingLabels(false); }
                  }}
                  onBlur={handleLabelsSave}
                  placeholder={t('issue.labelsPlaceholder')}
                  className="flex-1 text-sm border border-blue-400 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            ) : (
              <div
                onClick={() => setEditingLabels(true)}
                className="cursor-pointer min-h-7 flex flex-wrap gap-1 p-1.5 rounded-md border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {labelsValue
                  ? labelsValue.split(',').map((l) => l.trim()).filter(Boolean).map((lbl) => (
                    <span
                      key={lbl}
                      className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium"
                    >
                      {lbl}
                    </span>
                  ))
                  : <span className="text-xs text-gray-400 italic">{t('issue.labelsEmpty')}</span>
                }
              </div>
            )}
          </div>

          {/* Status badge display */}
          <div className="flex gap-2 flex-wrap">
            <StatusBadge status={issue.status} />
            <TypeBadge type={issue.type} />
            <PriorityBadge priority={issue.priority} />
          </div>

          {/* Parent issue (read-only) */}
          {issue.parentIssueTitle && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t('issue.parentIssue')}</p>
              <button
                onClick={() => navigate(`/issues/${issue.parentIssueId}`)}
                className="text-sm text-blue-600 hover:underline text-left"
              >
                {issue.parentIssueTitle}
              </button>
            </div>
          )}

          {/* Sub-tasks */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-700">{t('issue.subtasks')}</span>
              <button
                onClick={() => setShowSubtaskModal(true)}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('issue.addSubtask')}
              </button>
            </div>
            <div className="divide-y divide-gray-100">
              {subtasks.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => navigate(`/issues/${sub.id}`)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left group"
                >
                  <span className="text-xs font-mono text-gray-400 shrink-0">{sub.issueKey ?? `#${sub.id}`}</span>
                  <span className="text-sm text-gray-800 flex-1 truncate group-hover:text-blue-600">{sub.title}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${
                    sub.status === 'DONE' ? 'bg-green-100 text-green-700'
                    : sub.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                  }`}>{sub.status.replace('_', ' ')}</span>
                </button>
              ))}
              {subtasks.length === 0 && (
                <p className="px-4 py-3 text-xs text-gray-400">{t('issue.noSubtasks')}</p>
              )}
            </div>
          </div>

          <Modal
            isOpen={showSubtaskModal}
            onClose={() => setShowSubtaskModal(false)}
            title={t('issue.addSubtask')}
            size="lg"
          >
            <IssueForm
              projectId={projectId}
              sprints={sprints}
              onSubmit={handleSubtaskCreate}
              onCancel={() => setShowSubtaskModal(false)}
              loading={createSubtask.isPending}
            />
          </Modal>

          {/* Resolution date (read-only) */}
          {issue.resolutionDate && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">{t('issue.resolutionDate')}</p>
              <p className="text-sm text-gray-700">{formatDate(issue.resolutionDate)}</p>
            </div>
          )}

          {/* Collapsible Details section */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setDetailsOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
            >
              <span>{t('issue.details')}</span>
              {detailsOpen ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {detailsOpen && (
              <div className="px-4 py-4 space-y-4">
                {/* Severity */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.severity')}</label>
                  <select
                    value={detailsForm.severity}
                    onChange={(e) => setDetailsForm((f) => ({ ...f, severity: e.target.value as typeof f.severity }))}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('issue.selectSeverity')}</option>
                    <option value="MINOR">{t('severity.MINOR')}</option>
                    <option value="MAJOR">{t('severity.MAJOR')}</option>
                    <option value="CRITICAL">{t('severity.CRITICAL')}</option>
                  </select>
                </div>

                {/* Environment */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.environment')}</label>
                  <select
                    value={detailsForm.environment}
                    onChange={(e) => setDetailsForm((f) => ({ ...f, environment: e.target.value as typeof f.environment }))}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('issue.selectEnvironment')}</option>
                    <option value="DEV">{t('env.DEV')}</option>
                    <option value="UAT">{t('env.UAT')}</option>
                    <option value="PROD">{t('env.PROD')}</option>
                  </select>
                </div>

                {/* Module */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.module')}</label>
                  <input
                    type="text"
                    value={detailsForm.module}
                    onChange={(e) => setDetailsForm((f) => ({ ...f, module: e.target.value }))}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('issue.modulePlaceholder')}
                  />
                </div>

                {/* Dates row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.startDate')}</label>
                    <input
                      type="date"
                      value={detailsForm.startDate}
                      onChange={(e) => setDetailsForm((f) => ({ ...f, startDate: e.target.value }))}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.dueDate')}</label>
                    <input
                      type="date"
                      value={detailsForm.dueDate}
                      onChange={(e) => setDetailsForm((f) => ({ ...f, dueDate: e.target.value }))}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Time estimates row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.estimateHours')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={detailsForm.originalEstimateHours}
                      onChange={(e) => setDetailsForm((f) => ({ ...f, originalEstimateHours: e.target.value }))}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.remainingHours')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={detailsForm.remainingEstimateHours}
                      onChange={(e) => setDetailsForm((f) => ({ ...f, remainingEstimateHours: e.target.value }))}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.spentHours')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={detailsForm.timeSpentHours}
                      onChange={(e) => setDetailsForm((f) => ({ ...f, timeSpentHours: e.target.value }))}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Progress + SLA row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.progress')}</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={detailsForm.progressPercent}
                      onChange={(e) => setDetailsForm((f) => ({ ...f, progressPercent: e.target.value }))}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                    {detailsForm.progressPercent !== '' && (
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, Number(detailsForm.progressPercent)))}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.sla')}</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={detailsForm.slaHours}
                      onChange={(e) => setDetailsForm((f) => ({ ...f, slaHours: e.target.value }))}
                      className="w-full text-sm border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Business impact */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.businessImpact')}</label>
                  <textarea
                    value={detailsForm.businessImpact}
                    onChange={(e) => setDetailsForm((f) => ({ ...f, businessImpact: e.target.value }))}
                    rows={3}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('issue.businessImpactPlaceholder')}
                  />
                </div>

                {/* Root cause */}
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.rootCause')}</label>
                  <textarea
                    value={detailsForm.rootCause}
                    onChange={(e) => setDetailsForm((f) => ({ ...f, rootCause: e.target.value }))}
                    rows={3}
                    className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('issue.rootCausePlaceholder')}
                  />
                </div>

                {/* Save button */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleDetailsSave}
                    disabled={updateIssue.isPending}
                    className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateIssue.isPending ? t('common.saving') : t('common.save')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Workflow transitions + approvals */}
          <WorkflowPanel issue={issue} />

          {/* Issue Links */}
          <IssueLinksSection issueId={issueId} />

          {/* Worklog */}
          <WorklogSection issueId={issueId} />

          {/* Attachments */}
          <AttachmentSection issueId={issueId} />

          <hr className="border-gray-200" />

          {/* Comments */}
          <CommentSection issueId={issueId} />

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Activity */}
          <ActivityFeed issueId={issueId} />
        </div>
      </div>

      {/* Move Issue Modal */}
      <Modal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        title={t('issue.moveTitle')}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{t('issue.moveDesc')}</p>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">{t('issue.targetProject')}</label>
            <select
              value={moveTargetProjectId}
              onChange={(e) => setMoveTargetProjectId(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('issue.selectProject')}</option>
              {allProjects
                .filter((p) => p.id !== projectId)
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.key})</option>
                ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setShowMoveModal(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleMove}
              disabled={!moveTargetProjectId || moveIssue.isPending}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {moveIssue.isPending ? t('common.saving') : t('issue.move')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
