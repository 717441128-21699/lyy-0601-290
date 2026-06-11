import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Clock,
  User,
  Bike,
  Zap,
  AlertTriangle,
  MapPin,
  MessageSquare,
  Settings,
  RefreshCw,
  Download,
  Eye,
  ChevronRight,
  X,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Empty from '@/components/ui/Empty';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/toastStore';
import api from '@/utils/api';
import type { OperationLog, OperationLogType, UserRole } from '@shared/types';

const roleLabels: Record<UserRole, string> = {
  user: '普通用户',
  operator: '运维人员',
  dispatcher: '调度人员',
  finance: '财务人员',
  admin: '管理员',
};

const roleColors: Record<UserRole, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
  user: 'default',
  operator: 'primary',
  dispatcher: 'success',
  finance: 'warning',
  admin: 'danger',
};

const typeLabels: Record<OperationLogType, string> = {
  'unlock': '开锁',
  'return': '还车',
  'dispatch-confirm': '调度确认',
  'battery-complete': '换电完成',
  'complaint-process': '投诉处理',
  'system': '系统操作',
};

const typeIcons: Record<OperationLogType, typeof Bike> = {
  'unlock': Bike,
  'return': Bike,
  'dispatch-confirm': MapPin,
  'battery-complete': Zap,
  'complaint-process': MessageSquare,
  'system': Settings,
};

const typeColors: Record<OperationLogType, string> = {
  'unlock': 'bg-success-100 text-success-600',
  'return': 'bg-primary-100 text-primary-600',
  'dispatch-confirm': 'bg-secondary-100 text-secondary-600',
  'battery-complete': 'bg-warning-100 text-warning-600',
  'complaint-process': 'bg-purple-100 text-purple-600',
  'system': 'bg-gray-100 text-gray-600',
};

const relatedTypeRoutes: Record<string, string> = {
  'order': '/user/order/',
  'battery-task': '/operator/battery-task/',
  'fault': '/operator/fault/',
  'dispatch': '/dispatcher/task/',
  'complaint': '/user/complaint/',
};

