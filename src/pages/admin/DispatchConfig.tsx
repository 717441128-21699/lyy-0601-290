import { useState, useEffect } from 'react';
import {
  Battery,
  Zap,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  Save,
  Info,
  Settings,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import api from '@/utils/api';
import type { DispatchConfig as DispatchConfigType } from '@shared/types';

export default function DispatchConfig() {
  const [config, setConfig] = useState<DispatchConfigType>({
    lowBatteryThreshold: 20,
    batteryTaskBatchSize: 10,
    demandPredictionDays: 3,
    heatmapUpdateInterval: 60,
    highDensityThreshold: 50,
    lowDensityThreshold: 5,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get<{ dispatch: DispatchConfigType }>('/admin/system-config');
        setConfig(res.data.dispatch);
      } catch (error) {
        console.error('Failed to fetch dispatch config:', error);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (field: keyof DispatchConfigType, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setConfig((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/system-config/dispatch', config);
      alert('保存成功');
    } catch (error) {
      console.error('Failed to save dispatch config:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const configItems = [
    {
      key: 'lowBatteryThreshold',
      label: '低电量阈值',
      unit: '%',
      icon: Battery,
      color: 'danger',
      description: '低于此电量的车辆将生成换电任务',
    },
    {
      key: 'batteryTaskBatchSize',
      label: '换电任务批量生成数量',
      unit: '辆',
      icon: Zap,
      color: 'warning',
      description: '每次批量生成换电任务的数量',
    },
    {
      key: 'demandPredictionDays',
      label: '需求预测天数',
      unit: '天',
      icon: Clock,
      color: 'primary',
      description: '预测未来多少天的骑行需求',
    },
    {
      key: 'heatmapUpdateInterval',
      label: '热力图更新间隔',
      unit: '秒',
      icon: MapPin,
      color: 'success',
      description: '热力图数据更新的时间间隔',
    },
    {
      key: 'highDensityThreshold',
      label: '高密度阈值',
      unit: '辆',
      icon: TrendingUp,
      color: 'danger',
      description: '超过此车辆数判定为高密度区域',
    },
    {
      key: 'lowDensityThreshold',
      label: '低密度阈值',
      unit: '辆',
      icon: TrendingDown,
      color: 'warning',
      description: '低于此车辆数判定为低密度区域',
    },
  ];

  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
  };

  return (
    <Layout title="调度参数配置">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                <Settings className="w-4 h-4 text-primary-600" />
              </div>
              <CardTitle>调度参数</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {configItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.key} className="p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[item.color]}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={config[item.key as keyof DispatchConfigType]}
                        onChange={(e) =>
                          handleChange(item.key as keyof DispatchConfigType, e.target.value)
                        }
                        className="w-full"
                      />
                      <span className="text-sm text-gray-500 w-8">{item.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <Button
                variant="primary"
                icon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                loading={saving}
                size="lg"
              >
                保存配置
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center">
                <Info className="w-4 h-4 text-success-600" />
              </div>
              <CardTitle>调度算法说明</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-primary-50 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <Battery className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-semibold text-gray-900">换电调度</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  系统实时监测车辆电量，当电量低于低电量阈值时，自动生成换电任务。
                  任务会根据位置优先级分配给附近的运维人员，确保车辆及时得到换电服务。
                  批量生成数量控制每次任务派发的规模，避免任务过多造成运维压力。
                </p>
              </div>

              <div className="p-4 bg-success-50 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-success-600" />
                  </div>
                  <span className="font-semibold text-gray-900">车辆调度</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  基于热力图数据和历史订单，智能预测各区域的骑行需求。
                  当区域车辆数超过高密度阈值时，自动生成调运建议，将车辆调度到低密度区域。
                  热力图更新间隔决定数据的实时性，间隔越短数据越准确，但系统开销越大。
                </p>
              </div>

              <div className="p-4 bg-warning-50 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-warning-600" />
                  </div>
                  <span className="font-semibold text-gray-900">需求预测</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  采用机器学习算法，结合历史数据、天气、节假日等因素，
                  预测未来几天各区域的骑行需求量。预测天数越长，调度规划越充分，
                  但预测准确度会相应降低。建议根据实际运营情况调整参数。
                </p>
              </div>

              <div className="p-4 bg-secondary-50 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                    <Zap className="w-5 h-5 text-secondary-600" />
                  </div>
                  <span className="font-semibold text-gray-900">动态平衡</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  系统根据高低密度阈值自动平衡各区域的车辆分布。
                  高密度区域车辆过剩，需要调出；低密度区域车辆不足，需要调入。
                  合理设置阈值可以避免频繁调度，同时保证用户体验。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
