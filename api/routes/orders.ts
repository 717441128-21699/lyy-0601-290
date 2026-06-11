import { Router, type Request, type Response } from 'express';
import { orderService } from '../services/orderService.js';
import { ApiResponse, Order, RidingData, UnlockResponse } from '@shared/types';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const { status, userId } = req.query;
    const orders = orderService.getAllOrders(
      status as string | undefined,
      userId as string | undefined
    );

    const response: ApiResponse<Order[]> = {
      code: 200,
      message: '获取成功',
      data: orders,
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

router.post('/unlock', (req: Request, res: Response): void => {
  try {
    const { userId, bikeId } = req.body;

    if (!userId || !bikeId) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '缺少必要参数',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const result = orderService.createOrder(userId, bikeId);

    if (!result.success) {
      const response: ApiResponse<UnlockResponse> = {
        code: 400,
        message: result.message || '开锁失败',
        data: {
          success: false,
          message: result.message,
          recommendedBikes: result.recommendedBikes,
        },
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<UnlockResponse> = {
      code: 200,
      message: '开锁成功',
      data: {
        success: true,
        orderId: result.order?.id,
      },
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

router.get('/ongoing/:userId', (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const order = orderService.getOngoingOrder(userId);

    if (!order) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '没有进行中的订单',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Order> = {
      code: 200,
      message: '获取成功',
      data: order,
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

router.get('/:orderId', (req: Request, res: Response): void => {
  try {
    const { orderId } = req.params;
    const order = orderService.getOrderById(orderId);

    if (!order) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '订单不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Order> = {
      code: 200,
      message: '获取成功',
      data: order,
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

router.get('/:orderId/riding-data', (req: Request, res: Response): void => {
  try {
    const { orderId } = req.params;
    const ridingData = orderService.getRidingData(orderId);

    if (!ridingData) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '没有进行中的骑行',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<RidingData> = {
      code: 200,
      message: '获取成功',
      data: ridingData,
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

router.post('/:orderId/end', (req: Request, res: Response): void => {
  try {
    const { orderId } = req.params;
    const { endLng, endLat } = req.body;

    if (!endLng || !endLat) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '缺少位置参数',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const result = orderService.endRide(orderId, parseFloat(endLng), parseFloat(endLat));

    if (!result.success) {
      const response: ApiResponse<null> = {
        code: 400,
        message: result.message || '还车失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<Order> = {
      code: 200,
      message: '还车成功',
      data: result.order!,
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

router.get('/user/:userId', (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const { status } = req.query;
    const orders = orderService.getOrdersByUser(userId, status as string | undefined);

    const response: ApiResponse<Order[]> = {
      code: 200,
      message: '获取成功',
      data: orders,
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
