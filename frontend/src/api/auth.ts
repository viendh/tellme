import apiClient from './axios';
import type { AuthResponse, User } from '../types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
}

export interface UpdateProfileInput {
  fullName: string;
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface NotificationSettingsInput {
  notifyOnAssigned: boolean;
  notifyOnStatusChange: boolean;
  notifyOnComment: boolean;
}

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/api/auth/register', data);
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileInput): Promise<User> => {
    const response = await apiClient.put<User>('/api/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordInput): Promise<void> => {
    await apiClient.put('/api/auth/password', data);
  },

  updateNotifications: async (data: NotificationSettingsInput): Promise<User> => {
    const response = await apiClient.put<User>('/api/auth/notifications', data);
    return response.data;
  },
};
