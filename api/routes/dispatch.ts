import { Router, type Request, type Response } from 'express';
import { dispatchService } from '../services/dispatchService.js';
import { ApiResponse, HeatmapData, DispatchSuggestion, DispatchTask, SuggestionStatus, DispatchTaskStatus, DispatchPriority } from '@shared/types';

const router = Router();

router.get('/heatmap', (req: Request, res: Response): void => {
  try {
    const heatmapData = dispatchService.getHeatmapData();

    const response: ApiResponse<HeatmapData[]> = {
      code: 200,
      message: '获取成功',
      data: heatmapData,
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

router.post('/heatmap/refresh', (req: Request, res: Response): void => {
  try {
    const heatmapData = dispatchService.refreshHeatmapData();

    const response: ApiResponse<HeatmapData[]> = {
      code: 200,
      message: '刷新成功',
      data: heatmapData,
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

router.get('/suggestions', (req: Request, res: Response): void => {
  try {
    const { status, priority } = req.query;
    const suggestions = dispatchService.getDispatchSuggestions(
      status as SuggestionStatus | undefined,
      priority as DispatchPriority | undefined
    );

    const response: ApiResponse<DispatchSuggestion[]> = {
      code: 200,
      message: '获取成功',
      data: suggestions,
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

router.get('/suggestions/:suggestionId', (req: Request, res: Response): void => {
  try {
    const { suggestionId } = req.params;
    const suggestion = dispatchService.getDispatchSuggestionById(suggestionId);

    if (!suggestion) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '调度建议不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<DispatchSuggestion> = {
      code: 200,
      message: '获取成功',
      data: suggestion,
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

router.post('/suggestions/:suggestionId/confirm', (req: Request, res: Response): void => {
  try {
    const { suggestionId } = req.params;
    const result = dispatchService.confirmSuggestion(suggestionId);

    if (!result.success) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '确认失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<{ suggestion: DispatchSuggestion; task: DispatchTask }> = {
      code: 200,
      message: '确认成功',
      data: { suggestion: result.suggestion!, task: result.task! },
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

router.post('/suggestions/:suggestionId/reject', (req: Request, res: Response): void => {
  try {
    const { suggestionId } = req.params;
    const { reason } = req.body;
    const suggestion = dispatchService.rejectSuggestion(suggestionId, reason);

    if (!suggestion) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '拒绝失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<DispatchSuggestion> = {
      code: 200,
      message: '拒绝成功',
      data: suggestion,
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

router.post('/suggestions', (req: Request, res: Response): void => {
  try {
    const { fromAreaId, toAreaId, bikeCount, reason, priority } = req.body;
    const suggestion = dispatchService.createDispatchSuggestion(
      fromAreaId,
      toAreaId,
      bikeCount,
      reason,
      priority
    );

    const response: ApiResponse<DispatchSuggestion> = {
      code: 201,
      message: '创建成功',
      data: suggestion,
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

router.get('/tasks', (req: Request, res: Response): void => {
  try {
    const { status } = req.query;
    const tasks = dispatchService.getDispatchTasks(
      status as DispatchTaskStatus | undefined
    );

    const response: ApiResponse<DispatchTask[]> = {
      code: 200,
      message: '获取成功',
      data: tasks,
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

router.get('/tasks/:taskId', (req: Request, res: Response): void => {
  try {
    const { taskId } = req.params;
    const task = dispatchService.getDispatchTaskById(taskId);

    if (!task) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '调度任务不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<DispatchTask> = {
      code: 200,
      message: '获取成功',
      data: task,
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

router.post('/tasks/:taskId/start', (req: Request, res: Response): void => {
  try {
    const { taskId } = req.params;
    const task = dispatchService.startDispatchTask(taskId);

    if (!task) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '开始失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<DispatchTask> = {
      code: 200,
      message: '开始成功',
      data: task,
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

router.post('/tasks/:taskId/complete', (req: Request, res: Response): void => {
  try {
    const { taskId } = req.params;
    const task = dispatchService.completeDispatchTask(taskId);

    if (!task) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '完成失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<DispatchTask> = {
      code: 200,
      message: '完成成功',
      data: task,
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

router.post('/tasks', (req: Request, res: Response): void => {
  try {
    const { fromAreaId, toAreaId, bikeCount, assignedStaff, assignedStaffNames } = req.body;
    const task = dispatchService.createDispatchTask(
      fromAreaId,
      toAreaId,
      bikeCount,
      assignedStaff || [],
      assignedStaffNames || []
    );

    const response: ApiResponse<DispatchTask> = {
      code: 201,
      message: '创建成功',
      data: task,
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

export default router;
