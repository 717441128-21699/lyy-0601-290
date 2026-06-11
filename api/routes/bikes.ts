import { Router, type Request, type Response } from 'express';
import { bikeService } from '../services/bikeService.js';
import { ApiResponse, Bike, BikeStatus } from '@shared/types';

const router = Router();

router.get('/', (req: Request, res: Response): void => {
  try {
    const { status, areaId } = req.query;
    const bikes = bikeService.getAllBikes(
      status as BikeStatus | undefined,
      areaId as string | undefined
    );

    const response: ApiResponse<Bike[]> = {
      code: 200,
      message: '获取成功',
      data: bikes,
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

router.get('/nearby', (req: Request, res: Response): void => {
  try {
    const { lng, lat, radius, status } = req.query;

    if (!lng || !lat) {
      const response: ApiResponse<null> = {
        code: 400,
        message: '缺少位置参数',
        data: null,
      };
      res.status(400).json(response);
      return;
    }

    const bikes = bikeService.getNearbyBikes(
      parseFloat(lng as string),
      parseFloat(lat as string),
      radius ? parseInt(radius as string) : 1000,
      status as BikeStatus | undefined
    );

    const response: ApiResponse<Bike[]> = {
      code: 200,
      message: '获取成功',
      data: bikes,
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

router.get('/:bikeId', (req: Request, res: Response): void => {
  try {
    const { bikeId } = req.params;
    const bike = bikeService.getBikeById(bikeId);

    if (!bike) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '车辆不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Bike> = {
      code: 200,
      message: '获取成功',
      data: bike,
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

router.put('/:bikeId/status', (req: Request, res: Response): void => {
  try {
    const { bikeId } = req.params;
    const { status } = req.body;
    const bike = bikeService.updateBikeStatus(bikeId, status);

    if (!bike) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '车辆不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Bike> = {
      code: 200,
      message: '状态更新成功',
      data: bike,
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

router.put('/:bikeId/location', (req: Request, res: Response): void => {
  try {
    const { bikeId } = req.params;
    const { lng, lat } = req.body;
    const bike = bikeService.updateBikeLocation(bikeId, lng, lat);

    if (!bike) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '车辆不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Bike> = {
      code: 200,
      message: '位置更新成功',
      data: bike,
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

router.put('/:bikeId/battery', (req: Request, res: Response): void => {
  try {
    const { bikeId } = req.params;
    const { battery } = req.body;
    const bike = bikeService.updateBattery(bikeId, battery);

    if (!bike) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '车辆不存在',
        data: null,
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Bike> = {
      code: 200,
      message: '电量更新成功',
      data: bike,
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
    const bikeData = req.body;
    const bike = bikeService.createBike(bikeData);

    const response: ApiResponse<Bike> = {
      code: 201,
      message: '创建成功',
      data: bike,
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

router.delete('/:bikeId', (req: Request, res: Response): void => {
  try {
    const { bikeId } = req.params;
    const success = bikeService.deleteBike(bikeId);

    if (!success) {
      const response: ApiResponse<null> = {
        code: 404,
        message: '车辆不存在',
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

export default router;
