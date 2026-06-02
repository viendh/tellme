import apiClient from './axios';
import type {
  Workflow,
  WorkflowStep,
  WorkflowTransition,
  WorkflowApproval,
  WorkflowRequest,
  WorkflowStepRequest,
  WorkflowTransitionRequest,
  IssueTransitionRequest,
  ApprovalDecisionRequest,
} from '../types';

export const workflowApi = {
  // ── Workflow CRUD ──────────────────────────────────────────────────────────

  list: async (): Promise<Workflow[]> => {
    const res = await apiClient.get<Workflow[]>('/api/workflows');
    return res.data;
  },

  get: async (id: number): Promise<Workflow> => {
    const res = await apiClient.get<Workflow>(`/api/workflows/${id}`);
    return res.data;
  },

  create: async (data: WorkflowRequest): Promise<Workflow> => {
    const res = await apiClient.post<Workflow>('/api/workflows', data);
    return res.data;
  },

  update: async (id: number, data: WorkflowRequest): Promise<Workflow> => {
    const res = await apiClient.put<Workflow>(`/api/workflows/${id}`, data);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/workflows/${id}`);
  },

  // ── Steps ──────────────────────────────────────────────────────────────────

  addStep: async (workflowId: number, data: WorkflowStepRequest): Promise<WorkflowStep> => {
    const res = await apiClient.post<WorkflowStep>(`/api/workflows/${workflowId}/steps`, data);
    return res.data;
  },

  updateStep: async (workflowId: number, stepId: number, data: WorkflowStepRequest): Promise<WorkflowStep> => {
    const res = await apiClient.put<WorkflowStep>(`/api/workflows/${workflowId}/steps/${stepId}`, data);
    return res.data;
  },

  deleteStep: async (workflowId: number, stepId: number): Promise<void> => {
    await apiClient.delete(`/api/workflows/${workflowId}/steps/${stepId}`);
  },

  // ── Transitions ────────────────────────────────────────────────────────────

  addTransition: async (workflowId: number, data: WorkflowTransitionRequest): Promise<WorkflowTransition> => {
    const res = await apiClient.post<WorkflowTransition>(`/api/workflows/${workflowId}/transitions`, data);
    return res.data;
  },

  updateTransition: async (workflowId: number, transitionId: number, data: WorkflowTransitionRequest): Promise<WorkflowTransition> => {
    const res = await apiClient.put<WorkflowTransition>(`/api/workflows/${workflowId}/transitions/${transitionId}`, data);
    return res.data;
  },

  deleteTransition: async (workflowId: number, transitionId: number): Promise<void> => {
    await apiClient.delete(`/api/workflows/${workflowId}/transitions/${transitionId}`);
  },

  // ── Issue Transitions ──────────────────────────────────────────────────────

  getAvailableTransitions: async (issueId: number): Promise<WorkflowTransition[]> => {
    const res = await apiClient.get<WorkflowTransition[]>(`/api/workflows/issues/${issueId}/transitions`);
    return res.data;
  },

  executeTransition: async (issueId: number, data: IssueTransitionRequest): Promise<WorkflowApproval> => {
    const res = await apiClient.post<WorkflowApproval>(`/api/workflows/issues/${issueId}/transition`, data);
    return res.data;
  },

  getIssueApprovals: async (issueId: number): Promise<WorkflowApproval[]> => {
    const res = await apiClient.get<WorkflowApproval[]>(`/api/workflows/issues/${issueId}/approvals`);
    return res.data;
  },

  // ── Approvals ──────────────────────────────────────────────────────────────

  getMyPendingApprovals: async (): Promise<WorkflowApproval[]> => {
    const res = await apiClient.get<WorkflowApproval[]>('/api/workflows/approvals/pending');
    return res.data;
  },

  approve: async (id: number, data: ApprovalDecisionRequest): Promise<WorkflowApproval> => {
    const res = await apiClient.post<WorkflowApproval>(`/api/workflows/approvals/${id}/approve`, data);
    return res.data;
  },

  reject: async (id: number, data: ApprovalDecisionRequest): Promise<WorkflowApproval> => {
    const res = await apiClient.post<WorkflowApproval>(`/api/workflows/approvals/${id}/reject`, data);
    return res.data;
  },

  // ── Project Assignment ─────────────────────────────────────────────────────

  assignToProject: async (projectId: number, workflowId: number | null): Promise<void> => {
    const params = workflowId != null ? `?workflowId=${workflowId}` : '';
    await apiClient.put(`/api/projects/${projectId}/workflow${params}`);
  },
};
