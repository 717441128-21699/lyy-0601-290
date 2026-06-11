import { useState, useEffect } from 'react';
import {
  Battery,
  Wrench,
  Users,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import {
  BarChart,
  Bar,
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
import api from '@/utils/api';
import type { OperatingCost } from '@shared/types';

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  percentage,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  percentage?: number;
}) => {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
    secondary: 'bg-secondary-50 text-secondary-600',
  };

  return (
    <Card hoverable={false}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {percentage !== undefined && (
            <p className="text-xs text-gray-400 mt-2">占比 {percentage.toFixed(1)}%</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};

export default function Cost() {
  const [costs, setCosts] = useState<OperatingCost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<OperatingCost[]>('/finance/operating-costs', { days: 7 });
        setCosts(res.data);
      } catch (error) {
        console.error('Failed to fetch cost data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalBatteryCost = costs.reduce((sum, item) => sum + item.batteryCost, 0);
  const totalMaintenanceCost = costs.reduce((sum, item) => sum + item.maintenanceCost, 0);
  const totalStaffCost = costs.reduce((sum, item) => sum + item.staffCost, 0);
  const totalOtherCost = costs.reduce((sum, item) => sum + item.otherCost, 0);
  const totalCost = costs.reduce((sum, item) => sum + item.totalCost, 0);

  const chartData = costs.map((item) => ({
    date: item.date.slice(5),
    电池成本: item.batteryCost,
    维护成本: item.maintenanceCost,
    人员成本: item.staffCost,
    其他成本: item.otherCost,
  }));

  const monthlyData = [
    { month: '1月', 电池成本: 45000, 维护成本: 28000, 人员成本: 85000, 其他成本: 12000 },
    { month: '2月', 电池成本: 42000, 维护成本: 25000, 人员成本: 85000, 其他成本: 10000 },
    { month: '3月', 电池成本: 48000, 维护成本: 32000, 人员成本: 88000, 其他成本: 15000 },
    { month: '4月', 电池成本: 52000, 维护成本: 30000, 人员成本: 90000, 其他成本: 13000 },
    { month: '5月', 电池成本: 55000, 维护成本: 35000, 人员成本: 92000, 其他成本: 18000 },
    { month: '6月', 电池成本: 58000, 维护成本: 38000, 人员成本: 95000, 其他成本: 20000 },
  ];

  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

  return (
    <Layout title="运营成本">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="电池成本"
            value={formatCurrency(totalBatteryCost)}
            icon={Battery}
            color="primary"
            percentage={totalCost > 0 ? (totalBatteryCost / totalCost) * 100 : 0}
          />
          <StatCard
            title="维护成本"
            value={formatCurrency(totalMaintenanceCost)}
            icon={Wrench}
            color="warning"
            percentage={totalCost > 0 ? (totalMaintenanceCost / totalCost) * 100 : 0}
          />
          <StatCard
            title="人员成本"
            value={formatCurrency(totalStaffCost)}
            icon={Users}
            color="success"
            percentage={totalCost > 0 ? (totalStaffCost / totalCost) * 100 : 0}
          />
          <StatCard
            title="其他成本"
            value={formatCurrency(totalOtherCost)}
            icon={MoreHorizontal}
            color="secondary"
            percentage={totalCost > 0 ? (totalOtherCost / totalCost) * 100 : 0}
          />
          <StatCard
            title="总成本"
            value={formatCurrency(totalCost)}
            icon={DollarSign}
            color="danger"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>近7天成本趋势</CardTitle>
              <Badge variant="primary">近7天</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
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
                  <Legend />
                  <Bar
                    dataKey="电池成本"
                    stackId="a"
                    fill="#3b82f6"
                    name="电池成本"
                  />
                  <Bar
                    dataKey="维护成本"
                    stackId="a"
                    fill="#f59e0b"
                    name="维护成本"
                  />
                  <Bar
                    dataKey="人员成本"
                    stackId="a"
                    fill="#10b981"
                    name="人员成本"
                  />
                  <Bar
                    dataKey="其他成本"
                    stackId="a"
                    fill="#8b5cf6"
                    name="其他成本"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>成本明细</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        日期
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        电池
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        维护
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        人员
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        总计
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {costs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-400">
                          暂无数据
                        </td>
                      </tr>
                    ) : (
                      [...costs].reverse().map((item) => (
                        <tr
                          key={item.date}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">{item.date}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">
                            ¥{item.batteryCost.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">
                            ¥{item.maintenanceCost.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 text-right">
                            ¥{item.staffCost.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-danger-600 text-right">
                            ¥{item.totalCost.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>月度成本汇总</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                        月份
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        总成本
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                        环比
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((item, index) => {
                      const total =
                        item.电池成本 + item.维护成本 + item.人员成本 + item.其他成本;
                      const prevTotal =
                        index > 0
                          ? monthlyData[index - 1].电池成本 +
                            monthlyData[index - 1].维护成本 +
                            monthlyData[index - 1].人员成本 +
                            monthlyData[index - 1].其他成本
                          : total;
                      const change =
                        index > 0
                          ? ((total - prevTotal) / prevTotal) * 100
                          : 0;
                      return (
                        <tr
                          key={item.month}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {item.month}
                          </td>
                          <td className="py-3 px-4 text-sm font-semibold text-danger-600 text-right">
                            ¥{total.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {index > 0 ? (
                              <span
                                className={`text-sm font-medium ${
                                  change >= 0 ? 'text-danger-600' : 'text-success-600'
                                }`}
                              >
                                {change >= 0 ? '+' : ''}
                                {change.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
