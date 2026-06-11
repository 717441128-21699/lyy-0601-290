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
  Check,
  X,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { SidebarItem } from '@/components/layout/Sidebar';
import api from '@/utils/api';
import type { DispatchSuggestion, SuggestionStatus, DispatchPriority } from '@shared/types';

const dispatcherSidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: '调度首页', icon: LayoutDashboard, path: '/dispatcher/dashboard' },
  { key: 'heatmap', label: '热力图', icon: Flame, path: '/dispatcher/heatmap' },
  { key: 'suggestions', label: '调度建议', icon: Zap, path: '/dispatcher/suggestions' },
  { key: 'tasks', label: '调度任务', icon: FileText, path: '/dispatcher/tasks' },
];

const tabItems = [
  { key: 'pending', label: '待确认' },
  { key: 'confirmed', label: '已确认' },
  { key: 'rejected', label: '已拒绝' },
  { key: 'completed', label: '已完成' },
];

export default function Suggestions() {
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<DispatchSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<DispatchSuggestion | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const res = await api.get<DispatchSuggestion[]>('/dispatch/suggestions', {
        status: activeTab,
      });
      setSuggestions(res.data || []);
    } catch (error) {
      console.error('获取调度建议失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [activeTab]);

  const getStatusBadge = (status: SuggestionStatus) => {
    const statusMap: Record<SuggestionStatus, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
      pending: { variant: 'warning', label: '待确认' },
      confirmed: { variant: 'primary', label: '已确认' },
      rejected: { variant: 'danger', label: '已拒绝' },
      completed: { variant: 'success', label: '已完成' },
    };
    const config = statusMap[status];
    return <Badge variant={config.variant} size="sm" dot>{config.label}</Badge>;
  };

  const getPriorityBadge = (priority: DispatchPriority) => {
    const priorityMap: Record<DispatchPriority, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
      high: { variant: 'danger', label: '高优先级' },
      medium: { variant: 'warning', label: '中优先级' },
      low: { variant: 'default', label: '低优先级' },
    };
    const config = priorityMap[priority];
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const handleViewDetail = (suggestion: DispatchSuggestion) => {
    setSelectedSuggestion(suggestion);
    setDetailModalOpen(true);
  };

  const handleOpenConfirmModal = (suggestion: DispatchSuggestion) => {
    setSelectedSuggestion(suggestion);
    setConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedSuggestion) return;
    try {
      setActionLoading(true);
      await api.post(`/dispatch/suggestions/${selectedSuggestion.id}/confirm`);
      await fetchSuggestions();
      setConfirmModalOpen(false);
      setDetailModalOpen(false);
    } catch (error) {
      console.error('确认建议失败:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionLoading(true);
      await api.post(`/dispatch/suggestions/${id}/reject`);
      await fetchSuggestions();
      setDetailModalOpen(false);
    } catch (error) {
      console.error('拒绝建议失败:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout title="调度建议" sidebarItems={dispatcherSidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">调度建议</h2>
            <p className="text-gray-500 mt-1">查看和处理智能调度建议</p>
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
            ) : suggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((suggestion) => (
                  <Card key={suggestion.id} hoverable padding="md">
                    <CardHeader className="flex flex-row items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-secondary-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">调度建议</CardTitle>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatDate(suggestion.createTime)}
                          </p>
                        </div>
                      </div>
                      {getPriorityBadge(suggestion.priority)}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{suggestion.fromAreaName}</p>
                          <p className="text-xs text-gray-500">调出区域</p>
                        </div>
                        <div className="flex items-center justify-center">
                          <ArrowRight className="w-5 h-5 text-primary-500" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-900">{suggestion.toAreaName}</p>
                          <p className="text-xs text-gray-500">调入区域</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <Bike className="w-4 h-4" />
                          <span>调度 {suggestion.bikeCount} 辆</span>
                        </div>
                        {getStatusBadge(suggestion.status)}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2">
                        {suggestion.reason}
                      </p>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handleViewDetail(suggestion)}
                      >
                        查看详情
                      </Button>
                      {suggestion.status === 'pending' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-danger-600 border-danger-200 hover:bg-danger-50"
                            icon={<XCircle className="w-4 h-4" />}
                            onClick={() => handleReject(suggestion.id)}
                            loading={actionLoading}
                          >
                            拒绝
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={<CheckCircle className="w-4 h-4" />}
                            onClick={() => handleOpenConfirmModal(suggestion)}
                          >
                            确认
                          </Button>
                        </>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty
                title="暂无调度建议"
                description={`当前没有${tabItems.find(t => t.key === activeTab)?.label || ''}的调度建议`}
                icon={<Zap className="w-10 h-10 text-gray-400" />}
              />
            )}
          </CardContent>
        </Card>

        <Modal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title="调度建议详情"
          width="lg"
        >
          {selectedSuggestion && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-secondary-100 flex items-center justify-center">
                    <Zap className="w-7 h-7 text-secondary-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">调度建议</h3>
                    <p className="text-gray-500">{formatDate(selectedSuggestion.createTime)}</p>
                  </div>
                </div>
                {getStatusBadge(selectedSuggestion.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">调出区域</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-danger-500" />
                    <span className="text-lg font-semibold text-gray-900">{selectedSuggestion.fromAreaName}</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-2">调入区域</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-success-500" />
                    <span className="text-lg font-semibold text-gray-900">{selectedSuggestion.toAreaName}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-primary-50 rounded-xl">
                  <p className="text-sm text-gray-500">调度车辆数</p>
                  <p className="text-2xl font-bold text-primary-600 mt-1">
                    {selectedSuggestion.bikeCount} 辆
                  </p>
                </div>
                <div className="p-4 bg-warning-50 rounded-xl">
                  <p className="text-sm text-gray-500">优先级</p>
                  <div className="mt-1">
                    {getPriorityBadge(selectedSuggestion.priority)}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">生成原因</h4>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">
                  {selectedSuggestion.reason}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                  关闭
                </Button>
                {selectedSuggestion.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      className="text-danger-600 border-danger-200 hover:bg-danger-50"
                      icon={<X className="w-4 h-4" />}
                      onClick={() => handleReject(selectedSuggestion.id)}
                    >
                      拒绝
                    </Button>
                    <Button
                      variant="primary"
                      icon={<Check className="w-4 h-4" />}
                      onClick={() => {
                        setDetailModalOpen(false);
                        handleOpenConfirmModal(selectedSuggestion);
                      }}
                    >
                      确认调度
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </Modal>

        <Modal
          open={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title="确认调度"
          width="md"
        >
          {selectedSuggestion && (
            <div className="space-y-5">
              <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-warning-800">确认执行此调度？</p>
                    <p className="text-sm text-warning-600 mt-1">
                      确认后系统将自动创建调度任务并分配给运维人员。
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <p className="text-sm text-gray-500">调出区域</p>
                  <p className="font-semibold text-gray-900">{selectedSuggestion.fromAreaName}</p>
                </div>
                <ArrowRight className="w-6 h-6 text-primary-500" />
                <div className="text-center">
                  <p className="text-sm text-gray-500">调入区域</p>
                  <p className="font-semibold text-gray-900">{selectedSuggestion.toAreaName}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">调度车辆数</span>
                <span className="font-semibold text-gray-900">{selectedSuggestion.bikeCount} 辆</span>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setConfirmModalOpen(false)}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  icon={<Check className="w-4 h-4" />}
                  loading={actionLoading}
                  onClick={handleConfirm}
                >
                  确认调度
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </Layout>
  );
}
