import { Notification, NotificationType, UserRole } from '../../shared/types.js';
import { mockNotifications, generateId } from '../data/mockData.js';

let notifications: Notification[] = [...mockNotifications];

export const notificationService = {
  getNotifications(userId: string, userRole: UserRole, read?: boolean): Notification[] {
    let userNotifications = notifications.filter(n => n.userId === userId && n.userRole === userRole);
    if (read !== undefined) {
      userNotifications = userNotifications.filter(n => n.read === read);
    }
    return userNotifications.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  },

  getNotificationById(notificationId: string): Notification | undefined {
    return notifications.find(n => n.id === notificationId);
  },

  markAsRead(notificationId: string): Notification | undefined {
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index === -1) return undefined;
    notifications[index] = { ...notifications[index], read: true };
    return notifications[index];
  },

  markAllAsRead(userId: string, userRole: UserRole): number {
    let count = 0;
    notifications = notifications.map(n => {
      if (n.userId === userId && n.userRole === userRole && !n.read) {
        count++;
        return { ...n, read: true };
      }
      return n;
    });
    return count;
  },

  getUnreadCount(userId: string, userRole: UserRole): number {
    return notifications.filter(n => n.userId === userId && n.userRole === userRole && !n.read).length;
  },

  pushNotification(
    userId: string,
    userRole: UserRole,
    type: NotificationType,
    title: string,
    content: string,
    relatedId?: string,
    relatedType?: string
  ): Notification {
    const notification: Notification = {
      id: generateId(),
      userId,
      userRole,
      type,
      title,
      content,
      relatedId,
      relatedType,
      read: false,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    notifications.push(notification);
    return notification;
  },

  pushNotificationToRole(
    role: UserRole,
    type: NotificationType,
    title: string,
    content: string
  ): Notification[] {
    const userNotifications = notifications.filter(n => n.userRole === role);
    const userIds = [...new Set(userNotifications.map(n => n.userId))];

    const newNotifications: Notification[] = userIds.map(userId => ({
      id: generateId(),
      userId,
      userRole: role,
      type,
      title,
      content,
      read: false,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    }));

    notifications.push(...newNotifications);
    return newNotifications;
  },

  deleteNotification(notificationId: string): boolean {
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index === -1) return false;
    notifications.splice(index, 1);
    return true;
  },

  clearAllNotifications(userId: string, userRole: UserRole): number {
    const initialLength = notifications.length;
    notifications = notifications.filter(n => !(n.userId === userId && n.userRole === userRole));
    return initialLength - notifications.length;
  },
};
