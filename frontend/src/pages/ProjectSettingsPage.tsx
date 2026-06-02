import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Save, Archive, ArchiveRestore, Trash2, Loader2, GitBranch } from 'lucide-react';
import { useProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { useAuthStore } from '../store/authStore';
import { useConfirm } from '../context/ConfirmContext';
import { Input } from '../components/common/Input';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '../api/workflows';
import toast from 'react-hot-toast';
import type {
  ProjectStatus, ProjectType, ProjectVisibility, ProjectPriority,
  ProjectPhase, RiskLevel, ApprovalStatus, BoardType, EstimationType, CapexOpexType,
} from '../types';

type Tab = 'basic' | 'timeline' | 'agile' | 'finance';
const TABS: Tab[] = ['basic', 'timeline', 'agile', 'finance'];

function SelectField({
  label, value, onChange, children, disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-50 disabled:text-gray-400"
      >
        {children}
      </select>
    </div>
  );
}

/* ─── Workflow Selector sub-component ───────────────────────────────────── */
function WorkflowSelector({
  projectId,
  currentWorkflowId,
}: {
  projectId: number;
  currentWorkflowId?: number;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string>(currentWorkflowId?.toString() ?? '');

  // Sync when project data loads
  useEffect(() => {
    setSelected(currentWorkflowId?.toString() ?? '');
  }, [currentWorkflowId]);

  const { data: workflows = [] } = useQuery({
    queryKey: ['workflows'],
    queryFn: workflowApi.list,
  });

  const assignMut = useMutation({
    mutationFn: (workflowId: number | null) => workflowApi.assignToProject(projectId, workflowId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success(t('workflow.assigned'));
    },
    onError: () => toast.error(t('workflow.assignError')),
  });

  const handleSave = () => {
    assignMut.mutate(selected ? Number(selected) : null);
  };

  return (
    <div className="mt-8 border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 bg-gray-50 px-6 py-3 border-b border-gray-200">
        <GitBranch className="w-4 h-4 text-gray-500" />
        <h2 className="text-sm font-semibold text-gray-700">{t('workflow.assignToProject')}</h2>
      </div>
      <div className="px-6 py-5">
        <p className="text-xs text-gray-500 mb-4">{t('workflow.assignDesc')}</p>
        <div className="flex items-center gap-3">
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">{t('workflow.noWorkflow')}</option>
            {workflows.map(wf => (
              <option key={wf.id} value={wf.id}>
                {wf.name}{wf.isDefault ? ` (${t('workflow.default')})` : ''}
              </option>
            ))}
          </select>
          <button
            onClick={handleSave}
            disabled={assignMut.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            {assignMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectSettingsPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);
  const { user } = useAuthStore();

  const { data: project, isLoading } = useProject(id);
  const updateProject = useUpdateProject(id);
  const deleteProject = useDeleteProject();
  const confirm = useConfirm();

  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [initialized, setInitialized] = useState(false);

  // Tab 1 — Basic
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('SOFTWARE');
  const [status, setStatus] = useState<ProjectStatus>('PLANNING');
  const [visibility, setVisibility] = useState<ProjectVisibility>('PRIVATE');
  const [priority, setPriority] = useState<ProjectPriority | ''>('');

  // Tab 2 — Timeline
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [actualEndDate, setActualEndDate] = useState('');
  const [progressPercent, setProgressPercent] = useState('');
  const [milestone, setMilestone] = useState('');
  const [releaseVersion, setReleaseVersion] = useState('');
  const [phase, setPhase] = useState<ProjectPhase | ''>('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel | ''>('');
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('PENDING');

  // Tab 3 — Agile
  const [boardType, setBoardType] = useState<BoardType>('SCRUM');
  const [estimationType, setEstimationType] = useState<EstimationType>('STORY_POINT');
  const [sprintDurationDays, setSprintDurationDays] = useState('14');
  const [wipLimit, setWipLimit] = useState('');
  const [backlogEnabled, setBacklogEnabled] = useState(true);

  // Tab 4 — Finance & DevOps
  const [budgetAmount, setBudgetAmount] = useState('');
  const [plannedCost, setPlannedCost] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [currencyCode, setCurrencyCode] = useState('VND');
  const [capexOpexType, setCapexOpexType] = useState<CapexOpexType | ''>('');
  const [contractNo, setContractNo] = useState('');
  const [gitRepositoryUrl, setGitRepositoryUrl] = useState('');
  const [ciPipelineUrl, setCiPipelineUrl] = useState('');
  const [deploymentEnv, setDeploymentEnv] = useState<'DEV' | 'UAT' | 'PROD' | ''>('');
  const [releaseTag, setReleaseTag] = useState('');
  const [testCoverage, setTestCoverage] = useState('');

  const [nameError, setNameError] = useState('');

  // Initialize form from project data
  useEffect(() => {
    if (project && !initialized) {
      setName(project.name ?? '');
      setDescription(project.description ?? '');
      setProjectType(project.projectType ?? 'SOFTWARE');
      setStatus(project.status ?? 'PLANNING');
      setVisibility(project.visibility ?? 'PRIVATE');
      setPriority(project.priority ?? '');
      setStartDate(project.startDate ?? '');
      setEndDate(project.endDate ?? '');
      setActualEndDate(project.actualEndDate ?? '');
      setProgressPercent(project.progressPercent != null ? String(project.progressPercent) : '');
      setMilestone(project.milestone ?? '');
      setReleaseVersion(project.releaseVersion ?? '');
      setPhase(project.phase ?? '');
      setRiskLevel(project.riskLevel ?? '');
      setApprovalStatus(project.approvalStatus ?? 'PENDING');
      setBoardType(project.boardType ?? 'SCRUM');
      setEstimationType(project.estimationType ?? 'STORY_POINT');
      setSprintDurationDays(project.sprintDurationDays != null ? String(project.sprintDurationDays) : '14');
      setWipLimit(project.wipLimit != null ? String(project.wipLimit) : '');
      setBacklogEnabled(project.backlogEnabled !== false);
      setBudgetAmount(project.budgetAmount != null ? String(project.budgetAmount) : '');
      setPlannedCost(project.plannedCost != null ? String(project.plannedCost) : '');
      setActualCost(project.actualCost != null ? String(project.actualCost) : '');
      setCurrencyCode(project.currencyCode ?? 'VND');
      setCapexOpexType(project.capexOpexType ?? '');
      setContractNo(project.contractNo ?? '');
      setGitRepositoryUrl(project.gitRepositoryUrl ?? '');
      setCiPipelineUrl(project.ciPipelineUrl ?? '');
      setDeploymentEnv((project.deploymentEnv as 'DEV' | 'UAT' | 'PROD' | '') ?? '');
      setReleaseTag(project.releaseTag ?? '');
      setTestCoverage(project.testCoverage != null ? String(project.testCoverage) : '');
      setInitialized(true);
    }
  }, [project, initialized]);

  const isOwner = project?.owner?.id === user?.id;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setNameError(t('createProject.nameRequired'));
      setActiveTab('basic');
      return;
    }
    setNameError('');
    updateProject.mutate({
      name: name.trim(),
      description: description,
      projectType: projectType || undefined,
      status: status || undefined,
      visibility: visibility || undefined,
      priority: priority || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      actualEndDate: actualEndDate || undefined,
      progressPercent: progressPercent ? Number(progressPercent) : undefined,
      milestone: milestone || undefined,
      releaseVersion: releaseVersion || undefined,
      phase: phase || undefined,
      riskLevel: riskLevel || undefined,
      approvalStatus: approvalStatus || undefined,
      boardType: boardType || undefined,
      estimationType: estimationType || undefined,
      sprintDurationDays: sprintDurationDays ? Number(sprintDurationDays) : undefined,
      wipLimit: wipLimit ? Number(wipLimit) : undefined,
      backlogEnabled,
      budgetAmount: budgetAmount ? Number(budgetAmount) : undefined,
      plannedCost: plannedCost ? Number(plannedCost) : undefined,
      actualCost: actualCost ? Number(actualCost) : undefined,
      currencyCode: currencyCode || undefined,
      capexOpexType: capexOpexType || undefined,
      contractNo: contractNo || undefined,
      gitRepositoryUrl: gitRepositoryUrl || undefined,
      ciPipelineUrl: ciPipelineUrl || undefined,
      deploymentEnv: (deploymentEnv as 'DEV' | 'UAT' | 'PROD') || undefined,
      releaseTag: releaseTag || undefined,
      testCoverage: testCoverage ? Number(testCoverage) : undefined,
    });
  };

  const handleArchive = async () => {
    if (!project) return;
    const isArchived = project.status === 'ARCHIVED';
    const ok = await confirm({
      title: isArchived ? t('settings.unarchive') : t('settings.archive'),
      description: isArchived
        ? t('settings.unarchiveConfirm', { name: project.name })
        : t('settings.archiveConfirm', { name: project.name }),
      confirmLabel: isArchived ? t('settings.unarchive') : t('settings.archive'),
      variant: 'warning',
    });
    if (!ok) return;
    updateProject.mutate({
      name: project.name,
      status: isArchived ? 'ACTIVE' : 'ARCHIVED',
    });
  };

  const handleDelete = async () => {
    if (!project) return;
    const ok = await confirm({
      title: t('settings.delete'),
      description: t('settings.deleteConfirm', { name: project.name }),
      confirmLabel: t('settings.delete'),
      variant: 'danger',
    });
    if (!ok) return;
    deleteProject.mutate(id);
  };

  const tabLabel = (tab: Tab) => {
    const map: Record<Tab, string> = {
      basic: t('createProject.tabBasic'),
      timeline: t('createProject.tabTimeline'),
      agile: t('createProject.tabAgile'),
      finance: t('createProject.tabFinanceDevops'),
    };
    return map[tab];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!project) return null;

  const isArchived = project.status === 'ARCHIVED';

  return (
    <div className="p-8 max-w-3xl mx-auto overflow-y-auto h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
        <p className="text-gray-500 mt-1">{t('settings.subtitle')}</p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-6">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tabLabel(tab)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave}>
        <div className="bg-white rounded-xl border border-gray-200 p-8">

          {/* ── Tab 1: Basic ── */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <Input
                label={t('createProject.name')}
                required
                value={name}
                onChange={(e) => { setName(e.target.value); setNameError(''); }}
                placeholder={t('createProject.namePlaceholder')}
                error={nameError}
                autoFocus
              />

              {/* Key — read-only */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">{t('createProject.key')}</label>
                <div className="flex items-center gap-2">
                  <input
                    value={project.key}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md text-sm bg-gray-50 text-gray-500 font-mono cursor-not-allowed"
                  />
                  <span className="text-xs text-gray-400">{t('settings.keyReadOnly')}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">{t('createProject.description')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('createProject.descPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SelectField label={t('createProject.projectType')} value={projectType} onChange={(v) => setProjectType(v as ProjectType)}>
                  <option value="SOFTWARE">{t('projectType.SOFTWARE')}</option>
                  <option value="BUSINESS">{t('projectType.BUSINESS')}</option>
                  <option value="INFRASTRUCTURE">{t('projectType.INFRASTRUCTURE')}</option>
                </SelectField>

                <SelectField label={t('createProject.status')} value={status} onChange={(v) => setStatus(v as ProjectStatus)}>
                  <option value="ACTIVE">{t('projectStatus.ACTIVE')}</option>
                  <option value="DRAFT">{t('projectStatus.DRAFT')}</option>
                  <option value="PLANNING">{t('projectStatus.PLANNING')}</option>
                  <option value="IN_PROGRESS">{t('projectStatus.IN_PROGRESS')}</option>
                  <option value="UAT">{t('projectStatus.UAT')}</option>
                  <option value="GO_LIVE">{t('projectStatus.GO_LIVE')}</option>
                  <option value="CLOSED">{t('projectStatus.CLOSED')}</option>
                  <option value="ARCHIVED">{t('projectStatus.ARCHIVED')}</option>
                </SelectField>

                <SelectField label={t('createProject.visibility')} value={visibility} onChange={(v) => setVisibility(v as ProjectVisibility)}>
                  <option value="PRIVATE">{t('visibility.PRIVATE')}</option>
                  <option value="PUBLIC">{t('visibility.PUBLIC')}</option>
                  <option value="INTERNAL">{t('visibility.INTERNAL')}</option>
                </SelectField>

                <SelectField label={t('createProject.priority')} value={priority} onChange={(v) => setPriority(v as ProjectPriority | '')}>
                  <option value="">{t('createProject.noPriority')}</option>
                  <option value="LOW">{t('priority.LOW')}</option>
                  <option value="MEDIUM">{t('priority.MEDIUM')}</option>
                  <option value="HIGH">{t('priority.HIGH')}</option>
                  <option value="CRITICAL">{t('priority.CRITICAL')}</option>
                </SelectField>
              </div>
            </div>
          )}

          {/* ── Tab 2: Timeline ── */}
          {activeTab === 'timeline' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input label={t('createProject.startDate')} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <Input label={t('createProject.endDate')} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <Input label={t('createProject.actualEndDate')} type="date" value={actualEndDate} onChange={(e) => setActualEndDate(e.target.value)} />
                <Input label={t('createProject.progressPercent')} type="number" value={progressPercent} onChange={(e) => setProgressPercent(e.target.value)} placeholder="0" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label={t('createProject.milestone')} value={milestone} onChange={(e) => setMilestone(e.target.value)} placeholder="v1.0 Launch" />
                <Input label={t('createProject.releaseVersion')} value={releaseVersion} onChange={(e) => setReleaseVersion(e.target.value)} placeholder="1.0.0" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <SelectField label={t('createProject.phase')} value={phase} onChange={(v) => setPhase(v as ProjectPhase | '')}>
                  <option value="">— none —</option>
                  <option value="INITIATION">{t('phase.INITIATION')}</option>
                  <option value="PLANNING">{t('phase.PLANNING')}</option>
                  <option value="EXECUTION">{t('phase.EXECUTION')}</option>
                  <option value="MONITORING">{t('phase.MONITORING')}</option>
                  <option value="CLOSING">{t('phase.CLOSING')}</option>
                </SelectField>
                <SelectField label={t('createProject.riskLevel')} value={riskLevel} onChange={(v) => setRiskLevel(v as RiskLevel | '')}>
                  <option value="">— none —</option>
                  <option value="LOW">{t('riskLevel.LOW')}</option>
                  <option value="MEDIUM">{t('riskLevel.MEDIUM')}</option>
                  <option value="HIGH">{t('riskLevel.HIGH')}</option>
                </SelectField>
                <SelectField label={t('createProject.approvalStatus')} value={approvalStatus} onChange={(v) => setApprovalStatus(v as ApprovalStatus)}>
                  <option value="PENDING">{t('approvalStatus.PENDING')}</option>
                  <option value="APPROVED">{t('approvalStatus.APPROVED')}</option>
                  <option value="REJECTED">{t('approvalStatus.REJECTED')}</option>
                </SelectField>
              </div>
            </div>
          )}

          {/* ── Tab 3: Agile ── */}
          {activeTab === 'agile' && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">{t('createProject.boardType')}</label>
                <div className="flex gap-6">
                  {(['SCRUM', 'KANBAN'] as BoardType[]).map((bt) => (
                    <label key={bt} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="boardType" value={bt} checked={boardType === bt} onChange={() => setBoardType(bt)} className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">{t(`boardType.${bt}`)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">{t('createProject.estimationType')}</label>
                <div className="flex gap-6">
                  {(['STORY_POINT', 'HOURS'] as EstimationType[]).map((et) => (
                    <label key={et} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="estimationType" value={et} checked={estimationType === et} onChange={() => setEstimationType(et)} className="text-blue-600 focus:ring-blue-500" />
                      <span className="text-sm text-gray-700">{t(`estimationType.${et}`)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label={t('createProject.sprintDurationDays')} type="number" value={sprintDurationDays} onChange={(e) => setSprintDurationDays(e.target.value)} placeholder="14" />
                <Input label={t('createProject.wipLimit')} type="number" value={wipLimit} onChange={(e) => setWipLimit(e.target.value)} placeholder="— none —" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={backlogEnabled} onChange={(e) => setBacklogEnabled(e.target.checked)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="text-sm text-gray-700">{t('createProject.backlogEnabled')}</span>
              </label>
            </div>
          )}

          {/* ── Tab 4: Finance & DevOps ── */}
          {activeTab === 'finance' && (
            <div className="space-y-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Finance</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label={t('createProject.budgetAmount')} type="number" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} placeholder="0" />
                <Input label={t('createProject.plannedCost')} type="number" value={plannedCost} onChange={(e) => setPlannedCost(e.target.value)} placeholder="0" />
                <Input label={t('createProject.actualCost')} type="number" value={actualCost} onChange={(e) => setActualCost(e.target.value)} placeholder="0" />
                <Input label={t('createProject.currencyCode')} value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} placeholder="VND" />
                <SelectField label={t('createProject.capexOpexType')} value={capexOpexType} onChange={(v) => setCapexOpexType(v as CapexOpexType | '')}>
                  <option value="">— none —</option>
                  <option value="CAPEX">{t('capexOpex.CAPEX')}</option>
                  <option value="OPEX">{t('capexOpex.OPEX')}</option>
                </SelectField>
                <Input label={t('createProject.contractNo')} value={contractNo} onChange={(e) => setContractNo(e.target.value)} placeholder="CTR-2024-001" />
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">DevOps</p>
              <div className="grid grid-cols-2 gap-4">
                <Input label={t('createProject.gitRepositoryUrl')} value={gitRepositoryUrl} onChange={(e) => setGitRepositoryUrl(e.target.value)} placeholder="https://github.com/org/repo" />
                <Input label={t('createProject.ciPipelineUrl')} value={ciPipelineUrl} onChange={(e) => setCiPipelineUrl(e.target.value)} placeholder="https://ci.example.com/pipeline" />
                <SelectField label={t('createProject.deploymentEnv')} value={deploymentEnv} onChange={(v) => setDeploymentEnv(v as 'DEV' | 'UAT' | 'PROD' | '')}>
                  <option value="">— none —</option>
                  <option value="DEV">DEV</option>
                  <option value="UAT">UAT</option>
                  <option value="PROD">PROD</option>
                </SelectField>
                <Input label={t('createProject.releaseTag')} value={releaseTag} onChange={(e) => setReleaseTag(e.target.value)} placeholder="v1.0.0" />
              </div>
              <Input label={t('createProject.testCoverage')} type="number" value={testCoverage} onChange={(e) => setTestCoverage(e.target.value)} placeholder="0" />
            </div>
          )}
        </div>

        {/* Save footer */}
        <div className="flex justify-between items-center mt-4">
          <div className="flex gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`w-2 h-2 rounded-full transition-colors ${activeTab === tab ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={updateProject.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {updateProject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {updateProject.isPending ? t('common.saving') : t('settings.save')}
          </button>
        </div>
      </form>

      {/* ── Workflow Assignment ── */}
      <WorkflowSelector projectId={id} currentWorkflowId={project?.workflowId} />

      {/* ── Danger Zone ── */}
      <div className="mt-10 border border-red-200 rounded-xl overflow-hidden">
        <div className="bg-red-50 px-6 py-3 border-b border-red-200">
          <h2 className="text-sm font-semibold text-red-700">{t('settings.dangerZone')}</h2>
        </div>

        <div className="divide-y divide-red-100">
          {/* Archive / Unarchive */}
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isArchived ? t('settings.unarchive') : t('settings.archive')}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isArchived ? t('settings.unarchiveDesc') : t('settings.archiveDesc')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleArchive}
              disabled={updateProject.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-yellow-400 text-yellow-700 rounded-md hover:bg-yellow-50 disabled:opacity-60 transition-colors whitespace-nowrap"
            >
              {isArchived
                ? <ArchiveRestore className="w-4 h-4" />
                : <Archive className="w-4 h-4" />}
              {isArchived ? t('settings.unarchive') : t('settings.archive')}
            </button>
          </div>

          {/* Delete */}
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{t('settings.delete')}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isOwner ? t('settings.deleteDesc') : t('settings.ownerOnly')}
              </p>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={!isOwner || deleteProject.isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-red-400 text-red-700 rounded-md hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {deleteProject.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              {t('settings.delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
