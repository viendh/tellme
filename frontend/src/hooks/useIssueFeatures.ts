import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { issueFeaturesApi } from '../api/issueFeatures';
import type { IssueLinkType } from '../types';
import { issueKeys } from './useIssues';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const featureKeys = {
  links: (issueId: number) => ['issue-links', issueId] as const,
  worklogs: (issueId: number) => ['worklogs', issueId] as const,
  components: (projectId: number) => ['components', projectId] as const,
  versions: (projectId: number) => ['versions', projectId] as const,
  filters: ['saved-filters'] as const,
  overdueReport: (projectId: number) => ['report-overdue', projectId] as const,
  workloadReport: (projectId: number) => ['report-workload', projectId] as const,
  createdVsResolved: (projectId: number, days: number) => ['report-cvr', projectId, days] as const,
  resolutionTime: (projectId: number) => ['report-resolution', projectId] as const,
};

// ─── Watchers ────────────────────────────────────────────────────────────────

export function useToggleWatch(issueId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => issueFeaturesApi.toggleWatch(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(issueId) });
    },
    onError: () => toast.error('Failed to update watch status'),
  });
}

// ─── Votes ───────────────────────────────────────────────────────────────────

export function useToggleVote(issueId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => issueFeaturesApi.toggleVote(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(issueId) });
    },
    onError: () => toast.error('Failed to update vote'),
  });
}

// ─── Issue Links ─────────────────────────────────────────────────────────────

export function useIssueLinks(issueId: number) {
  return useQuery({
    queryKey: featureKeys.links(issueId),
    queryFn: () => issueFeaturesApi.getLinks(issueId),
    enabled: !!issueId,
  });
}

export function useAddIssueLink(issueId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { targetIssueId: number; linkType: IssueLinkType }) =>
      issueFeaturesApi.addLink(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.links(issueId) });
      toast.success('Link added');
    },
    onError: () => toast.error('Failed to add link'),
  });
}

export function useDeleteIssueLink(issueId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: number) => issueFeaturesApi.deleteLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.links(issueId) });
      toast.success('Link removed');
    },
    onError: () => toast.error('Failed to remove link'),
  });
}

// ─── Worklogs ────────────────────────────────────────────────────────────────

export function useWorklogs(issueId: number) {
  return useQuery({
    queryKey: featureKeys.worklogs(issueId),
    queryFn: () => issueFeaturesApi.getWorklogs(issueId),
    enabled: !!issueId,
  });
}

export function useAddWorklog(issueId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { timeSpentHours: number; startedAt?: string; description?: string }) =>
      issueFeaturesApi.addWorklog(issueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.worklogs(issueId) });
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(issueId) });
      toast.success('Work logged');
    },
    onError: () => toast.error('Failed to log work'),
  });
}

export function useDeleteWorklog(issueId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (worklogId: number) => issueFeaturesApi.deleteWorklog(worklogId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.worklogs(issueId) });
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(issueId) });
      toast.success('Worklog deleted');
    },
    onError: () => toast.error('Failed to delete worklog'),
  });
}

// ─── Clone / Move ─────────────────────────────────────────────────────────────

export function useCloneIssue(issueId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => issueFeaturesApi.cloneIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.all });
      toast.success('Issue cloned!');
    },
    onError: () => toast.error('Failed to clone issue'),
  });
}

export function useMoveIssue(issueId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetProjectId: number) => issueFeaturesApi.moveIssue(issueId, targetProjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.all });
      toast.success('Issue moved!');
    },
    onError: () => toast.error('Failed to move issue'),
  });
}

// ─── Labels ───────────────────────────────────────────────────────────────────

export function useUpdateLabels(issueId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (labels: string) => issueFeaturesApi.updateLabels(issueId, labels),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(issueId) });
      toast.success('Labels updated');
    },
    onError: () => toast.error('Failed to update labels'),
  });
}

// ─── Components ───────────────────────────────────────────────────────────────

export function useComponents(projectId: number) {
  return useQuery({
    queryKey: featureKeys.components(projectId),
    queryFn: () => issueFeaturesApi.getComponents(projectId),
    enabled: !!projectId,
  });
}

export function useCreateComponent(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; leadId?: number }) =>
      issueFeaturesApi.createComponent(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.components(projectId) });
      toast.success('Component created');
    },
    onError: () => toast.error('Failed to create component'),
  });
}

export function useUpdateComponent(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name: string; description?: string; leadId?: number } }) =>
      issueFeaturesApi.updateComponent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.components(projectId) });
      toast.success('Component updated');
    },
    onError: () => toast.error('Failed to update component'),
  });
}

export function useDeleteComponent(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => issueFeaturesApi.deleteComponent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.components(projectId) });
      toast.success('Component deleted');
    },
    onError: () => toast.error('Failed to delete component'),
  });
}

// ─── Versions ────────────────────────────────────────────────────────────────

export function useVersions(projectId: number) {
  return useQuery({
    queryKey: featureKeys.versions(projectId),
    queryFn: () => issueFeaturesApi.getVersions(projectId),
    enabled: !!projectId,
  });
}

export function useCreateVersion(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; status?: string; releaseDate?: string; startDate?: string }) =>
      issueFeaturesApi.createVersion(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.versions(projectId) });
      toast.success('Version created');
    },
    onError: () => toast.error('Failed to create version'),
  });
}

export function useUpdateVersion(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { name?: string; description?: string; status?: string; releaseDate?: string; startDate?: string } }) =>
      issueFeaturesApi.updateVersion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.versions(projectId) });
      toast.success('Version updated');
    },
    onError: () => toast.error('Failed to update version'),
  });
}

export function useDeleteVersion(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => issueFeaturesApi.deleteVersion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: featureKeys.versions(projectId) });
      toast.success('Version deleted');
    },
    onError: () => toast.error('Failed to delete version'),
  });
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export function useOverdueReport(projectId: number) {
  return useQuery({
    queryKey: featureKeys.overdueReport(projectId),
    queryFn: () => issueFeaturesApi.getOverdueIssues(projectId),
    enabled: !!projectId,
  });
}

export function useWorkloadReport(projectId: number) {
  return useQuery({
    queryKey: featureKeys.workloadReport(projectId),
    queryFn: () => issueFeaturesApi.getWorkloadReport(projectId),
    enabled: !!projectId,
  });
}

export function useCreatedVsResolvedReport(projectId: number, days = 30) {
  return useQuery({
    queryKey: featureKeys.createdVsResolved(projectId, days),
    queryFn: () => issueFeaturesApi.getCreatedVsResolvedReport(projectId, days),
    enabled: !!projectId,
  });
}

export function useResolutionTimeReport(projectId: number) {
  return useQuery({
    queryKey: featureKeys.resolutionTime(projectId),
    queryFn: () => issueFeaturesApi.getResolutionTimeReport(projectId),
    enabled: !!projectId,
  });
}
