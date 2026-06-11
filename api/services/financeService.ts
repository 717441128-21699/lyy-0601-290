import { FinanceOverview, DailyRevenue, DepositRecord, OperatingCost, ProfitReport, DepositType } from '../../shared/types.js';
import { mockDailyRevenues, mockOperatingCosts, mockProfitReports, mockDepositRecords } from '../data/mockData.js';
import { userService } from './userService.js';
import { operatorService } from './operatorService.js';

let dailyRevenues: DailyRevenue[] = [...mockDailyRevenues];
let operatingCosts: OperatingCost[] = [...mockOperatingCosts];
let profitReports: ProfitReport[] = [...mockProfitReports];
let depositRecords: DepositRecord[] = [...mockDepositRecords];

export const financeService = {
  getFinanceOverview(): FinanceOverview {
    const todayRevenue = dailyRevenues[dailyRevenues.length - 1]?.revenue ?? 0;
    const todayOrders = dailyRevenues[dailyRevenues.length - 1]?.orders ?? 0;
    const todayCost = operatingCosts[operatingCosts.length - 1]?.totalCost ?? 0;

    const todayDepositIn = depositRecords.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.type === 'deposit' && r.createTime.startsWith(today) && r.status === 'completed';
    }).reduce((sum, r) => sum + r.amount, 0);

    const todayDepositOut = depositRecords.filter(r => {
      const today = new Date().toISOString().split('T')[0];
      return r.type === 'refund' && r.createTime.startsWith(today) && r.status === 'completed';
    }).reduce((sum, r) => sum + r.amount, 0);

    const monthRevenue = dailyRevenues.reduce((sum, d) => sum + d.revenue, 0);
    const monthOrders = dailyRevenues.reduce((sum, d) => sum + d.orders, 0);
    const monthCost = operatingCosts.reduce((sum, d) => sum + d.totalCost, 0);

    return {
      todayRevenue,
      todayOrders,
      todayDepositIn,
      todayDepositOut,
      monthRevenue,
      monthOrders,
      todayCost,
      monthCost,
    };
  },

  getDailyRevenues(days?: number): DailyRevenue[] {
    if (days && days > 0) {
      return dailyRevenues.slice(-days);
    }
    return dailyRevenues;
  },

  getDepositRecords(type?: DepositType, status?: string): DepositRecord[] {
    let records = depositRecords;
    if (type) {
      records = records.filter(r => r.type === type);
    }
    if (status) {
      records = records.filter(r => r.status === status);
    }
    return records.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  },

  getDepositRecordsByUser(userId: string): DepositRecord[] {
    return depositRecords
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
  },

  getOperatingCosts(days?: number): OperatingCost[] {
    if (days && days > 0) {
      return operatingCosts.slice(-days);
    }
    return operatingCosts;
  },

  getProfitReports(): ProfitReport[] {
    return profitReports.sort((a, b) => b.month.localeCompare(a.month));
  },

  getProfitReportByMonth(month: string): ProfitReport | undefined {
    return profitReports.find(p => p.month === month);
  },

  processDepositRefund(recordId: string): DepositRecord | undefined {
    const index = depositRecords.findIndex(r => r.id === recordId && r.type === 'refund' && r.status === 'pending');
    if (index === -1) return undefined;

    depositRecords[index] = {
      ...depositRecords[index],
      status: 'completed',
      completeTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    return depositRecords[index];
  },

  addDailyRevenue(date: string, revenue: number, orders: number): DailyRevenue {
    const avgOrderAmount = orders > 0 ? Math.round((revenue / orders) * 100) / 100 : 0;
    const record: DailyRevenue = { date, revenue, orders, avgOrderAmount };
    dailyRevenues.push(record);
    return record;
  },

  addOperatingCost(cost: OperatingCost): OperatingCost {
    operatingCosts.push(cost);
    return cost;
  },

  getTotalDepositAmount(): number {
    const users = userService.getAllUsers('user');
    return users.filter(u => u.depositPaid).reduce((sum, u) => sum + u.depositAmount, 0);
  },

  getMaintenanceCosts(): number {
    const records = operatorService.getMaintenanceRecords();
    return records.reduce((sum, r) => sum + r.cost, 0);
  },
};
