import apiClient from './axios';

export interface AppNotification {
  id: number;
  type: string;
  title: string;
  body: string;
  issueId?: number;
  issueKey?: string;
  projectName?: string;
  read: boolean;
  createdAt: string;
}

export const notificationsApi = {
  getAll: async (): Promise<AppNotification[]> => {
    const r = await apiClient.get<AppNotification[]>('/api/notifications');
    return r.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const r = await apiClient.get<{ count: number }>('/api/notifications/unread-count');
    return r.data.count;
  },

  markRead: async (id: number): Promise<void> => {
    await apiClient.put(`/api/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.put('/api/notifications/read-all');
  },
};
