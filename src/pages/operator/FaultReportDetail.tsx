import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Wrench,
  CheckCircle,
  FileText,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/toastStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/utils/api';
import type { FaultReport, FaultStatus } from '@shared/types';
import type { SidebarItem } from '@/components/layout/Sidebar';

const operatorSidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: '运维看板', icon: AlertTriangle, path: '/operator/dashboard' },
  { key: 'battery', label: '换电任务', icon: AlertTriangle, path: '/operator/battery-tasks' },
  { key: 'fault', label: '故障报修', icon: AlertTriangle, path: '/operator/fault-reports' },
  { key: 'maintenance', label: '维修记录', icon: AlertTriangle, path: '/operator/maintenance-records' },
  { key: 'bikes', label: '车辆列表', icon: AlertTriangle, path: '/operator/bikes' },
];

const handleOptions = [
  { value: 'repair', label: '现场维修' },
  { value: 'transfer', label: '转移维修' },
  { value: 'replace', label: '更换零件' },
  { value: 'other', label: '其他处理' },
];

export default function FaultReportDetail() {
  const navigate = useNavigate();
  const { reportId } = useParams();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<FaultReport | null>(null);
  const [handleModalOpen, setHandleModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [handleMethod, setHandleMethod] = useState('');
  const [handleResult, setHandleResult] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReport = async () => {
    if (!reportId) return;
    try {
      setLoading(true);
      const res = await api.get<FaultReport>(`/operators/fault-reports/${reportId}`);
      if (res.code === 200 && res.data) {
        setReport(res.data);
      }
    } catch (error) {
      console.error('获取故障报告失败:', error);
      toast.error('获取故障详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportId]);

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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const getReporterTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      user: '用户',
      operator: '运维',
      system: '系统',
    };
    return typeMap[type] || type;
  };

  const handleProcess = async () => {
    if (!report) return;
    try {
      setActionLoading(true);
      const res = await api.post(`/operators/fault-reports/${report.id}/handle`, {
        handlerId: user?.id,
        handlerName: user?.nickname || user?.realName || '运维人员',
      });
      if (res.code === 200) {
        toast.success('开始处理故障');
        await fetchReport();
        setHandleModalOpen(false);
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
    if (!report || !handleResult.trim()) {
      toast.error('请输入处理结果');
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.post(`/operators/fault-reports/${report.id}/resolve`, {
        handleResult,
      });
      if (res.code === 200) {
        toast.success('故障已解决');
        await fetchReport();
        setResolveModalOpen(false);
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
    <Layout title="故障详情" sidebarItems={operatorSidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">故障详情</h2>
            <p className="text-gray-500 mt-1">故障编号：{reportId}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : report ? (
          <>
            <Card padding="lg">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-danger-100 flex items-center justify-center">
                      <AlertTriangle className="w-8 h-8 text-danger-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{report.bikeNo}</h3>
                      <p className="text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {report.areaName}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(report.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">故障类型</p>
                    <p className="text-xl font-semibold mt-2 text-gray-900">{report.faultType}</p>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">上报人</p>
                    <p className="text-xl font-semibold mt-2 text-gray-900">
                      {report.reporterName}
                      <Badge variant="outline" size="xs" className="ml-2">
                        {getReporterTypeLabel(report.reporterType)}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">上报时间</p>
                      <p className="font-medium text-gray-900">{formatDate(report.createTime)}</p>
                    </div>
                  </div>
                  {report.handlerName && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">处理人</p>
                        <p className="font-medium text-gray-900">{report.handlerName}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">故障描述</h4>
                  <p className="text-gray-600 bg-gray-50 p-5 rounded-xl">
                    {report.description}
                  </p>
                </div>

                {report.handleResult && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">处理结果</h4>
                    <p className="text-gray-600 bg-success-50 p-5 rounded-xl text-success-700">
                      {report.handleResult}
                    </p>
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
                    <p className="font-medium text-gray-900">故障上报</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {report.reporterName} · {formatDate(report.createTime)}
                    </p>
                  </div>
                </div>
                {report.handleTime && (
                  <div className="flex items-start gap-4">
                    <div className="w-3 h-3 rounded-full bg-warning-500 mt-1.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">开始处理</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {report.handlerName} · {formatDate(report.handleTime)}
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
              {report.status === 'pending' && (
                <Button
                  variant="primary"
                  icon={<Wrench className="w-4 h-4" />}
                  loading={actionLoading}
                  onClick={() => setHandleModalOpen(true)}
                >
                  处理故障
                </Button>
              )}
              {report.status === 'processing' && (
                <Button
                  variant="primary"
                  icon={<CheckCircle className="w-4 h-4" />}
                  loading={actionLoading}
                  onClick={() => {
                    setHandleResult('');
                    setResolveModalOpen(true);
                  }}
                >
                  解决故障
                </Button>
              )}
            </div>
          </>
        ) : (
          <Card padding="lg">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">故障报告不存在</p>
            </div>
          </Card>
        )}

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
