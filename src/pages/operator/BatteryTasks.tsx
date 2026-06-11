import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Modal from '@/components/ui/Modal';
import Empty from '@/components/ui/Empty';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  LayoutDashboard,
  BatteryCharging,
  AlertTriangle,
  Wrench,
  Bike,
  MapPin,
  Clock,
  User,
  Play,
  CheckCircle,
  Handshake,
  X,
} from 'lucide-react';
import type { SidebarItem } from '@/components/layout/Sidebar';
import api from '@/utils/api';
import { toast } from '@/components/ui/toastStore';
import Input from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import type { BatteryTask, BatteryTaskStatus } from '@shared/types';

const operatorSidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: '运维看板', icon: LayoutDashboard, path: '/operator/dashboard' },
  { key: 'battery', label: '换电任务', icon: BatteryCharging, path: '/operator/battery-tasks' },
  { key: 'fault', label: '故障报修', icon: AlertTriangle, path: '/operator/fault-reports' },
  { key: 'maintenance', label: '维修记录', icon: Wrench, path: '/operator/maintenance-records' },
  { key: 'bikes', label: '车辆列表', icon: Bike, path: '/operator/bikes' },
];

const tabItems = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待分配' },
  { key: 'assigned', label: '已分配' },
  { key: 'in-progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
];

export default function BatteryTasks() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<BatteryTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<BatteryTask | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [targetBattery, setTargetBattery] = useState('100');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await api.get<BatteryTask[]>('/operators/battery-tasks', params);
      setTasks(res.data || []);
    } catch (error) {
      console.error('获取换电任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

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

  const handleViewDetail = (task: BatteryTask) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  const handleAcceptTask = async (taskId: string) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/operators/battery-tasks/${taskId}/accept`, {
        operatorId: user?.id,
      });
      if (res.code === 200) {
        toast.success('接受任务成功');
        await fetchTasks();
      } else {
        toast.error(res.message || '接受任务失败');
      }
    } catch (error: any) {
      toast.error(error?.message || '接受任务失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTask = async (taskId: string) => {
    try {
      setActionLoading(true);
      const res = await api.post(`/operators/battery-tasks/${taskId}/start`);
      if (res.code === 200) {
        toast.success('开始任务成功');
        await fetchTasks();
      } else {
        toast.error(res.message || '开始任务失败');
      }
    } catch (error: any) {
      toast.error(error?.message || '开始任务失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCompleteModal = (task: BatteryTask) => {
    setSelectedTask(task);
    setTargetBattery('100');
    setCompleteModalOpen(true);
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    const battery = parseInt(targetBattery);
    if (isNaN(battery) || battery < 0 || battery > 100) {
      toast.error('请输入有效的电量值（0-100）');
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.post(`/operators/battery-tasks/${selectedTask.id}/complete`, {
        targetBattery: battery,
      });
      if (res.code === 200) {
        toast.success('完成换电成功');
        await fetchTasks();
        setCompleteModalOpen(false);
        setDetailModalOpen(false);
      } else {
        toast.error(res.message || '完成任务失败');
      }
    } catch (error: any) {
      toast.error(error?.message || '完成任务失败');
    } finally {
      setActionLoading(false);
    }
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

  return (
    <Layout title="换电任务" sidebarItems={operatorSidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">换电任务</h2>
            <p className="text-gray-500 mt-1">管理和处理车辆换电任务</p>
          </div>
        </div>

        <Card padding="none">
          <div className="px-5 pt-5">
            <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />
          </div>
          <CardContent className="pt-5">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : tasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map((task) => (
                  <Card key={task.id} hoverable padding="md" className="cursor-pointer" onClick={() => handleViewDetail(task)}>
                    <CardHeader className="flex flex-row items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                          <BatteryCharging className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{task.bikeNo}</CardTitle>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {task.areaName}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(task.status)}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">当前电量</span>
                        <span className={`text-sm font-semibold ${getBatteryColor(task.currentBattery)}`}>
                          {task.currentBattery}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getBatteryBgColor(task.currentBattery)}`}
                          style={{ width: `${task.currentBattery}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <User className="w-4 h-4" />
                          <span>{task.operatorName || '未分配'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(task.assignedTime)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      {task.status === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          icon={<Handshake className="w-4 h-4" />}
                          loading={actionLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptTask(task.id);
                          }}
                        >
                          接受任务
                        </Button>
                      )}
                      {task.status === 'assigned' && (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          icon={<Play className="w-4 h-4" />}
                          loading={actionLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartTask(task.id);
                          }}
                        >
                          开始换电
                        </Button>
                      )}
                      {task.status === 'in-progress' && (
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          icon={<CheckCircle className="w-4 h-4" />}
                          loading={actionLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCompleteModal(task);
                          }}
                        >
                          完成换电
                        </Button>
                      )}
                      {task.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          disabled
                        >
                          已完成
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty
                title="暂无换电任务"
                description="当前没有符合条件的换电任务"
              />
            )}
          </CardContent>
        </Card>

        <Modal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title="任务详情"
          width="lg"
        >
          {selectedTask && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-primary-100 flex items-center justify-center">
                    <BatteryCharging className="w-7 h-7 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedTask.bikeNo}</h3>
                    <p className="text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedTask.areaName}
                    </p>
                  </div>
                </div>
                {getStatusBadge(selectedTask.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">当前电量</p>
                  <p className={`text-2xl font-bold mt-1 ${getBatteryColor(selectedTask.currentBattery)}`}>
                    {selectedTask.currentBattery}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">目标电量</p>
                  <p className="text-2xl font-bold mt-1 text-success-600">
                    {selectedTask.targetBattery || 95}%
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">操作记录</h4>
                <div className="space-y-3">
                  {selectedTask.assignedTime && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">任务已分配</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {selectedTask.operatorName} · {formatDate(selectedTask.assignedTime)}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedTask.startTime && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-warning-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">开始换电</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(selectedTask.startTime)}</p>
                      </div>
                    </div>
                  )}
                  {selectedTask.completeTime && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-success-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">完成换电</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(selectedTask.completeTime)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                  关闭
                </Button>
                {selectedTask.status === 'pending' && (
                  <Button
                    variant="primary"
                    icon={<Handshake className="w-4 h-4" />}
                    loading={actionLoading}
                    onClick={() => handleAcceptTask(selectedTask.id)}
                  >
                    接受任务
                  </Button>
                )}
                {selectedTask.status === 'assigned' && (
                  <Button
                    variant="primary"
                    icon={<Play className="w-4 h-4" />}
                    loading={actionLoading}
                    onClick={() => handleStartTask(selectedTask.id)}
                  >
                    开始换电
                  </Button>
                )}
                {selectedTask.status === 'in-progress' && (
                  <Button
                    variant="primary"
                    icon={<CheckCircle className="w-4 h-4" />}
                    loading={actionLoading}
                    onClick={() => {
                      setDetailModalOpen(false);
                      handleOpenCompleteModal(selectedTask);
                    }}
                  >
                    完成换电
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

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
