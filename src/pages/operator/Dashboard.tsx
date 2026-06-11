import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  LayoutDashboard,
  BatteryCharging,
  AlertTriangle,
  CheckCircle,
  Bike,
  Zap,
  Wrench,
  FileText,
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react';
import type { SidebarItem } from '@/components/layout/Sidebar';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import type { BatteryTask, FaultReport, Bike as BikeType } from '@shared/types';

const operatorSidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: '运维看板', icon: LayoutDashboard, path: '/operator/dashboard' },
  { key: 'battery', label: '换电任务', icon: BatteryCharging, path: '/operator/battery-tasks' },
  { key: 'fault', label: '故障报修', icon: AlertTriangle, path: '/operator/fault-reports' },
  { key: 'maintenance', label: '维修记录', icon: Wrench, path: '/operator/maintenance-records' },
  { key: 'bikes', label: '车辆列表', icon: Bike, path: '/operator/bikes' },
];

interface StatsData {
  todayBatteryTasks: number;
  pendingFaults: number;
  completedTasks: number;
  totalBikes: number;
  taskProgress: number;
}

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData>({
    todayBatteryTasks: 0,
    pendingFaults: 0,
    completedTasks: 0,
    totalBikes: 0,
    taskProgress: 0,
  });
  const [recentTasks, setRecentTasks] = useState<BatteryTask[]>([]);
  const [recentFaults, setRecentFaults] = useState<FaultReport[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tasksRes, faultsRes, bikesRes] = await Promise.all([
          api.get<BatteryTask[]>('/operators/battery-tasks'),
          api.get<FaultReport[]>('/operators/fault-reports'),
          api.get<BikeType[]>('/bikes'),
        ]);

        const tasks = tasksRes.data || [];
        const faults = faultsRes.data || [];
        const bikes = bikesRes.data || [];

        const today = new Date().toISOString().split('T')[0];
        const todayTasks = tasks.filter(t => {
          if (!t.assignedTime) return false;
          return t.assignedTime.startsWith(today);
        });

        const completedToday = todayTasks.filter(t => t.status === 'completed').length;
        const totalToday = todayTasks.length;
        const progress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

        setStats({
          todayBatteryTasks: tasks.filter(t => t.status === 'pending' || t.status === 'assigned').length,
          pendingFaults: faults.filter(f => f.status === 'pending').length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          totalBikes: bikes.length,
          taskProgress: progress,
        });

        setRecentTasks(tasks.slice(0, 5));
        setRecentFaults(faults.slice(0, 3));
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
      pending: { variant: 'warning', label: '待分配' },
      assigned: { variant: 'primary', label: '已分配' },
      'in-progress': { variant: 'primary', label: '进行中' },
      completed: { variant: 'success', label: '已完成' },
    };
    const config = statusMap[status] || statusMap.pending;
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const getFaultStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
      pending: { variant: 'danger', label: '待处理' },
      processing: { variant: 'warning', label: '处理中' },
      resolved: { variant: 'success', label: '已解决' },
      closed: { variant: 'default', label: '已关闭' },
    };
    const config = statusMap[status] || statusMap.pending;
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <Layout title="运维看板" sidebarItems={operatorSidebarItems}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">欢迎回来，运维工程师</h2>
            <p className="text-gray-500 mt-1">{dateStr}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <Card hoverable padding="md" className="bg-gradient-to-br from-primary-50 to-primary-100">
                <CardContent className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-200">
                    <BatteryCharging className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">今日换电任务</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todayBatteryTasks}</p>
                    <p className="text-xs text-primary-600 mt-1">待处理</p>
                  </div>
                </CardContent>
              </Card>

              <Card hoverable padding="md" className="bg-gradient-to-br from-danger-50 to-danger-100">
                <CardContent className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-danger-500 flex items-center justify-center text-white shadow-lg shadow-danger-200">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">待处理故障</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingFaults}</p>
                    <p className="text-xs text-danger-600 mt-1">需及时处理</p>
                  </div>
                </CardContent>
              </Card>

              <Card hoverable padding="md" className="bg-gradient-to-br from-success-50 to-success-100">
                <CardContent className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success-500 flex items-center justify-center text-white shadow-lg shadow-success-200">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">已完成任务</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedTasks}</p>
                    <p className="text-xs text-success-600 mt-1">累计完成</p>
                  </div>
                </CardContent>
              </Card>

              <Card hoverable padding="md" className="bg-gradient-to-br from-secondary-50 to-secondary-100">
                <CardContent className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary-500 flex items-center justify-center text-white shadow-lg shadow-secondary-200">
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">负责车辆</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBikes}</p>
                    <p className="text-xs text-secondary-600 mt-1">总数</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card padding="md">
          <CardHeader>
            <CardTitle>今日任务进度</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-4 bg-gray-200 rounded-full animate-pulse w-3/4" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">完成进度</span>
                  <span className="font-semibold text-primary-600">{stats.taskProgress}%</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${stats.taskProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  继续加油，完成今日所有任务！
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card hoverable padding="md" className="cursor-pointer" onClick={() => navigate('/operator/battery-tasks')}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">换电任务</p>
                  <p className="text-xs text-gray-500">处理低电量车辆</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>

          <Card hoverable padding="md" className="cursor-pointer" onClick={() => navigate('/operator/fault-reports')}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center text-danger-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">故障报修</p>
                  <p className="text-xs text-gray-500">处理车辆故障</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>

          <Card hoverable padding="md" className="cursor-pointer" onClick={() => navigate('/operator/maintenance-records')}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center text-success-600">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">维修记录</p>
                  <p className="text-xs text-gray-500">查看维修历史</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>近期任务</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/operator/battery-tasks')}>
                查看全部
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              ) : recentTasks.length > 0 ? (
                recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/operator/battery-tasks')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                        <BatteryCharging className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{task.bikeNo}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{task.areaName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(task.status)}
                      <p className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        电量 {task.currentBattery}%
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">暂无任务</div>
              )}
            </CardContent>
          </Card>

          <Card padding="md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>故障提醒</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/operator/fault-reports')}>
                查看全部
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              ) : recentFaults.length > 0 ? (
                recentFaults.map((fault) => (
                  <div
                    key={fault.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/operator/fault-reports')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-danger-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{fault.bikeNo} - {fault.faultType}</p>
                        <p className="text-xs text-gray-500">{fault.reporterName} · {formatDate(fault.createTime)}</p>
                      </div>
                    </div>
                    {getFaultStatusBadge(fault.status)}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">暂无故障</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
