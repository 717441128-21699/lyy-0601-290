import { useState, useEffect } from 'react';
import { CreditCard, Clock, MapPin, Zap, Calendar, Timer, Save } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import api from '@/utils/api';
import type { PricingConfig } from '@shared/types';

export default function Pricing() {
  const [config, setConfig] = useState<PricingConfig>({
    baseFee: 2,
    baseDuration: 15,
    durationFee: 0.5,
    distanceFee: 0.3,
    maxDailyFee: 50,
    freeDuration: 2,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get<{ pricing: PricingConfig }>('/admin/system-config');
        setConfig(res.data.pricing);
      } catch (error) {
        console.error('Failed to fetch pricing config:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (field: keyof PricingConfig, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setConfig((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  const calculateFee = (duration: number, distance: number) => {
    if (duration <= config.freeDuration) {
      return 0;
    }
    let fee = config.baseFee;
    const extraDuration = Math.max(0, duration - config.baseDuration);
    fee += extraDuration * config.durationFee;
    fee += distance * config.distanceFee;
    return Math.min(fee, config.maxDailyFee);
  };

  const exampleDuration = 45;
  const exampleDistance = 5;
  const exampleFee = calculateFee(exampleDuration, exampleDistance);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/system-config/pricing', config);
      alert('保存成功');
    } catch (error) {
      console.error('Failed to save pricing config:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const configItems = [
    {
      key: 'baseFee',
      label: '起步价（元）',
      icon: CreditCard,
      color: 'primary',
    },
    {
      key: 'baseDuration',
      label: '起步时长（分钟）',
      icon: Clock,
      color: 'success',
    },
    {
      key: 'durationFee',
      label: '时长费（元/分钟）',
      icon: Timer,
      color: 'warning',
    },
    {
      key: 'distanceFee',
      label: '里程费（元/公里）',
      icon: MapPin,
      color: 'danger',
    },
    {
      key: 'maxDailyFee',
      label: '每日封顶（元）',
      icon: Calendar,
      color: 'secondary',
    },
    {
      key: 'freeDuration',
      label: '免费时长（分钟）',
      icon: Zap,
      color: 'primary',
    },
  ];

  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
    secondary: 'bg-secondary-50 text-secondary-600',
  };

  return (
    <Layout title="计费规则配置">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>计费规则</CardTitle>
                <Badge variant="primary">当前生效</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {configItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.key}>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClasses[item.color]}`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        {item.label}
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={config[item.key as keyof PricingConfig]}
                        onChange={(e) =>
                          handleChange(item.key as keyof PricingConfig, e.target.value)
                        }
                      />
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
              <CardTitle>费用预览</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-6 mb-6">
                <p className="text-sm text-primary-600 mb-2">示例骑行</p>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-4xl font-bold text-primary-600">¥{exampleFee.toFixed(2)}</span>
                  <span className="text-sm text-primary-500 pb-1">/ 次</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-primary-500">骑行时长</span>
                    <p className="font-semibold text-primary-700">{exampleDuration} 分钟</p>
                  </div>
                  <div>
                    <span className="text-primary-500">骑行距离</span>
                    <p className="font-semibold text-primary-700">{exampleDistance} 公里</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">起步价</span>
                  <span className="text-sm font-medium text-gray-900">¥{config.baseFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    时长费（{exampleDuration - config.baseDuration} 分钟 × ¥{config.durationFee}）
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    ¥{((exampleDuration - config.baseDuration) * config.durationFee).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    里程费（{exampleDistance} 公里 × ¥{config.distanceFee}）
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    ¥{(exampleDistance * config.distanceFee).toFixed(2)}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">总计</span>
                    <span className="text-lg font-bold text-primary-600">¥{exampleFee.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>计费规则说明</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-primary-600" />
                  </div>
                  <span className="font-medium text-gray-900">免费时长</span>
                </div>
                <p className="text-sm text-gray-500">
                  骑行时长在 {config.freeDuration} 分钟以内免费，超过后开始计费
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-success-100 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-success-600" />
                  </div>
                  <span className="font-medium text-gray-900">起步计费</span>
                </div>
                <p className="text-sm text-gray-500">
                  超过免费时长后，收取起步价 ¥{config.baseFee}（包含 {config.baseDuration} 分钟）
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-warning-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-warning-600" />
                  </div>
                  <span className="font-medium text-gray-900">每日封顶</span>
                </div>
                <p className="text-sm text-gray-500">
                  单日累计骑行费用最高 ¥{config.maxDailyFee}，超出部分免费
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
