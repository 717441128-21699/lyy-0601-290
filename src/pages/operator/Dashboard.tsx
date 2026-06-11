import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Select from '@/components/ui/Select';
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
  Truck,
  Filter,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import type { SidebarItem } from '@/components/layout/Sidebar';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import type { BatteryTask, FaultReport, Bike as BikeType, DispatchTask, DispatchTaskStatus, BatteryTaskStatus, FaultStatus } from '@shared/types';

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
  pendingDispatchTasks: number;
  completedTasks: number;
  totalBikes: number;
  taskProgress: number;
}

type TodoItem = {
  id: string;
  type: 'battery' | 'fault' | 'dispatch';
  title: string;
  subtitle: string;
  area?: string;
  status: string;
  urgency: 'high' | 'medium' | 'low';
  time: string;
};

const urgencyColors: Record<string, string> = {
  high: 'bg-danger-100 text-danger-600 border-danger-200',
  medium: 'bg-warning-100 text-warning-600 border-warning-200',
  low: 'bg-primary-100 text-primary-600 border-primary-200',
};

const urgencyLabels: Record<string, string> = {
  high: '紧急',
  medium: '重要',
  low: '普通',
};

const typeIcons = {
  battery: Zap,
  fault: AlertTriangle,
  dispatch: Truck,
};

const typeColors: Record<string, string> = {
  battery: 'bg-warning-100 text-warning-600',
  fault: 'bg-danger-100 text-danger-600',
  dispatch: 'bg-secondary-100 text-secondary-600',
};

const typeLabels: Record<string, string> = {
  battery: '换电',
  fault: '故障',
  dispatch: '调度',
};

