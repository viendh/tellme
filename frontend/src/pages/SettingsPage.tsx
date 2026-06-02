import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  User, Lock, Bell, Monitor,
  Save, Eye, EyeOff, RotateCcw,
  Check, Sun, Moon, Laptop,
  MessageSquare, Clock, Layers, Tag, Workflow,
  CalendarDays, UserCircle2, Hash, BarChart2,
  AlertCircle, GitBranch,
} from 'lucide-react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';
import type { DateFormat, ItemsPerPage, Theme, CardField, CardFieldsConfig } from '../store/settingsStore';
import { Avatar } from '../components/common/Avatar';

/* ─── helpers ─── */
type Tab = 'profile' | 'security' | 'notifications' | 'display';

function TabButton({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
        active
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
      }`}
    >
      <span className={active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {desc && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked, onChange, label, desc,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <label className="flex items-start gap-4 cursor-pointer group">
      <div className="relative mt-0.5 flex-shrink-0">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`} />
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white">{label}</p>
        {desc && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>}
      </div>
    </label>
  );
}

/* ─── Theme mini-preview ─── */
function ThemePreview({ type }: { type: Theme }) {
  if (type === 'light') return (
    <div className="h-14 bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="h-4 bg-gray-50 border-b border-gray-200 flex items-center px-2 gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        <div className="flex-1 h-1 bg-gray-200 rounded" />
        <div className="w-5 h-1 bg-blue-300 rounded" />
      </div>
      <div className="p-2 space-y-1.5">
        <div className="h-1.5 bg-gray-200 rounded w-3/4" />
        <div className="h-1.5 bg-gray-100 rounded w-1/2" />
        <div className="h-1.5 bg-blue-100 rounded w-2/3" />
      </div>
    </div>
  );
  if (type === 'dark') return (
    <div className="h-14 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
      <div className="h-4 bg-gray-800 border-b border-gray-700 flex items-center px-2 gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
        <div className="flex-1 h-1 bg-gray-700 rounded" />
        <div className="w-5 h-1 bg-blue-700 rounded" />
      </div>
      <div className="p-2 space-y-1.5">
        <div className="h-1.5 bg-gray-700 rounded w-3/4" />
        <div className="h-1.5 bg-gray-800 rounded w-1/2" />
        <div className="h-1.5 bg-blue-900 rounded w-2/3" />
      </div>
    </div>
  );
  return (
    <div className="h-14 rounded-lg border border-gray-200 overflow-hidden flex">
      <div className="flex-1 bg-white border-r border-gray-200">
        <div className="h-4 bg-gray-50 border-b border-gray-200" />
        <div className="p-1.5 space-y-1">
          <div className="h-1.5 bg-gray-200 rounded" />
          <div className="h-1.5 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
      <div className="flex-1 bg-gray-900">
        <div className="h-4 bg-gray-800 border-b border-gray-700" />
        <div className="p-1.5 space-y-1">
          <div className="h-1.5 bg-gray-700 rounded" />
          <div className="h-1.5 bg-gray-800 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

/* ─── Tab: Profile ─── */
function ProfileTab() {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');

  const { mutate, isPending } = useMutation({
    mutationFn: () => authApi.updateProfile({ fullName, avatarUrl: avatarUrl || undefined }),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success(t('settings.profileSaved'));
    },
    onError: () => toast.error(t('settings.profileError')),
  });

  const preview = { ...user!, fullName, avatarUrl: avatarUrl || undefined };

  return (
    <div className="space-y-4">
      <Card title={t('settings.profileTitle')} desc={t('settings.profileDesc')}>
        <div className="flex items-center gap-4 mb-6">
          <Avatar user={preview} size="lg" />
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{fullName || user?.fullName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('settings.fullName')}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('settings.avatarUrl')}
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('settings.avatarHint')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('settings.email')}
            </label>
            <input
              type="email"
              value={user?.email ?? ''}
              disabled
              className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('settings.emailReadOnly')}</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => mutate()}
            disabled={isPending || !fullName.trim()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {isPending ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ─── Tab: Security ─── */
function SecurityTab() {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirm, setConfirm]                 = useState('');
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: () => authApi.changePassword({ currentPassword, newPassword }),
    onSuccess: () => {
      toast.success(t('settings.passwordSaved'));
      setCurrentPassword(''); setNewPassword(''); setConfirm('');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg === 'Current password is incorrect'
        ? t('settings.wrongPassword')
        : t('settings.passwordError'));
    },
  });

  const mismatch = confirm && newPassword !== confirm;
  const canSubmit = currentPassword && newPassword.length >= 6 && newPassword === confirm;

  const inputCls = 'w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 pr-10 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-4">
      <Card title={t('settings.securityTitle')} desc={t('settings.securityDesc')}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('settings.currentPassword')}
            </label>
            <div className="relative">
              <input type={showCurrent ? 'text' : 'password'} value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)} className={inputCls} />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('settings.newPassword')}
            </label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)} className={inputCls} />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {newPassword && newPassword.length < 6 && (
              <p className="text-xs text-red-500 mt-1">{t('settings.passwordMinLength')}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('settings.confirmPassword')}
            </label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                mismatch ? 'border-red-400' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {mismatch && <p className="text-xs text-red-500 mt-1">{t('settings.passwordMismatch')}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={() => mutate()} disabled={isPending || !canSubmit}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <Lock className="w-4 h-4" />
            {isPending ? t('common.saving') : t('settings.changePassword')}
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ─── Tab: Notifications ─── */
function NotificationsTab() {
  const { t } = useTranslation();
  const { user, setUser } = useAuthStore();

  const [onAssigned,     setOnAssigned]     = useState(user?.notifyOnAssigned     ?? true);
  const [onStatusChange, setOnStatusChange] = useState(user?.notifyOnStatusChange ?? true);
  const [onComment,      setOnComment]      = useState(user?.notifyOnComment      ?? true);

  const { mutate, isPending } = useMutation({
    mutationFn: () => authApi.updateNotifications({
      notifyOnAssigned: onAssigned,
      notifyOnStatusChange: onStatusChange,
      notifyOnComment: onComment,
    }),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success(t('settings.notifSaved'));
    },
    onError: () => toast.error(t('settings.notifError')),
  });

  return (
    <div className="space-y-4">
      <Card title={t('settings.notifTitle')} desc={t('settings.notifDesc')}>
        <div className="space-y-5">
          <Toggle checked={onAssigned} onChange={setOnAssigned}
            label={t('settings.notifOnAssigned')} desc={t('settings.notifOnAssignedDesc')} />
          <div className="border-t border-gray-100 dark:border-gray-700" />
          <Toggle checked={onStatusChange} onChange={setOnStatusChange}
            label={t('settings.notifOnStatusChange')} desc={t('settings.notifOnStatusChangeDesc')} />
          <div className="border-t border-gray-100 dark:border-gray-700" />
          <Toggle checked={onComment} onChange={setOnComment}
            label={t('settings.notifOnComment')} desc={t('settings.notifOnCommentDesc')} />
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={() => mutate()} disabled={isPending}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />
            {isPending ? t('common.saving') : t('common.save')}
          </button>
        </div>
      </Card>
    </div>
  );
}

/* ─── Card field live preview ────────────────────────────────────────────── */
function CardPreview({ cardFields }: { cardFields: CardFieldsConfig }) {
  return (
    <div className="flex justify-center mb-5">
      <div className="w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-sm pointer-events-none text-xs">
        {/* Key */}
        {cardFields.issueKey && (
          <span className="text-gray-400 font-mono block mb-1 text-[10px]">PROJ-42</span>
        )}
        {/* Title — always visible */}
        <p className="text-gray-900 dark:text-gray-100 font-medium mb-2 leading-snug text-[11px]">
          Fix login authentication bug
        </p>
        {/* Progress */}
        {cardFields.progress && (
          <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1 mb-2">
            <div className="bg-blue-500 h-1 rounded-full w-3/5" />
          </div>
        )}
        {/* Last comment */}
        {cardFields.lastComment && (
          <div className="flex items-start gap-1 mb-2 bg-gray-50 dark:bg-gray-700/50 rounded px-1.5 py-1">
            <MessageSquare className="w-2.5 h-2.5 text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="text-[9px] text-gray-500 dark:text-gray-400 leading-snug">
              <span className="font-medium">Alice:</span> Good catch, let me look into this
            </span>
          </div>
        )}
        {/* Labels */}
        {cardFields.labels && (
          <div className="flex gap-1 mb-2">
            <span className="text-[9px] px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 rounded-full">backend</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 rounded-full">auth</span>
          </div>
        )}
        {/* Estimate */}
        {cardFields.estimate && (
          <div className="flex items-center gap-1 mb-1.5 text-[9px] text-gray-400">
            <Clock className="w-2.5 h-2.5" /> 3h
          </div>
        )}
        {/* Module */}
        {cardFields.module && (
          <div className="flex items-center gap-1 mb-1.5 text-[9px] text-gray-400">
            <Layers className="w-2.5 h-2.5" /> Auth Module
          </div>
        )}
        {/* Environment */}
        {cardFields.environment && (
          <div className="mb-2">
            <span className="text-[9px] px-1.5 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200 font-medium">UAT</span>
          </div>
        )}
        {/* Workflow step */}
        {cardFields.workflowStep && (
          <div className="mb-2">
            <span className="text-[9px] px-2 py-0.5 rounded-full font-semibold border"
              style={{ background: '#3b82f620', color: '#3b82f6', borderColor: '#3b82f650' }}>
              In Review
            </span>
          </div>
        )}
        {/* Footer */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            {cardFields.type && <span className="text-blue-500 text-[10px]">■</span>}
            {cardFields.priority && <span className="text-orange-500 text-[10px]">▲</span>}
            {cardFields.severity && <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />}
            {cardFields.issueId && <span className="text-gray-400 text-[9px]">#42</span>}
          </div>
          <div className="flex items-center gap-1">
            {cardFields.dueDate && <span className="text-red-500 text-[9px]">31/05</span>}
            {cardFields.assignee && (
              <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-[7px] font-bold">JD</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Card Fields Card ───────────────────────────────────────────────────── */
function CardFieldsCard() {
  const { t } = useTranslation();
  const { cardFields, setCardField } = useSettingsStore();

  const FIELDS: { key: CardField; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'issueKey',     label: t('settings.fieldIssueKey'),     desc: 'PROJ-42',                 icon: <Hash className="w-3.5 h-3.5" /> },
    { key: 'type',         label: t('settings.fieldType'),         desc: t('settings.fieldTypeDesc'),  icon: <Tag className="w-3.5 h-3.5" /> },
    { key: 'priority',     label: t('settings.fieldPriority'),     desc: t('settings.fieldPriorityDesc'), icon: <AlertCircle className="w-3.5 h-3.5" /> },
    { key: 'severity',     label: t('settings.fieldSeverity'),     desc: t('settings.fieldSeverityDesc'), icon: <AlertCircle className="w-3.5 h-3.5 text-orange-500" /> },
    { key: 'dueDate',      label: t('settings.fieldDueDate'),      desc: t('settings.fieldDueDateDesc'),  icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { key: 'assignee',     label: t('settings.fieldAssignee'),     desc: t('settings.fieldAssigneeDesc'), icon: <UserCircle2 className="w-3.5 h-3.5" /> },
    { key: 'progress',     label: t('settings.fieldProgress'),     desc: t('settings.fieldProgressDesc'), icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { key: 'lastComment',  label: t('settings.fieldLastComment'),  desc: t('settings.fieldLastCommentDesc'), icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { key: 'labels',       label: t('settings.fieldLabels'),       desc: t('settings.fieldLabelsDesc'),    icon: <Tag className="w-3.5 h-3.5" /> },
    { key: 'estimate',     label: t('settings.fieldEstimate'),     desc: t('settings.fieldEstimateDesc'),  icon: <Clock className="w-3.5 h-3.5" /> },
    { key: 'module',       label: t('settings.fieldModule'),       desc: t('settings.fieldModuleDesc'),    icon: <Layers className="w-3.5 h-3.5" /> },
    { key: 'environment',  label: t('settings.fieldEnvironment'),  desc: t('settings.fieldEnvironmentDesc'), icon: <Workflow className="w-3.5 h-3.5" /> },
    { key: 'workflowStep', label: t('settings.fieldWorkflowStep'), desc: t('settings.fieldWorkflowStepDesc'), icon: <GitBranch className="w-3.5 h-3.5" /> },
    { key: 'issueId',      label: t('settings.fieldIssueId'),      desc: t('settings.fieldIssueIdDesc'),  icon: <Hash className="w-3.5 h-3.5" /> },
  ];

  return (
    <Card title={t('settings.cardFieldsTitle')} desc={t('settings.cardFieldsDesc')}>
      {/* Live preview */}
      <CardPreview cardFields={cardFields} />

      {/* Field toggles grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {FIELDS.map((f) => (
          <label
            key={f.key}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
              cardFields[f.key]
                ? 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={cardFields[f.key]}
              onChange={(e) => setCardField(f.key, e.target.checked)}
            />
            {/* Custom checkbox */}
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              cardFields[f.key]
                ? 'bg-blue-600 border-blue-600'
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {cardFields[f.key] && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            {/* Icon + text */}
            <div className="flex items-start gap-2 min-w-0">
              <span className={`mt-0.5 flex-shrink-0 ${cardFields[f.key] ? 'text-blue-500 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
                {f.icon}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-medium leading-none mb-0.5 ${cardFields[f.key] ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {f.label}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-tight truncate">{f.desc}</p>
              </div>
            </div>
          </label>
        ))}
      </div>
    </Card>
  );
}

/* ─── Tab: Display ─── */
function DisplayTab() {
  const { t } = useTranslation();
  const {
    theme, setTheme,
    dateFormat, itemsPerPage, compactMode,
    setDateFormat, setItemsPerPage, setCompactMode, reset,
  } = useSettingsStore();
  // cardFields is used by CardFieldsCard component directly

  const THEME_OPTIONS: { value: Theme; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: t('settings.themeLight'),
      desc: t('settings.themeLightDesc'),
      icon: <Sun className="w-4 h-4 text-amber-500" />,
    },
    {
      value: 'dark',
      label: t('settings.themeDark'),
      desc: t('settings.themeDarkDesc'),
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
    },
    {
      value: 'system',
      label: t('settings.themeSystem'),
      desc: t('settings.themeSystemDesc'),
      icon: <Laptop className="w-4 h-4 text-gray-500 dark:text-gray-400" />,
    },
  ];

  const DATE_OPTIONS: { value: DateFormat; label: string; example: string }[] = [
    { value: 'DD/MM/YYYY',  label: t('settings.fmtDDMMYYYY'),  example: '26/05/2026' },
    { value: 'MM/DD/YYYY',  label: t('settings.fmtMMDDYYYY'),  example: '05/26/2026' },
    { value: 'YYYY-MM-DD',  label: t('settings.fmtISO'),       example: '2026-05-26' },
    { value: 'MMM D, YYYY', label: t('settings.fmtReadable'),  example: 'May 26, 2026' },
  ];

  const PAGE_OPTIONS: ItemsPerPage[] = [10, 20, 50];

  return (
    <div className="space-y-4">
      {/* ── Theme ── */}
      <Card title={t('settings.themeTitle')} desc={t('settings.themeDesc')}>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex flex-col gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                theme === opt.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <ThemePreview type={opt.value} />
              <div className="flex items-start justify-between gap-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {opt.icon}
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{opt.label}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-snug">{opt.desc}</p>
                </div>
                {theme === opt.value && (
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                )}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* ── Date format ── */}
      <Card title={t('settings.dateFormatTitle')} desc={t('settings.dateFormatDesc')}>
        <div className="grid grid-cols-2 gap-3">
          {DATE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDateFormat(opt.value)}
              className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                dateFormat === opt.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{opt.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">{opt.example}</p>
              </div>
              {dateFormat === opt.value && (
                <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* ── Items per page ── */}
      <Card title={t('settings.itemsPerPageTitle')} desc={t('settings.itemsPerPageDesc')}>
        <div className="flex gap-3">
          {PAGE_OPTIONS.map((n) => (
            <button
              key={n}
              onClick={() => setItemsPerPage(n)}
              className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-colors ${
                itemsPerPage === n
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </Card>

      {/* ── Compact mode ── */}
      <Card title={t('settings.compactTitle')} desc={t('settings.compactDesc')}>
        <Toggle
          checked={compactMode}
          onChange={setCompactMode}
          label={t('settings.compactMode')}
          desc={t('settings.compactModeDesc')}
        />
      </Card>

      {/* ── Card fields ── */}
      <CardFieldsCard />

      {/* Reset */}
      <div className="flex justify-end">
        <button
          onClick={() => { reset(); toast.success(t('settings.displayReset')); }}
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {t('settings.resetDisplay')}
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile',       label: t('settings.tabProfile'),       icon: <User className="w-4 h-4" /> },
    { id: 'security',      label: t('settings.tabSecurity'),      icon: <Lock className="w-4 h-4" /> },
    { id: 'notifications', label: t('settings.tabNotifications'), icon: <Bell className="w-4 h-4" /> },
    { id: 'display',       label: t('settings.tabDisplay'),       icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('settings.pageTitle')}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settings.pageSubtitle')}</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <aside className="w-52 flex-shrink-0">
          <nav className="space-y-1 sticky top-6">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                icon={tab.icon}
                label={tab.label}
              />
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {activeTab === 'profile'       && <ProfileTab />}
          {activeTab === 'security'      && <SecurityTab />}
          {activeTab === 'notifications' && <NotificationsTab />}
          {activeTab === 'display'       && <DisplayTab />}
        </main>
      </div>
    </div>
  );
}
