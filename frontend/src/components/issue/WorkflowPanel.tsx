import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Clock, CheckCircle, XCircle, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { workflowApi } from '../../api/workflows';
import type { Issue, WorkflowApproval } from '../../types';
import { formatDate } from '../../utils/formatters';

interface WorkflowPanelProps {
  issue: Issue;
}

/* ─── Transition confirmation modal ─────────────────────────────────────── */
function TransitionModal({
  transitionName,
  requiresApproval,
  onClose,
  onConfirm,
  loading,
}: {
  transitionName: string;
  requiresApproval: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  loading: boolean;
}) {
  const { t } = useTranslation();
  const [comment, setComment] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-gray-700">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{transitionName}</h3>
          {requiresApproval && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {t('workflow.approvalRequired')}
            </p>
          )}
        </div>
        <div className="px-5 py-4">
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">{t('workflow.comment')}</label>
          <textarea
            autoFocus
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
            className="w-full text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t('workflow.commentPlaceholder')}
          />
        </div>
        <div className="px-5 pb-4 flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg transition-colors">
            {t('common.cancel')}
          </button>
          <button onClick={() => onConfirm(comment)} disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors">
            {loading ? t('common.saving') : requiresApproval ? t('workflow.requestApproval') : t('workflow.applyTransition')}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Approval row ───────────────────────────────────────────────────────── */
