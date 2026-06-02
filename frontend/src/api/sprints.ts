import apiClient from './axios';
import type { Sprint, CreateSprintInput, UpdateSprintInput } from '../types';

export interface BurndownPoint {
  date: string;
  remaining: number;
  ideal: number;
  completed: number;
}

export const sprintsApi = {
  getByProject: async (projectId: number): Promise<Sprint[]> => {
    const response = await apiClient.get<Sprint[]>(`/api/projects/${projectId}/sprints`);
    return response.data;
  },

  create: async (projectId: number, data: CreateSprintInput): Promise<Sprint> => {
    const response = await apiClient.post<Sprint>(`/api/projects/${projectId}/sprints`, data);
    return response.data;
  },

  update: async (id: number, data: UpdateSprintInput): Promise<Sprint> => {
    const response = await apiClient.put<Sprint>(`/api/sprints/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/sprints/${id}`);
  },

  start: async (id: number): Promise<Sprint> => {
    const response = await apiClient.post<Sprint>(`/api/sprints/${id}/start`);
    return response.data;
  },

  complete: async (id: number): Promise<Sprint> => {
    const response = await apiClient.post<Sprint>(`/api/sprints/${id}/complete`);
    return response.data;
  },

  getBurndown: async (id: number): Promise<BurndownPoint[]> => {
    const response = await apiClient.get<BurndownPoint[]>(`/api/sprints/${id}/burndown`);
    return response.data;
  },
};
