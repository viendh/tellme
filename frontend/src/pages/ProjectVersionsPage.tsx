import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Tag, CalendarDays, CheckCircle2, Archive, Circle } from 'lucide-react';
import { useVersions, useCreateVersion, useUpdateVersion, useDeleteVersion } from '../hooks/useIssueFeatures';
import { Modal } from '../components/common/Modal';
import { useConfirm } from '../context/ConfirmContext';
import type { Version, VersionStatus } from '../types';

interface VersionFormData {
  name: string;
  description: string;
  status: VersionStatus;
  releaseDate: string;
  startDate: string;
}

const EMPTY_FORM: VersionFormData = {
  name: '',
  description: '',
  status: 'UNRELEASED',
  releaseDate: '',
  startDate: '',
};

const STATUS_META: Record<VersionStatus, { label: string; pill: string; icon: typeof Circle }> = {
  UNRELEASED: { label: 'Unreleased', pill: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300', icon: Circle },
  RELEASED:   { label: 'Released',   pill: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400', icon: CheckCircle2 },
  ARCHIVED:   { label: 'Archived',   pill: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400', icon: Archive },
};

function formatDate(d?: string | null) {
  if (!d) return '—';
  const dt = new Date(d);
  return `${String(dt.getDate()).padStart(2,'0')}/${String(dt.getMonth()+1).padStart(2,'0')}/${dt.getFullYear()}`;
}

/* ── Compact inline form row ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-28 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-2 text-right">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

const INPUT = 'w-full border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400';

export function ProjectVersionsPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);

  const { data: versions = [], isLoading } = useVersions(id);
  const createVersion = useCreateVersion(id);
  const updateVersion = useUpdateVersion(id);
  const deleteVersion = useDeleteVersion(id);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Version | null>(null);
  const [form, setForm] = useState<VersionFormData>(EMPTY_FORM);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (v: Version) => {
    setEditing(v);
    setForm({ name: v.name, description: v.description ?? '', status: v.status, releaseDate: v.releaseDate ?? '', startDate: v.startDate ?? '' });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const data = { name: form.name.trim(), description: form.description.trim() || undefined, status: form.status, releaseDate: form.releaseDate || undefined, startDate: form.startDate || undefined };
    if (editing) updateVersion.mutate({ id: editing.id, data }, { onSuccess: () => setShowModal(false) });
    else createVersion.mutate(data, { onSuccess: () => setShowModal(false) });
  };

  const handleDelete = async (v: Version) => {
    const ok = await confirm({ title: t('version.deleteTitle'), description: t('version.deleteConfirm', { name: v.name }), variant: 'danger' });
    if (ok) deleteVersion.mutate(v.id);
  };

  /* Status summary counts */
  const counts = versions.reduce((acc, v) => { acc[v.status] = (acc[v.status] ?? 0) + 1; return acc; }, {} as Record<VersionStatus, number>);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-6 py-5 space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">{t('version.title')}</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500">{t('version.subtitle')}</p>
            </div>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
            <Plus className="w-3.5 h-3.5" />{t('version.create')}
          </button>
        </div>

        {/* ── Status summary chips ── */}
        {versions.length > 0 && (
          <div className="flex items-center gap-2">
            {(Object.keys(STATUS_META) as VersionStatus[]).map((s) => {
              const m = STATUS_META[s];
              const Icon = m.icon;
              const count = counts[s] ?? 0;
              return (
                <span key={s} className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${m.pill}`}>
                  <Icon className="w-3 h-3" />{count} {m.label}
                </span>
              );
            })}
          </div>
        )}

        {/* ── Table card ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="py-10 text-center text-gray-400 text-sm">{t('common.loading')}</div>
          ) : versions.length === 0 ? (
            <div className="py-10 text-center">
              <Tag className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500">{t('version.empty')}</p>
              <button onClick={openCreate} className="mt-2 text-xs text-blue-500 hover:text-blue-600 hover:underline">{t('version.createFirst')}</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">{t('version.name')}</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">{t('version.status')}</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">{t('version.startDate')}</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">{t('version.releaseDate')}</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">{t('version.description')}</th>
                  <th className="w-16 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {versions.map((v) => {
                  const meta = STATUS_META[v.status];
                  const Icon = meta.icon;
                  const isReleased = v.releaseDate && new Date(v.releaseDate) < new Date();
                  return (
                    <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                      <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{v.name}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${meta.pill}`}>
                          <Icon className="w-2.5 h-2.5" />{t(`versionStatus.${v.status}`)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400">
                        {v.startDate ? (
                          <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3 text-gray-300 dark:text-gray-600" />{formatDate(v.startDate)}</span>
                        ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-xs">
                        {v.releaseDate ? (
                          <span className={`flex items-center gap-1 ${isReleased ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            <CalendarDays className="w-3 h-3" />{formatDate(v.releaseDate)}
                          </span>
                        ) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{v.description || <span className="text-gray-300 dark:text-gray-600">—</span>}</td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(v)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30" title={t('common.edit')}>
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(v)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30" title={t('common.delete')}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? t('version.edit') : t('version.create')}
        size="sm"
      >
        <div className="px-5 py-4 space-y-3">

          {/* Name */}
          <Field label={`${t('version.name')} *`}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t('version.namePlaceholder')}
              className={INPUT}
              autoFocus
            />
          </Field>

          {/* Status */}
          <Field label={t('version.status')}>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as VersionStatus }))}
              className={INPUT}
            >
              <option value="UNRELEASED">{t('versionStatus.UNRELEASED')}</option>
              <option value="RELEASED">{t('versionStatus.RELEASED')}</option>
              <option value="ARCHIVED">{t('versionStatus.ARCHIVED')}</option>
            </select>
          </Field>

          {/* Dates — two on one row */}
          <Field label={t('version.startDate')}>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className={INPUT}
              />
              <div className="relative">
                <span className="absolute -top-4 left-0 text-[10px] text-gray-400 dark:text-gray-500">{t('version.releaseDate')}</span>
                <input
                  type="date"
                  value={form.releaseDate}
                  onChange={(e) => setForm((f) => ({ ...f, releaseDate: e.target.value }))}
                  className={INPUT}
                />
              </div>
            </div>
          </Field>

          {/* Description */}
          <Field label={t('version.description')}>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className={`${INPUT} resize-none`}
            />
          </Field>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <button onClick={() => setShowModal(false)} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim() || createVersion.isPending || updateVersion.isPending}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {editing ? t('common.update') : t('common.create')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
