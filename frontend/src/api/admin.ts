import apiClient from './axios';
import type { User, EmailLog } from '../types';

export const adminApi = {
  getUsers: async (search?: string): Promise<User[]> => {
    const params = search ? { search } : {};
    const res = await apiClient.get<User[]>('/api/admin/users', { params });
    return res.data;
  },

  updateRole: async (id: number, role: 'USER' | 'ADMIN'): Promise<User> => {
    const res = await apiClient.put<User>(`/api/admin/users/${id}/role`, { role });
    return res.data;
  },

  updateStatus: async (id: number, isActive: boolean): Promise<User> => {
    const res = await apiClient.put<User>(`/api/admin/users/${id}/status`, { isActive });
    return res.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/users/${id}`);
  },

  getPendingUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<User[]>('/api/admin/users/pending');
    return res.data;
  },

  approveUser: async (id: number): Promise<User> => {
    const res = await apiClient.put<User>(`/api/admin/users/${id}/approve`);
    return res.data;
  },

  rejectUser: async (id: number): Promise<User> => {
    const res = await apiClient.put<User>(`/api/admin/users/${id}/reject`);
    return res.data;
  },

  getEmailLogs: async (params?: { status?: string; emailType?: string; search?: string }): Promise<EmailLog[]> => {
    const res = await apiClient.get<EmailLog[]>('/api/admin/email-logs', { params });
    return res.data;
  },

  deleteEmailLog: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/admin/email-logs/${id}`);
  },

  clearEmailLogs: async (): Promise<void> => {
    await apiClient.delete('/api/admin/email-logs');
  },
};
