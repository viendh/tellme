import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { sprintsApi } from '../api/sprints';
import type { CreateSprintInput, UpdateSprintInput } from '../types';

export const sprintKeys = {
  all: ['sprints'] as const,
  byProject: (projectId: number) => [...sprintKeys.all, 'project', projectId] as const,
};

export function useSprints(projectId: number) {
  return useQuery({
    queryKey: sprintKeys.byProject(projectId),
    queryFn: () => sprintsApi.getByProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateSprint(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSprintInput) => sprintsApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(projectId) });
      toast.success('Sprint created!');
    },
    onError: () => {
      toast.error('Failed to create sprint');
    },
  });
}

export function useUpdateSprint(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateSprintInput }) =>
      sprintsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(projectId) });
      toast.success('Sprint updated!');
    },
    onError: () => {
      toast.error('Failed to update sprint');
    },
  });
}

export function useDeleteSprint(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sprintsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(projectId) });
      toast.success('Sprint deleted');
    },
    onError: () => {
      toast.error('Failed to delete sprint');
    },
  });
}

export function useStartSprint(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sprintsApi.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(projectId) });
      toast.success('Sprint started!');
    },
    onError: () => {
      toast.error('Failed to start sprint');
    },
  });
}

export function useCompleteSprint(projectId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => sprintsApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sprintKeys.byProject(projectId) });
      toast.success('Sprint completed!');
    },
    onError: () => {
      toast.error('Failed to complete sprint');
    },
  });
}
