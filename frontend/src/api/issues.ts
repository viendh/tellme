import apiClient from './axios';
import type {
  Issue,
  CreateIssueInput,
  UpdateIssueInput,
  PatchIssueStatusInput,
  PatchIssueSprintInput,
} from '../types';

export const issuesApi = {
  getByProject: async (projectId: number, sprintId?: number | 'backlog'): Promise<Issue[]> => {
    const params: Record<string, string | number> = {};
    if (sprintId !== undefined) {
      params.sprintId = sprintId;
    }
    const response = await apiClient.get<Issue[]>(`/api/projects/${projectId}/issues`, { params });
    return response.data;
  },

  create: async (projectId: number, data: CreateIssueInput): Promise<Issue> => {
    const response = await apiClient.post<Issue>(`/api/projects/${projectId}/issues`, data);
    return response.data;
  },

  getById: async (id: number): Promise<Issue> => {
    const response = await apiClient.get<Issue>(`/api/issues/${id}`);
    return response.data;
  },

  update: async (id: number, data: UpdateIssueInput): Promise<Issue> => {
    const response = await apiClient.put<Issue>(`/api/issues/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/issues/${id}`);
  },

  patchStatus: async (id: number, data: PatchIssueStatusInput): Promise<Issue> => {
    const response = await apiClient.patch<Issue>(`/api/issues/${id}/status`, data);
    return response.data;
  },

  patchSprint: async (id: number, data: PatchIssueSprintInput): Promise<Issue> => {
    const response = await apiClient.patch<Issue>(`/api/issues/${id}/sprint`, data);
    return response.data;
  },

  assign: async (issueId: number, assigneeId: number | null): Promise<Issue> => {
    const response = await apiClient.patch<Issue>(`/api/issues/${issueId}/assign`, { assigneeId });
    return response.data;
  },

  getMyIssues: async (): Promise<Issue[]> => {
    const response = await apiClient.get<Issue[]>('/api/issues/my');
    return response.data;
  },

  getSubtasks: async (issueId: number): Promise<Issue[]> => {
    const response = await apiClient.get<Issue[]>(`/api/issues/${issueId}/subtasks`);
    return response.data;
  },
};
