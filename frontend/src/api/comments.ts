import apiClient from './axios';
import type { Comment, ActivityLog, CreateCommentInput, UpdateCommentInput } from '../types';

export const commentsApi = {
  getByIssue: async (issueId: number): Promise<Comment[]> => {
    const response = await apiClient.get<Comment[]>(`/api/issues/${issueId}/comments`);
    return response.data;
  },

  create: async (issueId: number, data: CreateCommentInput): Promise<Comment> => {
    const response = await apiClient.post<Comment>(`/api/issues/${issueId}/comments`, data);
    return response.data;
  },

  update: async (id: number, data: UpdateCommentInput): Promise<Comment> => {
    const response = await apiClient.put<Comment>(`/api/comments/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/comments/${id}`);
  },

  getActivity: async (issueId: number): Promise<ActivityLog[]> => {
    const response = await apiClient.get<ActivityLog[]>(`/api/issues/${issueId}/activity`);
    return response.data;
  },
};
