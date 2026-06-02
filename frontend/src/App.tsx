import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { useSettingsStore } from './store/settingsStore';
import { AppLayout } from './components/layout/AppLayout';
import { ProjectLayout } from './components/layout/ProjectLayout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { BoardPage } from './pages/BoardPage';
import { BacklogPage } from './pages/BacklogPage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminEmailLogsPage } from './pages/AdminEmailLogsPage';
import { RegisterPendingPage } from './pages/RegisterPendingPage';
import { ProjectMembersPage } from './pages/ProjectMembersPage';
import { ProjectSettingsPage } from './pages/ProjectSettingsPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { ProjectDashboardPage } from './pages/ProjectDashboardPage';
import { MyIssuesPage } from './pages/MyIssuesPage';
import { HelpPage } from './pages/HelpPage';
import { ProjectComponentsPage } from './pages/ProjectComponentsPage';
import { ProjectVersionsPage } from './pages/ProjectVersionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SavedFiltersPage } from './pages/SavedFiltersPage';
import { AdvancedSearchPage } from './pages/AdvancedSearchPage';
import { SettingsPage } from './pages/SettingsPage';
import { WorkflowsPage } from './pages/WorkflowsPage';
import { WorkflowBuilderPage } from './pages/WorkflowBuilderPage';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function RootRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return <Navigate to={isAuthenticated ? '/projects' : '/login'} replace />;
}

/* Applies the dark/light class to <html> whenever theme setting changes */
function ThemeEffect() {
  const theme = useSettingsStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      return;
    }
    if (theme === 'light') {
      root.classList.remove('dark');
      return;
    }
    // system — follow OS preference
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (dark: boolean) =>
      dark ? root.classList.add('dark') : root.classList.remove('dark');
    apply(mq.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeEffect />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register/pending" element={<RegisterPendingPage />} />

          {/* Protected routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/my-issues" element={<MyIssuesPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/new" element={<CreateProjectPage />} />
            <Route path="/projects/:projectId" element={<ProjectLayout />}>
              <Route index element={<Navigate to="board" replace />} />
              <Route path="dashboard" element={<ProjectDashboardPage />} />
              <Route path="board" element={<BoardPage />} />
              <Route path="backlog" element={<BacklogPage />} />
              <Route path="members" element={<ProjectMembersPage />} />
              <Route path="settings" element={<ProjectSettingsPage />} />
              <Route path="components" element={<ProjectComponentsPage />} />
              <Route path="versions" element={<ProjectVersionsPage />} />
              <Route path="reports" element={<ReportsPage />} />
            </Route>
            <Route path="/issues/:issueId" element={<IssueDetailPage />} />
            <Route path="/search" element={<AdvancedSearchPage />} />
            <Route path="/filters" element={<SavedFiltersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/workflows" element={<WorkflowsPage />} />
            <Route path="/workflows/:id" element={<WorkflowBuilderPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/email-logs" element={<AdminEmailLogsPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            fontSize: '14px',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#f9fafb',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#f9fafb',
            },
          },
        }}
      />

      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
