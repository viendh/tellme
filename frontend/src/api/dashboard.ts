import apiClient from './axios';

export interface UserDashboard {
  totalProjects: number;
  totalAssigned: number;
  todoCount: number;
  inProgressCount: number;
  testingCount: number;
  doneCount: number;
  overdueCount: number;
  recentIssues: import('../types').Issue[];
}

export interface SprintSummary {
  id: number;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  totalIssues: number;
  doneIssues: number;
  inProgressIssues: number;
}

export interface MemberWorkload {
  user: import('../types').User;
  totalIssues: number;
  inProgressIssues: number;
  doneIssues: number;
}

export interface ProjectDashboard {
  totalIssues: number;
  todoCount: number;
  inProgressCount: number;
  testingCount: number;
  uatCount: number;
  doneCount: number;
  bugCount: number;
  taskCount: number;
  storyCount: number;
  epicCount: number;
  lowCount: number;
  mediumCount: number;
  highCount: number;
  criticalCount: number;
  activeSprint?: SprintSummary;
  memberWorkload: MemberWorkload[];
  recentActivity: import('../types').ActivityLog[];
}

export const dashboardApi = {
  getUserDashboard: async (): Promise<UserDashboard> => {
    const res = await apiClient.get<UserDashboard>('/api/dashboard');
    return res.data;
  },

  getProjectDashboard: async (projectId: number): Promise<ProjectDashboard> => {
    const res = await apiClient.get<ProjectDashboard>(`/api/projects/${projectId}/dashboard`);
    return res.data;
  },
};
