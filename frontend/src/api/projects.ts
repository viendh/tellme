import apiClient from './axios';
import type { Project, User, CreateProjectInput, UpdateProjectInput, ProjectMember, AddMemberInput, ProjectRole } from '../types';

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/api/projects');
    return response.data;
  },

  create: async (data: CreateProjectInput): Promise<Project> => {
    const response = await apiClient.post<Project>('/api/projects', data);
    return response.data;
  },

  getById: async (id: number): Promise<Project> => {
    const response = await apiClient.get<Project>(`/api/projects/${id}`);
    return response.data;
  },

  update: async (id: number, data: UpdateProjectInput): Promise<Project> => {
    const response = await apiClient.put<Project>(`/api/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}`);
  },

  getMembers: async (id: number): Promise<User[]> => {
    const response = await apiClient.get<User[]>(`/api/projects/${id}/members`);
    return response.data;
  },

  getRoles: async (id: number): Promise<ProjectMember[]> => {
    const res = await apiClient.get<ProjectMember[]>(`/api/projects/${id}/roles`);
    return res.data;
  },

  addMember: async (id: number, data: AddMemberInput): Promise<ProjectMember> => {
    const res = await apiClient.post<ProjectMember>(`/api/projects/${id}/members`, data);
    return res.data;
  },

  updateMemberRole: async (id: number, userId: number, role: ProjectRole): Promise<ProjectMember> => {
    const res = await apiClient.put<ProjectMember>(`/api/projects/${id}/members/${userId}`, { userId, role });
    return res.data;
  },

  removeMember: async (id: number, userId: number): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}/members/${userId}`);
  },
};
