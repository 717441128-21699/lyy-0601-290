import { User, UserRole, DepositRecord, DepositType, DepositStatus } from '@shared/types';
import { mockUsers, mockDepositRecords, generateId } from '../data/mockData.js';
import { configService } from './configService.js';

let users: User[] = [...mockUsers];
let depositRecords: DepositRecord[] = [...mockDepositRecords];

export const userService = {
  login(username: string, password: string, role: UserRole): User | null {
    const mockAccounts: Record<string, { userId: string; password: string }> = {
      'user001': { userId: 'user-001', password: '123456' },
      'user002': { userId: 'user-002', password: '123456' },
      'operator1': { userId: 'op-001', password: '123456' },
      'operator2': { userId: 'op-002', password: '123456' },
      'dispatcher1': { userId: 'disp-001', password: '123456' },
      'finance1': { userId: 'fin-001', password: '123456' },
      'admin1': { userId: 'admin-001', password: '123456' },
    };

    const account = mockAccounts[username];
    if (account && account.password === password) {
      const user = users.find(u => u.id === account.userId && u.role === role);
      if (user) return user;
    }

    const user = users.find(u => u.nickname === username && u.role === role);
    if (user) {
      return user;
    }
    const phoneUser = users.find(u => u.phone === username && u.role === role);
    if (phoneUser) {
      return phoneUser;
    }
    return null;
  },

  getUserById(userId: string): User | undefined {
    return users.find(u => u.id === userId);
  },

  getUserByPhone(phone: string): User | undefined {
    return users.find(u => u.phone === phone);
  },

  updateUser(userId: string, updates: Partial<User>): User | undefined {
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return undefined;
    users[index] = { ...users[index], ...updates };
    return users[index];
  },

  verifyRealName(userId: string, realName: string, idCard: string): User | undefined {
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return undefined;
    users[index] = {
      ...users[index],
      realNameVerified: true,
      realName,
      idCard,
    };
    return users[index];
  },

  getDepositAmountByCreditScore(creditScore: number): number {
    const creditConfig = configService.getCreditConfig();
    const tier = creditConfig.depositTiers.find(
      t => creditScore >= t.minScore && creditScore <= t.maxScore
    );
    return tier?.depositAmount ?? 299;
  },

  payDeposit(userId: string): { success: boolean; record?: DepositRecord; user?: User } {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false };
    if (user.depositPaid) return { success: false };

    const depositAmount = this.getDepositAmountByCreditScore(user.creditScore);
    const record: DepositRecord = {
      id: generateId(),
      userId: user.id,
      userName: user.nickname,
      type: 'deposit' as DepositType,
      amount: depositAmount,
      status: 'completed' as DepositStatus,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      completeTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    depositRecords.push(record);

    const userIndex = users.findIndex(u => u.id === userId);
    users[userIndex] = {
      ...user,
      depositPaid: true,
      depositAmount,
    };

    return { success: true, record, user: users[userIndex] };
  },

  refundDeposit(userId: string): { success: boolean; record?: DepositRecord; user?: User } {
    const user = users.find(u => u.id === userId);
    if (!user) return { success: false };
    if (!user.depositPaid) return { success: false };

    const record: DepositRecord = {
      id: generateId(),
      userId: user.id,
      userName: user.nickname,
      type: 'refund' as DepositType,
      amount: user.depositAmount,
      status: 'pending' as DepositStatus,
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    depositRecords.push(record);

    const userIndex = users.findIndex(u => u.id === userId);
    users[userIndex] = {
      ...user,
      depositPaid: false,
    };

    return { success: true, record, user: users[userIndex] };
  },

  getDepositRecordsByUser(userId: string): DepositRecord[] {
    return depositRecords.filter(r => r.userId === userId).sort((a, b) => 
      new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
    );
  },

  calculateCreditScore(userId: string, action: string): User | undefined {
    const user = users.find(u => u.id === userId);
    if (!user) return undefined;

    const creditConfig = configService.getCreditConfig();
    let scoreChange = 0;

    switch (action) {
      case 'complete_ride':
        scoreChange = creditConfig.completeRideBonus;
        break;
      case 'report_fault':
        scoreChange = creditConfig.reportFaultBonus;
        break;
      case 'overtime_parking':
        scoreChange = -creditConfig.overtimeParkingPenalty;
        break;
      case 'damage':
        scoreChange = -creditConfig.damagePenalty;
        break;
      case 'complaint':
        scoreChange = -creditConfig.complaintPenalty;
        break;
    }

    const newScore = Math.max(
      creditConfig.minScore,
      Math.min(creditConfig.maxScore, user.creditScore + scoreChange)
    );

    const index = users.findIndex(u => u.id === userId);
    users[index] = { ...user, creditScore: newScore };
    return users[index];
  },

  getAllUsers(role?: UserRole): User[] {
    if (role) {
      return users.filter(u => u.role === role);
    }
    return users;
  },

  createUser(userData: Omit<User, 'id'>): User {
    const newUser: User = {
      ...userData,
      id: generateId(),
    };
    users.push(newUser);
    return newUser;
  },

  deleteUser(userId: string): boolean {
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return false;
    users.splice(index, 1);
    return true;
  },
};
