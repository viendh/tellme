import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react';
import { Button } from '../common/Button';
import { Input, Textarea } from '../common/Input';
import { Select } from '../common/Select';
import { AssigneeSelect } from './AssigneeSelect';
import { ISSUE_TEMPLATES, type IssueTemplate } from '../../data/issueTemplates';
import type { CreateIssueInput, IssueType, IssuePriority, IssueSeverity, IssueEnvironment, Sprint, User } from '../../types';

interface IssueFormProps {
  projectId: number;
  sprints: Sprint[];
  members?: User[];
  onSubmit: (data: CreateIssueInput) => void;
  onCancel: () => void;
  loading?: boolean;
  defaultSprintId?: number;
}

export function IssueForm({
  projectId,
  sprints,
  members: _members,
  onSubmit,
  onCancel,
  loading = false,
  defaultSprintId,
}: IssueFormProps) {
  const { t } = useTranslation();

  const [selectedTemplate, setSelectedTemplate] = useState<IssueTemplate | null>(null);
  const [showTemplates, setShowTemplates]       = useState(true);

  const [title,                  setTitle]                  = useState('');
  const [description,            setDescription]            = useState('');
  const [type,                   setType]                   = useState<IssueType>('TASK');
  const [priority,               setPriority]               = useState<IssuePriority>('MEDIUM');
  const [severity,               setSeverity]               = useState<IssueSeverity>('MINOR');
  const [sprintId,               setSprintId]               = useState<string>(defaultSprintId?.toString() ?? '');
  const [assignee,               setAssignee]               = useState<User | null>(null);
  const [module,                 setModule]                 = useState('');
  const [environment,            setEnvironment]            = useState<IssueEnvironment | ''>('');
  const [dueDate,                setDueDate]                = useState('');
  const [startDate,              setStartDate]              = useState('');
  const [originalEstimateHours,  setOriginalEstimateHours]  = useState('');
  const [slaHours,               setSlaHours]               = useState('');
  const [businessImpact,         setBusinessImpact]         = useState('');
  const [rootCause,              setRootCause]              = useState('');
  const [titleError,             setTitleError]             = useState('');

  // ── Apply template ──
  const applyTemplate = (tpl: IssueTemplate) => {
    setSelectedTemplate(tpl);
    setType(tpl.fields.type);
    setPriority(tpl.fields.priority);
    setSeverity(tpl.fields.severity ?? 'MINOR');
    setEnvironment(tpl.fields.environment ?? '');
    setSlaHours(tpl.fields.slaHours?.toString() ?? '');
    setOriginalEstimateHours(tpl.fields.originalEstimateHours?.toString() ?? '');
    setDescription(tpl.fields.descriptionTemplate);
    setShowTemplates(false);
  };

  const clearTemplate = () => {
    setSelectedTemplate(null);
    setType('TASK');
    setPriority('MEDIUM');
    setSeverity('MINOR');
    setEnvironment('');
    setSlaHours('');
    setOriginalEstimateHours('');
    setDescription('');
    setShowTemplates(true);
  };

  const typeOptions:        { value: IssueType; label: string }[]     = [
    { value: 'TASK', label: t('type.TASK') }, { value: 'STORY', label: t('type.STORY') },
    { value: 'BUG',  label: t('type.BUG') }, { value: 'EPIC',  label: t('type.EPIC') },
  ];
  const priorityOptions:    { value: IssuePriority; label: string }[] = [
    { value: 'LOW', label: t('priority.LOW') }, { value: 'MEDIUM', label: t('priority.MEDIUM') },
    { value: 'HIGH', label: t('priority.HIGH') }, { value: 'CRITICAL', label: t('priority.CRITICAL') },
  ];
  const severityOptions:    { value: IssueSeverity; label: string }[] = [
    { value: 'MINOR', label: t('severity.MINOR') }, { value: 'MAJOR', label: t('severity.MAJOR') },
    { value: 'CRITICAL', label: t('severity.CRITICAL') },
  ];
  const environmentOptions: { value: IssueEnvironment; label: string }[] = [
    { value: 'DEV', label: t('env.DEV') }, { value: 'UAT', label: t('env.UAT') },
    { value: 'PROD', label: t('env.PROD') },
  ];
  const sprintOptions = [
    { value: '', label: t('issue.noSprint') },
    ...sprints.map((s) => ({ value: s.id.toString(), label: s.name })),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setTitleError(t('issue.titleRequired')); return; }
    setTitleError('');
    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      type, priority, severity,
      sprintId:              sprintId              ? Number(sprintId)              : undefined,
      assigneeId:            assignee              ? assignee.id                   : undefined,
      module:                module.trim()         || undefined,
      environment:           environment           || undefined,
      dueDate:               dueDate               || undefined,
      startDate:             startDate             || undefined,
      originalEstimateHours: originalEstimateHours ? Number(originalEstimateHours) : undefined,
      slaHours:              slaHours              ? Number(slaHours)              : undefined,
      businessImpact:        businessImpact.trim() || undefined,
      rootCause:             rootCause.trim()      || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh]">

      {/* ── Template picker ── */}
      <div className="px-6 pt-4 pb-3 border-b border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setShowTemplates((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-full text-left"
        >
          <Sparkles className="w-4 h-4 text-blue-500" />
          Dùng mẫu template
          {selectedTemplate && (
            <span className={`ml-2 flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border ${selectedTemplate.accentBg} ${selectedTemplate.accentText} ${selectedTemplate.accent}`}>
              <span>{selectedTemplate.icon}</span>{selectedTemplate.name}
            </span>
          )}
          {selectedTemplate && (
            <span
              role="button"
              onClick={(e) => { e.stopPropagation(); clearTemplate(); }}
              className="ml-auto p-0.5 text-gray-400 hover:text-red-500 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          {!selectedTemplate && (
            <span className="ml-auto text-gray-400">
              {showTemplates ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </span>
          )}
        </button>

        {showTemplates && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {ISSUE_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl)}
                className={`text-left p-3 rounded-lg border-2 transition-all hover:shadow-sm ${
                  selectedTemplate?.id === tpl.id
                    ? `${tpl.accent} ${tpl.accentBg}`
                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base leading-none">{tpl.icon}</span>
                  <span className={`text-xs font-semibold ${selectedTemplate?.id === tpl.id ? tpl.accentText : 'text-gray-700 dark:text-gray-300'}`}>
                    {tpl.name}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight line-clamp-2">{tpl.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Form fields ── */}
      <div className="p-6 space-y-4">
        <Input
          label={`${t('issue.titleLabel')} *`}
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('issue.titlePlaceholder')}
          error={titleError}
          autoFocus
        />

        <Textarea
          label={t('issue.description')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('issue.descPlaceholder')}
          rows={description.length > 200 ? 8 : 4}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select label={t('issue.type')}     value={type}     onChange={(e) => setType(e.target.value as IssueType)}     options={typeOptions} />
          <Select label={t('issue.priority')} value={priority} onChange={(e) => setPriority(e.target.value as IssuePriority)} options={priorityOptions} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label={t('issue.severity')} value={severity} onChange={(e) => setSeverity(e.target.value as IssueSeverity)} options={severityOptions} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('issue.environment')}</label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value as IssueEnvironment | '')}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('issue.noEnvironment')}</option>
              {environmentOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        <Input label={t('issue.module')} value={module} onChange={(e) => setModule(e.target.value)} placeholder={t('issue.modulePlaceholder')} />

        <div className="grid grid-cols-2 gap-4">
          <Select label={t('issue.sprint')} value={sprintId} onChange={(e) => setSprintId(e.target.value)} options={sprintOptions} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('issue.assignee')}</label>
            <AssigneeSelect projectId={projectId} value={assignee} onChange={setAssignee} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('issue.startDate')}</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('issue.dueDate')}</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('issue.estimateHours')}</label>
            <input type="number" min="0" step="0.5" value={originalEstimateHours} onChange={(e) => setOriginalEstimateHours(e.target.value)} placeholder="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('issue.sla')}</label>
            <input type="number" min="0" step="0.5" value={slaHours} onChange={(e) => setSlaHours(e.target.value)} placeholder="0"
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <Textarea label={t('issue.businessImpact')} value={businessImpact} onChange={(e) => setBusinessImpact(e.target.value)} placeholder={t('issue.businessImpactPlaceholder')} rows={2} />
        <Textarea label={t('issue.rootCause')}      value={rootCause}       onChange={(e) => setRootCause(e.target.value)}       placeholder={t('issue.rootCausePlaceholder')}       rows={2} />

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="secondary" onClick={onCancel}>{t('common.cancel')}</Button>
          <Button type="submit" loading={loading}>{t('issue.create')}</Button>
        </div>
      </div>
    </form>
  );
}
