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
  Flame,
  Zap,
  FileText,
  Bike,
  MapPin,
  ArrowRight,
  Clock,
  Eye,
  User,
  Calendar,
  CheckCircle,
  Play,
} from 'lucide-react';
import type { SidebarItem } from '@/components/layout/Sidebar';
import api from '@/utils/api';
import type { DispatchTask, DispatchTaskStatus } from '@shared/types';

const dispatcherSidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: '调度首页', icon: LayoutDashboard, path: '/dispatcher/dashboard' },
  { key: 'heatmap', label: '热力图', icon: Flame, path: '/dispatcher/heatmap' },
  { key: 'suggestions', label: '调度建议', icon: Zap, path: '/dispatcher/suggestions' },
  { key: 'tasks', label: '调度任务', icon: FileText, path: '/dispatcher/tasks' },
];

const tabItems = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待执行' },
  { key: 'in-progress', label: '进行中' },
  { key: 'completed', label: '已完成' },
];

export default function Tasks() {
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<DispatchTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<DispatchTask | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await api.get<DispatchTask[]>('/dispatch/tasks', params);
      setTasks(res.data || []);
    } catch (error) {
      console.error('获取调度任务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const getStatusBadge = (status: DispatchTaskStatus) => {
    const statusMap: Record<DispatchTaskStatus, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
      pending: { variant: 'warning', label: '待执行' },
      'in-progress': { variant: 'primary', label: '进行中' },
      completed: { variant: 'success', label: '已完成' },
    };
    const config = statusMap[status];
    return <Badge variant={config.variant} size="sm" dot>{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const handleViewDetail = (task: DispatchTask) => {
    setSelectedTask(task);
    setDetailModalOpen(true);
  };

  const getProgressPercent = (task: DispatchTask) => {
    if (task.status === 'completed') return 100;
    if (task.status === 'in-progress') return 50;
    return 0;
  };

  return (
    <Layout title="调度任务" sidebarItems={dispatcherSidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">调度任务</h2>
            <p className="text-gray-500 mt-1">查看和管理调度任务执行情况</p>
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
                  <Card key={task.id} hoverable padding="md">
                    <CardHeader className="flex flex-row items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                          <FileText className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">调度任务</CardTitle>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {formatDate(task.createTime)}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(task.status)}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="text-center flex-1">
                          <p className="text-sm font-medium text-gray-900">{task.fromAreaName}</p>
                          <p className="text-xs text-gray-500">调出</p>
                        </div>
                        <div className="flex items-center justify-center">
                          <ArrowRight className="w-5 h-5 text-primary-500" />
                        </div>
                        <div className="text-center flex-1">
                          <p className="text-sm font-medium text-gray-900">{task.toAreaName}</p>
                          <p className="text-xs text-gray-500">调入</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">执行进度</span>
                          <span className="font-medium text-gray-900">{getProgressPercent(task)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              task.status === 'completed' ? 'bg-success-500' : 'bg-primary-500'
                            }`}
                            style={{ width: `${getProgressPercent(task)}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Bike className="w-4 h-4" />
                          <span>{task.bikeCount} 辆</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <User className="w-4 h-4" />
                          <span>{task.assignedStaffNames.length} 人</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        fullWidth
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handleViewDetail(task)}
                      >
                        查看详情
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty
                title="暂无调度任务"
                description={`当前没有${tabItems.find(t => t.key === activeTab)?.label || ''}的调度任务`}
                icon={<FileText className="w-10 h-10 text-gray-400" />}
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
                    <FileText className="w-7 h-7 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">调度任务</h3>
                    <p className="text-gray-500">{formatDate(selectedTask.createTime)}</p>
                  </div>
                </div>
                {getStatusBadge(selectedTask.status)}
              </div>

              <div className="flex items-center justify-center gap-6 p-6 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-danger-100 flex items-center justify-center mx-auto mb-2">
                    <MapPin className="w-6 h-6 text-danger-600" />
                  </div>
                  <p className="font-semibold text-gray-900">{selectedTask.fromAreaName}</p>
                  <p className="text-xs text-gray-500">调出区域</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-gray-300" />
                    <ArrowRight className="w-5 h-5 text-primary-500" />
                    <div className="w-3 h-0.5 bg-gray-300" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">调度</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-2">
                    <MapPin className="w-6 h-6 text-success-600" />
                  </div>
                  <p className="font-semibold text-gray-900">{selectedTask.toAreaName}</p>
                  <p className="text-xs text-gray-500">调入区域</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">调度车辆数</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedTask.bikeCount} 辆
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">负责人员</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {selectedTask.assignedStaffNames.length} 人
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">负责人员</h4>
                <div className="space-y-2">
                  {selectedTask.assignedStaffNames.map((name, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{name}</p>
                        <p className="text-xs text-gray-500">运维人员</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">执行进度</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">完成进度</span>
                    <span className="font-semibold text-primary-600">{getProgressPercent(selectedTask)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        selectedTask.status === 'completed'
                          ? 'bg-gradient-to-r from-success-400 to-success-600'
                          : 'bg-gradient-to-r from-primary-400 to-primary-600'
                      }`}
                      style={{ width: `${getProgressPercent(selectedTask)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">时间线</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">任务创建</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatDate(selectedTask.createTime)}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-success-500" />
                  </div>
                  {selectedTask.status !== 'pending' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-warning-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">开始执行</p>
                        <p className="text-xs text-gray-500 mt-0.5">执行中</p>
                      </div>
                      {selectedTask.status === 'in-progress' && (
                        <Play className="w-5 h-5 text-warning-500" />
                      )}
                      {selectedTask.status === 'completed' && (
                        <CheckCircle className="w-5 h-5 text-success-500" />
                      )}
                    </div>
                  )}
                  {selectedTask.completeTime && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-success-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">任务完成</p>
                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(selectedTask.completeTime)}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-success-500" />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                  关闭
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
