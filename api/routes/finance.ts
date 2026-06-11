import { Router, type Request, type Response } from 'express';
import { financeService } from '../services/financeService.js';
import { ApiResponse, FinanceOverview, DailyRevenue, DepositRecord, OperatingCost, ProfitReport, DepositType } from '@shared/types';

const router = Router();

router.get('/overview', (req: Request, res: Response): void => {
  try {
    const overview = financeService.getFinanceOverview();

    const response: ApiResponse<FinanceOverview> = {
      code: 200,
      message: '获取成功',
      data: overview,
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

router.get('/daily-revenue', (req: Request, res: Response): void => {
  try {
    const { days } = req.query;
    const revenues = financeService.getDailyRevenues(
      days ? parseInt(days as string) : undefined
    );

    const response: ApiResponse<DailyRevenue[]> = {
      code: 200,
      message: '获取成功',
      data: revenues,
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

router.get('/deposit-records', (req: Request, res: Response): void => {
  try {
    const { type, status } = req.query;
    const records = financeService.getDepositRecords(
      type as DepositType | undefined,
      status as string | undefined
    );

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

router.get('/deposit-records/user/:userId', (req: Request, res: Response): void => {
  try {
    const { userId } = req.params;
    const records = financeService.getDepositRecordsByUser(userId);

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

router.post('/deposit-records/:recordId/process', (req: Request, res: Response): void => {
  try {
    const { recordId } = req.params;
    const record = financeService.processDepositRefund(recordId);

    if (!record) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '处理失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<DepositRecord> = {
      code: 200,
      message: '处理成功',
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

router.get('/operating-costs', (req: Request, res: Response): void => {
  try {
    const { days } = req.query;
    const costs = financeService.getOperatingCosts(
      days ? parseInt(days as string) : undefined
    );

    const response: ApiResponse<OperatingCost[]> = {
      code: 200,
      message: '获取成功',
      data: costs,
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

router.get('/profit-reports', (req: Request, res: Response): void => {
  try {
    const reports = financeService.getProfitReports();

    const response: ApiResponse<ProfitReport[]> = {
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

router.get('/profit-reports/:month', (req: Request, res: Response): void => {
  try {
    const { month } = req.params;
    const report = financeService.getProfitReportByMonth(month);

    if (!report) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '报表不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<ProfitReport> = {
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

router.get('/total-deposit', (req: Request, res: Response): void => {
  try {
    const total = financeService.getTotalDepositAmount();

    const response: ApiResponse<number> = {
      code: 200,
      message: '获取成功',
      data: total,
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

router.get('/maintenance-costs', (req: Request, res: Response): void => {
  try {
    const total = financeService.getMaintenanceCosts();

    const response: ApiResponse<number> = {
      code: 200,
      message: '获取成功',
      data: total,
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
