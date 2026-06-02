import apiClient from './axios';
import type { IssueLink, IssueLinkType, Worklog, Component, Version, SavedFilter, Issue } from '../types';

// ─── Watch / Vote ────────────────────────────────────────────────────────────

export interface WatchStatus {
  watching: boolean;
  watchCount: number;
  watchers: { id: number; fullName: string; avatarUrl?: string }[];
}

export const issueFeaturesApi = {
  // Watchers
  getWatchStatus: (issueId: number) =>
    apiClient.get<WatchStatus>(`/api/issues/${issueId}/watchers`).then((r) => r.data),

  toggleWatch: (issueId: number) =>
    apiClient.post<{ watching: boolean; watchCount: number }>(`/api/issues/${issueId}/watch`).then((r) => r.data),

  // Votes
  toggleVote: (issueId: number) =>
    apiClient.post<{ voted: boolean; voteCount: number }>(`/api/issues/${issueId}/vote`).then((r) => r.data),

  // ─── Issue Links ─────────────────────────────────────────────────────────

  getLinks: (issueId: number) =>
    apiClient.get<IssueLink[]>(`/api/issues/${issueId}/links`).then((r) => r.data),

  addLink: (issueId: number, data: { targetIssueId: number; linkType: IssueLinkType }) =>
    apiClient.post<IssueLink>(`/api/issues/${issueId}/links`, data).then((r) => r.data),

  deleteLink: (linkId: number) =>
    apiClient.delete(`/api/issue-links/${linkId}`),

  // ─── Worklogs ────────────────────────────────────────────────────────────

  getWorklogs: (issueId: number) =>
    apiClient.get<Worklog[]>(`/api/issues/${issueId}/worklogs`).then((r) => r.data),

  addWorklog: (issueId: number, data: { timeSpentHours: number; startedAt?: string; description?: string }) =>
    apiClient.post<Worklog>(`/api/issues/${issueId}/worklogs`, data).then((r) => r.data),

  updateWorklog: (worklogId: number, data: { timeSpentHours: number; startedAt?: string; description?: string }) =>
    apiClient.put<Worklog>(`/api/worklogs/${worklogId}`, data).then((r) => r.data),

  deleteWorklog: (worklogId: number) =>
    apiClient.delete(`/api/worklogs/${worklogId}`),

  // ─── Clone / Move ─────────────────────────────────────────────────────────

  cloneIssue: (issueId: number) =>
    apiClient.post<Issue>(`/api/issues/${issueId}/clone`).then((r) => r.data),

  moveIssue: (issueId: number, targetProjectId: number) =>
    apiClient
      .post<Issue>(`/api/issues/${issueId}/move`, null, { params: { targetProjectId } })
      .then((r) => r.data),

  // ─── Labels ───────────────────────────────────────────────────────────────

  updateLabels: (issueId: number, labels: string) =>
    apiClient.put<Issue>(`/api/issues/${issueId}/labels`, { labels }).then((r) => r.data),

  // ─── Components ───────────────────────────────────────────────────────────

  getComponents: (projectId: number) =>
    apiClient.get<Component[]>(`/api/projects/${projectId}/components`).then((r) => r.data),

  createComponent: (projectId: number, data: { name: string; description?: string; leadId?: number }) =>
    apiClient.post<Component>(`/api/projects/${projectId}/components`, data).then((r) => r.data),

  updateComponent: (componentId: number, data: { name: string; description?: string; leadId?: number }) =>
    apiClient.put<Component>(`/api/components/${componentId}`, data).then((r) => r.data),

  deleteComponent: (componentId: number) =>
    apiClient.delete(`/api/components/${componentId}`),

  // ─── Versions ────────────────────────────────────────────────────────────

  getVersions: (projectId: number) =>
    apiClient.get<Version[]>(`/api/projects/${projectId}/versions`).then((r) => r.data),

  createVersion: (
    projectId: number,
    data: { name: string; description?: string; status?: string; releaseDate?: string; startDate?: string },
  ) => apiClient.post<Version>(`/api/projects/${projectId}/versions`, data).then((r) => r.data),

  updateVersion: (
    versionId: number,
    data: { name?: string; description?: string; status?: string; releaseDate?: string; startDate?: string },
  ) => apiClient.put<Version>(`/api/versions/${versionId}`, data).then((r) => r.data),

  deleteVersion: (versionId: number) =>
    apiClient.delete(`/api/versions/${versionId}`),

  // ─── Saved Filters ───────────────────────────────────────────────────────

  getSavedFilters: () =>
    apiClient.get<SavedFilter[]>('/api/filters').then((r) => r.data),

  createSavedFilter: (data: { name: string; filterCriteria: string; isShared?: boolean; isFavorite?: boolean }) =>
    apiClient.post<SavedFilter>('/api/filters', data).then((r) => r.data),

  updateSavedFilter: (filterId: number, data: { name?: string; filterCriteria?: string; isShared?: boolean; isFavorite?: boolean }) =>
    apiClient.put<SavedFilter>(`/api/filters/${filterId}`, data).then((r) => r.data),

  deleteSavedFilter: (filterId: number) =>
    apiClient.delete(`/api/filters/${filterId}`),

  // ─── Reports ─────────────────────────────────────────────────────────────

  getOverdueIssues: (projectId: number) =>
    apiClient.get<Issue[]>(`/api/projects/${projectId}/reports/overdue`).then((r) => r.data),

  getWorkloadReport: (projectId: number) =>
    apiClient.get<any[]>(`/api/projects/${projectId}/reports/workload`).then((r) => r.data),

  getCreatedVsResolvedReport: (projectId: number, days = 30) =>
    apiClient
      .get<{ labels: string[]; created: number[]; resolved: number[] }>(
        `/api/projects/${projectId}/reports/created-vs-resolved`,
        { params: { days } },
      )
      .then((r) => r.data),

  getResolutionTimeReport: (projectId: number) =>
    apiClient
      .get<{ avgHours: number; count: number; byType: { type: string; count: number; avgHours: number }[] }>(
        `/api/projects/${projectId}/reports/resolution-time`,
      )
      .then((r) => r.data),
};
