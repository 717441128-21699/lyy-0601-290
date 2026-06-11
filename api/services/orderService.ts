import { Order, RidingData, Bike } from '@shared/types';
import { mockOrders, generateId } from '../data/mockData.js';
import { bikeService } from './bikeService.js';
import { userService } from './userService.js';
import { configService } from './configService.js';
import { notificationService } from './notificationService.js';

let orders: Order[] = [...mockOrders];

const calculateCost = (duration: number, distance: number): { baseFee: number; durationFee: number; distanceFee: number; discount: number; totalAmount: number } => {
  const pricing = configService.getPricingConfig();
  const durationMinutes = Math.ceil(duration / 60);

  const baseFee = pricing.baseFee;
  let durationFee = 0;
  if (durationMinutes > pricing.freeDuration) {
    const chargeableMinutes = Math.max(0, durationMinutes - pricing.baseDuration);
    durationFee = Math.ceil(chargeableMinutes / 15) * pricing.durationFee * 3;
  }
  const distanceFee = Math.round((distance / 1000) * pricing.distanceFee * 100) / 100;

  const totalAmount = Math.min(pricing.maxDailyFee, baseFee + durationFee + distanceFee);

  return {
    baseFee,
    durationFee,
    distanceFee,
    discount: 0,
    totalAmount: Math.round(totalAmount * 100) / 100,
  };
};

