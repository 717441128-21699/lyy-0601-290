import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BatteryCharging,
  MapPin,
  Clock,
  User,
  Handshake,
  Play,
  CheckCircle,
  Zap,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/toastStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/utils/api';
import type { BatteryTask, BatteryTaskStatus } from '@shared/types';
import type { SidebarItem } from '@/components/layout/Sidebar';

const operatorSidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: '运维看板', icon: BatteryCharging, path: '/operator/dashboard' },
  { key: 'battery', label: '换电任务', icon: BatteryCharging, path: '/operator/battery-tasks' },
  { key: 'fault', label: '故障报修', icon: BatteryCharging, path: '/operator/fault-reports' },
  { key: 'maintenance', label: '维修记录', icon: BatteryCharging, path: '/operator/maintenance-records' },
  { key: 'bikes', label: '车辆列表', icon: BatteryCharging, path: '/operator/bikes' },
];

export default function BatteryTaskDetail() {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState<BatteryTask | null>(null);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [targetBattery, setTargetBattery] = useState('100');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTask = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const res = await api.get<BatteryTask>(`/operators/battery-tasks/${taskId}`);
      if (res.code === 200 && res.data) {
        setTask(res.data);
      }
    } catch (error) {
      console.error('获取换电任务失败:', error);
      toast.error('获取任务详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const getStatusBadge = (status: BatteryTaskStatus) => {
    const statusMap: Record<BatteryTaskStatus, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
      pending: { variant: 'warning', label: '待分配' },
      assigned: { variant: 'primary', label: '已分配' },
      'in-progress': { variant: 'primary', label: '进行中' },
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

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-success-600';
    if (battery > 30) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getBatteryBgColor = (battery: number) => {
    if (battery > 60) return 'bg-success-500';
    if (battery > 30) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  const handleAcceptTask = async () => {
    if (!task) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/operators/battery-tasks/${task.id}/accept`, {
        operatorId: user?.id,
      });
      if (res.code === 200) {
        toast.success('接受任务成功');
        await fetchTask();
      } else {
        toast.error(res.message || '接受任务失败');
      }
    } catch (error: any) {
      toast.error(error?.message || '接受任务失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTask = async () => {
    if (!task) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/operators/battery-tasks/${task.id}/start`);
      if (res.code === 200) {
        toast.success('开始任务成功');
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
    const battery = parseInt(targetBattery);
    if (isNaN(battery) || battery < 0 || battery > 100) {
      toast.error('请输入有效的电量值（0-100）');
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.post(`/operators/battery-tasks/${task.id}/complete`, {
        targetBattery: battery,
      });
      if (res.code === 200) {
        toast.success('完成换电成功');
        await fetchTask();
        setCompleteModalOpen(false);
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
    <Layout title="换电任务详情" sidebarItems={operatorSidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">换电任务详情</h2>
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
                    <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center">
                      <BatteryCharging className="w-8 h-8 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{task.bikeNo}</h3>
                      <p className="text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {task.areaName}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(task.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">当前电量</p>
                    <div className="flex items-end gap-2 mt-2">
                      <p className={`text-3xl font-bold ${getBatteryColor(task.currentBattery)}`}>
                        {task.currentBattery}%
                      </p>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full rounded-full transition-all ${getBatteryBgColor(task.currentBattery)}`}
                        style={{ width: `${task.currentBattery}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">目标电量</p>
                    <p className="text-3xl font-bold mt-2 text-success-600">
                      {task.targetBattery || 95}%
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">运维人员</p>
                      <p className="font-medium text-gray-900">{task.operatorName || '未分配'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">分配时间</p>
                      <p className="font-medium text-gray-900">{formatDate(task.assignedTime)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary-500" />
                操作记录
              </h4>
              <div className="space-y-4">
                {task.assignedTime && (
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">任务已分配</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {task.operatorName} · {formatDate(task.assignedTime)}
                      </p>
                    </div>
                  </div>
                )}
                {task.startTime && (
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-warning-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">开始换电</p>
                      <p className="text-sm text-gray-500 mt-0.5">{formatDate(task.startTime)}</p>
                    </div>
                  </div>
                )}
                {task.completeTime && (
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-success-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">完成换电</p>
                      <p className="text-sm text-gray-500 mt-0.5">{formatDate(task.completeTime)}</p>
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
                  icon={<Handshake className="w-4 h-4" />}
                  loading={actionLoading}
                  onClick={handleAcceptTask}
                >
                  接受任务
                </Button>
              )}
              {task.status === 'assigned' && (
                <Button
                  variant="primary"
                  icon={<Play className="w-4 h-4" />}
                  loading={actionLoading}
                  onClick={handleStartTask}
                >
                  开始换电
                </Button>
              )}
              {task.status === 'in-progress' && (
                <Button
                  variant="primary"
                  icon={<CheckCircle className="w-4 h-4" />}
                  loading={actionLoading}
                  onClick={() => setCompleteModalOpen(true)}
                >
                  完成换电
                </Button>
              )}
            </div>
          </>
        ) : (
          <Card padding="lg">
            <div className="text-center py-8">
              <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">任务不存在</p>
            </div>
          </Card>
        )}

        <Modal
          open={completeModalOpen}
          onClose={() => setCompleteModalOpen(false)}
          title="完成换电"
          description="请输入目标电量"
          width="md"
        >
          <div className="space-y-5">
            <Input
              label="目标电量（%）"
              type="number"
              min={0}
              max={100}
              value={targetBattery}
              onChange={(e) => setTargetBattery(e.target.value)}
              placeholder="请输入目标电量"
            />
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setCompleteModalOpen(false)}>
                取消
              </Button>
              <Button
                variant="primary"
                icon={<CheckCircle className="w-4 h-4" />}
                loading={actionLoading}
                onClick={handleCompleteTask}
              >
                确认完成
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
