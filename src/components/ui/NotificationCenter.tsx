import { useEffect, useRef, useState } from 'react';
import {
  Bell, X, CheckCheck, ChevronRight,
  Bike, CreditCard, Zap, AlertTriangle,
  MapPin, MessageSquare, Settings
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import api from '@/utils/api';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType } from '@shared/types';

const notificationIcons: Record<NotificationType, typeof Bike> = {
  'unlock': Bike,
  'order-complete': CreditCard,
  'battery-task': Zap,
  'fault': AlertTriangle,
  'dispatch': MapPin,
  'complaint': MessageSquare,
  'system': Settings,
};

const notificationColors: Record<NotificationType, string> = {
  'unlock': 'bg-primary-100 text-primary-600',
  'order-complete': 'bg-success-100 text-success-600',
  'battery-task': 'bg-warning-100 text-warning-600',
  'fault': 'bg-danger-100 text-danger-600',
  'dispatch': 'bg-secondary-100 text-secondary-600',
  'complaint': 'bg-purple-100 text-purple-600',
  'system': 'bg-gray-100 text-gray-600',
};

interface NotificationCenterProps {
  className?: string;
}

export default function NotificationCenter({ className }: NotificationCenterProps) {
  const { user } = useAuthStore();
  const { notifications, unreadCount, addNotification, markAsRead, markAllAsRead, setNotifications } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current && user) {
      loadNotifications();
      hasLoaded.current = true;
    }
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        simulateNewNotification();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get<Notification[]>('/notifications');
      if (res.code === 200) {
        setNotifications(res.data);
      }
    } catch (e) {
      console.error('Failed to load notifications:', e);
    }
  };

  const simulateNewNotification = () => {
    const types: NotificationType[] = ['battery-task', 'dispatch', 'system', 'complaint'];
    const type = types[Math.floor(Math.random() * types.length)];
    const titles: Record<NotificationType, string> = {
      'unlock': '开锁成功',
      'order-complete': '骑行结束',
      'battery-task': '新换电任务',
      'fault': '故障提醒',
      'dispatch': '调度通知',
      'complaint': '投诉更新',
      'system': '系统通知',
    };
    const contents: Record<NotificationType, string> = {
      'unlock': '您的车辆已开锁，祝您骑行愉快',
      'order-complete': '骑行已结束，请查看电子账单',
      'battery-task': '您有新的换电任务待处理',
      'fault': '检测到车辆故障，请及时处理',
      'dispatch': '系统生成新的调度建议',
      'complaint': '您的投诉有新的处理进展',
      'system': '系统将于今晚进行维护升级',
    };

    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: user!.id,
      userRole: user!.role,
      type,
      title: titles[type],
      content: contents[type],
      read: false,
      createTime: new Date().toLocaleString('zh-CN'),
    };
    addNotification(newNotif);
  };

  const handleNotificationClick = (notif: Notification) => {
    if (!notif.read) {
      markAsRead(notif.id);
    }
    setIsOpen(false);
  };

  const formatTime = (time: string) => {
    const now = new Date();
    const notifTime = new Date(time);
    const diff = now.getTime() - notifTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return time;
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-danger-500 text-white text-xs font-medium rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-scale-in origin-top-right">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">通知中心</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                全部已读
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">暂无通知</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.slice(0, 10).map((notif) => {
                  const Icon = notificationIcons[notif.type];
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={cn(
                        'w-full px-5 py-4 flex items-start gap-3 text-left transition-colors hover:bg-gray-50',
                        !notif.read && 'bg-primary-50/50'
                      )}
                    >
                      <div className={cn('p-2 rounded-xl flex-shrink-0 mt-0.5', notificationColors[notif.type])}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn('text-sm font-medium', notif.read ? 'text-gray-600' : 'text-gray-900')}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notif.content}</p>
                        <p className="text-xs text-gray-400 mt-1.5">{formatTime(notif.createTime)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
            <button className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium">
              查看全部通知
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
