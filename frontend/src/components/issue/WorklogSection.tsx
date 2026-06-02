import { useState } from 'react';
import { Clock, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useWorklogs, useAddWorklog, useDeleteWorklog } from '../../hooks/useIssueFeatures';
import { formatDate } from '../../utils/formatters';

interface Props {
  issueId: number;
}

export function WorklogSection({ issueId }: Props) {
  const { t } = useTranslation();
  const { data: worklogs = [], isLoading } = useWorklogs(issueId);
  const addWorklog = useAddWorklog(issueId);
  const deleteWorklog = useDeleteWorklog(issueId);

  const [open, setOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [hours, setHours] = useState('');
  const [startedAt, setStartedAt] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');

  const totalHours = worklogs.reduce((sum, w) => sum + w.timeSpentHours, 0);

  const handleAdd = () => {
    const h = parseFloat(hours);
    if (!h || h <= 0) return;
    addWorklog.mutate(
      {
        timeSpentHours: h,
        startedAt: startedAt ? startedAt + 'T00:00:00' : undefined,
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setHours('');
          setDescription('');
          setShowForm(false);
        },
      },
    );
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span>{t('issue.worklog')}</span>
          {totalHours > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
              {totalHours.toFixed(1)}h
            </span>
          )}
        </div>
        {open ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <p className="px-4 py-3 text-xs text-gray-400">{t('common.loading')}</p>
          ) : worklogs.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-400">{t('issue.noWorklogs')}</p>
          ) : (
            worklogs.map((w) => (
              <div key={w.id} className="flex items-start gap-3 px-4 py-3 group">
                <div className="shrink-0 w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                  {w.authorName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{w.authorName}</span>
                    <span className="text-xs text-gray-400">{formatDate(w.startedAt)}</span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                      {w.timeSpentHours}h
                    </span>
                  </div>
                  {w.description && (
                    <p className="text-xs text-gray-600 mt-0.5">{w.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteWorklog.mutate(w.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 rounded transition-all shrink-0"
                  title={t('common.delete')}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}

          {/* Add worklog form */}
          {showForm ? (
            <div className="px-4 py-3 bg-gray-50 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    {t('issue.hoursSpent')} *
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.5"
                    placeholder="1.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">
                    {t('issue.workDate')}
                  </label>
                  <input
                    type="date"
                    value={startedAt}
                    onChange={(e) => setStartedAt(e.target.value)}
                    className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">
                  {t('issue.workDescription')}
                </label>
                <input
                  type="text"
                  placeholder={t('issue.workDescPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setShowForm(false); }}
                  className="w-full text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={!hours || parseFloat(hours) <= 0 || addWorklog.isPending}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {t('issue.logWork')}
                </button>
                <button
                  onClick={() => { setShowForm(false); setHours(''); setDescription(''); }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md hover:bg-gray-200"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center gap-1.5 px-4 py-2.5 text-xs text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              {t('issue.logWork')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