export const orderService = {
  createOrder(userId: string, bikeId: string): { success: boolean; order?: Order; message?: string; recommendedBikes?: Bike[] } {
    const bike = bikeService.getBikeById(bikeId);
    const user = userService.getUserById(userId);
    const dispatchConfig = configService.getDispatchConfig();

    if (!user) {
      return { success: false, message: '用户不存在' };
    }

    if (!bike) {
      return { success: false, message: '车辆不存在' };
    }

    if (bike.status === 'fault' || bike.status === 'maintenance') {
      const nearbyBikes = bikeService.getNearbyBikes(bike.lng, bike.lat, 500, 'available');
      return { success: false, message: '车辆故障或维护中，暂不可用', recommendedBikes: nearbyBikes.slice(0, 3) };
    }

    if (bike.status === 'in-use') {
      const nearbyBikes = bikeService.getNearbyBikes(bike.lng, bike.lat, 500, 'available');
      return { success: false, message: '车辆正在使用中', recommendedBikes: nearbyBikes.slice(0, 3) };
    }

    if (bike.battery < dispatchConfig.lowBatteryThreshold) {
      const nearbyBikes = bikeService.getNearbyBikes(bike.lng, bike.lat, 500, 'available');
      bikeService.updateBikeStatus(bikeId, 'low-battery');
      return { 
        success: false, 
        message: `车辆电量过低（${bike.battery}%），已自动锁定。为您推荐附近可用车辆`, 
        recommendedBikes: nearbyBikes.slice(0, 5) 
      };
    }

    if (!user.depositPaid) {
      return { success: false, message: '请先缴纳押金' };
    }

    if (!user.realNameVerified) {
      return { success: false, message: '请先完成实名认证' };
    }

    const existingOngoingOrder = orders.find(o => o.userId === userId && o.status === 'ongoing');
    if (existingOngoingOrder) {
      return { success: false, message: '您有进行中的订单，请先结束骑行' };
    }

    bikeService.updateBikeStatus(bikeId, 'in-use');
    bikeService.incrementRideCount(bikeId);

    const newOrder: Order = {
      id: generateId(),
      userId,
      userName: user.nickname,
      bikeId,
      bikeNo: bike.bikeNo,
      status: 'ongoing',
      startTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      duration: 0,
      distance: 0,
      startLng: bike.lng,
      startLat: bike.lat,
      baseFee: configService.getPricingConfig().baseFee,
      durationFee: 0,
      distanceFee: 0,
      discount: 0,
      totalAmount: configService.getPricingConfig().baseFee,
      paidAmount: 0,
    };

    orders.push(newOrder);

    notificationService.pushNotification(
      userId,
      'user',
      'unlock',
      '开锁成功',
      '您的车辆已开锁，祝您骑行愉快',
      newOrder.id,
      'order'
    );

    return { success: true, order: newOrder };
  },

  getOrderById(orderId: string): Order | undefined {
    return orders.find(o => o.id === orderId);
  },

  getOrdersByUser(userId: string, status?: string): Order[] {
    let userOrders = orders.filter(o => o.userId === userId);
    if (status) {
      userOrders = userOrders.filter(o => o.status === status);
    }
    return userOrders.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  },

  getOngoingOrder(userId: string): Order | undefined {
    return orders.find(o => o.userId === userId && o.status === 'ongoing');
  },

  getRidingData(orderId: string): RidingData | null {
    const order = orders.find(o => o.id === orderId && o.status === 'ongoing');
    if (!order) return null;

    const bike = bikeService.getBikeById(order.bikeId);
    const startTime = new Date(order.startTime).getTime();
    const now = Date.now();
    const duration = Math.floor((now - startTime) / 1000);
    const distance = order.distance + Math.floor(Math.random() * 50);
    const cost = calculateCost(duration, distance);

    return {
      orderId,
      duration,
      distance,
      estimatedCost: cost.totalAmount,
      currentBattery: bike?.battery ?? 0,
      currentLng: bike?.lng ?? order.startLng,
      currentLat: bike?.lat ?? order.startLat,
    };
  },

  endRide(orderId: string, endLng: number, endLat: number): { success: boolean; order?: Order; message?: string } {
    const index = orders.findIndex(o => o.id === orderId && o.status === 'ongoing');
    if (index === -1) {
      return { success: false, message: '订单不存在或已结束' };
    }

    const order = orders[index];
    const bike = bikeService.getBikeById(order.bikeId);

    const startTime = new Date(order.startTime).getTime();
    const now = Date.now();
    const duration = Math.floor((now - startTime) / 1000);
    const distance = order.distance + Math.floor(Math.random() * 200) + 500;

    const cost = calculateCost(duration, distance);

    const endTime = new Date().toISOString().replace('T', ' ').substring(0, 19);

    orders[index] = {
      ...order,
      status: 'completed',
      endTime,
      duration,
      distance,
      endLng,
      endLat,
      ...cost,
      paidAmount: cost.totalAmount,
    };

    bikeService.updateBikeLocation(order.bikeId, endLng, endLat);
    bikeService.updateBikeStatus(order.bikeId, 'available');

    userService.calculateCreditScore(order.userId, 'complete_ride');

    const durationMinutes = Math.ceil(duration / 60);
    const durationText = durationMinutes >= 60
      ? `${Math.floor(durationMinutes / 60)}小时${durationMinutes % 60}分钟`
      : `${durationMinutes}分钟`;
    const amount = orders[index].totalAmount.toFixed(2);

    notificationService.pushNotification(
      order.userId,
      'user',
      'order-complete',
      '骑行结束',
      `您的骑行已结束，时长${durationText}，费用${amount}元`,
      order.id,
      'order'
    );

    return { success: true, order: orders[index] };
  },

  getAllOrders(status?: string, userId?: string): Order[] {
    let result = orders;
    if (status) {
      result = result.filter(o => o.status === status);
    }
    if (userId) {
      result = result.filter(o => o.userId === userId);
    }
    return result.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  },

  getTodayOrderCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return orders.filter(o => o.startTime.startsWith(today.replace(/-/g, '-'))).length;
  },

  getTodayRevenue(): number {
    const today = new Date().toISOString().split('T')[0];
    return orders
      .filter(o => o.startTime.startsWith(today) && o.status === 'completed')
      .reduce((sum, o) => sum + o.paidAmount, 0);
  },
};
