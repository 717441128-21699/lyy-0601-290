import { Router, type Request, type Response } from 'express';
import { operationLogService } from '../services/operationLogService.js';
import { ApiResponse, OperationLog, OperationLogType, UserRole } from '@shared/types';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const { operatorRole, logType, startTime, endTime, page, pageSize } = req.query;

    const result = operationLogService.getLogs(
      operatorRole as UserRole | undefined,
      logType as OperationLogType | undefined,
      startTime as string | undefined,
      endTime as string | undefined,
      page ? parseInt(page as string, 10) : 1,
      pageSize ? parseInt(pageSize as string, 10) : 20
    );

    const response: ApiResponse<{ list: OperationLog[]; total: number }> = {
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

router.get('/:logId', (req: Request, res: Response): void => {
  try {
    const { logId } = req.params;
    const log = operationLogService.getLogById(logId);

    if (!log) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '日志不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<OperationLog> = {
      code: 200,
      message: '获取成功',
      data: log,
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

router.post('/', (req: Request, res: Response): void => {
  try {
    const { type, operatorId, operatorName, operatorRole, description, relatedId, relatedType, relatedName } = req.body;

    if (!type || !operatorId || !operatorName || !operatorRole || !description) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '缺少必要参数',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const log = operationLogService.addLog(
      type as OperationLogType,
      operatorId,
      operatorName,
      operatorRole as UserRole,
      description,
      relatedId,
      relatedType,
      relatedName
    );

    const response: ApiResponse<OperationLog> = {
      code: 201,
      message: '创建成功',
      data: log,
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

router.delete('/clear', (req: Request, res: Response): void => {
  try {
    const count = operationLogService.clearLogs();

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
