import { useState, useEffect } from 'react';
import {
  Users,
  Bike,
  ShoppingCart,
  DollarSign,
  Settings,
  CreditCard,
  Zap,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import api from '@/utils/api';
import type { CityStats } from '@shared/types';

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
              <ArrowUpRight
                className={`w-4 h-4 ${
                  trend === 'up' ? 'text-success-500' : 'text-danger-500 rotate-180'
                }`}
              />
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

const QuickLink = ({
  icon: Icon,
  label,
  path,
  color,
}: {
  icon: React.ElementType;
  label: string;
  path: string;
  color: string;
}) => {
  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600 hover:bg-primary-100',
    success: 'bg-success-50 text-success-600 hover:bg-success-100',
    warning: 'bg-warning-50 text-warning-600 hover:bg-warning-100',
    danger: 'bg-danger-50 text-danger-600 hover:bg-danger-100',
  };

  return (
    <button
      className={`w-full flex items-center gap-3 p-4 rounded-xl transition-colors ${colorClasses[color]}`}
    >
      <Icon className="w-6 h-6" />
      <span className="font-medium flex-1 text-left">{label}</span>
      <ArrowUpRight className="w-4 h-4" />
    </button>
  );
};

export default function AdminDashboard() {
  const [cityStats, setCityStats] = useState<CityStats[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBikes, setTotalBikes] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, dashboardRes] = await Promise.all([
          api.get<CityStats[]>('/admin/city-stats'),
          api.get('/admin/dashboard-stats'),
        ]);
        setCityStats(statsRes.data);
        const data = dashboardRes.data as Record<string, unknown>;
        setTotalUsers((data.totalUsers as number) || 12580);
        setTotalBikes((data.totalBikes as number) || 3500);
        setTodayOrders((data.todayOrders as number) || 892);
        setTodayRevenue((data.todayRevenue as number) || 25680);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const radarData = cityStats.map((city) => ({
    city: city.cityName,
    周转率: city.turnoverRate,
    故障率: 100 - city.faultRate * 10,
    满意度: city.satisfactionRate,
    日均订单: Math.round(city.avgDailyOrders / 50),
    车均收入: Math.round(city.avgRevenuePerBike / 10),
  }));

  const quickLinks = [
    { icon: CreditCard, label: '计费规则', path: '/admin/pricing', color: 'primary' },
    { icon: Zap, label: '信用分配置', path: '/admin/credit-config', color: 'warning' },
    { icon: MapPin, label: '调度参数', path: '/admin/dispatch-config', color: 'success' },
    { icon: Users, label: '用户管理', path: '/admin/users', color: 'danger' },
  ];

  const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

  return (
    <Layout title="管理首页">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="总用户数"
            value={totalUsers.toLocaleString()}
            icon={Users}
            color="primary"
            trend="up"
            trendValue="+5.2%"
          />
          <StatCard
            title="总车辆数"
            value={totalBikes.toLocaleString()}
            icon={Bike}
            color="success"
            trend="up"
            trendValue="+3.1%"
          />
          <StatCard
            title="今日订单"
            value={todayOrders.toLocaleString()}
            icon={ShoppingCart}
            color="warning"
            trend="up"
            trendValue="+8.6%"
          />
          <StatCard
            title="今日收入"
            value={formatCurrency(todayRevenue)}
            icon={DollarSign}
            color="danger"
            trend="up"
            trendValue="+12.3%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>多城市运营数据对比</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="city" tick={{ fill: '#6b7280', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <Radar
                      name="周转率"
                      dataKey="周转率"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="故障率"
                      dataKey="故障率"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="满意度"
                      dataKey="满意度"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="日均订单"
                      dataKey="日均订单"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="车均收入"
                      dataKey="车均收入"
                      stroke="#ef4444"
                      fill="#ef4444"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
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
                {quickLinks.map((link, index) => (
                  <QuickLink key={index} {...link} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>各城市运营概览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      城市
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      车辆数
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      周转率
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      故障率
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      满意度
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      日均订单
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">
                      车均收入
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cityStats.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-400">
                        暂无数据
                      </td>
                    </tr>
                  ) : (
                    cityStats.map((city) => (
                      <tr
                        key={city.cityId}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                              <MapPin className="w-4 h-4 text-primary-600" />
                            </div>
                            <span className="font-medium text-gray-900">
                              {city.cityName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-900">
                          {city.totalBikes.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant="primary" size="sm">
                            {city.turnoverRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant={city.faultRate < 5 ? 'success' : 'warning'} size="sm">
                            {city.faultRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Badge variant="success" size="sm">
                            {city.satisfactionRate.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right text-sm text-gray-900">
                          {city.avgDailyOrders.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-sm font-semibold text-success-600">
                          {formatCurrency(city.avgRevenuePerBike)}
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
