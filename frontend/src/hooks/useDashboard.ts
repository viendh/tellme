import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

export function useUserDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'user'],
    queryFn: dashboardApi.getUserDashboard,
    staleTime: 60_000,
  });
}

export function useProjectDashboard(projectId: number) {
  return useQuery({
    queryKey: ['dashboard', 'project', projectId],
    queryFn: () => dashboardApi.getProjectDashboard(projectId),
    enabled: !!projectId,
    staleTime: 60_000,
  });
}
