import { useState, useEffect } from 'react';
import {
  PieChart as PieChartIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  Info,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import api from '@/utils/api';
import type { ProfitReport } from '@shared/types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendValue,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
  trend?: 'up' | 'down';
  trendValue?: string;
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

export default function Reports() {
  const [reports, setReports] = useState<ProfitReport[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get<ProfitReport[]>('/finance/profit-reports');
        setReports(res.data);
        if (res.data.length > 0) {
          setSelectedMonth(res.data[0].month);
        }
      } catch (error) {
        console.error('Failed to fetch profit reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentReport = reports.find((r) => r.month === selectedMonth);

  const monthOptions = reports.map((r) => ({
    value: r.month,
    label: `${r.month}月`,
  }));

  const pieData = currentReport
    ? [
        { name: '订单收入', value: currentReport.orderRevenue },
        { name: '押金收入', value: currentReport.depositIncome },
        { name: '运营成本', value: currentReport.totalCost },
      ]
    : [];

  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

  const handleExport = () => {
    alert('报表导出功能 - 模拟');
  };

  return (
    <Layout title="利润报表">
      <div className="space-y-6">
        <Card hoverable={false}>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">选择月份：</span>
                </div>
                <Select
                  options={monthOptions}
                  value={selectedMonth}
                  onChange={setSelectedMonth}
                  placeholder="选择月份"
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Info className="w-4 h-4" />
                  <span>每月1号自动生成</span>
                </div>
                <Button
                  variant="outline"
                  icon={<Download className="w-4 h-4" />}
                  onClick={handleExport}
                >
                  导出报表
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总收入"
            value={formatCurrency(currentReport?.totalRevenue || 0)}
            icon={DollarSign}
            color="success"
            trend="up"
            trendValue="+12.5%"
          />
          <StatCard
            title="总成本"
            value={formatCurrency(currentReport?.totalCost || 0)}
            icon={PieChartIcon}
            color="danger"
            trend="up"
            trendValue="+8.3%"
          />
          <StatCard
            title="净利润"
            value={formatCurrency(currentReport?.netProfit || 0)}
            icon={TrendingUp}
            color="primary"
            trend="up"
            trendValue="+15.2%"
          />
          <StatCard
            title="利润率"
            value={`${currentReport?.profitMargin.toFixed(1) || 0}%`}
            icon={PieChartIcon}
            color="warning"
            trend="up"
            trendValue="+2.1%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>收入成本构成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>成本明细</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary-500" />
                    <span className="text-sm text-gray-700">电池成本</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(currentReport?.batteryCost || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-warning-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-warning-500" />
                    <span className="text-sm text-gray-700">维护成本</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(currentReport?.maintenanceCost || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-success-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-success-500" />
                    <span className="text-sm text-gray-700">人员成本</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(currentReport?.staffCost || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-secondary-500" />
                    <span className="text-sm text-gray-700">其他成本</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(currentReport?.otherCost || 0)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">总成本</span>
                    <span className="text-lg font-bold text-danger-600">
                      {formatCurrency(currentReport?.totalCost || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>月度对比</CardTitle>
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
                      总收入
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      总成本
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      净利润
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      利润率
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                      状态
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    reports.map((report) => (
                      <tr
                        key={report.month}
                        className={`border-b border-gray-50 hover:bg-gray-50 ${
                          report.month === selectedMonth ? 'bg-primary-50/50' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          {report.month}月
                        </td>
                        <td className="py-3 px-4 text-sm text-success-600 text-right font-medium">
                          {formatCurrency(report.totalRevenue)}
                        </td>
                        <td className="py-3 px-4 text-sm text-danger-600 text-right font-medium">
                          {formatCurrency(report.totalCost)}
                        </td>
                        <td className="py-3 px-4 text-sm text-primary-600 text-right font-semibold">
                          {formatCurrency(report.netProfit)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 text-right">
                          {report.profitMargin.toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="success" size="sm">
                            已生成
                          </Badge>
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
