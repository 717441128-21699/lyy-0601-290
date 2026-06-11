import { Router, type Request, type Response } from 'express';
import { userService } from '../services/userService.js';
import { ApiResponse, User, DepositRecord } from '../../shared/types.js';

const router = Router();

router.get('/:userId', (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const user = userService.getUserById(userId);

    if (!user) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '用户不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<User> = {
      code: 200,
      message: '获取成功',
      data: user,
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

router.put('/:userId', (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const user = userService.updateUser(userId, updates);

    if (!user) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '用户不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<User> = {
      code: 200,
      message: '更新成功',
      data: user,
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

router.post('/:userId/verify-realname', (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const { realName, idCard } = req.body;
    const user = userService.verifyRealName(userId, realName, idCard);

    if (!user) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '用户不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<User> = {
      code: 200,
      message: '实名认证成功',
      data: user,
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

router.post('/:userId/deposit/pay', (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const result = userService.payDeposit(userId);

    if (!result.success) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '支付押金失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<{ user: User; record: DepositRecord }> = {
      code: 200,
      message: '押金支付成功',
      data: { user: result.user!, record: result.record! },
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

router.post('/:userId/deposit/refund', (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const result = userService.refundDeposit(userId);

    if (!result.success) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '押金退款申请失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<{ user: User; record: DepositRecord }> = {
      code: 200,
      message: '押金退款申请已提交',
      data: { user: result.user!, record: result.record! },
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

router.get('/:userId/deposit-records', (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const records = userService.getDepositRecordsByUser(userId);

    const response: ApiResponse<DepositRecord[]> = {
      code: 200,
      message: '获取成功',
      data: records,
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

router.post('/:userId/credit/calculate', (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const { action } = req.body;
    const user = userService.calculateCreditScore(userId, action);

    if (!user) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '用户不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<User> = {
      code: 200,
      message: '信用分更新成功',
      data: user,
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
