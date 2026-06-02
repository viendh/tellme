import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { UserPlus, Trash2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useConfirm } from '../context/ConfirmContext';
import {
  useProjectRoles,
  useAddMember,
  useUpdateMemberRole,
  useRemoveMember,
  useProjectMembers,
} from '../hooks/useProjects';
import { useAuthStore } from '../store/authStore';
import { Avatar } from '../components/common/Avatar';
import { RoleBadge } from '../components/common/RoleBadge';
import type { ProjectRole } from '../types';

const ROLE_OPTIONS: { value: ProjectRole; label: string }[] = [
  { value: 'MANAGER',   label: 'Manager' },
  { value: 'DEVELOPER', label: 'Developer' },
  { value: 'TESTER',    label: 'Tester' },
  { value: 'VIEWER',    label: 'Viewer' },
];

export function ProjectMembersPage() {
  const { t } = useTranslation();
  const { projectId } = useParams<{ projectId: string }>();
  const projId = Number(projectId);
  const currentUser = useAuthStore((s) => s.user);

  const { data: members = [], isLoading } = useProjectRoles(projId);
  const { data: allUsers = [] } = useProjectMembers(projId);
  const addMember = useAddMember(projId);
  const updateRole = useUpdateMemberRole(projId);
  const removeMember = useRemoveMember(projId);

  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('DEVELOPER');

  const myMember = members.find((m) => m.user.id === currentUser?.id);
  const canManage = myMember?.role === 'OWNER' || myMember?.role === 'MANAGER';

  const memberIds = new Set(members.map((m) => m.user.id));
  const availableUsers = allUsers.filter((u) => !memberIds.has(u.id));

  const handleAdd = () => {
    if (!selectedUserId) return;
    addMember.mutate(
      { userId: Number(selectedUserId), role: selectedRole },
      {
        onSuccess: () => {
          setSelectedUserId('');
          setSelectedRole('DEVELOPER');
        },
      }
    );
  };

  const confirm = useConfirm();

  const handleRemove = async (userId: number, fullName: string) => {
    const ok = await confirm({
      title: t('members.removeTitle'),
      description: t('members.removeConfirm', { name: fullName }),
      variant: 'warning',
    });
    if (!ok) return;
    removeMember.mutate(userId);
  };

  return (
    <div className="p-6 overflow-y-auto h-full">
      <div className="mb-6 flex items-center gap-3">
        <Users className="w-6 h-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('members.title')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t('members.subtitle')}</p>
        </div>
      </div>

      {/* Add member form (OWNER/MANAGER only) */}
      {canManage && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> {t('members.addMember')}
          </h2>
          <div className="flex gap-3 flex-wrap">
            <select
              value={selectedUserId}
              onChange={(e) =>
                setSelectedUserId(e.target.value ? Number(e.target.value) : '')
              }
              className="flex-1 min-w-48 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('members.selectUser')}</option>
              {availableUsers.length === 0 && (
                <option disabled>{t('members.noAvailableUsers')}</option>
              )}
              {availableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.email})
                </option>
              ))}
            </select>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as ProjectRole)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              disabled={!selectedUserId || addMember.isPending}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {addMember.isPending ? t('members.adding') : t('members.add')}
            </button>
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">{t('members.loading')}</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
                  {t('members.colUser')}
                </th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">
                  {t('members.colRole')}
                </th>
                {canManage && (
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">
                    {t('members.colActions')}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => {
                const isSelf = member.user.id === currentUser?.id;
                const isOwner = member.role === 'OWNER';
                return (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar user={member.user} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {member.user.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{member.user.email}</p>
                        </div>
                        {isSelf && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {t('members.you')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {canManage && !isOwner ? (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            updateRole.mutate({
                              userId: member.user.id,
                              role: e.target.value as ProjectRole,
                            })
                          }
                          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <RoleBadge role={member.role} />
                      )}
                    </td>
                    {canManage && (
                      <td className="px-4 py-3 text-right">
                        {!isOwner && (
                          <button
                            onClick={() =>
                              handleRemove(member.user.id, member.user.fullName)
                            }
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title={t('members.removeTitle')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-400">
          {t('members.memberCount', { count: members.length })}
        </div>
      </div>
    </div>
  );
}
