import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Wallet,
  RotateCcw,
  Calendar,
  PieChart,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import api from '@/utils/api';
import type { FinanceOverview, DailyRevenue, DepositRecord } from '@shared/types';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: 'up' | 'down';
  trendValue?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
}) => {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
  };

  return (
    <Card hoverable={false}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-success-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-danger-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  trend === 'up' ? 'text-success-600' : 'text-danger-600'
                }`}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};

export default function FinanceDashboard() {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [dailyRevenues, setDailyRevenues] = useState<DailyRevenue[]>([]);
  const [todayRecords, setTodayRecords] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, revenueRes, depositRes] = await Promise.all([
          api.get<FinanceOverview>('/finance/overview'),
          api.get<DailyRevenue[]>('/finance/daily-revenue', { days: 7 }),
          api.get<DepositRecord[]>('/finance/deposit-records'),
        ]);
        setOverview(overviewRes.data);
        setDailyRevenues(revenueRes.data);
        setTodayRecords(depositRes.data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickLinks = [
    { icon: Wallet, label: '押金管理', path: '/finance/deposit', color: 'primary' },
    { icon: PieChart, label: '利润报表', path: '/finance/reports', color: 'success' },
    { icon: BarChart3, label: '成本统计', path: '/finance/cost', color: 'warning' },
  ];

  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

  const chartData = dailyRevenues.map((item) => ({
    date: item.date.slice(5),
    收入: item.revenue,
  }));

  return (
    <Layout title="财务概览">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            title="今日收入"
            value={formatCurrency(overview?.todayRevenue || 0)}
            icon={DollarSign}
            trend="up"
            trendValue="12.5%"
            color="success"
          />
          <StatCard
            title="今日订单数"
            value={(overview?.todayOrders || 0).toString()}
            icon={ShoppingCart}
            trend="up"
            trendValue="8.3%"
            color="primary"
          />
          <StatCard
            title="今日押金收入"
            value={formatCurrency(overview?.todayDepositIn || 0)}
            icon={Wallet}
            color="primary"
          />
          <StatCard
            title="今日押金退还"
            value={formatCurrency(overview?.todayDepositOut || 0)}
            icon={RotateCcw}
            color="warning"
          />
          <StatCard
            title="本月收入"
            value={formatCurrency(overview?.monthRevenue || 0)}
            icon={Calendar}
            trend="up"
            trendValue="15.2%"
            color="success"
          />
          <StatCard
            title="本月净利润"
            value={formatCurrency((overview?.monthRevenue || 0) - (overview?.monthCost || 0))}
            icon={TrendingUp}
            trend="up"
            trendValue="10.8%"
            color="success"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>近7天收入趋势</CardTitle>
                <Badge variant="primary">实时</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="收入"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>快捷入口</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickLinks.map((link, index) => {
                  const Icon = link.icon;
                  const colorClasses: Record<string, string> = {
                    primary: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
                    success: 'bg-success-50 text-success-600 hover:bg-success-100',
                    warning: 'bg-warning-50 text-warning-600 hover:bg-warning-100',
                  };
                  return (
                    <button
                      key={index}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${colorClasses[link.color]}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium flex-1 text-left">{link.label}</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>今日收支明细</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">类型</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">用户</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">金额</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">时间</th>
                  </tr>
                </thead>
                <tbody>
                  {todayRecords.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    todayRecords.map((record) => (
                      <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Badge variant={record.type === 'deposit' ? 'success' : 'warning'} size="sm">
                            {record.type === 'deposit' ? '押金缴纳' : '押金退还'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">{record.userName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`font-semibold ${
                              record.type === 'deposit' ? 'text-success-600' : 'text-warning-600'
                            }`}
                          >
                            {record.type === 'deposit' ? '+' : '-'}¥{record.amount}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              record.status === 'completed'
                                ? 'success'
                                : record.status === 'pending'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {record.status === 'completed'
                              ? '已完成'
                              : record.status === 'pending'
                              ? '待处理'
                              : '失败'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-500">{record.createTime}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
