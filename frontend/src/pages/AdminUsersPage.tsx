import { useState, useRef } from 'react';
import { Search, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useAdminUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
  useDeleteUser,
  usePendingUsers,
  useApproveUser,
  useRejectUser,
} from '../hooks/useAdmin';
import { useAuthStore } from '../store/authStore';
import { useConfirm } from '../context/ConfirmContext';
import { Avatar } from '../components/common/Avatar';
import { formatDate } from '../utils/formatters';
import type { User } from '../types';

type Tab = 'pending' | 'all';

export function AdminUsersPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentUser = useAuthStore((s) => s.user);

  const { data: allUsers = [], isLoading: loadingAll } = useAdminUsers(debouncedSearch || undefined);
  const { data: pendingUsers = [], isLoading: loadingPending } = usePendingUsers();
  const updateRoleMutation = useUpdateUserRole();
  const updateStatusMutation = useUpdateUserStatus();
  const deleteUserMutation = useDeleteUser();
  const approveMutation = useApproveUser();
  const rejectMutation = useRejectUser();
  const confirm = useConfirm();

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 400);
  };

  const handleDelete = async (user: User) => {
    const ok = await confirm({
      title: t('admin.deleteUser'),
      description: t('admin.deleteConfirm', { name: user.fullName }),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    });
    if (ok) deleteUserMutation.mutate(user.id);
  };

  const handleReject = async (user: User) => {
    const ok = await confirm({
      title: t('admin.rejectUser'),
      description: t('admin.rejectConfirm', { name: user.fullName }),
      confirmLabel: t('admin.reject'),
      variant: 'warning',
    });
    if (ok) rejectMutation.mutate(user.id);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.title')}</h1>
        <p className="text-gray-500 mt-1">{t('admin.subtitle')}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          {t('admin.tabPending')}
          {pendingUsers.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {pendingUsers.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'all'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {t('admin.tabAll')}
          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-1.5 py-0.5 rounded-full">
            {allUsers.length}
          </span>
        </button>
      </div>

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loadingPending ? (
            <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">{t('admin.pendingEmpty')}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="divide-x divide-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">{t('admin.colUser')}</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">{t('admin.colRegistered')}</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">{t('admin.colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 divide-x divide-gray-100">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                          {t('admin.pendingBadge')}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => approveMutation.mutate(user.id)}
                          disabled={approveMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {t('admin.approve')}
                        </button>
                        <button
                          onClick={() => handleReject(user)}
                          disabled={rejectMutation.isPending}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 text-xs font-medium rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {t('admin.reject')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* All Users Tab */}
      {activeTab === 'all' && (
        <>
          <div className="mb-4 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('admin.searchPlaceholder')}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {loadingAll ? (
              <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">{t('admin.colUser')}</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">{t('admin.colRole')}</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">{t('admin.colStatus')}</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">{t('admin.colJoined')}</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">{t('admin.colDelete')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allUsers.map((user) => {
                    const isSelf = user.id === currentUser?.id;
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 divide-x divide-gray-100">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar user={user} size="sm" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                            {isSelf && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{t('admin.you')}</span>
                            )}
                            {!user.isApproved && (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">{t('admin.pendingBadge')}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={user.role}
                            disabled={isSelf}
                            onChange={(e) =>
                              updateRoleMutation.mutate({ id: user.id, role: e.target.value as 'USER' | 'ADMIN' })
                            }
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="USER">USER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            disabled={isSelf}
                            onClick={() => updateStatusMutation.mutate({ id: user.id, isActive: !user.isActive })}
                            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                              user.isActive
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                            {user.isActive ? t('admin.active') : t('admin.inactive')}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            disabled={isSelf}
                            onClick={() => handleDelete(user)}
                            className="text-red-500 hover:text-red-700 disabled:opacity-30 disabled:cursor-not-allowed p-1 rounded hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            {!loadingAll && allUsers.length === 0 && (
              <div className="p-8 text-center text-gray-500">{t('admin.noUsers')}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
