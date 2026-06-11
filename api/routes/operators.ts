import { Router, type Request, type Response } from 'express';
import { operatorService } from '../services/operatorService.js';
import { ApiResponse, BatteryTask, FaultReport, MaintenanceRecord, BatteryTaskStatus, FaultStatus } from '../../shared/types.js';

const router = Router();

router.get('/battery-tasks', (req: Request, res: Response): void => {
  try {
    const { operatorId, status } = req.query;
    const tasks = operatorService.getBatteryTasks(
      operatorId as string | undefined,
      status as BatteryTaskStatus | undefined
    );

    const response: ApiResponse<BatteryTask[]> = {
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

router.get('/battery-tasks/:taskId', (req: Request, res: Response): void => {
  try {
    const { taskId } = req.params;
    const task = operatorService.getBatteryTaskById(taskId);

    if (!task) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '任务不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<BatteryTask> = {
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

router.post('/battery-tasks/:taskId/accept', (req: Request, res: Response): void => {
  try {
    const { taskId } = req.params;
    const { operatorId } = req.body;
    const task = operatorService.acceptBatteryTask(taskId, operatorId);

    if (!task) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '接受任务失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<BatteryTask> = {
      code: 200,
      message: '接受任务成功',
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

router.post('/battery-tasks/:taskId/start', (req: Request, res: Response): void => {
  try {
    const { taskId } = req.params;
    const task = operatorService.startBatteryTask(taskId);

    if (!task) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '开始任务失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<BatteryTask> = {
      code: 200,
      message: '开始任务成功',
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

router.post('/battery-tasks/:taskId/complete', (req: Request, res: Response): void => {
  try {
    const { taskId } = req.params;
    const { targetBattery } = req.body;
    const task = operatorService.completeBatteryTask(taskId, targetBattery);

    if (!task) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '完成任务失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<BatteryTask> = {
      code: 200,
      message: '完成任务成功',
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

router.get('/fault-reports', (req: Request, res: Response): void => {
  try {
    const { status, reporterType } = req.query;
    const reports = operatorService.getFaultReports(
      status as FaultStatus | undefined,
      reporterType as string | undefined
    );

    const response: ApiResponse<FaultReport[]> = {
      code: 200,
      message: '获取成功',
      data: reports,
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

router.get('/fault-reports/:reportId', (req: Request, res: Response): void => {
  try {
    const { reportId } = req.params;
    const report = operatorService.getFaultReportById(reportId);

    if (!report) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '故障报修不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<FaultReport> = {
      code: 200,
      message: '获取成功',
      data: report,
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

router.post('/fault-reports', (req: Request, res: Response): void => {
  try {
    const { bikeId, reporterId, reporterName, reporterType, faultType, description, images } = req.body;
    const report = operatorService.createFaultReport(
      bikeId,
      reporterId,
      reporterName,
      reporterType,
      faultType,
      description,
      images || []
    );

    const response: ApiResponse<FaultReport> = {
      code: 201,
      message: '提交成功',
      data: report,
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

router.post('/fault-reports/:reportId/handle', (req: Request, res: Response): void => {
  try {
    const { reportId } = req.params;
    const { handlerId, handlerName } = req.body;
    const report = operatorService.handleFaultReport(reportId, handlerId, handlerName);

    if (!report) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '处理失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<FaultReport> = {
      code: 200,
      message: '处理成功',
      data: report,
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

router.post('/fault-reports/:reportId/resolve', (req: Request, res: Response): void => {
  try {
    const { reportId } = req.params;
    const { handleResult } = req.body;
    const report = operatorService.resolveFaultReport(reportId, handleResult);

    if (!report) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '解决失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<FaultReport> = {
      code: 200,
      message: '解决成功',
      data: report,
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

router.post('/fault-reports/:reportId/close', (req: Request, res: Response): void => {
  try {
    const { reportId } = req.params;
    const report = operatorService.closeFaultReport(reportId);

    if (!report) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '关闭失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<FaultReport> = {
      code: 200,
      message: '关闭成功',
      data: report,
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

router.get('/maintenance-records', (req: Request, res: Response): void => {
  try {
    const { bikeId, operatorId } = req.query;
    const records = operatorService.getMaintenanceRecords(
      bikeId as string | undefined,
      operatorId as string | undefined
    );

    const response: ApiResponse<MaintenanceRecord[]> = {
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

router.post('/maintenance-records', (req: Request, res: Response): void => {
  try {
    const { bikeId, operatorId, operatorName, maintenanceType, description, partsReplaced, cost, faultReportId } = req.body;
    const record = operatorService.createMaintenanceRecord(
      bikeId,
      operatorId,
      operatorName,
      maintenanceType,
      description,
      partsReplaced || [],
      cost,
      faultReportId
    );

    const response: ApiResponse<MaintenanceRecord> = {
      code: 201,
      message: '创建成功',
      data: record,
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

router.get('/maintenance-records/:recordId', (req: Request, res: Response): void => {
  try {
    const { recordId } = req.params;
    const record = operatorService.getMaintenanceRecordById(recordId);

    if (!record) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '维修记录不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<MaintenanceRecord> = {
      code: 200,
      message: '获取成功',
      data: record,
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
