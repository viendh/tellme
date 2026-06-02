import apiClient from './axios';
import type { Issue } from '../types';

export interface SearchParams {
  projectId?: number;
  status?: string;
  priority?: string;
  type?: string;
  assigneeId?: number;
  q?: string;
}

export const searchApi = {
  advancedSearch: async (params: SearchParams): Promise<Issue[]> => {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null),
    );
    const res = await apiClient.get<Issue[]>('/api/issues/search', { params: cleaned });
    return res.data;
  },
};
