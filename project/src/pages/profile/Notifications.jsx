import { Bell, Tag, Truck, Gift, Package, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../../context/NotificationContext';

const iconForType = (type) => {
  switch (type) {
    case 'order':
      return { icon: Truck, iconBg: 'bg-green-100', iconColor: 'text-green-600' };
    case 'offer':
      return { icon: Tag, iconBg: 'bg-yellow-100', iconColor: 'text-yellow-600' };
    case 'referral':
      return { icon: Gift, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' };
    case 'system':
      return { icon: Info, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' };
    default:
      return { icon: Package, iconBg: 'bg-gray-100', iconColor: 'text-gray-600' };
  }
};

export default function Notifications() {
  const { t } = useTranslation();
  const {
    notifications,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    refresh,
  } = useNotifications();

  const formatTimeAgo = (isoDate) => {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '';

    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notifications.time.justNow', 'Just now');
    if (diffMins === 1) return t('notifications.time.minAgo', { count: 1, defaultValue: '1 min ago' });
    if (diffMins < 60) return t('notifications.time.minsAgo', { count: diffMins, defaultValue: `${diffMins} mins ago` });
    if (diffHours === 1) return t('notifications.time.hourAgo', { count: 1, defaultValue: '1 hour ago' });
    if (diffHours < 24) return t('notifications.time.hoursAgo', { count: diffHours, defaultValue: `${diffHours} hours ago` });
    if (diffDays === 1) return t('notifications.time.dayAgo', { count: 1, defaultValue: '1 day ago' });
    if (diffDays < 7) return t('notifications.time.daysAgo', { count: diffDays, defaultValue: `${diffDays} days ago` });
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#2d6a2d]" />
            <h3 className="text-base font-semibold text-gray-900">{t('notifications.title', 'Notifications')}</h3>
            {unreadCount > 0 && (
              <span className="ml-1 text-xs bg-[#2d6a2d] text-white rounded-full px-2 py-0.5 font-medium">
                {unreadCount} {t('notifications.new', 'new')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs font-medium text-[#2d6a2d] hover:underline"
              >
                {t('notifications.markAllAsRead', 'Mark all as read')}
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(t('notifications.confirmClear', 'Clear all customer notifications? This cannot be undone.'))) {
                    void clearNotifications();
                  }
                }}
                className="text-xs font-medium text-red-600 hover:underline"
              >
                {t('notifications.clearAll', 'Clear notifications')}
              </button>
            )}
          </div>
        </div>

        {loading && notifications.length === 0 && (
          <div className="py-10 text-center text-sm text-gray-400">{t('notifications.loading', 'Loading notifications...')}</div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <button
                type="button"
                onClick={refresh}
                className="text-left text-xs font-semibold text-red-700 underline sm:text-right"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="py-10 text-center">
            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">{t('notifications.empty', 'No notifications yet')}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {notifications.map((notif) => {
            const { icon: Icon, iconBg, iconColor } = iconForType(notif.type);
            return (
              <button
                key={notif.id}
                onClick={() => !notif.is_read && markAsRead(notif.id)}
                className={`flex items-start gap-4 p-4 rounded-lg border transition-all text-left w-full
                  ${notif.is_read ? 'border-gray-100 bg-white' : 'border-green-100 bg-[#f8fcf5]'}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#2d6a2d] flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                  {notif.created_at && (
                    <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(notif.created_at)}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
