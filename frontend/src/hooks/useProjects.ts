import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import { projectsApi } from '../api/projects';
import type { CreateProjectInput, UpdateProjectInput, AddMemberInput, ProjectRole } from '../types';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  detail: (id: number) => [...projectKeys.all, 'detail', id] as const,
  members: (id: number) => [...projectKeys.all, 'members', id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: projectsApi.getAll,
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
}

export function useProjectMembers(id: number) {
  return useQuery({
    queryKey: projectKeys.members(id),
    queryFn: () => projectsApi.getMembers(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreateProjectInput) => projectsApi.create(data),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Project created! Thêm thành viên vào dự án.');
      navigate(`/projects/${project.id}/members`);
    },
    onError: () => {
      toast.error('Failed to create project');
    },
  });
}

export function useUpdateProject(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProjectInput) => projectsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Project updated!');
    },
    onError: () => {
      toast.error('Failed to update project');
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      toast.success('Project deleted');
      navigate('/projects');
    },
    onError: () => {
      toast.error('Failed to delete project');
    },
  });
}

export function useProjectRoles(id: number) {
  return useQuery({
    queryKey: [...projectKeys.members(id), 'roles'],
    queryFn: () => projectsApi.getRoles(id),
    enabled: !!id,
  });
}

export function useAddMember(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddMemberInput) => projectsApi.addMember(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.members(projectId) });
      toast.success('Thêm thành viên thành công');
    },
    onError: (e: AxiosError<{ message?: string }>) => {
      toast.error(e.response?.data?.message ?? 'Không thể thêm thành viên');
    },
  });
}

export function useUpdateMemberRole(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: ProjectRole }) =>
      projectsApi.updateMemberRole(projectId, userId, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.members(projectId) });
      toast.success('Đã cập nhật vai trò');
    },
    onError: () => toast.error('Không thể cập nhật vai trò'),
  });
}

export function useRemoveMember(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.members(projectId) });
      toast.success('Đã xóa thành viên');
    },
    onError: () => toast.error('Không thể xóa thành viên'),
  });
}
