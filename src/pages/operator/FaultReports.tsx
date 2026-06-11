import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
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
  Eye,
  CheckCircle,
  Send,
} from 'lucide-react';
import type { SidebarItem } from '@/components/layout/Sidebar';
import api from '@/utils/api';
import { toast } from '@/components/ui/toastStore';
import { useAuthStore } from '@/store/authStore';
import type { FaultReport, FaultStatus } from '@shared/types';

const operatorSidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: '运维看板', icon: LayoutDashboard, path: '/operator/dashboard' },
  { key: 'battery', label: '换电任务', icon: BatteryCharging, path: '/operator/battery-tasks' },
  { key: 'fault', label: '故障报修', icon: AlertTriangle, path: '/operator/fault-reports' },
  { key: 'maintenance', label: '维修记录', icon: Wrench, path: '/operator/maintenance-records' },
  { key: 'bikes', label: '车辆列表', icon: Bike, path: '/operator/bikes' },
];

const tabItems = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '处理中' },
  { key: 'resolved', label: '已解决' },
];

const handleOptions = [
  { value: 'repair', label: '现场维修' },
  { value: 'transfer', label: '转移维修' },
  { value: 'replace', label: '更换零件' },
  { value: 'other', label: '其他处理' },
];

export default function FaultReports() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<FaultReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<FaultReport | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [handleModalOpen, setHandleModalOpen] = useState(false);
  const [handleMethod, setHandleMethod] = useState('');
  const [handleResult, setHandleResult] = useState('');
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await api.get<FaultReport[]>('/operators/fault-reports', params);
      setReports(res.data || []);
    } catch (error) {
      console.error('获取故障报告失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const getStatusBadge = (status: FaultStatus) => {
    const statusMap: Record<FaultStatus, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
      pending: { variant: 'danger', label: '待处理' },
      processing: { variant: 'warning', label: '处理中' },
      resolved: { variant: 'success', label: '已解决' },
      closed: { variant: 'default', label: '已关闭' },
    };
    const config = statusMap[status];
    return <Badge variant={config.variant} size="sm" dot>{config.label}</Badge>;
  };

  const getReporterTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      user: '用户',
      operator: '运维',
      system: '系统',
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const handleViewDetail = (report: FaultReport) => {
    setSelectedReport(report);
    setDetailModalOpen(true);
  };

  const handleOpenHandleModal = (report: FaultReport) => {
    setSelectedReport(report);
    setHandleMethod('');
    setHandleResult('');
    setHandleModalOpen(true);
  };

  const handleOpenResolveModal = (report: FaultReport) => {
    setSelectedReport(report);
    setHandleResult('');
    setResolveModalOpen(true);
  };

  const handleProcess = async () => {
    if (!selectedReport) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/operators/fault-reports/${selectedReport.id}/handle`, {
        handlerId: user?.id,
        handlerName: user?.nickname || user?.realName || '运维人员',
      });
      if (res.code === 200) {
        toast.success('开始处理故障');
        await fetchReports();
        setHandleModalOpen(false);
        setDetailModalOpen(false);
      } else {
        toast.error(res.message || '处理故障失败');
      }
    } catch (error: any) {
      toast.error(error?.message || '处理故障失败');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedReport || !handleResult.trim()) {
      toast.error('请输入处理结果');
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.post(`/operators/fault-reports/${selectedReport.id}/resolve`, {
        handleResult,
      });
      if (res.code === 200) {
        toast.success('故障已解决');
        await fetchReports();
        setResolveModalOpen(false);
        setDetailModalOpen(false);
      } else {
        toast.error(res.message || '解决故障失败');
      }
    } catch (error: any) {
      toast.error(error?.message || '解决故障失败');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Layout title="故障报修" sidebarItems={operatorSidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">故障报修</h2>
            <p className="text-gray-500 mt-1">处理车辆故障报修申请</p>
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
            ) : reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.map((report) => (
                  <Card key={report.id} hoverable padding="md">
                    <CardHeader className="flex flex-row items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-danger-100 flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-danger-600" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{report.bikeNo}</CardTitle>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {report.areaName}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(report.status)}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" size="sm">{report.faultType}</Badge>
                        <span className="text-xs text-gray-500">
                          {getReporterTypeLabel(report.reporterType)}上报
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {report.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-500">
                          <User className="w-4 h-4" />
                          <span>{report.reporterName}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(report.createTime)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<Eye className="w-4 h-4" />}
                        onClick={() => handleViewDetail(report)}
                      >
                        查看详情
                      </Button>
                      {report.status === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Wrench className="w-4 h-4" />}
                          onClick={() => handleOpenHandleModal(report)}
                        >
                          处理
                        </Button>
                      )}
                      {report.status === 'processing' && (
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<CheckCircle className="w-4 h-4" />}
                          onClick={() => handleOpenResolveModal(report)}
                        >
                          解决
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty
                title="暂无故障报告"
                description="当前没有符合条件的故障报告"
              />
            )}
          </CardContent>
        </Card>

        <Modal
          open={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title="故障详情"
          width="lg"
        >
          {selectedReport && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-danger-100 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-danger-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedReport.bikeNo}</h3>
                    <p className="text-gray-500 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedReport.areaName}
                    </p>
                  </div>
                </div>
                {getStatusBadge(selectedReport.status)}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">故障类型</p>
                  <p className="text-lg font-semibold mt-1 text-gray-900">{selectedReport.faultType}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">上报人</p>
                  <p className="text-lg font-semibold mt-1 text-gray-900">{selectedReport.reporterName}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">故障描述</h4>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.handleResult && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">处理结果</h4>
                  <p className="text-gray-600 bg-success-50 p-4 rounded-xl text-success-700">
                    {selectedReport.handleResult}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900">时间线</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">故障上报</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {selectedReport.reporterName} · {formatDate(selectedReport.createTime)}
                      </p>
                    </div>
                  </div>
                  {selectedReport.handleTime && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-warning-500 mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">开始处理</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {selectedReport.handlerName} · {formatDate(selectedReport.handleTime)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                  关闭
                </Button>
                {selectedReport.status === 'pending' && (
                  <Button
                    variant="primary"
                    icon={<Wrench className="w-4 h-4" />}
                    onClick={() => {
                      setDetailModalOpen(false);
                      handleOpenHandleModal(selectedReport);
                    }}
                  >
                    处理故障
                  </Button>
                )}
                {selectedReport.status === 'processing' && (
                  <Button
                    variant="primary"
                    icon={<CheckCircle className="w-4 h-4" />}
                    onClick={() => {
                      setDetailModalOpen(false);
                      handleOpenResolveModal(selectedReport);
                    }}
                  >
                    解决故障
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        <Modal
          open={handleModalOpen}
          onClose={() => setHandleModalOpen(false)}
          title="处理故障"
          description="确认开始处理此故障"
          width="md"
        >
          <div className="space-y-5">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">
                点击确认后，故障状态将变为"处理中"，您将作为处理人负责此故障的修复工作。
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setHandleModalOpen(false)}>
                取消
              </Button>
              <Button
                variant="primary"
                icon={<Wrench className="w-4 h-4" />}
                loading={actionLoading}
                onClick={handleProcess}
              >
                确认处理
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          open={resolveModalOpen}
          onClose={() => setResolveModalOpen(false)}
          title="解决故障"
          description="请填写处理结果"
          width="md"
        >
          <div className="space-y-5">
            <div>
              <Select
                label="处理方式"
                options={handleOptions}
                value={handleMethod}
                onChange={setHandleMethod}
                placeholder="请选择处理方式"
              />
            </div>
            <div>
              <Input
                label="处理结果"
                value={handleResult}
                onChange={(e) => setHandleResult(e.target.value)}
                placeholder="请输入处理结果"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setResolveModalOpen(false)}>
                取消
              </Button>
              <Button
                variant="primary"
                icon={<CheckCircle className="w-4 h-4" />}
                loading={actionLoading}
                onClick={handleResolve}
                disabled={!handleResult.trim()}
              >
                确认解决
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
