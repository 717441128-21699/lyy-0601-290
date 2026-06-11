import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
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
  User,
  Clock,
  Plus,
  X,
  DollarSign,
  Package,
  FileText,
} from 'lucide-react';
import type { SidebarItem } from '@/components/layout/Sidebar';
import api from '@/utils/api';
import type { MaintenanceRecord, Bike as BikeType } from '@shared/types';

const operatorSidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: '运维看板', icon: LayoutDashboard, path: '/operator/dashboard' },
  { key: 'battery', label: '换电任务', icon: BatteryCharging, path: '/operator/battery-tasks' },
  { key: 'fault', label: '故障报修', icon: AlertTriangle, path: '/operator/fault-reports' },
  { key: 'maintenance', label: '维修记录', icon: Wrench, path: '/operator/maintenance-records' },
  { key: 'bikes', label: '车辆列表', icon: Bike, path: '/operator/bikes' },
];

const maintenanceTypes = [
  { value: '定期保养', label: '定期保养' },
  { value: '刹车维修', label: '刹车维修' },
  { value: '电池维修', label: '电池维修' },
  { value: '车锁维修', label: '车锁维修' },
  { value: '轮胎更换', label: '轮胎更换' },
  { value: '其他维修', label: '其他维修' },
];

export default function MaintenanceRecords() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [bikes, setBikes] = useState<BikeType[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    bikeId: '',
    maintenanceType: '',
    description: '',
    parts: '',
    cost: '',
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.get<MaintenanceRecord[]>('/operators/maintenance-records');
      setRecords(res.data || []);
    } catch (error) {
      console.error('获取维修记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBikes = async () => {
    try {
      const res = await api.get<BikeType[]>('/bikes');
      setBikes(res.data || []);
    } catch (error) {
      console.error('获取车辆列表失败:', error);
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchBikes();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const handleOpenAddModal = () => {
    setFormData({
      bikeId: '',
      maintenanceType: '',
      description: '',
      parts: '',
      cost: '',
    });
    setAddModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.bikeId || !formData.maintenanceType || !formData.description) {
      return;
    }

    try {
      setActionLoading(true);
      const partsArray = formData.parts
        .split(/[,，]/)
        .map(p => p.trim())
        .filter(p => p);

      await api.post('/operators/maintenance-records', {
        bikeId: formData.bikeId,
        maintenanceType: formData.maintenanceType,
        description: formData.description,
        partsReplaced: partsArray,
        cost: parseFloat(formData.cost) || 0,
      });

      await fetchRecords();
      setAddModalOpen(false);
    } catch (error) {
      console.error('创建维修记录失败:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const bikeOptions = bikes.map(bike => ({
    value: bike.id,
    label: `${bike.bikeNo} - ${bike.areaName}`,
  }));

  return (
    <Layout title="维修记录" sidebarItems={operatorSidebarItems}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">维修记录</h2>
            <p className="text-gray-500 mt-1">查看和管理车辆维修记录</p>
          </div>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenAddModal}
          >
            新增记录
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : records.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((record) => (
              <Card key={record.id} hoverable padding="md">
                <CardHeader className="flex flex-row items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-success-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{record.bikeNo}</CardTitle>
                      <p className="text-xs text-gray-500 mt-0.5">{record.maintenanceType}</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">已完成</Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-600 line-clamp-2">{record.description}</p>
                  
                  {record.partsReplaced.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {record.partsReplaced.map((part, idx) => (
                        <Badge key={idx} variant="secondary" size="sm">
                          {part}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500">
                      <User className="w-4 h-4" />
                      <span>{record.operatorName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(record.createTime)}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1 text-success-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">¥{record.cost.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Package className="w-4 h-4" />
                      <span>{record.partsReplaced.length} 个零件</span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Empty
            title="暂无维修记录"
            description="点击右上角按钮添加第一条维修记录"
            icon={<FileText className="w-10 h-10 text-gray-400" />}
            action={
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleOpenAddModal}
              >
                新增记录
              </Button>
            }
          />
        )}

        <Modal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          title="新增维修记录"
          width="md"
        >
          <div className="space-y-4">
            <div>
              <Select
                label="选择车辆"
                options={bikeOptions}
                value={formData.bikeId}
                onChange={(val) => setFormData(prev => ({ ...prev, bikeId: val }))}
                placeholder="请选择车辆"
              />
            </div>

            <div>
              <Select
                label="维修类型"
                options={maintenanceTypes}
                value={formData.maintenanceType}
                onChange={(val) => setFormData(prev => ({ ...prev, maintenanceType: val }))}
                placeholder="请选择维修类型"
              />
            </div>

            <div>
              <Input
                label="维修描述"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="请输入维修描述"
              />
            </div>

            <div>
              <Input
                label="更换零件（多个用逗号分隔）"
                value={formData.parts}
                onChange={(e) => setFormData(prev => ({ ...prev, parts: e.target.value }))}
                placeholder="例如：刹车片, 电池"
              />
            </div>

            <div>
              <Input
                label="维修费用（元）"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                placeholder="请输入维修费用"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setAddModalOpen(false)}>
                取消
              </Button>
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                loading={actionLoading}
                onClick={handleSubmit}
                disabled={!formData.bikeId || !formData.maintenanceType || !formData.description}
              >
                提交
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
}
