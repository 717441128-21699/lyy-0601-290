import { Router, type Request, type Response } from 'express';
import { userService } from '../services/userService.js';
import { LoginRequest, ApiResponse, LoginResponse } from '../../shared/types.js';

const router = Router();

router.post('/login', (req: Request, res: Response): void => {
  try {
    const { role, username, password }: LoginRequest = req.body;
    const user = userService.login(username, password, role);

    if (!user) {
      const response: ApiResponse<null> = {
        code: 401,
        message: '用户名或密码错误',
        data: null,
      };
      res.status(401).json(response);
      return;
    }

    const token = `mock-token-${user.id}-${Date.now()}`;
    const data: LoginResponse = {
      token,
      user,
    };

    const response: ApiResponse<LoginResponse> = {
      code: 200,
      message: '登录成功',
      data,
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

router.post('/logout', (req: Request, res: Response): void => {
  try {
    const response: ApiResponse<boolean> = {
      code: 200,
      message: '退出成功',
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

export default router;
