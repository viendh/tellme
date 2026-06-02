import { create } from 'zustand';
import type { AppNotification } from '../api/notifications';

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  setNotifications: (list: AppNotification[]) => void;
  addNotification: (n: AppNotification) => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (list) =>
    set({ notifications: list, unreadCount: list.filter((n) => !n.read).length }),

  addNotification: (n) =>
    set((s) => ({
      notifications: [n, ...s.notifications].slice(0, 30),
      unreadCount: s.unreadCount + (n.read ? 0 : 1),
    })),

  markRead: (id) =>
    set((s) => {
      const notifications = s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return { notifications, unreadCount: notifications.filter((n) => !n.read).length };
    }),

  markAllRead: () =>
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),
}));