function ApprovalRow({
  approval,
  onApprove,
  onReject,
  canResolve,
}: {
  approval: WorkflowApproval;
  onApprove: (id: number, comment: string) => void;
  onReject: (id: number, comment: string) => void;
  canResolve: boolean;
}) {
  const { t } = useTranslation();
  const [comment, setComment] = useState('');
  const [expanded, setExpanded] = useState(false);

  const statusColor =
    approval.status === 'APPROVED' ? 'text-green-600' :
    approval.status === 'REJECTED' ? 'text-red-500' : 'text-amber-500';

  const StatusIcon =
    approval.status === 'APPROVED' ? CheckCircle :
    approval.status === 'REJECTED' ? XCircle : Clock;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <StatusIcon className={`w-4 h-4 flex-shrink-0 ${statusColor}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-medium text-gray-800 dark:text-gray-200">{approval.transitionName}</span>
            <span className="text-gray-400 dark:text-gray-500">·</span>
            <span className="text-gray-500 dark:text-gray-400 text-xs">{approval.fromStepName}</span>
            <ArrowRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
            <span className="text-gray-500 dark:text-gray-400 text-xs">{approval.toStepName}</span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('workflow.requestedBy', { name: approval.requestedBy.fullName })} · {formatDate(approval.createdAt)}
          </p>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 dark:text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />}
      </div>

      {expanded && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-100 dark:border-gray-700">
          {approval.comment && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 italic">"{approval.comment}"</p>
          )}
          {approval.resolvedBy && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {approval.status === 'APPROVED' ? t('workflow.approvedBy') : t('workflow.rejectedBy')}{' '}
              {approval.resolvedBy.fullName} · {formatDate(approval.resolvedAt!)}
            </p>
          )}

          {approval.status === 'PENDING' && canResolve && (
            <div className="space-y-2 pt-1">
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={2}
                placeholder={t('workflow.resolveCommentPlaceholder')}
                className="w-full text-xs border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => onApprove(approval.id, comment)}
                  className="flex-1 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                  {t('workflow.approve')}
                </button>
                <button
                  onClick={() => onReject(approval.id, comment)}
                  className="flex-1 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-500 transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5 inline mr-1" />
                  {t('workflow.reject')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── WorkflowPanel ─────────────────────────────────────────────────────── */
export function WorkflowPanel({ issue }: WorkflowPanelProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [pendingTransition, setPendingTransition] = useState<{
    id: number;
    name: string;
    requiresApproval: boolean;
  } | null>(null);

  // Only fetch if project has workflow
  const hasWorkflow = !!issue.currentStepId || !!issue.currentStepName;

  const { data: transitions = [] } = useQuery({
    queryKey: ['workflow-transitions', issue.id],
    queryFn: () => workflowApi.getAvailableTransitions(issue.id),
  });

  const { data: approvals = [] } = useQuery({
    queryKey: ['workflow-approvals', issue.id],
    queryFn: () => workflowApi.getIssueApprovals(issue.id),
  });

  const { data: myPendingApprovals = [] } = useQuery({
    queryKey: ['my-pending-approvals'],
    queryFn: workflowApi.getMyPendingApprovals,
  });

  // Check if current user has pending approvals for this issue
  const canResolveAny = myPendingApprovals.some(a => a.issueId === issue.id && a.status === 'PENDING');

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['issue', issue.id] });
    queryClient.invalidateQueries({ queryKey: ['workflow-transitions', issue.id] });
    queryClient.invalidateQueries({ queryKey: ['workflow-approvals', issue.id] });
    queryClient.invalidateQueries({ queryKey: ['my-pending-approvals'] });
  };

  const executeMut = useMutation({
    mutationFn: ({ transitionId, comment }: { transitionId: number; comment: string }) =>
      workflowApi.executeTransition(issue.id, { transitionId, comment }),
    onSuccess: (result) => {
      invalidate();
      setPendingTransition(null);
      if (result.status === 'PENDING') {
        toast.success(t('workflow.approvalRequested'));
      } else {
        toast.success(t('workflow.transitionApplied'));
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? t('workflow.transitionError'));
    },
  });

  const approveMut = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) =>
      workflowApi.approve(id, { comment }),
    onSuccess: () => { invalidate(); toast.success(t('workflow.approveSuccess')); },
    onError: () => toast.error(t('workflow.approveError')),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) =>
      workflowApi.reject(id, { comment }),
    onSuccess: () => { invalidate(); toast.success(t('workflow.rejectSuccess')); },
    onError: () => toast.error(t('workflow.rejectError')),
  });

  // Don't render if no transitions and no approvals (project has no workflow)
  if (transitions.length === 0 && approvals.length === 0 && !hasWorkflow) return null;

  const pendingApprovals = approvals.filter(a => a.status === 'PENDING');
  const resolvedApprovals = approvals.filter(a => a.status !== 'PENDING');

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{t('workflow.panel')}</span>
        {issue.currentStepName && (
          <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
            style={{ background: issue.currentStepColor ?? '#6b7280' }}
          >
            {issue.currentStepName}
          </span>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        {/* Available transitions */}
        {transitions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">{t('workflow.availableTransitions')}</p>
            <div className="flex flex-wrap gap-2">
              {transitions.map(tr => (
                <button
                  key={tr.id}
                  onClick={() => setPendingTransition({
                    id: tr.id,
                    name: tr.name,
                    requiresApproval: tr.requiresApproval,
                  })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    tr.requiresApproval
                      ? 'border-amber-300 dark:border-amber-600/50 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20'
                      : 'border-blue-300 dark:border-blue-500/50 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20'
                  }`}
                >
                  {tr.requiresApproval && <Shield className="w-3 h-3" />}
                  {tr.name}
                  <ArrowRight className="w-3 h-3" />
                  <span className="font-normal text-gray-500">{tr.toStepName}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Pending approvals */}
        {pendingApprovals.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
              {t('workflow.pendingApprovals')} ({pendingApprovals.length})
            </p>
            <div className="space-y-2">
              {pendingApprovals.map(a => (
                <ApprovalRow
                  key={a.id}
                  approval={a}
                  canResolve={canResolveAny}
                  onApprove={(id, comment) => approveMut.mutate({ id, comment })}
                  onReject={(id, comment) => rejectMut.mutate({ id, comment })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Resolved approvals (collapsed history) */}
        {resolvedApprovals.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">
              {t('workflow.approvalHistory')} ({resolvedApprovals.length})
            </p>
            <div className="space-y-2">
              {resolvedApprovals.slice(0, 3).map(a => (
                <ApprovalRow
                  key={a.id}
                  approval={a}
                  canResolve={false}
                  onApprove={() => {}}
                  onReject={() => {}}
                />
              ))}
            </div>
          </div>
        )}

        {transitions.length === 0 && approvals.length === 0 && (
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">{t('workflow.noTransitionsAvailable')}</p>
        )}
      </div>

      {/* Transition confirmation modal */}
      {pendingTransition && (
        <TransitionModal
          transitionName={pendingTransition.name}
          requiresApproval={pendingTransition.requiresApproval}
          onClose={() => setPendingTransition(null)}
          onConfirm={(comment) => executeMut.mutate({ transitionId: pendingTransition.id, comment })}
          loading={executeMut.isPending}
        />
      )}
    </div>
  );
}
