import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { toast } from '@/components/ui/toastStore';
import api from '@/utils/api';
import type { Notification, NotificationType } from '@shared/types';

const notificationToastColors: Record<NotificationType, 'success' | 'info' | 'warning' | 'error'> = {
  'unlock': 'success',
  'order-complete': 'info',
  'battery-task': 'warning',
  'fault': 'error',
  'dispatch': 'warning',
  'complaint': 'info',
  'system': 'info',
};

export default function NotificationListener() {
  const { user } = useAuthStore();
  const { notifications, addNotification, setNotifications } = useNotificationStore();
  const hasLoaded = useRef(false);
  const notificationIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    notificationIdsRef.current = new Set(notifications.map(n => n.id));
  }, [notifications]);

  useEffect(() => {
    if (!user) {
      hasLoaded.current = false;
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await api.get<Notification[]>('/notifications', {
          userId: user.id,
          userRole: user.role,
        });

        if (res.code === 200) {
          const freshNotifications = res.data;

          if (!hasLoaded.current) {
            setNotifications(freshNotifications);
            hasLoaded.current = true;
          } else {
            const newOnes = freshNotifications.filter(
              n => !notificationIdsRef.current.has(n.id)
            );

            newOnes.forEach(notif => {
              addNotification(notif);
              const toastType = notificationToastColors[notif.type];
              toast({
                type: toastType,
                title: notif.title,
                description: notif.content,
              });
            });
          }
        }
      } catch (e) {
        console.error('Failed to fetch notifications:', e);
      }
    };

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  return null;
}
