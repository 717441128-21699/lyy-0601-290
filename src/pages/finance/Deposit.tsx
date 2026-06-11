import { useState, useEffect } from 'react';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import Modal from '@/components/ui/Modal';
import api from '@/utils/api';
import type { DepositRecord, DepositType, DepositStatus } from '@shared/types';

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}) => {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
  };

  return (
    <Card hoverable={false}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
};

export default function Deposit() {
  const [records, setRecords] = useState<DepositRecord[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DepositRecord | null>(null);

  const fetchRecords = async (tabKey: string) => {
    setLoading(true);
    try {
      const params: Record<string, unknown> = {};
      if (tabKey !== 'all') {
        params.type = tabKey;
      }
      const res = await api.get<DepositRecord[]>('/finance/deposit-records', params);
      setRecords(res.data);
    } catch (error) {
      console.error('Failed to fetch deposit records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(activeTab);
  }, [activeTab]);

  const totalDeposit = records
    .filter((r) => r.type === 'deposit' && r.status === 'completed')
    .reduce((sum, r) => sum + r.amount, 0);

  const depositCount = records.filter((r) => r.type === 'deposit').length;
  const refundCount = records.filter((r) => r.type === 'refund').length;
  const pendingRefund = records.filter((r) => r.type === 'refund' && r.status === 'pending').length;

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'deposit', label: '缴纳' },
    { key: 'refund', label: '退还' },
  ];

  const handleProcessRefund = (record: DepositRecord) => {
    setSelectedRecord(record);
    setShowProcessModal(true);
  };

  const confirmProcessRefund = async () => {
    if (!selectedRecord) return;
    try {
      await api.post(`/finance/deposit-records/${selectedRecord.id}/process-refund`);
      setShowProcessModal(false);
      setSelectedRecord(null);
      fetchRecords(activeTab as DepositType);
    } catch (error) {
      console.error('Failed to process refund:', error);
    }
  };

  const getStatusBadge = (status: DepositStatus) => {
    const variants: Record<DepositStatus, 'success' | 'warning' | 'danger'> = {
      completed: 'success',
      pending: 'warning',
      failed: 'danger',
    };
    const labels: Record<DepositStatus, string> = {
      completed: '已完成',
      pending: '待处理',
      failed: '失败',
    };
    return <Badge variant={variants[status]} size="sm">{labels[status]}</Badge>;
  };

  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

  return (
    <Layout title="押金管理">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="当前押金总额"
            value={formatCurrency(totalDeposit)}
            icon={Wallet}
            color="primary"
          />
          <StatCard
            title="缴纳笔数"
            value={depositCount.toString()}
            icon={ArrowDownCircle}
            color="success"
          />
          <StatCard
            title="退还笔数"
            value={refundCount.toString()}
            icon={ArrowUpCircle}
            color="warning"
          />
          <StatCard
            title="待处理退还"
            value={pendingRefund.toString()}
            icon={Clock}
            color="danger"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>押金记录</CardTitle>
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={() => fetchRecords(activeTab)}
              >
                刷新
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              items={tabItems}
              activeKey={activeTab}
              onChange={setActiveTab}
              variant="pills"
              className="mb-6"
            />

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      用户名称
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">类型</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">金额</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">时间</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        暂无记录
                      </td>
                    </tr>
                  ) : (
                    records.map((record) => (
                      <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 text-sm font-medium">
                                {record.userName.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm text-gray-900">{record.userName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={record.type === 'deposit' ? 'success' : 'warning'}
                            size="sm"
                          >
                            {record.type === 'deposit' ? '押金缴纳' : '押金退还'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-semibold ${
                              record.type === 'deposit' ? 'text-success-600' : 'text-warning-600'
                            }`}
                          >
                            {record.type === 'deposit' ? '+' : '-'}
                            {formatCurrency(record.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                        <td className="py-3 px-4 text-sm text-gray-500">{record.createTime}</td>
                        <td className="py-3 px-4 text-right">
                          {record.type === 'refund' && record.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleProcessRefund(record)}
                            >
                              处理
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal
        open={showProcessModal}
        onClose={() => setShowProcessModal(false)}
        title="处理押金退还"
        description="确认处理该用户的押金退还申请"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">用户</span>
                <span className="text-sm font-medium text-gray-900">
                  {selectedRecord.userName}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">类型</span>
                <Badge variant="warning" size="sm">
                  押金退还
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">退还金额</span>
                <span className="text-xl font-bold text-warning-600">
                  {formatCurrency(selectedRecord.amount)}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowProcessModal(false)}
              >
                取消
              </Button>
              <Button variant="primary" fullWidth onClick={confirmProcessRefund}>
                确认处理
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </Layout>
  );
}
