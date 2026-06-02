import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, LogOut, FolderKanban, ChevronRight,
  ShieldCheck, Mail, PanelLeftClose, PanelLeftOpen,
  BarChart2, HelpCircle, Search, SlidersHorizontal,
  Settings, ListTodo, GitBranch,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../common/Avatar';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

/* ── Reusable nav link ── */
function NavItem({
  to,
  icon,
  label,
  collapsed,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-blue-600 text-white'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        } ${collapsed ? 'justify-center' : ''}`
      }
    >
      <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        {icon}
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 whitespace-nowrap overflow-hidden">{label}</span>
          <ChevronRight className="w-3 h-3 flex-shrink-0 opacity-40" />
        </>
      )}
    </NavLink>
  );
}

/* ── Section label (only shown when expanded) ── */
function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) {
    return <div className="mx-auto w-5 border-t border-gray-700 my-2" />;
  }
  return (
    <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-500 select-none">
      {label}
    </p>
  );
}

/* ── Divider ── */
function Divider({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={`${collapsed ? 'mx-3' : 'mx-2'} border-t border-gray-700/60 my-1.5`} />
  );
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div
      className="flex flex-col h-full bg-gray-900 text-white flex-shrink-0 transition-all duration-300 overflow-hidden"
      style={{ width: collapsed ? '56px' : '224px' }}
    >
      {/* ── Header / Logo ── */}
      <div className="flex items-center border-b border-gray-700/60 flex-shrink-0 h-14">
        {collapsed ? (
          <button
            onClick={onToggle}
            title={t('nav.expand')}
            className="w-full h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2.5 px-4 flex-1 min-w-0">
              <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                <LayoutGrid className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-base whitespace-nowrap tracking-tight">Tellme</span>
            </div>
            <button
              onClick={onToggle}
              title={t('nav.collapse')}
              className="flex-shrink-0 mr-2 p-1.5 text-gray-500 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto overflow-x-hidden">

        {/* ── MAIN ── */}
        <SectionLabel label={t('nav.sectionMain')} collapsed={collapsed} />

        <NavItem to="/dashboard" icon={<BarChart2 className="w-4 h-4" />}    label={t('nav.dashboard')} collapsed={collapsed} end />
        <NavItem to="/my-issues" icon={<ListTodo  className="w-4 h-4" />}    label={t('nav.myIssues')}  collapsed={collapsed} />
        <NavItem to="/projects"  icon={<FolderKanban className="w-4 h-4" />} label={t('nav.projects')}  collapsed={collapsed} />

        <NavItem to="/workflows" icon={<GitBranch className="w-4 h-4" />} label={t('nav.workflows')} collapsed={collapsed} />

        {/* ── DISCOVER ── */}
        <SectionLabel label={t('nav.sectionDiscover')} collapsed={collapsed} />

        <NavItem to="/search"  icon={<Search           className="w-4 h-4" />} label={t('nav.search')}       collapsed={collapsed} />
        <NavItem to="/filters" icon={<SlidersHorizontal className="w-4 h-4" />} label={t('nav.savedFilters')} collapsed={collapsed} />

        {/* ── ADMIN (admin only) ── */}
        {user?.role === 'ADMIN' && (
          <>
            <SectionLabel label={t('nav.sectionAdmin')} collapsed={collapsed} />
            <NavItem to="/admin/users"       icon={<ShieldCheck className="w-4 h-4" />} label={t('nav.admin')}     collapsed={collapsed} />
            <NavItem to="/admin/email-logs"  icon={<Mail        className="w-4 h-4" />} label={t('nav.emailLogs')} collapsed={collapsed} />
          </>
        )}

        {/* ── Utility (Settings + Help) ── */}
        <Divider collapsed={collapsed} />
        <NavItem to="/settings" icon={<Settings   className="w-4 h-4" />} label={t('nav.settings')} collapsed={collapsed} />
        <NavItem to="/help"     icon={<HelpCircle className="w-4 h-4" />} label={t('nav.help')}     collapsed={collapsed} />
      </nav>

      {/* ── User section ── */}
      {user && (
        <div className="px-2 py-3 border-t border-gray-700/60 flex-shrink-0">
          {collapsed ? (
            /* Collapsed: avatar + logout stacked */
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => navigate('/settings')}
                title={`${user.fullName} — ${user.email}`}
              >
                <Avatar user={user} size="sm" />
              </button>
              <button
                onClick={handleLogout}
                title={t('nav.signOut')}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Expanded: avatar row + language + logout */
            <>
              <button
                onClick={() => navigate('/settings')}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-left mb-1"
              >
                <Avatar user={user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate leading-tight">{user.fullName}</p>
                  <p className="text-xs text-gray-400 truncate leading-tight">{user.email}</p>
                </div>
                <Settings className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
              </button>

              <LanguageSwitcher />

              <button
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors mt-0.5"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{t('nav.signOut')}</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
