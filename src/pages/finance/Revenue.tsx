import { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Calendar as CalendarIcon,
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import api from '@/utils/api';
import type { DailyRevenue } from '@shared/types';

const SummaryCard = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
}) => {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
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
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );
};

export default function Revenue() {
  const [revenues, setRevenues] = useState<DailyRevenue[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<DailyRevenue[]>('/finance/daily-revenue', { days: 30 });
        setRevenues(res.data);
        if (res.data.length > 0) {
          setEndDate(res.data[res.data.length - 1].date);
          setStartDate(res.data[0].date);
        }
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRevenue = revenues.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = revenues.reduce((sum, item) => sum + item.orders, 0);
  const avgOrderAmount = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const chartData = revenues.map((item) => ({
    date: item.date.slice(5),
    收入: item.revenue,
    订单数: item.orders,
  }));

  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

  return (
    <Layout title="收入统计">
      <div className="space-y-6">
        <Card hoverable={false}>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">日期范围：</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
                <span className="text-gray-400">至</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <Badge variant="primary">共 {revenues.length} 天</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard
            title="总收入"
            value={formatCurrency(totalRevenue)}
            icon={DollarSign}
            color="success"
            subtitle="统计周期内累计收入"
          />
          <SummaryCard
            title="总订单"
            value={totalOrders.toLocaleString()}
            icon={ShoppingCart}
            color="primary"
            subtitle="统计周期内累计订单"
          />
          <SummaryCard
            title="平均客单价"
            value={formatCurrency(Math.round(avgOrderAmount * 100) / 100)}
            icon={TrendingUp}
            color="warning"
            subtitle="总收入 / 总订单数"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>收入趋势图</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="收入"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="收入(元)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="订单数"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                    name="订单数"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>日收入明细</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">日期</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">订单数</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">收入</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      平均客单价
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {revenues.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    [...revenues].reverse().map((item) => (
                      <tr key={item.date} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{item.date}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                          {item.orders.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-success-600 text-right">
                          {formatCurrency(item.revenue)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 text-right">
                          {formatCurrency(item.avgOrderAmount)}
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
    </Layout>
  );
}
