import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { notificationsApi } from '../../api/notifications';

const TYPE_ICONS: Record<string, string> = {
  ISSUE_ASSIGNED:   '📋',
  STATUS_CHANGED:   '🔄',
  COMMENT_ADDED:    '💬',
  SPRINT_ENDING:    '⏳',
  OVERDUE_REMINDER: '⚠️',
  SLA_VIOLATION:    '🚨',
  DAILY_DIGEST:     '📊',
};

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60)    return 'vừa xong';
  if (diff < 3600)  return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export function NotificationBell() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkRead = async (id: number) => {
    markRead(id);
    await notificationsApi.markRead(id).catch(() => {});
  };

  const handleMarkAllRead = async () => {
    markAllRead();
    await notificationsApi.markAllRead().catch(() => {});
  };

  const handleClickNotif = async (notif: typeof notifications[0]) => {
    if (!notif.read) await handleMarkRead(notif.id);
    if (notif.issueId) {
      navigate(`/issues/${notif.issueId}`);
      setOpen(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 flex flex-col overflow-hidden"
          style={{ maxHeight: '480px' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Thông báo
              {unreadCount > 0 && (
                <span className="ml-2 text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full">{unreadCount} mới</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-700 dark:hover:text-blue-400">
                <CheckCheck className="w-3.5 h-3.5" />Đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Bell className="w-8 h-8 text-gray-200 dark:text-gray-700" />
                <p className="text-sm text-gray-400 dark:text-gray-500">Chưa có thông báo</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleClickNotif(n)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer border-b border-gray-50 dark:border-gray-800 transition-colors ${
                    n.read
                      ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                      : 'bg-blue-50/60 dark:bg-blue-900/10 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                  }`}
                >
                  {/* Icon */}
                  <div className="text-lg flex-shrink-0 mt-0.5 leading-none">
                    {TYPE_ICONS[n.type] ?? '🔔'}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium leading-snug ${n.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-gray-300 dark:text-gray-600">{timeAgo(n.createdAt)}</span>
                      {n.projectName && (
                        <span className="text-[10px] text-blue-400 dark:text-blue-500">{n.projectName}</span>
                      )}
                    </div>
                  </div>

                  {/* Unread dot + actions */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                    )}
                    {n.issueId && (
                      <ExternalLink className="w-3 h-3 text-gray-300 dark:text-gray-600 mt-auto" />
                    )}
                    {!n.read && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }}
                        className="p-0.5 text-gray-300 hover:text-blue-500 rounded"
                        title="Đánh dấu đã đọc"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
