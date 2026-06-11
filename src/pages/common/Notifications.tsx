import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Filter,
  ArrowLeft,
  Bike,
  CreditCard,
  Zap,
  AlertTriangle,
  MapPin,
  MessageSquare,
  Settings,
  ChevronRight,
  Inbox,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Empty from '@/components/ui/Empty';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import api from '@/utils/api';
import { cn } from '@/lib/utils';
import type { Notification, NotificationType, UserRole } from '@shared/types';

const typeTabs = [
  { key: 'all', label: '全部' },
  { key: 'unlock', label: '开锁' },
  { key: 'order-complete', label: '订单' },
  { key: 'battery-task', label: '换电' },
  { key: 'fault', label: '故障' },
  { key: 'dispatch', label: '调度' },
  { key: 'complaint', label: '投诉' },
  { key: 'system', label: '系统' },
];

const readTabs = [
  { key: 'all', label: '全部' },
  { key: 'unread', label: '未读' },
  { key: 'read', label: '已读' },
];

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
  'unlock': 'bg-success-100 text-success-600',
  'order-complete': 'bg-primary-100 text-primary-600',
  'battery-task': 'bg-warning-100 text-warning-600',
  'fault': 'bg-danger-100 text-danger-600',
  'dispatch': 'bg-secondary-100 text-secondary-600',
  'complaint': 'bg-purple-100 text-purple-600',
  'system': 'bg-gray-100 text-gray-600',
};

export default function Notifications() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { notifications, unreadCount, setNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [activeRead, setActiveRead] = useState('all');

  const sidebarItems = getSidebarItems(user?.role);

  function getSidebarItems(role?: UserRole) {
    if (!role) return [];
    const items: any[] = [];
    
    if (role === 'user') {
      items.push(
        { key: 'home', label: '首页', icon: Inbox, path: '/user' },
        { key: 'orders', label: '我的订单', icon: CreditCard, path: '/user/orders' },
        { key: 'notifications', label: '消息中心', icon: Bell, path: '/notifications' },
      );
    } else if (role === 'operator') {
      items.push(
        { key: 'dashboard', label: '运维看板', icon: Settings, path: '/operator/dashboard' },
        { key: 'battery', label: '换电任务', icon: Zap, path: '/operator/battery-tasks' },
        { key: 'fault', label: '故障报修', icon: AlertTriangle, path: '/operator/fault-reports' },
        { key: 'notifications', label: '消息中心', icon: Bell, path: '/notifications' },
      );
    } else if (role === 'dispatcher') {
      items.push(
        { key: 'dashboard', label: '调度看板', icon: Settings, path: '/dispatcher/dashboard' },
        { key: 'heatmap', label: '热力图', icon: MapPin, path: '/dispatcher/heatmap' },
        { key: 'suggestions', label: '调度建议', icon: Settings, path: '/dispatcher/suggestions' },
        { key: 'tasks', label: '调度任务', icon: Settings, path: '/dispatcher/tasks' },
        { key: 'notifications', label: '消息中心', icon: Bell, path: '/notifications' },
      );
    } else if (role === 'admin') {
      items.push(
        { key: 'dashboard', label: '管理看板', icon: Settings, path: '/admin/dashboard' },
        { key: 'pricing', label: '计费规则', icon: Settings, path: '/admin/pricing' },
        { key: 'operation-logs', label: '操作记录', icon: Settings, path: '/admin/operation-logs' },
        { key: 'notifications', label: '消息中心', icon: Bell, path: '/notifications' },
      );
    }
    
    return items;
  }

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params: any = {
        userId: user.id,
        userRole: user.role,
      };
      if (activeRead !== 'all') {
        params.read = activeRead === 'read';
      }
      const res = await api.get<Notification[]>('/notifications', params);
      if (res.code === 200) {
        setNotifications(res.data || []);
      }
    } catch (error) {
      console.error('获取通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [activeRead, user]);

  const filteredNotifications = notifications.filter(notif => {
    if (activeType !== 'all' && notif.type !== activeType) return false;
    return true;
  });

  const handleMarkAllAsRead = async () => {
    markAllAsRead();
    if (user) {
      try {
        await api.post('/notifications/read-all', {
          userId: user.id,
          userRole: user.role,
        });
      } catch (e) {
        console.error('Failed to mark all as read:', e);
      }
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    if (!notif.read) {
      markAsRead(notif.id);
      try {
        await api.post(`/notifications/${notif.id}/read`);
      } catch (e) {
        console.error('Failed to mark as read:', e);
      }
    }

    if (notif.relatedId && notif.relatedType) {
      navigateToDetail(notif.relatedType, notif.relatedId);
    }
  };

  const navigateToDetail = (relatedType: string, relatedId: string) => {
    const isOperatorRole = user?.role === 'operator';
    const routes: Record<string, string> = {
      'order': `/user/order/${relatedId}`,
      'battery-task': `/operator/battery-task/${relatedId}`,
      'fault': `/operator/fault/${relatedId}`,
      'dispatch': isOperatorRole ? `/operator/dispatch-task/${relatedId}` : `/dispatcher/task/${relatedId}`,
      'complaint': `/user/complaint/${relatedId}`,
    };
    const route = routes[relatedType];
    if (route) {
      navigate(route);
    }
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
    <Layout title="消息中心" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">消息中心</h2>
            <p className="text-gray-500 mt-1">
              共 {notifications.length} 条通知，{unreadCount} 条未读
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<CheckCheck className="w-4 h-4" />}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              全部已读
            </Button>
          </div>
        </div>

        <Card padding="none">
          <div className="px-5 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">通知类型：</span>
              <div className="flex-1 overflow-x-auto">
                <Tabs items={typeTabs} activeKey={activeType} onChange={setActiveType} />
              </div>
            </div>
            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">阅读状态：</span>
              <Tabs items={readTabs} activeKey={activeRead} onChange={setActiveRead} />
            </div>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {loading ? (
              <div className="p-5 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredNotifications.length === 0 ? (
              <Empty
                title="暂无通知"
                description="当前没有符合条件的通知"
                icon={<Bell className="w-12 h-12 text-gray-300" />}
              />
            ) : (
              <div className="divide-y divide-gray-50">
                {filteredNotifications.map((notif) => {
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
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn('text-sm font-medium', notif.read ? 'text-gray-600' : 'text-gray-900')}>
                            {notif.title}
                          </p>
                          <div className="flex items-center gap-2">
                            {!notif.read && (
                              <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                            )}
                            <span className="text-xs text-gray-400 whitespace-nowrap">
                              {formatTime(notif.createTime)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notif.content}</p>
                        {notif.relatedType && (
                          <div className="flex items-center gap-1 mt-2">
                            <Badge variant="outline" size="xs">
                              {notif.relatedType}
                            </Badge>
                            <span className="text-xs text-gray-400">#{notif.relatedId}</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