export default function OperationLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [detailLog, setDetailLog] = useState<OperationLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {
        page,
        pageSize: 20,
      };
      if (roleFilter) {
        params.operatorRole = roleFilter;
      }
      if (typeFilter) {
        params.logType = typeFilter;
      }
      const res = await api.get<{ list: OperationLog[]; total: number }>('/operation-logs', params);
      if (res.code === 200) {
        setLogs(res.data.list || []);
        setTotal(res.data.total || 0);
      }
    } catch (error) {
      console.error('获取操作记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, roleFilter, typeFilter]);

  const roleOptions = [
    { value: '', label: '全部角色' },
    { value: 'user', label: '普通用户' },
    { value: 'operator', label: '运维人员' },
    { value: 'dispatcher', label: '调度人员' },
    { value: 'finance', label: '财务人员' },
    { value: 'admin', label: '管理员' },
  ];

  const typeOptions = [
    { value: '', label: '全部类型' },
    { value: 'unlock', label: '开锁' },
    { value: 'return', label: '还车' },
    { value: 'dispatch-confirm', label: '调度确认' },
    { value: 'battery-complete', label: '换电完成' },
    { value: 'complaint-process', label: '投诉处理' },
    { value: 'system', label: '系统操作' },
  ];

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const navigateToRelated = (relatedType?: string, relatedId?: string) => {
    if (!relatedType || !relatedId) return;
    const route = relatedTypeRoutes[relatedType];
    if (route) {
      navigate(`${route}${relatedId}`);
      setDetailModalOpen(false);
    }
  };

  const handleViewDetail = (log: OperationLog) => {
    setDetailLog(log);
    setDetailModalOpen(true);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params: Record<string, unknown> = {
        pageSize: 1000,
      };
      if (roleFilter) {
        params.operatorRole = roleFilter;
      }
      if (typeFilter) {
        params.logType = typeFilter;
      }
      const res = await api.get<{ list: OperationLog[]; total: number }>('/operation-logs', params);
      if (res.code === 200 && res.data.list) {
        const csvContent = generateCSV(res.data.list);
        downloadCSV(csvContent);
        toast.success('导出成功');
      }
    } catch (error) {
      console.error('导出失败:', error);
      toast.error('导出失败');
    } finally {
      setExporting(false);
    }
  };

  const generateCSV = (data: OperationLog[]) => {
    const headers = ['时间', '处理人', '角色', '动作', '描述', '关联对象', '关联ID'];
    const rows = data.map(log => [
      formatTime(log.createTime),
      log.operatorName,
      roleLabels[log.operatorRole],
      typeLabels[log.type],
      `"${log.description.replace(/"/g, '""')}"`,
      log.relatedName || '',
      log.relatedId || '',
    ]);
    return '\uFEFF' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const downloadCSV = (content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `操作记录_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout title="操作记录">
      <div className="space-y-6">
        <Card hoverable={false}>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">筛选：</span>
                </div>
                <Select
                  options={roleOptions}
                  value={roleFilter}
                  onChange={setRoleFilter}
                  className="w-36"
                />
                <Select
                  options={typeOptions}
                  value={typeFilter}
                  onChange={setTypeFilter}
                  className="w-36"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RefreshCw className="w-4 h-4" />}
                  onClick={fetchLogs}
                >
                  刷新
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Download className="w-4 h-4" />}
                  onClick={handleExport}
                  loading={exporting}
                >
                  导出
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>操作记录</CardTitle>
              <Badge variant="primary">共 {total} 条</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <Empty
                title="暂无操作记录"
                description="当前没有符合条件的操作记录"
                icon={<Clock className="w-12 h-12 text-gray-300" />}
              />
            ) : (
              <div className="space-y-3">
                {logs.map((log) => {
                  const Icon = typeIcons[log.type];
                  return (
                    <div
                      key={log.id}
                      className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      <div className={`p-2 rounded-xl flex-shrink-0 ${typeColors[log.type]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={roleColors[log.operatorRole]} size="sm">
                            {roleLabels[log.operatorRole]}
                          </Badge>
                          <Badge variant="outline" size="sm">
                            {typeLabels[log.type]}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.operatorName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                        {log.relatedName && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-400">关联对象：</span>
                            <button
                              onClick={() => navigateToRelated(log.relatedType, log.relatedId)}
                              className="text-xs text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1"
                            >
                              <Badge variant="outline" size="xs">
                                {log.relatedName}
                              </Badge>
                              {log.relatedId && (
                                <span>#{log.relatedId}</span>
                              )}
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(log.createTime)}</span>
                          </div>
                          <button
                            onClick={() => handleViewDetail(log)}
                            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            查看详情
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!loading && logs.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <span className="text-sm text-gray-500">
                  共 {total} 条记录，第 {page} 页
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * 20 >= total}
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {detailModalOpen && detailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">操作记录详情</h3>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${typeColors[detailLog.type]}`}>
                  {(() => {
                    const Icon = typeIcons[detailLog.type];
                    return <Icon className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={roleColors[detailLog.operatorRole]} size="sm">
                      {roleLabels[detailLog.operatorRole]}
                    </Badge>
                    <Badge variant="outline" size="sm">
                      {typeLabels[detailLog.type]}
                    </Badge>
                  </div>
                  <p className="text-base font-semibold text-gray-900 mt-1">{detailLog.operatorName}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">操作描述</p>
                  <p className="text-sm text-gray-900">{detailLog.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">操作时间</p>
                    <p className="text-sm font-medium text-gray-900">{formatTime(detailLog.createTime)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">记录编号</p>
                    <p className="text-sm font-medium text-gray-900">#{detailLog.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">处理人ID</p>
                    <p className="text-sm font-medium text-gray-900">{detailLog.operatorId}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">处理人角色</p>
                    <p className="text-sm font-medium text-gray-900">{roleLabels[detailLog.operatorRole]}</p>
                  </div>
                </div>

                {(detailLog.relatedId || detailLog.relatedName) && (
                  <div className="p-4 bg-primary-50 rounded-xl">
                    <p className="text-xs text-primary-600 mb-1">关联对象</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {detailLog.relatedName || '-'}
                        </p>
                        {detailLog.relatedId && (
                          <p className="text-xs text-gray-500">#{detailLog.relatedId}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<ChevronRight className="w-4 h-4" />}
                        onClick={() => navigateToRelated(detailLog.relatedType, detailLog.relatedId)}
                        disabled={!detailLog.relatedType || !detailLog.relatedId}
                      >
                        查看详情
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
                关闭
              </Button>
              {detailLog.relatedType && detailLog.relatedId && (
                <Button
                  variant="primary"
                  icon={<Eye className="w-4 h-4" />}
                  onClick={() => navigateToRelated(detailLog.relatedType, detailLog.relatedId)}
                >
                  查看关联对象
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
