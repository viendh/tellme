import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, Plus, Star, Share2, Trash2, Pencil, Globe, Lock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issueFeaturesApi } from '../api/issueFeatures';
import { Modal } from '../components/common/Modal';
import { useConfirm } from '../context/ConfirmContext';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import type { SavedFilter } from '../types';

const filterKeys = {
  all: ['saved-filters'] as const,
};

export function SavedFiltersPage() {
  const { t } = useTranslation();
  const confirm = useConfirm();
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const { data: filters = [], isLoading } = useQuery({
    queryKey: filterKeys.all,
    queryFn: issueFeaturesApi.getSavedFilters,
  });

  const createFilter = useMutation({
    mutationFn: issueFeaturesApi.createSavedFilter,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: filterKeys.all }); toast.success(t('filter.created')); },
    onError: () => toast.error(t('filter.createError')),
  });

  const updateFilter = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof issueFeaturesApi.updateSavedFilter>[1] }) =>
      issueFeaturesApi.updateSavedFilter(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: filterKeys.all }); toast.success(t('filter.updated')); },
    onError: () => toast.error(t('filter.updateError')),
  });

  const deleteFilter = useMutation({
    mutationFn: issueFeaturesApi.deleteSavedFilter,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: filterKeys.all }); toast.success(t('filter.deleted')); },
    onError: () => toast.error(t('filter.deleteError')),
  });

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<SavedFilter | null>(null);
  const [form, setForm] = useState({ name: '', filterCriteria: '', isShared: false, isFavorite: false });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', filterCriteria: '', isShared: false, isFavorite: false });
    setShowModal(true);
  };

  const openEdit = (f: SavedFilter) => {
    setEditing(f);
    setForm({ name: f.name, filterCriteria: f.filterCriteria, isShared: f.isShared, isFavorite: f.isFavorite });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.filterCriteria.trim()) return;
    if (editing) {
      updateFilter.mutate({ id: editing.id, data: form }, { onSuccess: () => setShowModal(false) });
    } else {
      createFilter.mutate(form, { onSuccess: () => setShowModal(false) });
    }
  };

  const handleDelete = async (f: SavedFilter) => {
    const ok = await confirm({ title: t('filter.deleteTitle'), description: t('filter.deleteConfirm', { name: f.name }), variant: 'danger' });
    if (ok) deleteFilter.mutate(f.id);
  };

  const toggleFavorite = (f: SavedFilter) => {
    updateFilter.mutate({ id: f.id, data: { isFavorite: !f.isFavorite } });
  };

  const toggleShared = (f: SavedFilter) => {
    if (f.creatorId !== currentUser?.id) return;
    updateFilter.mutate({ id: f.id, data: { isShared: !f.isShared } });
  };

  const myFilters = filters.filter((f) => f.creatorId === currentUser?.id);
  const sharedFilters = filters.filter((f) => f.creatorId !== currentUser?.id && f.isShared);
  const favoriteFilters = filters.filter((f) => f.isFavorite);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              {t('filter.title')}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{t('filter.subtitle')}</p>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
            <Plus className="w-4 h-4" /> {t('filter.create')}
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
        ) : filters.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg py-16 text-center">
            <Filter className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('filter.empty')}</p>
            <button onClick={openCreate} className="mt-3 text-sm text-blue-600 hover:underline">{t('filter.createFirst')}</button>
          </div>
        ) : (
          <>
            {/* Favorites */}
            {favoriteFilters.length > 0 && (
              <FilterSection
                title={t('filter.favorites')}
                icon={<Star className="w-4 h-4 text-amber-500 fill-amber-400" />}
                filters={favoriteFilters}
                currentUserId={currentUser?.id}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggleFavorite={toggleFavorite}
                onToggleShared={toggleShared}
              />
            )}

            {/* My Filters */}
            <FilterSection
              title={t('filter.myFilters')}
              icon={<Lock className="w-4 h-4 text-gray-500" />}
              filters={myFilters}
              currentUserId={currentUser?.id}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleFavorite={toggleFavorite}
              onToggleShared={toggleShared}
            />

            {/* Shared by others */}
            {sharedFilters.length > 0 && (
              <FilterSection
                title={t('filter.sharedWithMe')}
                icon={<Globe className="w-4 h-4 text-blue-500" />}
                filters={sharedFilters}
                currentUserId={currentUser?.id}
                onEdit={openEdit}
                onDelete={handleDelete}
                onToggleFavorite={toggleFavorite}
                onToggleShared={toggleShared}
                readOnly
              />
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? t('filter.edit') : t('filter.create')} size="lg">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">{t('filter.name')} *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder={t('filter.namePlaceholder')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              {t('filter.criteria')} *
              <span className="ml-2 text-xs text-gray-400 font-normal">{t('filter.criteriaHint')}</span>
            </label>
            <textarea
              value={form.filterCriteria}
              onChange={(e) => setForm((f) => ({ ...f, filterCriteria: e.target.value }))}
              rows={5}
              placeholder={t('filter.criteriaPlaceholder')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isShared}
                onChange={(e) => setForm((f) => ({ ...f, isShared: e.target.checked }))}
                className="w-4 h-4 rounded text-blue-600"
              />
              <span className="text-sm text-gray-700 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-gray-400" /> {t('filter.shared')}
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFavorite}
                onChange={(e) => setForm((f) => ({ ...f, isFavorite: e.target.checked }))}
                className="w-4 h-4 rounded text-amber-500"
              />
              <span className="text-sm text-gray-700 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" /> {t('filter.favorite')}
              </span>
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200">{t('common.cancel')}</button>
            <button
              onClick={handleSubmit}
              disabled={!form.name.trim() || !form.filterCriteria.trim() || createFilter.isPending || updateFilter.isPending}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {editing ? t('common.update') : t('common.create')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── FilterSection sub-component ─────────────────────────────────────────────

interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  filters: SavedFilter[];
  currentUserId?: number;
  onEdit: (f: SavedFilter) => void;
  onDelete: (f: SavedFilter) => void;
  onToggleFavorite: (f: SavedFilter) => void;
  onToggleShared: (f: SavedFilter) => void;
  readOnly?: boolean;
}

function FilterSection({ title, icon, filters, currentUserId, onEdit, onDelete, onToggleFavorite, onToggleShared, readOnly }: FilterSectionProps) {
  const { t } = useTranslation();
  if (filters.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        <span className="text-xs text-gray-400">({filters.length})</span>
      </div>
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {filters.map((f) => {
          const isOwner = f.creatorId === currentUserId;
          return (
            <div key={f.id} className="flex items-start gap-3 px-4 py-3 group hover:bg-gray-50 transition-colors">
              {/* Favorite star */}
              <button
                onClick={() => onToggleFavorite(f)}
                className={`mt-0.5 flex-shrink-0 ${f.isFavorite ? 'text-amber-400' : 'text-gray-300 hover:text-amber-300'}`}
                title={f.isFavorite ? t('filter.unfavorite') : t('filter.addFavorite')}
              >
                <Star className={`w-4 h-4 ${f.isFavorite ? 'fill-amber-400' : ''}`} />
              </button>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900">{f.name}</span>
                  {f.isShared && (
                    <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {t('filter.shared')}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {t('filter.by')} {f.creatorName} · {formatDate(f.updatedAt)}
                </div>
                <pre className="text-xs text-gray-500 bg-gray-50 rounded px-2 py-1 mt-2 font-mono overflow-x-auto max-h-16 whitespace-pre-wrap break-all">
                  {f.filterCriteria}
                </pre>
              </div>

              {/* Actions */}
              {!readOnly && isOwner && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => onToggleShared(f)}
                    className={`p-1.5 rounded hover:bg-blue-50 ${f.isShared ? 'text-blue-600' : 'text-gray-400 hover:text-blue-600'}`}
                    title={f.isShared ? t('filter.makePrivate') : t('filter.makeShared')}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onEdit(f)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50" title={t('common.edit')}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(f)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50" title={t('common.delete')}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
