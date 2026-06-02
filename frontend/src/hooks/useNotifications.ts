import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { notificationsApi, type AppNotification } from '../api/notifications';

const TYPE_ICONS: Record<string, string> = {
  ISSUE_ASSIGNED:  '📋',
  STATUS_CHANGED:  '🔄',
  COMMENT_ADDED:   '💬',
  SPRINT_ENDING:   '⏳',
  OVERDUE_REMINDER:'⚠️',
  SLA_VIOLATION:   '🚨',
};

export function useNotifications() {
  const { token, isAuthenticated } = useAuthStore();
  const { setNotifications, addNotification } = useNotificationStore();
  const clientRef = useRef<Client | null>(null);

  // Load existing notifications on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    notificationsApi.getAll()
      .then(setNotifications)
      .catch(() => {});
  }, [isAuthenticated]);

  // WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe('/user/queue/notifications', (msg) => {
          try {
            const notif: AppNotification = JSON.parse(msg.body);
            addNotification(notif);
            const icon = TYPE_ICONS[notif.type] ?? '🔔';
            toast(`${icon} ${notif.title}`, {
              duration: 5000,
              style: {
                background: '#1e40af',
                color: '#fff',
                fontSize: '13px',
                borderRadius: '10px',
                maxWidth: '360px',
              },
            });
          } catch { /* ignore */ }
        });
      },
      onDisconnect: () => {},
      onStompError: () => {},
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
    };
  }, [isAuthenticated, token]);
}
