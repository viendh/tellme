import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { issuesApi } from '../api/issues';
import type {
  CreateIssueInput,
  UpdateIssueInput,
  PatchIssueStatusInput,
  PatchIssueSprintInput,
} from '../types';

export const issueKeys = {
  all: ['issues'] as const,
  byProject: (projectId: number, sprintId?: number | 'backlog') =>
    [...issueKeys.all, 'project', projectId, sprintId] as const,
  detail: (id: number) => [...issueKeys.all, 'detail', id] as const,
  subtasks: (id: number) => [...issueKeys.all, 'subtasks', id] as const,
};

export function useIssues(projectId: number, sprintId?: number | 'backlog') {
  return useQuery({
    queryKey: issueKeys.byProject(projectId, sprintId),
    queryFn: () => issuesApi.getByProject(projectId, sprintId),
    enabled: !!projectId,
  });
}

export function useIssue(id: number) {
  return useQuery({
    queryKey: issueKeys.detail(id),
    queryFn: () => issuesApi.getById(id),
    enabled: !!id,
  });
}

export function useMyIssues() {
  return useQuery({
    queryKey: [...issueKeys.all, 'my'],
    queryFn: issuesApi.getMyIssues,
    staleTime: 30_000,
  });
}

export function useSubtasks(issueId: number) {
  return useQuery({
    queryKey: issueKeys.subtasks(issueId),
    queryFn: () => issuesApi.getSubtasks(issueId),
    enabled: !!issueId,
  });
}

export function useCreateIssue(projectId: number, parentIssueId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIssueInput) => issuesApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.all });
      if (parentIssueId) {
        queryClient.invalidateQueries({ queryKey: issueKeys.subtasks(parentIssueId) });
      }
      toast.success('Issue created!');
    },
    onError: () => {
      toast.error('Failed to create issue');
    },
  });
}

export function useUpdateIssue(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateIssueInput) => issuesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: issueKeys.all });
      toast.success('Issue updated!');
    },
    onError: () => {
      toast.error('Failed to update issue');
    },
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => issuesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.all });
      toast.success('Issue deleted');
    },
    onError: () => {
      toast.error('Failed to delete issue');
    },
  });
}

export function usePatchIssueStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchIssueStatusInput }) =>
      issuesApi.patchStatus(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: issueKeys.all });
    },
    onError: () => {
      toast.error('Failed to update issue status');
    },
  });
}

export function usePatchIssueSprint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatchIssueSprintInput }) =>
      issuesApi.patchSprint(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.all });
      toast.success('Issue moved!');
    },
    onError: () => {
      toast.error('Failed to move issue');
    },
  });
}
