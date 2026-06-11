import { Router, type Request, type Response } from 'express';
import { adminService } from '../services/adminService.js';
import { ApiResponse, SystemConfig, CityStats, User, UserRole } from '../../shared/types.js';

const router = Router();

router.get('/config', (req: Request, res: Response): void => {
  try {
    const config = adminService.getSystemConfig();

    const response: ApiResponse<SystemConfig> = {
      code: 200,
      message: '获取成功',
      data: config,
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

router.put('/config', (req: Request, res: Response): void => {
  try {
    const config = req.body;
    const updatedConfig = adminService.updateSystemConfig(config);

    const response: ApiResponse<SystemConfig> = {
      code: 200,
      message: '更新成功',
      data: updatedConfig,
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

router.get('/city-stats', (req: Request, res: Response): void => {
  try {
    const stats = adminService.getCityStats();

    const response: ApiResponse<CityStats[]> = {
      code: 200,
      message: '获取成功',
      data: stats,
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

router.get('/city-stats/:cityId', (req: Request, res: Response): void => {
  try {
    const { cityId } = req.params;
    const stats = adminService.getCityStatsById(cityId);

    if (!stats) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '城市数据不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<CityStats> = {
      code: 200,
      message: '获取成功',
      data: stats,
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

router.get('/dashboard', (req: Request, res: Response): void => {
  try {
    const stats = adminService.getDashboardStats();

    const response: ApiResponse<typeof stats> = {
      code: 200,
      message: '获取成功',
      data: stats,
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

router.get('/users', (req: Request, res: Response): void => {
  try {
    const { page, pageSize, role, keyword } = req.query;
    const result = adminService.getUserList(
      page ? parseInt(page as string) : 1,
      pageSize ? parseInt(pageSize as string) : 20,
      role as UserRole | undefined,
      keyword as string | undefined
    );

    const response: ApiResponse<typeof result> = {
      code: 200,
      message: '获取成功',
      data: result,
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

router.post('/users', (req: Request, res: Response): void => {
  try {
    const userData = req.body;
    const user = adminService.addUser(userData);

    const response: ApiResponse<User> = {
      code: 201,
      message: '创建成功',
      data: user,
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

router.put('/users/:userId', (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    const user = adminService.updateUser(userId, updates);

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

router.delete('/users/:userId', (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const success = adminService.deleteUser(userId);

    if (!success) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '用户不存在',
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

router.post('/users/:userId/credit/adjust', (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const { scoreChange } = req.body;
    const user = adminService.adjustUserCredit(userId, scoreChange);

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
      message: '信用分调整成功',
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

router.get('/operator-stats', (req: Request, res: Response): void => {
  try {
    const stats = adminService.getOperatorStats();

    const response: ApiResponse<typeof stats> = {
      code: 200,
      message: '获取成功',
      data: stats,
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

router.get('/system-health', (req: Request, res: Response): void => {
  try {
    const health = adminService.getSystemHealth();

    const response: ApiResponse<typeof health> = {
      code: 200,
      message: '获取成功',
      data: health,
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