export default function OperatorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [todoFilter, setTodoFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [stats, setStats] = useState<StatsData>({
    todayBatteryTasks: 0,
    pendingFaults: 0,
    pendingDispatchTasks: 0,
    completedTasks: 0,
    totalBikes: 0,
    taskProgress: 0,
  });
  const [batteryTasks, setBatteryTasks] = useState<BatteryTask[]>([]);
  const [faultReports, setFaultReports] = useState<FaultReport[]>([]);
  const [dispatchTasks, setDispatchTasks] = useState<DispatchTask[]>([]);
  const [areas, setAreas] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const reqs: Promise<any>[] = [
          api.get<BatteryTask[]>('/operators/battery-tasks'),
          api.get<FaultReport[]>('/operators/fault-reports'),
          api.get<BikeType[]>('/bikes'),
        ];
        if (user?.id) {
          reqs.push(api.get<DispatchTask[]>('/dispatch/tasks', { operatorId: user.id }));
        }
        const [tasksRes, faultsRes, bikesRes, dispatchRes] = await Promise.all(reqs);

        const tasks = tasksRes.data || [];
        const faults = faultsRes.data || [];
        const bikes = bikesRes.data || [];
        const dispatches = dispatchRes?.data || [];

        const today = new Date().toISOString().split('T')[0];
        const todayTasks = tasks.filter(t => {
          if (!t.assignedTime) return false;
          return t.assignedTime.startsWith(today);
        });

        const completedToday = todayTasks.filter(t => t.status === 'completed').length;
        const totalToday = todayTasks.length;
        const progress = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

        const pendingDispatches = dispatches.filter(d => d.status === 'pending' || d.status === 'in-progress');

        setStats({
          todayBatteryTasks: tasks.filter(t => t.status === 'pending' || t.status === 'assigned').length,
          pendingFaults: faults.filter(f => f.status === 'pending' || f.status === 'processing').length,
          pendingDispatchTasks: pendingDispatches.length,
          completedTasks: tasks.filter(t => t.status === 'completed').length,
          totalBikes: bikes.length,
          taskProgress: progress,
        });

        setBatteryTasks(tasks.slice(0, 10));
        setFaultReports(faults.slice(0, 10));
        setDispatchTasks(dispatches);

        const allAreas = new Set<string>();
        tasks.forEach(t => t.areaName && allAreas.add(t.areaName));
        faults.forEach(f => f.areaName && allAreas.add(f.areaName));
        dispatches.forEach(d => {
          d.fromAreaName && allAreas.add(d.fromAreaName);
          d.toAreaName && allAreas.add(d.toAreaName);
        });
        setAreas(Array.from(allAreas));
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const buildTodoList = (): TodoItem[] => {
    const todos: TodoItem[] = [];

    batteryTasks
      .filter(t => t.status === 'pending' || t.status === 'assigned' || t.status === 'in-progress')
      .forEach(t => {
        const urgency = (t.currentBattery || 0) < 10 ? 'high' : (t.currentBattery || 0) < 20 ? 'medium' : 'low';
        todos.push({
          id: `battery-${t.id}`,
          type: 'battery',
          title: `${t.bikeNo} 换电`,
          subtitle: `当前电量 ${t.currentBattery}%`,
          area: t.areaName,
          status: t.status,
          urgency,
          time: t.assignedTime || t.startTime || t.completeTime || new Date().toISOString(),
        });
      });

    faultReports
      .filter(f => f.status === 'pending' || f.status === 'processing')
      .forEach(f => {
        const urgency = f.status === 'pending' ? 'high' : 'medium';
        todos.push({
          id: `fault-${f.id}`,
          type: 'fault',
          title: `${f.bikeNo} - ${f.faultType}`,
          subtitle: f.description || '',
          area: f.areaName,
          status: f.status,
          urgency,
          time: f.createTime,
        });
      });

    dispatchTasks
      .filter(d => d.status === 'pending' || d.status === 'in-progress')
      .forEach(d => {
        const urgency = d.bikeCount > 5 ? 'high' : d.bikeCount > 2 ? 'medium' : 'low';
        todos.push({
          id: `dispatch-${d.id}`,
          type: 'dispatch',
          title: `${d.fromAreaName} → ${d.toAreaName}`,
          subtitle: `调度 ${d.bikeCount} 辆车`,
          area: d.fromAreaName,
          status: d.status,
          urgency,
          time: d.createTime,
        });
      });

    let filtered = todos;
    if (todoFilter !== 'all') {
      filtered = filtered.filter(t => t.type === todoFilter);
    }
    if (areaFilter) {
      filtered = filtered.filter(t => t.area === areaFilter);
    }
    if (urgencyFilter) {
      filtered = filtered.filter(t => t.urgency === urgencyFilter);
    }

    const urgencyOrder = { high: 0, medium: 1, low: 2 };
    return filtered.sort((a, b) => {
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      }
      return new Date(a.time).getTime() - new Date(b.time).getTime();
    });
  };

  const handleTodoClick = (todo: TodoItem) => {
    if (todo.type === 'battery') {
      navigate(`/operator/battery-task/${todo.id.replace('battery-', '')}`);
    } else if (todo.type === 'fault') {
      navigate(`/operator/fault/${todo.id.replace('fault-', '')}`);
    } else if (todo.type === 'dispatch') {
      navigate(`/operator/dispatch-task/${todo.id.replace('dispatch-', '')}`);
    }
  };

  const getTodoStatusBadge = (type: string, status: string) => {
    if (type === 'battery') {
      const statusMap: Record<BatteryTaskStatus, { variant: any; label: string }> = {
        pending: { variant: 'warning', label: '待分配' },
        assigned: { variant: 'primary', label: '已分配' },
        'in-progress': { variant: 'primary', label: '进行中' },
        completed: { variant: 'success', label: '已完成' },
      };
      const config = statusMap[status as BatteryTaskStatus] || statusMap.pending;
      return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
    } else if (type === 'fault') {
      const statusMap: Record<FaultStatus, { variant: any; label: string }> = {
        pending: { variant: 'danger', label: '待处理' },
        processing: { variant: 'warning', label: '处理中' },
        resolved: { variant: 'success', label: '已解决' },
        closed: { variant: 'default', label: '已关闭' },
      };
      const config = statusMap[status as FaultStatus] || statusMap.pending;
      return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
    } else {
      const statusMap: Record<DispatchTaskStatus, { variant: any; label: string }> = {
        pending: { variant: 'warning', label: '待执行' },
        'in-progress': { variant: 'primary', label: '执行中' },
        completed: { variant: 'success', label: '已完成' },
      };
      const config = statusMap[status as DispatchTaskStatus] || statusMap.pending;
      return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
    }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  const todoTabs = [
    { key: 'all', label: '全部' },
    { key: 'battery', label: '换电' },
    { key: 'fault', label: '故障' },
    { key: 'dispatch', label: '调度' },
  ];

  const areaOptions = [
    { value: '', label: '全部区域' },
    ...areas.map(a => ({ value: a, label: a })),
  ];

  const urgencyOptions = [
    { value: '', label: '全部紧急度' },
    { value: 'high', label: '紧急' },
    { value: 'medium', label: '重要' },
    { value: 'low', label: '普通' },
  ];

  const todoList = buildTodoList();

  return (
    <Layout title="运维看板" sidebarItems={operatorSidebarItems}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">欢迎回来，运维工程师</h2>
            <p className="text-gray-500 mt-1">{dateStr}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <Card hoverable padding="md" className="bg-gradient-to-br from-warning-50 to-warning-100">
                <CardContent className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning-500 flex items-center justify-center text-white shadow-lg shadow-warning-200">
                    <BatteryCharging className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">待换电</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todayBatteryTasks}</p>
                    <p className="text-xs text-warning-600 mt-1">需处理</p>
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

              <Card hoverable padding="md" className="bg-gradient-to-br from-secondary-50 to-secondary-100">
                <CardContent className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary-500 flex items-center justify-center text-white shadow-lg shadow-secondary-200">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">调度任务</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingDispatchTasks}</p>
                    <p className="text-xs text-secondary-600 mt-1">待执行</p>
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

              <Card hoverable padding="md" className="bg-gradient-to-br from-primary-50 to-primary-100">
                <CardContent className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-200">
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">负责车辆</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBikes}</p>
                    <p className="text-xs text-primary-600 mt-1">总数</p>
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

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>今日待办</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">筛选：</span>
                </div>
                <Select
                  options={areaOptions}
                  value={areaFilter}
                  onChange={setAreaFilter}
                  className="w-32"
                  size="sm"
                />
                <Select
                  options={urgencyOptions}
                  value={urgencyFilter}
                  onChange={setUrgencyFilter}
                  className="w-32"
                  size="sm"
                />
              </div>
            </div>
            <div className="mt-3">
              <Tabs items={todoTabs} activeKey={todoFilter} onChange={setTodoFilter} variant="pills" size="sm" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : todoList.length === 0 ? (
              <div className="py-12 text-center">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">暂无待办任务</p>
                <p className="text-xs text-gray-400 mt-1">所有任务都已完成，干得漂亮！</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todoList.map(todo => {
                  const Icon = typeIcons[todo.type];
                  return (
                    <div
                      key={todo.id}
                      onClick={() => handleTodoClick(todo)}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer group"
                    >
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${typeColors[todo.type]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" size="xs">
                                {typeLabels[todo.type]}
                              </Badge>
                              <Badge variant={todo.urgency === 'high' ? 'danger' : todo.urgency === 'medium' ? 'warning' : 'primary'} size="xs">
                                {urgencyLabels[todo.urgency]}
                              </Badge>
                              {getTodoStatusBadge(todo.type, todo.status)}
                            </div>
                            <p className="font-semibold text-gray-900 mt-2">{todo.title}</p>
                            {todo.subtitle && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{todo.subtitle}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                              {todo.area && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{todo.area}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatDate(todo.time)}</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0 mt-1" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card hoverable padding="md" className="cursor-pointer" onClick={() => navigate('/operator/battery-tasks')}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center text-warning-600">
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
      </div>
    </Layout>
  );
}
