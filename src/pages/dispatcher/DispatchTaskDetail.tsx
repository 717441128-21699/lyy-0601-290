import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  Play,
  CheckCircle,
  Truck,
  ArrowRight,
  BatteryCharging,
  AlertTriangle,
  Wrench,
  Bike,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/toastStore';
import api from '@/utils/api';
import { useAuthStore } from '@/store/authStore';
import type { DispatchTask, DispatchTaskStatus, UserRole } from '@shared/types';
import type { SidebarItem } from '@/components/layout/Sidebar';

const dispatcherSidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: '调度看板', icon: MapPin, path: '/dispatcher/dashboard' },
  { key: 'heatmap', label: '热力图', icon: MapPin, path: '/dispatcher/heatmap' },
  { key: 'suggestions', label: '调度建议', icon: MapPin, path: '/dispatcher/suggestions' },
  { key: 'tasks', label: '调度任务', icon: MapPin, path: '/dispatcher/tasks' },
];

const operatorSidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: '运维看板', icon: BatteryCharging, path: '/operator/dashboard' },
  { key: 'battery', label: '换电任务', icon: BatteryCharging, path: '/operator/battery-tasks' },
  { key: 'fault', label: '故障报修', icon: AlertTriangle, path: '/operator/fault-reports' },
  { key: 'maintenance', label: '维修记录', icon: Wrench, path: '/operator/maintenance-records' },
  { key: 'bikes', label: '车辆列表', icon: Bike, path: '/operator/bikes' },
];

export default function DispatchTaskDetail() {
  const location = useLocation();
  const { user } = useAuthStore();
  const isOperator = location.pathname.startsWith('/operator') || user?.role === 'operator';
  const sidebarItems = isOperator ? operatorSidebarItems : dispatcherSidebarItems;
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<DispatchTask | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTask = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const res = await api.get<DispatchTask>(`/dispatch/tasks/${taskId}`);
      if (res.code === 200 && res.data) {
        setTask(res.data);
      }
    } catch (error) {
      console.error('获取调度任务失败:', error);
      toast.error('获取任务详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const getStatusBadge = (status: DispatchTaskStatus) => {
    const statusMap: Record<DispatchTaskStatus, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
      pending: { variant: 'warning', label: '待执行' },
      'in-progress': { variant: 'primary', label: '执行中' },
      completed: { variant: 'success', label: '已完成' },
    };
    const config = statusMap[status];
    return <Badge variant={config.variant} size="sm" dot>{config.label}</Badge>;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const handleStartTask = async () => {
    if (!task) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/dispatch/tasks/${task.id}/start`);
      if (res.code === 200) {
        toast.success('开始执行调度任务');
        await fetchTask();
      } else {
        toast.error(res.message || '开始任务失败');
      }
    } catch (error: any) {
      toast.error(error?.message || '开始任务失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteTask = async () => {
    if (!task) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/dispatch/tasks/${task.id}/complete`);
      if (res.code === 200) {
        toast.success('调度任务已完成');
        await fetchTask();
      } else {
        toast.error(res.message || '完成任务失败');
      }
    } catch (error: any) {
      toast.error(error?.message || '完成任务失败');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout title="调度任务详情" sidebarItems={sidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">调度任务详情</h2>
            <p className="text-gray-500 mt-1">任务编号：{taskId}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : task ? (
          <>
            <Card padding="lg">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-secondary-100 flex items-center justify-center">
                      <Truck className="w-8 h-8 text-secondary-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">车辆调度</h3>
                      <p className="text-gray-500 flex items-center gap-1 mt-1">
                        <Clock className="w-4 h-4" />
                        创建时间：{formatDate(task.createTime)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(task.status)}
                </div>

                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-primary-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900 text-lg">{task.fromAreaName}</p>
                      <p className="text-sm text-gray-500">调出区域</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-8">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center">
                          <ArrowRight className="w-6 h-6 text-secondary-500" />
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-gray-900">{task.bikeCount}</p>
                          <p className="text-sm text-gray-500">辆</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <MapPin className="w-8 h-8 text-secondary-500 mx-auto mb-2" />
                      <p className="font-semibold text-gray-900 text-lg">{task.toAreaName}</p>
                      <p className="text-sm text-gray-500">调入区域</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">车辆数量</p>
                    <p className="text-3xl font-bold mt-2 text-gray-900">{task.bikeCount} 辆</p>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">执行状态</p>
                    <div className="mt-2">
                      {getStatusBadge(task.status)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-500" />
                    分配的运维人员
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {task.assignedStaffNames.map((name, index) => (
                      <Badge key={index} variant="secondary" size="md">
                        {name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {task.completeTime && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-success-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">完成时间</p>
                      <p className="font-medium text-gray-900">{formatDate(task.completeTime)}</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card padding="lg">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                时间线
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">任务创建</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      系统 · {formatDate(task.createTime)}
                    </p>
                  </div>
                </div>
                {task.status === 'in-progress' && (
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-warning-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">执行中</p>
                      <p className="text-sm text-gray-500 mt-0.5">正在转移车辆</p>
                    </div>
                  </div>
                )}
                {task.completeTime && (
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-success-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">任务完成</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {formatDate(task.completeTime)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate(-1)}>
                返回列表
              </Button>
              {task.status === 'pending' && (
                <Button
                  variant="primary"
                  icon={<Play className="w-4 h-4" />}
                  loading={actionLoading}
                  onClick={handleStartTask}
                >
                  开始执行
                </Button>
              )}
              {task.status === 'in-progress' && (
                <Button
                  variant="primary"
                  icon={<CheckCircle className="w-4 h-4" />}
                  loading={actionLoading}
                  onClick={handleCompleteTask}
                >
                  完成任务
                </Button>
              )}
            </div>
          </>
        ) : (
          <Card padding="lg">
            <div className="text-center py-8">
              <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">任务不存在</p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}
