import { SystemConfig, CityStats, User, UserRole } from '../../shared/types.js';
import { mockCityStats } from '../data/mockData.js';
import { configService } from './configService.js';
import { userService } from './userService.js';
import { bikeService } from './bikeService.js';
import { orderService } from './orderService.js';
import { financeService } from './financeService.js';

export const adminService = {
  getSystemConfig(): SystemConfig {
    return configService.getSystemConfig();
  },

  updateSystemConfig(config: Partial<SystemConfig>): SystemConfig {
    return configService.updateSystemConfig(config);
  },

  getCityStats(): CityStats[] {
    return mockCityStats;
  },

  getCityStatsById(cityId: string): CityStats | undefined {
    return mockCityStats.find(c => c.cityId === cityId);
  },

  getDashboardStats() {
    const totalBikes = bikeService.getAllBikes().length;
    const availableBikes = bikeService.getAllBikes('available').length;
    const inUseBikes = bikeService.getAllBikes('in-use').length;
    const faultBikes = bikeService.getAllBikes('fault').length;
    const totalUsers = userService.getAllUsers('user').length;
    const totalOrders = orderService.getAllOrders().length;
    const todayOrders = orderService.getTodayOrderCount();
    const todayRevenue = orderService.getTodayRevenue();
    const financeOverview = financeService.getFinanceOverview();

    return {
      totalBikes,
      availableBikes,
      inUseBikes,
      faultBikes,
      totalUsers,
      totalOrders,
      todayOrders,
      todayRevenue,
      financeOverview,
    };
  },

  getUserList(page: number = 1, pageSize: number = 20, role?: UserRole, keyword?: string) {
    let users = userService.getAllUsers(role);

    if (keyword) {
      users = users.filter(u =>
        u.nickname.includes(keyword) ||
        u.phone.includes(keyword) ||
        (u.realName && u.realName.includes(keyword))
      );
    }

    const total = users.length;
    const startIndex = (page - 1) * pageSize;
    const list = users.slice(startIndex, startIndex + pageSize);

    return {
      total,
      page,
      pageSize,
      list,
    };
  },

  addUser(userData: Omit<User, 'id'>): User {
    return userService.createUser(userData);
  },

  updateUser(userId: string, updates: Partial<User>): User | undefined {
    return userService.updateUser(userId, updates);
  },

  deleteUser(userId: string): boolean {
    return userService.deleteUser(userId);
  },

  adjustUserCredit(userId: string, scoreChange: number): User | undefined {
    const user = userService.getUserById(userId);
    if (!user) return undefined;

    const creditConfig = configService.getCreditConfig();
    const newScore = Math.max(
      creditConfig.minScore,
      Math.min(creditConfig.maxScore, user.creditScore + scoreChange)
    );

    return userService.updateUser(userId, { creditScore: newScore });
  },

  getOperatorStats() {
    const operators = userService.getAllUsers('operator');
    return {
      total: operators.length,
      online: Math.floor(operators.length * 0.7),
      onTask: Math.floor(operators.length * 0.4),
    };
  },

  getSystemHealth() {
    const totalBikes = bikeService.getAllBikes().length;
    const faultBikes = bikeService.getAllBikes('fault').length;
    const maintenanceBikes = bikeService.getAllBikes('maintenance').length;

    return {
      bikeHealthRate: totalBikes > 0 ? Math.round((totalBikes - faultBikes - maintenanceBikes) / totalBikes * 10000) / 100 : 100,
      faultRate: totalBikes > 0 ? Math.round(faultBikes / totalBikes * 10000) / 100 : 0,
      maintenanceRate: totalBikes > 0 ? Math.round(maintenanceBikes / totalBikes * 10000) / 100 : 0,
    };
  },
};
