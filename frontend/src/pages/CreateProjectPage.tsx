import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCreateProject } from '../hooks/useProjects';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import type {
  ProjectStatus, ProjectType, ProjectVisibility, ProjectPriority,
  ProjectPhase, RiskLevel, ApprovalStatus, BoardType, EstimationType, CapexOpexType,
} from '../types';

type Tab = 'basic' | 'timeline' | 'agile' | 'finance';

const TABS: Tab[] = ['basic', 'timeline', 'agile', 'finance'];

const STATUS_COLORS: Record<ProjectStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  DRAFT: 'bg-gray-100 text-gray-600',
  PLANNING: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
  UAT: 'bg-yellow-100 text-yellow-700',
  GO_LIVE: 'bg-orange-100 text-orange-700',
  CLOSED: 'bg-red-100 text-red-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

function SelectField({
  label, value, onChange, children, required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
      >
        {children}
      </select>
    </div>
  );
}

export function CreateProjectPage() {
  const { t } = useTranslation();
  const createProject = useCreateProject();

  const [activeTab, setActiveTab] = useState<Tab>('basic');

  // Tab 1 — Basic
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
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
  const [currencyCode, setCurrencyCode] = useState('VND');
  const [capexOpexType, setCapexOpexType] = useState<CapexOpexType | ''>('');
  const [contractNo, setContractNo] = useState('');
  const [gitRepositoryUrl, setGitRepositoryUrl] = useState('');
  const [ciPipelineUrl, setCiPipelineUrl] = useState('');
  const [deploymentEnv, setDeploymentEnv] = useState<'DEV' | 'UAT' | 'PROD' | ''>('');
  const [releaseTag, setReleaseTag] = useState('');
  const [testCoverage, setTestCoverage] = useState('');

  const [errors, setErrors] = useState<{ name?: string; key?: string }>({});

  const handleNameChange = (value: string) => {
    setName(value);
    const autoKey = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (!key || key === name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)) {
      setKey(autoKey);
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = t('createProject.nameRequired');
    if (!key.trim()) newErrors.key = t('createProject.keyRequired');
    else if (!/^[A-Z0-9]+$/.test(key)) newErrors.key = t('createProject.keyInvalid');
    else if (key.length < 2) newErrors.key = t('createProject.keyMin');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) setActiveTab('basic');
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createProject.mutate({
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description.trim() || undefined,
      projectType,
      status,
      visibility,
      priority: priority || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      actualEndDate: actualEndDate || undefined,
      progressPercent: progressPercent ? Number(progressPercent) : undefined,
      milestone: milestone || undefined,
      releaseVersion: releaseVersion || undefined,
      phase: phase || undefined,
      riskLevel: riskLevel || undefined,
      approvalStatus,
      boardType,
      estimationType,
      sprintDurationDays: sprintDurationDays ? Number(sprintDurationDays) : undefined,
      wipLimit: wipLimit ? Number(wipLimit) : undefined,
      backlogEnabled,
      budgetAmount: budgetAmount ? Number(budgetAmount) : undefined,
      plannedCost: plannedCost ? Number(plannedCost) : undefined,
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

  const tabLabel = (tab: Tab) => {
    const map: Record<Tab, string> = {
      basic: t('createProject.tabBasic'),
      timeline: t('createProject.tabTimeline'),
      agile: t('createProject.tabAgile'),
      finance: t('createProject.tabFinanceDevops'),
    };
    return map[tab];
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link
        to="/projects"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('projects.title')}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('createProject.title')}</h1>
        <p className="text-gray-500 mt-1">{t('createProject.subtitle')}</p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 mb-6 gap-0">
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

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 p-8">

          {/* ── Tab 1: Basic ── */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              <Input
                label={t('createProject.name')}
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder={t('createProject.namePlaceholder')}
                error={errors.name}
                autoFocus
              />

              <Input
                label={t('createProject.key')}
                required
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))}
                placeholder={t('createProject.keyPlaceholder')}
                error={errors.key}
                helperText={t('createProject.keyHint')}
              />

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
                  <option value="PLANNING">{t('projectStatus.PLANNING')}</option>
                  <option value="DRAFT">{t('projectStatus.DRAFT')}</option>
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

              {name && key && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-medium text-gray-500 mb-3">{t('createProject.preview')}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {key.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 truncate">{name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[status]}`}>
                          {t(`projectStatus.${status}`)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{key} · {t(`projectType.${projectType}`)} · {t(`visibility.${visibility}`)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Tab 2: Timeline ── */}
          {activeTab === 'timeline' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input label={t('createProject.startDate')} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <Input label={t('createProject.endDate')} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <Input label={t('createProject.actualEndDate')} type="date" value={actualEndDate} onChange={(e) => setActualEndDate(e.target.value)} />
                <Input
                  label={t('createProject.progressPercent')}
                  type="number"
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('createProject.milestone')}
                  value={milestone}
                  onChange={(e) => setMilestone(e.target.value)}
                  placeholder="v1.0 Launch"
                />
                <Input
                  label={t('createProject.releaseVersion')}
                  value={releaseVersion}
                  onChange={(e) => setReleaseVersion(e.target.value)}
                  placeholder="1.0.0"
                />
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
                      <input
                        type="radio"
                        name="boardType"
                        value={bt}
                        checked={boardType === bt}
                        onChange={() => setBoardType(bt)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
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
                      <input
                        type="radio"
                        name="estimationType"
                        value={et}
                        checked={estimationType === et}
                        onChange={() => setEstimationType(et)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{t(`estimationType.${et}`)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('createProject.sprintDurationDays')}
                  type="number"
                  value={sprintDurationDays}
                  onChange={(e) => setSprintDurationDays(e.target.value)}
                  placeholder="14"
                />
                <Input
                  label={t('createProject.wipLimit')}
                  type="number"
                  value={wipLimit}
                  onChange={(e) => setWipLimit(e.target.value)}
                  placeholder="— none —"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={backlogEnabled}
                  onChange={(e) => setBacklogEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{t('createProject.backlogEnabled')}</span>
              </label>
            </div>
          )}

          {/* ── Tab 4: Finance & DevOps ── */}
          {activeTab === 'finance' && (
            <div className="space-y-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Finance</p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('createProject.budgetAmount')}
                  type="number"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="0"
                />
                <Input
                  label={t('createProject.plannedCost')}
                  type="number"
                  value={plannedCost}
                  onChange={(e) => setPlannedCost(e.target.value)}
                  placeholder="0"
                />
                <Input
                  label={t('createProject.currencyCode')}
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  placeholder="VND"
                />
                <SelectField label={t('createProject.capexOpexType')} value={capexOpexType} onChange={(v) => setCapexOpexType(v as CapexOpexType | '')}>
                  <option value="">— none —</option>
                  <option value="CAPEX">{t('capexOpex.CAPEX')}</option>
                  <option value="OPEX">{t('capexOpex.OPEX')}</option>
                </SelectField>
              </div>
              <Input
                label={t('createProject.contractNo')}
                value={contractNo}
                onChange={(e) => setContractNo(e.target.value)}
                placeholder="CTR-2024-001"
              />

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider pt-2">DevOps</p>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('createProject.gitRepositoryUrl')}
                  value={gitRepositoryUrl}
                  onChange={(e) => setGitRepositoryUrl(e.target.value)}
                  placeholder="https://github.com/org/repo"
                />
                <Input
                  label={t('createProject.ciPipelineUrl')}
                  value={ciPipelineUrl}
                  onChange={(e) => setCiPipelineUrl(e.target.value)}
                  placeholder="https://ci.example.com/pipeline"
                />
                <SelectField label={t('createProject.deploymentEnv')} value={deploymentEnv} onChange={(v) => setDeploymentEnv(v as 'DEV' | 'UAT' | 'PROD' | '')}>
                  <option value="">— none —</option>
                  <option value="DEV">DEV</option>
                  <option value="UAT">UAT</option>
                  <option value="PROD">PROD</option>
                </SelectField>
                <Input
                  label={t('createProject.releaseTag')}
                  value={releaseTag}
                  onChange={(e) => setReleaseTag(e.target.value)}
                  placeholder="v1.0.0"
                />
              </div>
              <Input
                label={t('createProject.testCoverage')}
                type="number"
                value={testCoverage}
                onChange={(e) => setTestCoverage(e.target.value)}
                placeholder="0"
              />
            </div>
          )}
        </div>

        {/* Footer navigation */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-1.5">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  activeTab === tab ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-3">
            {activeTab !== 'basic' && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setActiveTab(TABS[TABS.indexOf(activeTab) - 1])}
              >
                ← {t('common.back')}
              </Button>
            )}
            {activeTab === 'basic' && (
              <Link to="/projects">
                <Button type="button" variant="secondary">{t('common.cancel')}</Button>
              </Link>
            )}
            {activeTab !== 'finance' ? (
              <Button
                type="button"
                onClick={() => setActiveTab(TABS[TABS.indexOf(activeTab) + 1])}
              >
                {t('common.next')} →
              </Button>
            ) : (
              <Button type="submit" loading={createProject.isPending}>
                {t('createProject.submit')}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
