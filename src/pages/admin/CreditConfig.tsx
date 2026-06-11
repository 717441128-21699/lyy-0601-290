import { useState, useEffect } from 'react';
import {
  Zap,
  Plus,
  Minus,
  Save,
  Trash2,
  Award,
  ThumbsUp,
  AlertTriangle,
  Car,
  MessageSquare,
  Wallet,
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import api from '@/utils/api';
import type { CreditConfig, DepositTier } from '@shared/types';

export default function CreditConfig() {
  const [config, setConfig] = useState<CreditConfig>({
    initialScore: 750,
    minScore: 300,
    maxScore: 950,
    completeRideBonus: 2,
    reportFaultBonus: 5,
    overtimeParkingPenalty: 10,
    damagePenalty: 50,
    complaintPenalty: 20,
    depositTiers: [
      { minScore: 850, maxScore: 950, depositAmount: 0 },
      { minScore: 750, maxScore: 849, depositAmount: 99 },
      { minScore: 650, maxScore: 749, depositAmount: 199 },
      { minScore: 300, maxScore: 649, depositAmount: 299 },
    ],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await api.get<{ credit: CreditConfig }>('/admin/system-config');
        setConfig(res.data.credit);
      } catch (error) {
        console.error('Failed to fetch credit config:', error);
      }
    };
    fetchConfig();
  }, []);

  const handleBaseChange = (field: keyof CreditConfig, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setConfig((prev) => ({ ...prev, [field]: numValue }));
    }
  };

  const handleTierChange = (index: number, field: keyof DepositTier, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) return;

    setConfig((prev) => {
      const newTiers = [...prev.depositTiers];
      newTiers[index] = { ...newTiers[index], [field]: numValue };
      return { ...prev, depositTiers: newTiers };
    });
  };

  const addTier = () => {
    setConfig((prev) => {
      const lastTier = prev.depositTiers[prev.depositTiers.length - 1];
      const newTier: DepositTier = {
        minScore: lastTier ? lastTier.minScore - 100 : 500,
        maxScore: lastTier ? lastTier.minScore - 1 : 599,
        depositAmount: 199,
      };
      return { ...prev, depositTiers: [...prev.depositTiers, newTier] };
    });
  };

  const removeTier = (index: number) => {
    if (config.depositTiers.length <= 1) return;
    setConfig((prev) => ({
      ...prev,
      depositTiers: prev.depositTiers.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/system-config/credit', config);
      alert('保存成功');
    } catch (error) {
      console.error('Failed to save credit config:', error);
      alert('保存失败');
    } finally {
      setSaving(false);
    }
  };

  const scoreRangeItems = [
    { key: 'initialScore', label: '初始信用分', icon: Zap, color: 'primary' },
    { key: 'minScore', label: '最低信用分', icon: AlertTriangle, color: 'danger' },
    { key: 'maxScore', label: '最高信用分', icon: Award, color: 'success' },
  ];

  const bonusRules = [
    { key: 'completeRideBonus', label: '完成骑行加分', icon: ThumbsUp, color: 'success' },
    { key: 'reportFaultBonus', label: '举报故障加分', icon: Car, color: 'primary' },
  ];

  const penaltyRules = [
    { key: 'overtimeParkingPenalty', label: '违停扣分', icon: AlertTriangle, color: 'warning' },
    { key: 'damagePenalty', label: '损坏车辆扣分', icon: Car, color: 'danger' },
    { key: 'complaintPenalty', label: '被投诉扣分', icon: MessageSquare, color: 'danger' },
  ];

  const colorClasses: Record<string, string> = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-warning-50 text-warning-600',
    danger: 'bg-danger-50 text-danger-600',
  };

  return (
    <Layout title="信用分配置">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>信用分基础配置</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {scoreRangeItems.map((item) => {
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
                      value={config[item.key as keyof CreditConfig] as number}
                      onChange={(e) =>
                        handleBaseChange(item.key as keyof CreditConfig, e.target.value)
                      }
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-success-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-success-600" />
                </div>
                <CardTitle>加分规则</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bonusRules.map((rule) => {
                  const Icon = rule.icon;
                  return (
                    <div key={rule.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[rule.color]}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-900">{rule.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-success-600 font-bold">+</span>
                        <Input
                          type="number"
                          value={config[rule.key as keyof CreditConfig] as number}
                          onChange={(e) =>
                            handleBaseChange(rule.key as keyof CreditConfig, e.target.value)
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">分</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-danger-100 flex items-center justify-center">
                  <Minus className="w-4 h-4 text-danger-600" />
                </div>
                <CardTitle>扣分规则</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {penaltyRules.map((rule) => {
                  const Icon = rule.icon;
                  return (
                    <div key={rule.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[rule.color]}`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-gray-900">{rule.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-danger-600 font-bold">-</span>
                        <Input
                          type="number"
                          value={config[rule.key as keyof CreditConfig] as number}
                          onChange={(e) =>
                            handleBaseChange(rule.key as keyof CreditConfig, e.target.value)
                          }
                          className="w-20"
                        />
                        <span className="text-sm text-gray-500">分</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-primary-600" />
                </div>
                <CardTitle>押金梯度配置</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
                onClick={addTier}
              >
                新增梯度
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      信用分区间（最低）
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      信用分区间（最高）
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                      押金金额（元）
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {config.depositTiers.map((tier, index) => (
                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={tier.minScore}
                          onChange={(e) => handleTierChange(index, 'minScore', e.target.value)}
                          className="w-28"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <Input
                          type="number"
                          value={tier.maxScore}
                          onChange={(e) => handleTierChange(index, 'maxScore', e.target.value)}
                          className="w-28"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">¥</span>
                          <Input
                            type="number"
                            value={tier.depositAmount}
                            onChange={(e) =>
                              handleTierChange(index, 'depositAmount', e.target.value)
                            }
                            className="w-28"
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<Trash2 className="w-4 h-4 text-danger-500" />}
                          onClick={() => removeTier(index)}
                          disabled={config.depositTiers.length <= 1}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
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
      </div>
    </Layout>
  );
}
