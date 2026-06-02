import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  GitBranch, Plus, Trash2, Settings2, Star, Edit2,
  ArrowRight, Circle, CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { workflowApi } from '../api/workflows';
import type { Workflow, WorkflowRequest } from '../types';

/* ─── Mini Flow Preview ───────────────────────────────────────────────────── */
function MiniFlow({ workflow }: { workflow: Workflow }) {
  const steps = [...workflow.steps].sort((a, b) => a.position - b.position);
  if (steps.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-gray-400 dark:text-gray-600 text-xs">
        <Circle className="w-3 h-3" /> No steps
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: step.color + '20',
              color: step.color,
              border: `1px solid ${step.color}50`,
            }}>
            {step.isInitial && <Circle className="w-2.5 h-2.5 flex-shrink-0" />}
            {step.isFinal && <CheckCircle className="w-2.5 h-2.5 flex-shrink-0" />}
            <span className="truncate max-w-[80px]">{step.name}</span>
          </div>
          {i < steps.length - 1 && (
            <ArrowRight className="w-3 h-3 text-gray-400 dark:text-gray-600 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Workflow Card ───────────────────────────────────────────────────────── */
function WorkflowCard({
  workflow, onEdit, onDelete, onOpen,
}: {
  workflow: Workflow;
  onEdit: () => void;
  onDelete: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-all group hover:shadow-lg hover:shadow-black/10 dark:hover:shadow-black/20">
      {/* Color strip from steps */}
      <div className="flex h-1.5">
        {workflow.steps.length > 0 ? (
          [...workflow.steps].sort((a, b) => a.position - b.position).map(s => (
            <div key={s.id} className="flex-1" style={{ background: s.color }} />
          ))
        ) : (
          <div className="flex-1 bg-gray-200 dark:bg-gray-700" />
        )}
      </div>

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{workflow.name}</h3>
              {workflow.isDefault && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/15 text-amber-500 dark:text-amber-400 rounded-full text-[10px] font-bold border border-amber-500/30 flex-shrink-0">
                  <Star className="w-2.5 h-2.5" /> Default
                </span>
              )}
            </div>
            {workflow.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{workflow.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button onClick={onEdit} title="Edit"
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onOpen} title="Open Builder"
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Settings2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onDelete} title="Delete"
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mini Flow */}
        <div className="mb-4">
          <MiniFlow workflow={workflow} />
        </div>

        {/* Stats + CTA */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Circle className="w-3 h-3" /> {workflow.steps.length} steps
            </span>
            <span className="flex items-center gap-1">
              <ArrowRight className="w-3 h-3" /> {workflow.transitions.length} transitions
            </span>
          </div>
          <button
            onClick={onOpen}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-lg transition-colors"
          >
            Open Builder <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {workflow.createdBy && (
          <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-2">Created by {workflow.createdBy}</p>
        )}
      </div>
    </div>
  );
}

/* ─── Workflow Form Modal ─────────────────────────────────────────────────── */
function WorkflowFormModal({
  initial, onClose, onSave, saving,
}: {
  initial?: Workflow; onClose: () => void;
  onSave: (data: WorkflowRequest) => void; saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim() || undefined, isDefault });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            {initial ? 'Edit Workflow' : 'New Workflow'}
          </h2>
          <button onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <span className="text-lg leading-none">×</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">
              Name *
            </label>
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 placeholder-gray-400 dark:placeholder-gray-600"
              placeholder="e.g. Software Development Flow" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 placeholder-gray-400 dark:placeholder-gray-600 resize-none"
              placeholder="Describe what this workflow is for…" />
          </div>
          <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
            isDefault ? 'border-amber-500/50 bg-amber-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}>
            <input type="checkbox" checked={isDefault} onChange={e => setIsDefault(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-amber-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400" /> Set as Default
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Used by new projects that don't specify a workflow</p>
            </div>
          </label>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving || !name.trim()}
              className="flex-1 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 transition-colors font-semibold">
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Workflow'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── WorkflowsPage ───────────────────────────────────────────────────────── */
export function WorkflowsPage() {
  useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Workflow | null>(null);

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['workflows'],
    queryFn: workflowApi.list,
  });

  const createMutation = useMutation({
    mutationFn: workflowApi.create,
    onSuccess: (wf) => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow created');
      setShowForm(false);
      navigate(`/workflows/${wf.id}`);
    },
    onError: () => toast.error('Failed to create workflow'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkflowRequest }) => workflowApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow updated');
      setEditing(null);
    },
    onError: () => toast.error('Failed to update workflow'),
  });

  const deleteMutation = useMutation({
    mutationFn: workflowApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      toast.success('Workflow deleted');
    },
    onError: () => toast.error('Failed to delete workflow'),
  });

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600/20 border border-blue-500/30 rounded-2xl flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Workflows</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {workflows.length > 0 ? `${workflows.length} workflow${workflows.length !== 1 ? 's' : ''}` : 'Define issue lifecycle flows'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-lg shadow-blue-900/20"
          >
            <Plus className="w-4 h-4" /> New Workflow
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
            Loading…
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
              <GitBranch className="w-9 h-9 text-gray-400 dark:text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-1">No workflows yet</h3>
            <p className="text-sm text-gray-500 mb-6 text-center max-w-xs">
              Create your first workflow to control how issues move through their lifecycle
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-sm font-semibold rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Workflow
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map(wf => (
              <WorkflowCard
                key={wf.id}
                workflow={wf}
                onEdit={() => setEditing(wf)}
                onOpen={() => navigate(`/workflows/${wf.id}`)}
                onDelete={() => {
                  if (window.confirm(`Delete workflow "${wf.name}"? This cannot be undone.`))
                    deleteMutation.mutate(wf.id);
                }}
              />
            ))}

            {/* Add card */}
            <button
              onClick={() => setShowForm(true)}
              className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-500/50 rounded-2xl text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all group"
            >
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-600/20 rounded-2xl flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-sm font-semibold">New Workflow</p>
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <WorkflowFormModal
          onClose={() => setShowForm(false)}
          onSave={data => createMutation.mutate(data)}
          saving={createMutation.isPending}
        />
      )}
      {editing && (
        <WorkflowFormModal
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={data => updateMutation.mutate({ id: editing.id, data })}
          saving={updateMutation.isPending}
        />
      )}
    </div>
  );
}
