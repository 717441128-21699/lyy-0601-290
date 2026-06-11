export type UserRole = 'user' | 'operator' | 'dispatcher' | 'finance' | 'admin';

export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar: string;
  realNameVerified: boolean;
  creditScore: number;
  depositAmount: number;
  depositPaid: boolean;
  role: UserRole;
  realName?: string;
  idCard?: string;
}

export type BikeStatus = 'available' | 'in-use' | 'low-battery' | 'fault' | 'maintenance';

export interface Bike {
  id: string;
  bikeNo: string;
  status: BikeStatus;
  battery: number;
  lng: number;
  lat: number;
  distance?: number;
  areaId: string;
  areaName: string;
  lastMaintenanceTime?: string;
  totalRides: number;
  faultCount: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  bikeId: string;
  bikeNo: string;
  status: 'ongoing' | 'completed' | 'cancelled';
  startTime: string;
  endTime?: string;
  duration: number;
  distance: number;
  startLng: number;
  startLat: number;
  endLng?: number;
  endLat?: number;
  baseFee: number;
  durationFee: number;
  distanceFee: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
}

export interface RidingData {
  orderId: string;
  duration: number;
  distance: number;
  estimatedCost: number;
  currentBattery: number;
  currentLng: number;
  currentLat: number;
}

export type BatteryTaskStatus = 'pending' | 'assigned' | 'in-progress' | 'completed';

export interface BatteryTask {
  id: string;
  bikeId: string;
  bikeNo: string;
  operatorId?: string;
  operatorName?: string;
  status: BatteryTaskStatus;
  currentBattery: number;
  targetBattery?: number;
  lng: number;
  lat: number;
  areaName: string;
  assignedTime?: string;
  startTime?: string;
  completeTime?: string;
}

export type FaultStatus = 'pending' | 'processing' | 'resolved' | 'closed';

export interface FaultReport {
  id: string;
  bikeId: string;
  bikeNo: string;
  reporterId: string;
  reporterName: string;
  reporterType: 'user' | 'operator' | 'system';
  faultType: string;
  description: string;
  images: string[];
  status: FaultStatus;
  createTime: string;
  handlerId?: string;
  handlerName?: string;
  handleTime?: string;
  handleResult?: string;
  areaName: string;
}

export interface MaintenanceRecord {
  id: string;
  bikeId: string;
  bikeNo: string;
  faultReportId?: string;
  operatorId: string;
  operatorName: string;
  maintenanceType: string;
  description: string;
  partsReplaced: string[];
  cost: number;
  createTime: string;
}

export type DemandLevel = 'low' | 'medium' | 'high' | 'very-high';

export interface HeatmapData {
  areaId: string;
  areaName: string;
  bikeCount: number;
  demandLevel: DemandLevel;
  demandCount: number;
  centerLng: number;
  centerLat: number;
}

export type DispatchPriority = 'high' | 'medium' | 'low';
export type SuggestionStatus = 'pending' | 'confirmed' | 'rejected' | 'completed';

export interface DispatchSuggestion {
  id: string;
  fromAreaId: string;
  fromAreaName: string;
  toAreaId: string;
  toAreaName: string;
  bikeCount: number;
  reason: string;
  priority: DispatchPriority;
  createTime: string;
  status: SuggestionStatus;
}

export type DispatchTaskStatus = 'pending' | 'in-progress' | 'completed';

export interface DispatchTask {
  id: string;
  suggestionId?: string;
  fromAreaId: string;
  fromAreaName: string;
  toAreaId: string;
  toAreaName: string;
  bikeCount: number;
  status: DispatchTaskStatus;
  assignedStaff: string[];
  assignedStaffNames: string[];
  createTime: string;
  completeTime?: string;
}

export interface FinanceOverview {
  todayRevenue: number;
  todayOrders: number;
  todayDepositIn: number;
  todayDepositOut: number;
  monthRevenue: number;
  monthOrders: number;
  todayCost: number;
  monthCost: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
  avgOrderAmount: number;
}

export type DepositType = 'deposit' | 'refund';
export type DepositStatus = 'pending' | 'completed' | 'failed';

export interface DepositRecord {
  id: string;
  userId: string;
  userName: string;
  type: DepositType;
  amount: number;
  status: DepositStatus;
  createTime: string;
  completeTime?: string;
}

export interface OperatingCost {
  date: string;
  batteryCost: number;
  maintenanceCost: number;
  staffCost: number;
  otherCost: number;
  totalCost: number;
}

export interface ProfitReport {
  month: string;
  totalRevenue: number;
  orderRevenue: number;
  depositIncome: number;
  totalCost: number;
  batteryCost: number;
  maintenanceCost: number;
  staffCost: number;
  otherCost: number;
  netProfit: number;
  profitMargin: number;
}

export type ComplaintType = 'bike-fault' | 'billing-dispute' | 'other';
export type ComplaintStatus = 'pending' | 'processing' | 'resolved' | 'closed';

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  orderId?: string;
  type: ComplaintType;
  title: string;
  description: string;
  images: string[];
  status: ComplaintStatus;
  handlerId?: string;
  handlerName?: string;
  handleResult?: string;
  userConfirmed: boolean;
  createTime: string;
  handleTime?: string;
  closeTime?: string;
}

export type NotificationType = 'unlock' | 'order-complete' | 'battery-task' | 'fault' | 'dispatch' | 'complaint' | 'system';

export interface Notification {
  id: string;
  userId: string;
  userRole: UserRole;
  type: NotificationType;
  title: string;
  content: string;
  relatedId?: string;
  relatedType?: string;
  read: boolean;
  createTime: string;
}

export interface PricingConfig {
  baseFee: number;
  baseDuration: number;
  durationFee: number;
  distanceFee: number;
  maxDailyFee: number;
  freeDuration: number;
}

export interface DepositTier {
  minScore: number;
  maxScore: number;
  depositAmount: number;
}

export interface CreditConfig {
  initialScore: number;
  minScore: number;
  maxScore: number;
  completeRideBonus: number;
  reportFaultBonus: number;
  overtimeParkingPenalty: number;
  damagePenalty: number;
  complaintPenalty: number;
  depositTiers: DepositTier[];
}

export interface DispatchConfig {
  lowBatteryThreshold: number;
  batteryTaskBatchSize: number;
  demandPredictionDays: number;
  heatmapUpdateInterval: number;
  highDensityThreshold: number;
  lowDensityThreshold: number;
}

export interface SystemConfig {
  pricing: PricingConfig;
  credit: CreditConfig;
  dispatch: DispatchConfig;
}

export interface CityStats {
  cityId: string;
  cityName: string;
  totalBikes: number;
  turnoverRate: number;
  faultRate: number;
  satisfactionRate: number;
  avgDailyOrders: number;
  avgRevenuePerBike: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface LoginRequest {
  role: UserRole;
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UnlockRequest {
  bikeId: string;
}

export interface UnlockResponse {
  success: boolean;
  orderId?: string;
  message?: string;
  recommendedBikes?: Bike[];
}

export interface CreateComplaintRequest {
  type: ComplaintType;
  orderId?: string;
  title: string;
  description: string;
  images: string[];
}
