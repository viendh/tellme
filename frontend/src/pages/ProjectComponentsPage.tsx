import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Pencil, Trash2, Puzzle, UserCircle2 } from 'lucide-react';
import { useComponents, useCreateComponent, useUpdateComponent, useDeleteComponent } from '../hooks/useIssueFeatures';
import { useProjectMembers } from '../hooks/useProjectMembers';
import { Modal } from '../components/common/Modal';
import { useConfirm } from '../context/ConfirmContext';
import type { Component } from '../types';

interface ComponentFormData {
  name: string;
  description: string;
  leadId: string;
}

const EMPTY_FORM: ComponentFormData = { name: '', description: '', leadId: '' };

const INPUT = 'w-full border border-gray-200 dark:border-gray-600 rounded-md px-2.5 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-24 flex-shrink-0 text-xs font-medium text-gray-500 dark:text-gray-400 pt-2 text-right">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  );
}

export function ProjectComponentsPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const { projectId } = useParams<{ projectId: string }>();
  const id = Number(projectId);

  const { data: components = [], isLoading } = useComponents(id);
  const { data: members = [] } = useProjectMembers(id);
  const createComponent = useCreateComponent(id);
  const updateComponent = useUpdateComponent(id);
  const deleteComponent = useDeleteComponent(id);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Component | null>(null);
  const [form, setForm] = useState<ComponentFormData>(EMPTY_FORM);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (comp: Component) => {
    setEditing(comp);
    setForm({ name: comp.name, description: comp.description ?? '', leadId: comp.leadId ? String(comp.leadId) : '' });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const data = { name: form.name.trim(), description: form.description.trim() || undefined, leadId: form.leadId ? Number(form.leadId) : undefined };
    if (editing) updateComponent.mutate({ id: editing.id, data }, { onSuccess: () => setShowModal(false) });
    else createComponent.mutate(data, { onSuccess: () => setShowModal(false) });
  };

  const handleDelete = async (comp: Component) => {
    const ok = await confirm({ title: t('component.deleteTitle'), description: t('component.deleteConfirm', { name: comp.name }), variant: 'danger' });
    if (ok) deleteComponent.mutate(comp.id);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-6 py-5 space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Puzzle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white leading-tight">{t('component.title')}</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500">{t('component.subtitle')}</p>
            </div>
          </div>
          <button onClick={openCreate} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
            <Plus className="w-3.5 h-3.5" />{t('component.create')}
          </button>
        </div>

        {/* ── Table card ── */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="py-10 text-center text-gray-400 text-sm">{t('common.loading')}</div>
          ) : components.length === 0 ? (
            <div className="py-10 text-center">
              <Puzzle className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500">{t('component.empty')}</p>
              <button onClick={openCreate} className="mt-2 text-xs text-blue-500 hover:text-blue-600 hover:underline">{t('component.createFirst')}</button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 divide-x divide-gray-100 dark:divide-gray-700">
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">{t('component.name')}</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">{t('component.lead')}</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-medium text-gray-400 uppercase tracking-wider">{t('component.description')}</th>
                  <th className="w-16 px-4 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {components.map((comp) => (
                  <tr key={comp.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group divide-x divide-gray-100 dark:divide-gray-800">
                    <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{comp.name}</td>
                    <td className="px-4 py-2.5">
                      {comp.leadName
                        ? <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><UserCircle2 className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />{comp.leadName}</span>
                        : <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">
                      {comp.description || <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(comp)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30" title={t('common.edit')}>
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(comp)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-900/30" title={t('common.delete')}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? t('component.edit') : t('component.create')}
        size="sm"
      >
        <div className="px-5 py-4 space-y-3">

          {/* Name */}
          <Field label={`${t('component.name')} *`}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t('component.namePlaceholder')}
              className={INPUT}
              autoFocus
            />
          </Field>

          {/* Lead */}
          <Field label={t('component.lead')}>
            <select
              value={form.leadId}
              onChange={(e) => setForm((f) => ({ ...f, leadId: e.target.value }))}
              className={INPUT}
            >
              <option value="">{t('component.noLead')}</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.fullName}</option>
              ))}
            </select>
          </Field>

          {/* Description */}
          <Field label={t('component.description')}>
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
              disabled={!form.name.trim() || createComponent.isPending || updateComponent.isPending}
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
