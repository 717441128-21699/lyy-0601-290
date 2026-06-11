import { Router, type Request, type Response } from 'express';
import { complaintService } from '../services/complaintService.js';
import { ApiResponse, Complaint, ComplaintType, ComplaintStatus, CreateComplaintRequest } from '../../shared/types.js';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const { status, type } = req.query;
    const complaints = complaintService.getAllComplaints(
      status as ComplaintStatus | undefined,
      type as ComplaintType | undefined
    );

    const response: ApiResponse<Complaint[]> = {
      code: 200,
      message: '获取成功',
      data: complaints,
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
    const { userId, userName, type, title, description, images, orderId }: CreateComplaintRequest & { userId: string; userName: string; orderId?: string } = req.body;

    if (!userId || !userName || !type || !title || !description) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '缺少必要参数',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const complaint = complaintService.createComplaint(
      userId,
      userName,
      type,
      title,
      description,
      images || [],
      orderId
    );

    const response: ApiResponse<Complaint> = {
      code: 201,
      message: '提交成功',
      data: complaint,
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

router.get('/stats', (req: Request, res: Response): void => {
  try {
    const stats = {
      pending: complaintService.getPendingCount(),
      processing: complaintService.getProcessingCount(),
      resolved: complaintService.getResolvedCount(),
    };

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

router.get('/:complaintId', (req: Request, res: Response): void => {
  try {
    const { complaintId } = req.params;
    const complaint = complaintService.getComplaintById(complaintId);

    if (!complaint) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '投诉不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Complaint> = {
      code: 200,
      message: '获取成功',
      data: complaint,
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
    const complaints = complaintService.getComplaintsByUser(
      userId,
      status as ComplaintStatus | undefined
    );

    const response: ApiResponse<Complaint[]> = {
      code: 200,
      message: '获取成功',
      data: complaints,
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

router.post('/:complaintId/handle', (req: Request, res: Response): void => {
  try {
    const { complaintId } = req.params;
    const { handlerId, handlerName } = req.body;
    const complaint = complaintService.handleComplaint(complaintId, handlerId, handlerName);

    if (!complaint) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '处理失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<Complaint> = {
      code: 200,
      message: '处理成功',
      data: complaint,
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

router.post('/:complaintId/resolve', (req: Request, res: Response): void => {
  try {
    const { complaintId } = req.params;
    const { handleResult } = req.body;
    const complaint = complaintService.resolveComplaint(complaintId, handleResult);

    if (!complaint) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '解决失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<Complaint> = {
      code: 200,
      message: '解决成功',
      data: complaint,
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

router.post('/:complaintId/user-confirm', (req: Request, res: Response): void => {
  try {
    const { complaintId } = req.params;
    const complaint = complaintService.userConfirmComplaint(complaintId);

    if (!complaint) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '确认失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<Complaint> = {
      code: 200,
      message: '确认成功',
      data: complaint,
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

router.post('/:complaintId/close', (req: Request, res: Response): void => {
  try {
    const { complaintId } = req.params;
    const complaint = complaintService.closeComplaint(complaintId);

    if (!complaint) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '关闭失败',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const response: ApiResponse<Complaint> = {
      code: 200,
      message: '关闭成功',
      data: complaint,
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
