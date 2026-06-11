import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
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
  Search,
  Battery,
  Zap,
  AlertCircle,
  BarChart3,
  Eye,
} from 'lucide-react';
import type { SidebarItem } from '@/components/layout/Sidebar';
import api from '@/utils/api';
import type { Bike as BikeType, BikeStatus } from '@shared/types';

const operatorSidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: '运维看板', icon: LayoutDashboard, path: '/operator/dashboard' },
  { key: 'battery', label: '换电任务', icon: BatteryCharging, path: '/operator/battery-tasks' },
  { key: 'fault', label: '故障报修', icon: AlertTriangle, path: '/operator/fault-reports' },
  { key: 'maintenance', label: '维修记录', icon: Wrench, path: '/operator/maintenance-records' },
  { key: 'bikes', label: '车辆列表', icon: Bike, path: '/operator/bikes' },
];

const statusOptions = [
  { value: '', label: '全部状态' },
  { value: 'available', label: '可用' },
  { value: 'in-use', label: '使用中' },
  { value: 'low-battery', label: '低电量' },
  { value: 'fault', label: '故障' },
  { value: 'maintenance', label: '维修中' },
];

const areaOptions = [
  { value: '', label: '全部区域' },
  { value: 'area-001', label: '中心商务区' },
  { value: 'area-002', label: '科技园区' },
  { value: 'area-003', label: '大学城' },
  { value: 'area-004', label: '居民区A' },
  { value: 'area-005', label: '居民区B' },
  { value: 'area-006', label: '交通枢纽' },
];

export default function Bikes() {
  const [loading, setLoading] = useState(true);
  const [bikes, setBikes] = useState<BikeType[]>([]);
  const [filteredBikes, setFilteredBikes] = useState<BikeType[]>([]);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const res = await api.get<BikeType[]>('/bikes');
      setBikes(res.data || []);
      setFilteredBikes(res.data || []);
    } catch (error) {
      console.error('获取车辆列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBikes();
  }, []);

  useEffect(() => {
    let result = bikes;

    if (searchText) {
      result = result.filter(bike =>
        bike.bikeNo.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter) {
      result = result.filter(bike => bike.status === statusFilter);
    }

    if (areaFilter) {
      result = result.filter(bike => bike.areaId === areaFilter);
    }

    setFilteredBikes(result);
  }, [searchText, statusFilter, areaFilter, bikes]);

  const getStatusBadge = (status: BikeStatus) => {
    const statusMap: Record<BikeStatus, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
      available: { variant: 'success', label: '可用' },
      'in-use': { variant: 'primary', label: '使用中' },
      'low-battery': { variant: 'warning', label: '低电量' },
      fault: { variant: 'danger', label: '故障' },
      maintenance: { variant: 'default', label: '维修中' },
    };
    const config = statusMap[status];
    return <Badge variant={config.variant} size="sm" dot>{config.label}</Badge>;
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 60) return 'text-success-600';
    if (battery > 30) return 'text-warning-600';
    return 'text-danger-600';
  };

  const getBatteryBgColor = (battery: number) => {
    if (battery > 60) return 'bg-success-500';
    if (battery > 30) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  return (
    <Layout title="车辆列表" sidebarItems={operatorSidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">车辆列表</h2>
            <p className="text-gray-500 mt-1">查看和管理所有车辆</p>
          </div>
        </div>

        <Card padding="md">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="搜索车辆编号..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="状态筛选"
              />
            </div>
            <div className="w-full md:w-48">
              <Select
                options={areaOptions}
                value={areaFilter}
                onChange={setAreaFilter}
                placeholder="区域筛选"
              />
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredBikes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBikes.map((bike) => (
              <Card key={bike.id} hoverable padding="md">
                <CardHeader className="flex flex-row items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                      <Bike className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{bike.bikeNo}</CardTitle>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {bike.areaName}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(bike.status)}
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Battery className={`w-4 h-4 ${getBatteryColor(bike.battery)}`} />
                      <span className={`text-sm font-semibold ${getBatteryColor(bike.battery)}`}>
                        {bike.battery}%
                      </span>
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getBatteryBgColor(bike.battery)}`}
                          style={{ width: `${bike.battery}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="w-4 h-4 text-primary-500" />
                      <span className="text-gray-600">骑行 {bike.totalRides} 次</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle className="w-4 h-4 text-danger-500" />
                      <span className="text-gray-600">故障 {bike.faultCount} 次</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    icon={<Eye className="w-4 h-4" />}
                  >
                    查看详情
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Empty
            title="没有找到车辆"
            description={searchText || statusFilter || areaFilter ? '没有符合条件的车辆，请调整筛选条件' : '暂无车辆数据'}
            icon={<Bike className="w-10 h-10 text-gray-400" />}
          />
        )}
      </div>
    </Layout>
  );
}
