import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Plus, Trash2, Edit2, ArrowRight, ChevronRight,
  Circle, CheckCircle, Zap, Shield, X, Save, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { workflowApi } from '../api/workflows';
import type {
  WorkflowStep, WorkflowTransition,
  WorkflowStepRequest, WorkflowTransitionRequest, TransitionRole,
} from '../types';

/* ─── Constants ──────────────────────────────────────────────────────────── */
const ISSUE_STATUS_OPTIONS = ['TODO', 'IN_PROGRESS', 'TESTING', 'UAT', 'DONE'];
const ROLE_OPTIONS: TransitionRole[] = ['ANY', 'ASSIGNEE', 'REPORTER', 'MANAGER', 'ADMIN'];
const ROLE_LABELS: Record<TransitionRole, string> = {
  ANY: 'Any member', ASSIGNEE: 'Assignee only', REPORTER: 'Reporter only',
  MANAGER: 'Manager+', ADMIN: 'Admin only',
};
const PRESET_COLORS = [
  '#6b7280','#3b82f6','#8b5cf6','#f59e0b',
  '#10b981','#ef4444','#ec4899','#06b6d4','#84cc16',
];

/* ─── Step Card ──────────────────────────────────────────────────────────── */
function StepCard({
  step, isSelected, outgoingTransitions, isLast,
  onClick, onEdit, onDelete, onAddTransition,
}: {
  step: WorkflowStep;
  isSelected: boolean;
  outgoingTransitions: WorkflowTransition[];
  isLast: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddTransition: () => void;
}) {
  return (
    <div className="flex items-center flex-shrink-0">
      {/* Card */}
      <div className="flex flex-col items-center gap-2 group">
        <div
          onClick={onClick}
          className={`
            relative w-44 rounded-2xl overflow-hidden cursor-pointer
            transition-all duration-200 shadow-md hover:shadow-xl
            ${isSelected
              ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-gray-950 scale-105'
              : 'hover:scale-102 opacity-90 hover:opacity-100'
            }
          `}
        >
          {/* Color bar */}
          <div className="h-2.5" style={{ background: step.color }} />
          {/* Body */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-4 text-center rounded-b-2xl">
            {/* Color dot */}
            <div
              className="w-4 h-4 rounded-full mx-auto mb-3 shadow-lg"
              style={{ background: step.color, boxShadow: `0 0 10px ${step.color}88` }}
            />
            <p className="font-bold text-sm text-gray-900 dark:text-white mb-2 leading-tight">{step.name}</p>
            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-1">
              {step.isInitial && (
                <span className="flex items-center gap-0.5 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-[10px] font-semibold border border-blue-500/30">
                  <Circle className="w-2.5 h-2.5" /> START
                </span>
              )}
              {step.isFinal && (
                <span className="flex items-center gap-0.5 px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-[10px] font-semibold border border-green-500/30">
                  <CheckCircle className="w-2.5 h-2.5" /> END
                </span>
              )}
              {step.mappedStatus && (
                <span className="px-2 py-0.5 bg-gray-700 text-gray-400 rounded-full text-[10px]">
                  {step.mappedStatus}
                </span>
              )}
            </div>
          </div>
          {/* Hover actions */}
          <div className="absolute top-3 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={e => { e.stopPropagation(); onEdit(); }}
              className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-blue-600 text-gray-600 hover:text-white dark:text-white rounded-md transition-colors"
              title="Edit step"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={e => { e.stopPropagation(); onDelete(); }}
              className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 hover:bg-red-600 text-gray-600 hover:text-white dark:text-white rounded-md transition-colors"
              title="Delete step"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Outgoing transition labels under card */}
        {outgoingTransitions.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1 w-44">
            {outgoingTransitions.slice(0,3).map(t => (
              <span
                key={t.id}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  t.requiresApproval
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {t.requiresApproval && '⏳'} {t.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Arrow connector to next step */}
      {!isLast && (
        <div className="flex flex-col items-center mx-1 flex-shrink-0">
          {/* Button to add transition */}
          <button
            onClick={onAddTransition}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-600/20 text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500/50 transition-all group"
          >
            <ArrowRight className="w-4 h-4" />
            {outgoingTransitions.length > 0 ? (
              <span className="bg-blue-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {outgoingTransitions.length}
              </span>
            ) : (
              <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Side Panel ─────────────────────────────────────────────────────────── */
type PanelMode = 'step-new' | 'step-edit' | 'transition-new' | 'transition-edit' | null;

interface PanelState {
  mode: PanelMode;
  step?: WorkflowStep;
  transition?: WorkflowTransition;
  defaultFromStepId?: number;
}

/* ─── Step Form ──────────────────────────────────────────────────────────── */
function StepForm({
  initial, onSave, onCancel, saving,
}: {
  initial?: WorkflowStep; onSave: (d: WorkflowStepRequest) => void;
  onCancel: () => void; saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [color, setColor] = useState(initial?.color ?? PRESET_COLORS[0]);
  const [isInitial, setIsInitial] = useState(initial?.isInitial ?? false);
  const [isFinal, setIsFinal] = useState(initial?.isFinal ?? false);
  const [mappedStatus, setMappedStatus] = useState(initial?.mappedStatus ?? '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), color, isInitial, isFinal, mappedStatus: mappedStatus || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Preview */}
        <div className="flex justify-center py-2">
          <div className="w-32 rounded-xl overflow-hidden shadow-lg" style={{ border: `2px solid ${color}` }}>
            <div className="h-2" style={{ background: color }} />
            <div className="bg-gray-800 p-3 text-center">
              <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: color }} />
              <p className="text-xs font-bold text-white truncate">{name || 'Step name'}</p>
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">Name *</label>
          <input autoFocus value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
            placeholder="e.g. In Review" />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Color</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full transition-all"
                style={{
                  background: c,
                  transform: color === c ? 'scale(1.3)' : 'scale(1)',
                  outline: color === c ? `2px solid white` : 'none',
                  outlineOffset: '2px',
                }}
              />
            ))}
            <input type="color" value={color} onChange={e => setColor(e.target.value)}
              className="w-7 h-7 rounded-full cursor-pointer border-0 bg-transparent" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">
            Mapped Status
          </label>
          <select value={mappedStatus} onChange={e => setMappedStatus(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
            <option value="">— None —</option>
            {ISSUE_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Syncs this step to an IssueStatus enum value</p>
        </div>

        <div className="space-y-2.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Flags</label>
          {([
            ['isInitial', isInitial, setIsInitial, 'Start step — new issues begin here', 'bg-blue-500/20 text-blue-400 border-blue-500/30'],
            ['isFinal', isFinal, setIsFinal, 'End step — closes the issue', 'bg-green-500/20 text-green-400 border-green-500/30'],
          ] as const).map(([key, val, set, desc, cls]) => (
            <label key={key} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              val ? cls : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
              <input type="checkbox" checked={val as boolean} onChange={e => (set as any)(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded accent-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{key === 'isInitial' ? 'Initial Step' : 'Final Step'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{desc as string}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving || !name.trim()}
          className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : 'Save Step'}
        </button>
      </div>
    </form>
  );
}

/* ─── Transition Form ────────────────────────────────────────────────────── */
function TransitionForm({
  steps, initial, defaultFromStepId, onSave, onCancel, saving,
}: {
  steps: WorkflowStep[]; initial?: WorkflowTransition;
  defaultFromStepId?: number;
  onSave: (d: WorkflowTransitionRequest) => void;
  onCancel: () => void; saving: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [fromStepId, setFromStepId] = useState(
    initial?.fromStepId?.toString() ?? defaultFromStepId?.toString() ?? ''
  );
  const [toStepId, setToStepId] = useState(initial?.toStepId?.toString() ?? '');
  const [requiredRole, setRequiredRole] = useState<TransitionRole>(initial?.requiredRole ?? 'ANY');
  const [requiresApproval, setRequiresApproval] = useState(initial?.requiresApproval ?? false);
  const [approverRole, setApproverRole] = useState<TransitionRole>(initial?.approverRole ?? 'MANAGER');

  const fromStep = steps.find(s => s.id.toString() === fromStepId);
  const toStep = steps.find(s => s.id.toString() === toStepId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !toStepId) return;
    onSave({
      name: name.trim(),
      fromStepId: fromStepId ? Number(fromStepId) : undefined,
      toStepId: Number(toStepId),
      requiredRole,
      requiresApproval,
      approverRole: requiresApproval ? approverRole : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Flow preview */}
        <div className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          {fromStep ? (
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
              style={{ background: fromStep.color + '33', border: `1.5px solid ${fromStep.color}`, color: fromStep.color }}>
              {fromStep.name}
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500">
              Any Step
            </span>
          )}
          <div className="flex flex-col items-center gap-0.5">
            <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-400" />
            {name && <span className="text-[10px] text-blue-400 font-medium">{name}</span>}
          </div>
          {toStep ? (
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: toStep.color + '33', border: `1.5px solid ${toStep.color}`, color: toStep.color }}>
              {toStep.name}
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-lg text-xs font-bold border border-dashed border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500">
              Target Step
            </span>
          )}
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">
            Transition Name *
          </label>
          <input autoFocus value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
            placeholder="e.g. Start Review" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">From Step</label>
            <select value={fromStepId} onChange={e => setFromStepId(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
              <option value="">Any Step</option>
              {steps.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">To Step *</label>
            <select value={toStepId} onChange={e => setToStepId(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
              <option value="">Select…</option>
              {steps.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">
            Who can trigger
          </label>
          <div className="space-y-1.5">
            {ROLE_OPTIONS.map(r => (
              <label key={r} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                requiredRole === r ? 'border-blue-500 bg-blue-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}>
                <input type="radio" name="requiredRole" value={r}
                  checked={requiredRole === r} onChange={() => setRequiredRole(r)}
                  className="accent-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{ROLE_LABELS[r]}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
            requiresApproval ? 'border-amber-500/50 bg-amber-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}>
            <input type="checkbox" checked={requiresApproval}
              onChange={e => setRequiresApproval(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded accent-amber-500" />
            <div>
              <p className="text-sm font-medium text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> Requires Approval
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Transition waits for an authorized person to approve</p>
            </div>
          </label>

          {requiresApproval && (
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-2">Approver Role</label>
              <div className="space-y-1.5">
                {ROLE_OPTIONS.filter(r => r !== 'ANY').map(r => (
                  <label key={r} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    approverRole === r ? 'border-amber-500 bg-amber-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}>
                    <input type="radio" name="approverRole" value={r}
                      checked={approverRole === r} onChange={() => setApproverRole(r)}
                      className="accent-amber-500" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{r}</p>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-2 text-sm text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-lg hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving || !name.trim() || !toStepId}
          className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

/* ─── Transition Row ─────────────────────────────────────────────────────── */
function TransitionRow({
  transition, steps, onEdit, onDelete,
}: {
  transition: WorkflowTransition;
  steps: WorkflowStep[];
  onEdit: () => void;
  onDelete: () => void;
}) {
  const fromStep = steps.find(s => s.id === transition.fromStepId);
  const toStep = steps.find(s => s.id === transition.toStepId);

  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:border-gray-200 dark:hover:border-gray-600 group transition-colors">
      {/* From */}
      <div className="flex items-center gap-2 min-w-0">
        {fromStep ? (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0"
            style={{ background: fromStep.color + '25', color: fromStep.color, border: `1px solid ${fromStep.color}50` }}>
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: fromStep.color }} />
            {fromStep.name}
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-gray-400 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600 flex-shrink-0">
            Any Step
          </span>
        )}
      </div>

      {/* Arrow + label */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className="h-px w-4 bg-gray-200 dark:bg-gray-600" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600">
            {transition.name}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-gray-400 dark:text-gray-500 flex items-center gap-0.5">
              <Zap className="w-2.5 h-2.5" />{transition.requiredRole}
            </span>
            {transition.requiresApproval && (
              <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                <Shield className="w-2.5 h-2.5" />{transition.approverRole}
              </span>
            )}
          </div>
        </div>
        <div className="h-px w-4 bg-gray-200 dark:bg-gray-600" />
        <ArrowRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
      </div>

      {/* To */}
      {toStep && (
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold flex-shrink-0"
          style={{ background: toStep.color + '25', color: toStep.color, border: `1px solid ${toStep.color}50` }}>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: toStep.color }} />
          {toStep.name}
        </span>
      )}

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={onDelete}
          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── WorkflowBuilderPage ────────────────────────────────────────────────── */
export function WorkflowBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const workflowId = Number(id);
  useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [panel, setPanel] = useState<PanelState>({ mode: null });

  const closePanel = useCallback(() => setPanel({ mode: null }), []);

  const { data: workflow, isLoading } = useQuery({
    queryKey: ['workflow', workflowId],
    queryFn: () => workflowApi.get(workflowId),
    enabled: !!workflowId,
  });

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['workflow', workflowId] });
    queryClient.invalidateQueries({ queryKey: ['workflows'] });
  }, [queryClient, workflowId]);

  /* Step mutations */
  const addStepMut = useMutation({
    mutationFn: (data: WorkflowStepRequest) => workflowApi.addStep(workflowId, data),
    onSuccess: () => { invalidate(); closePanel(); toast.success('Step added'); },
    onError: () => toast.error('Failed to save step'),
  });
  const updateStepMut = useMutation({
    mutationFn: ({ stepId, data }: { stepId: number; data: WorkflowStepRequest }) =>
      workflowApi.updateStep(workflowId, stepId, data),
    onSuccess: () => { invalidate(); closePanel(); toast.success('Step updated'); },
    onError: () => toast.error('Failed to save step'),
  });
  const deleteStepMut = useMutation({
    mutationFn: (stepId: number) => workflowApi.deleteStep(workflowId, stepId),
    onSuccess: () => { invalidate(); toast.success('Step deleted'); },
    onError: () => toast.error('Failed to delete step'),
  });

  /* Transition mutations */
  const addTransMut = useMutation({
    mutationFn: (data: WorkflowTransitionRequest) => workflowApi.addTransition(workflowId, data),
    onSuccess: () => { invalidate(); closePanel(); toast.success('Transition added'); },
    onError: () => toast.error('Failed to save transition'),
  });
  const updateTransMut = useMutation({
    mutationFn: ({ tid, data }: { tid: number; data: WorkflowTransitionRequest }) =>
      workflowApi.updateTransition(workflowId, tid, data),
    onSuccess: () => { invalidate(); closePanel(); toast.success('Transition updated'); },
    onError: () => toast.error('Failed to save transition'),
  });
  const deleteTransMut = useMutation({
    mutationFn: (tid: number) => workflowApi.deleteTransition(workflowId, tid),
    onSuccess: () => { invalidate(); toast.success('Transition deleted'); },
    onError: () => toast.error('Failed to delete transition'),
  });

  if (isLoading) return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!workflow) return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-500 dark:text-gray-400">
      Workflow not found
    </div>
  );

  const sortedSteps = [...workflow.steps].sort((a, b) => a.position - b.position);

  /* Transitions grouped by fromStep */
  const transitionsFrom = (stepId: number | undefined) =>
    workflow.transitions.filter(t => t.fromStepId === stepId);

  const panelTitle =
    panel.mode === 'step-new' ? 'Add Step' :
    panel.mode === 'step-edit' ? 'Edit Step' :
    panel.mode === 'transition-new' ? 'Add Transition' :
    panel.mode === 'transition-edit' ? 'Edit Transition' : '';

  const isSaving = addStepMut.isPending || updateStepMut.isPending ||
    addTransMut.isPending || updateTransMut.isPending;

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <button onClick={() => navigate('/workflows')}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold">{workflow.name}</h1>
          {workflow.description && <p className="text-xs text-gray-500 dark:text-gray-400">{workflow.description}</p>}
        </div>
        <div className="flex items-center gap-2 ml-1">
          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
            {sortedSteps.length} steps
          </span>
          <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
            {workflow.transitions.length} transitions
          </span>
          {workflow.isDefault && (
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
              Default
            </span>
          )}
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setPanel({ mode: 'step-new' })}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Step
        </button>
      </div>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Canvas + transitions ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Visual Flow Canvas */}
          <div className="p-8">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">Flow</p>

            {sortedSteps.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                  <Circle className="w-7 h-7 text-gray-400 dark:text-gray-600" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No steps yet</p>
                <p className="text-sm text-gray-500 dark:text-gray-600 mb-4">Add steps to define the workflow states</p>
                <button
                  onClick={() => setPanel({ mode: 'step-new' })}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add First Step
                </button>
              </div>
            ) : (
              <div className="flex items-start overflow-x-auto pb-4 gap-0">
                {sortedSteps.map((step, i) => (
                  <StepCard
                    key={step.id}
                    step={step}
                    isSelected={panel.step?.id === step.id}
                    outgoingTransitions={transitionsFrom(step.id)}
                    isLast={i === sortedSteps.length - 1}
                    onClick={() => {
                      if (panel.step?.id === step.id) closePanel();
                      else setPanel({ mode: 'step-edit', step });
                    }}
                    onEdit={() => setPanel({ mode: 'step-edit', step })}
                    onDelete={() => {
                      if (window.confirm(`Delete step "${step.name}"?`))
                        deleteStepMut.mutate(step.id);
                    }}
                    onAddTransition={() => setPanel({
                      mode: 'transition-new',
                      defaultFromStepId: step.id,
                    })}
                  />
                ))}

                {/* Add step button at end */}
                <div className="flex items-center flex-shrink-0 ml-3">
                  <button
                    onClick={() => setPanel({ mode: 'step-new' })}
                    className="flex flex-col items-center justify-center w-32 h-28 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-2xl text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all group"
                  >
                    <Plus className="w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Add Step</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* "Any Step" transitions (fromStep is null) */}
          {workflow.transitions.filter(t => t.fromStepId == null).length > 0 && (
            <div className="px-8 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  Global Transitions (from any step)
                </p>
              </div>
              <div className="space-y-2">
                {workflow.transitions.filter(t => t.fromStepId == null).map(tr => (
                  <TransitionRow
                    key={tr.id} transition={tr} steps={sortedSteps}
                    onEdit={() => setPanel({ mode: 'transition-edit', transition: tr })}
                    onDelete={() => {
                      if (window.confirm(`Delete transition "${tr.name}"?`))
                        deleteTransMut.mutate(tr.id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Transitions list */}
          {workflow.transitions.filter(t => t.fromStepId != null).length > 0 && (
            <div className="px-8 pb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                    All Transitions ({workflow.transitions.filter(t => t.fromStepId != null).length})
                  </p>
                </div>
                <button
                  onClick={() => setPanel({ mode: 'transition-new' })}
                  disabled={sortedSteps.length < 2}
                  className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 dark:hover:text-white disabled:opacity-40 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Transition
                </button>
              </div>
              <div className="space-y-2">
                {workflow.transitions.filter(t => t.fromStepId != null).map(tr => (
                  <TransitionRow
                    key={tr.id} transition={tr} steps={sortedSteps}
                    onEdit={() => setPanel({ mode: 'transition-edit', transition: tr })}
                    onDelete={() => {
                      if (window.confirm(`Delete transition "${tr.name}"?`))
                        deleteTransMut.mutate(tr.id);
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty transitions */}
          {workflow.transitions.length === 0 && sortedSteps.length >= 2 && (
            <div className="px-8 pb-8">
              <div className="flex items-center justify-center py-10 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                <div className="text-center">
                  <ArrowRight className="w-8 h-8 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-400 dark:text-gray-500 text-sm mb-3">No transitions yet</p>
                  <button
                    onClick={() => setPanel({ mode: 'transition-new' })}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm text-gray-700 dark:text-white rounded-lg transition-colors mx-auto"
                  >
                    <Plus className="w-4 h-4" /> Add Transition
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Side Panel ───────────────────────────────────────── */}
        {panel.mode && (
          <div className="w-80 flex-shrink-0 border-l border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900 animate-in slide-in-from-right duration-200">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">{panelTitle}</h2>
              <button onClick={closePanel}
                className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {(panel.mode === 'step-new' || panel.mode === 'step-edit') && (
                <StepForm
                  initial={panel.mode === 'step-edit' ? panel.step : undefined}
                  saving={isSaving}
                  onCancel={closePanel}
                  onSave={data => {
                    if (panel.mode === 'step-new') addStepMut.mutate(data);
                    else if (panel.step) updateStepMut.mutate({ stepId: panel.step.id, data });
                  }}
                />
              )}
              {(panel.mode === 'transition-new' || panel.mode === 'transition-edit') && (
                <TransitionForm
                  steps={sortedSteps}
                  initial={panel.mode === 'transition-edit' ? panel.transition : undefined}
                  defaultFromStepId={panel.defaultFromStepId}
                  saving={isSaving}
                  onCancel={closePanel}
                  onSave={data => {
                    if (panel.mode === 'transition-new') addTransMut.mutate(data);
                    else if (panel.transition) updateTransMut.mutate({ tid: panel.transition.id, data });
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
