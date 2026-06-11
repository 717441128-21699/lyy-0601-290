import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import Empty from '@/components/ui/Empty';
import { SkeletonCard } from '@/components/ui/Skeleton';
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

export default function OperationLogs() {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

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
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={fetchLogs}
              >
                刷新
              </Button>
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
                            <Badge variant="outline" size="xs">
                              {log.relatedName}
                            </Badge>
                            {log.relatedId && (
                              <span className="text-xs text-gray-400">#{log.relatedId}</span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(log.createTime)}</span>
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
    </Layout>
  );
}
