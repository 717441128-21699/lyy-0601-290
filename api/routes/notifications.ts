import { Router, type Request, type Response } from 'express';
import { notificationService } from '../services/notificationService.js';
import { ApiResponse, Notification, NotificationType, UserRole } from '@shared/types';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const { userId, userRole, read } = req.query;

    if (!userId || !userRole) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '缺少必要参数',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const notifications = notificationService.getNotifications(
      userId as string,
      userRole as UserRole,
      read !== undefined ? read === 'true' : undefined
    );

    const response: ApiResponse<Notification[]> = {
      code: 200,
      message: '获取成功',
      data: notifications,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      code: 500,
      message: '服务器内部错误',
      data: null,
    };
    res.status(500).json(response);
  }
});

router.get('/unread-count', (req: Request, res: Response): void => {
  try {
    const { userId, userRole } = req.query;

    if (!userId || !userRole) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '缺少必要参数',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const count = notificationService.getUnreadCount(
      userId as string,
      userRole as UserRole
    );

    const response: ApiResponse<number> = {
      code: 200,
      message: '获取成功',
      data: count,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      code: 500,
      message: '服务器内部错误',
      data: null,
    };
    res.status(500).json(response);
  }
});

router.get('/:notificationId', (req: Request, res: Response): void => {
  try {
    const { notificationId } = req.params;
    const notification = notificationService.getNotificationById(notificationId);

    if (!notification) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '通知不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Notification> = {
      code: 200,
      message: '获取成功',
      data: notification,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      code: 500,
      message: '服务器内部错误',
      data: null,
    };
    res.status(500).json(response);
  }
});

router.post('/:id/read', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    const notification = notificationService.markAsRead(id);

    if (!notification) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '通知不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Notification> = {
      code: 200,
      message: '标记成功',
      data: notification,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      code: 500,
      message: '服务器内部错误',
      data: null,
    };
    res.status(500).json(response);
  }
});

router.post('/read-all', (req: Request, res: Response): void => {
  try {
    const { userId, userRole } = req.body;

    if (!userId || !userRole) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '缺少必要参数',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const count = notificationService.markAllAsRead(
      userId as string,
      userRole as UserRole
    );

    const response: ApiResponse<number> = {
      code: 200,
      message: '全部标记已读成功',
      data: count,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      code: 500,
      message: '服务器内部错误',
      data: null,
    };
    res.status(500).json(response);
  }
});

router.post('/push', (req: Request, res: Response): void => {
  try {
    const { userId, userRole, type, title, content, relatedId, relatedType } = req.body;

    if (!userId || !userRole || !type || !title || !content) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '缺少必要参数',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const notification = notificationService.pushNotification(
      userId,
      userRole,
      type as NotificationType,
      title,
      content,
      relatedId,
      relatedType
    );

    const response: ApiResponse<Notification> = {
      code: 201,
      message: '推送成功',
      data: notification,
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      code: 500,
      message: '服务器内部错误',
      data: null,
    };
    res.status(500).json(response);
  }
});

router.post('/push-role', (req: Request, res: Response): void => {
  try {
    const { role, type, title, content } = req.body;

    if (!role || !type || !title || !content) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '缺少必要参数',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const notifications = notificationService.pushNotificationToRole(
      role as UserRole,
      type as NotificationType,
      title,
      content
    );

    const response: ApiResponse<Notification[]> = {
      code: 201,
      message: '推送成功',
      data: notifications,
    };
    res.status(201).json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      code: 500,
      message: '服务器内部错误',
      data: null,
    };
    res.status(500).json(response);
  }
});

router.delete('/:notificationId', (req: Request, res: Response): void => {
  try {
    const { notificationId } = req.params;
    const success = notificationService.deleteNotification(notificationId);

    if (!success) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '通知不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<boolean> = {
      code: 200,
      message: '删除成功',
      data: true,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      code: 500,
      message: '服务器内部错误',
      data: null,
    };
    res.status(500).json(response);
  }
});

router.delete('/clear-all', (req: Request, res: Response): void => {
  try {
    const { userId, userRole } = req.body;

    if (!userId || !userRole) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '缺少必要参数',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const count = notificationService.clearAllNotifications(
      userId as string,
      userRole as UserRole
    );

    const response: ApiResponse<number> = {
      code: 200,
      message: '清空成功',
      data: count,
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      code: 500,
      message: '服务器内部错误',
      data: null,
    };
    res.status(500).json(response);
  }
});

export default router;
