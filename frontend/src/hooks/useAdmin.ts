import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { adminApi } from '../api/admin';

export function useAdminUsers(search?: string) {
  return useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () => adminApi.getUsers(search),
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: 'USER' | 'ADMIN' }) =>
      adminApi.updateRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Role updated');
    },
    onError: () => toast.error('Failed to update role'),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      adminApi.updateStatus(id, isActive),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Status updated');
    },
    onError: () => toast.error('Failed to update status'),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User deleted');
    },
    onError: () => toast.error('Failed to delete user'),
  });
}

export function usePendingUsers() {
  return useQuery({
    queryKey: ['admin', 'users', 'pending'],
    queryFn: () => adminApi.getPendingUsers(),
    refetchInterval: 30000,
  });
}

export function useApproveUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.approveUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User approved successfully');
    },
    onError: () => toast.error('Failed to approve user'),
  });
}

export function useRejectUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminApi.rejectUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User rejected');
    },
    onError: () => toast.error('Failed to reject user'),
  });
}
