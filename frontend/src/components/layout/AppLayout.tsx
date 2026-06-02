import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Sidebar } from './Sidebar';
import { ConfirmProvider } from '../../context/ConfirmContext';

export function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', String(collapsed));
  }, [collapsed]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <ConfirmProvider>
      <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        <div className="flex-1 overflow-hidden flex flex-col min-w-0">
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </ConfirmProvider>
  );
}
