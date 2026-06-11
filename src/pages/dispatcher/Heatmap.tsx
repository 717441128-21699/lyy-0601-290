import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Tabs from '@/components/ui/Tabs';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  LayoutDashboard,
  Flame,
  Zap,
  FileText,
  Bike,
  MapPin,
  Users,
  RefreshCw,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import type { SidebarItem } from '@/components/layout/Sidebar';
import api from '@/utils/api';
import type { HeatmapData, DemandLevel } from '@shared/types';

const dispatcherSidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: '调度首页', icon: LayoutDashboard, path: '/dispatcher/dashboard' },
  { key: 'heatmap', label: '热力图', icon: Flame, path: '/dispatcher/heatmap' },
  { key: 'suggestions', label: '调度建议', icon: Zap, path: '/dispatcher/suggestions' },
  { key: 'tasks', label: '调度任务', icon: FileText, path: '/dispatcher/tasks' },
];

const viewTabs = [
  { key: 'bikes', label: '车辆密度' },
  { key: 'demand', label: '人流需求' },
];

export default function Heatmap() {
  const [activeTab, setActiveTab] = useState('bikes');
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get<HeatmapData[]>('/dispatch/heatmap');
      setHeatmapData(res.data || []);
    } catch (error) {
      console.error('获取热力图数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const res = await api.post<HeatmapData[]>('/dispatch/heatmap/refresh');
      setHeatmapData(res.data || []);
    } catch (error) {
      console.error('刷新热力图数据失败:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getDemandLevelBadge = (level: DemandLevel) => {
    const levelMap: Record<DemandLevel, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string; icon: React.ReactNode }> = {
      'very-high': { variant: 'danger', label: '极高', icon: <ArrowUp className="w-3 h-3" /> },
      high: { variant: 'warning', label: '高', icon: <TrendingUp className="w-3 h-3" /> },
      medium: { variant: 'primary', label: '中', icon: <Minus className="w-3 h-3" /> },
      low: { variant: 'success', label: '低', icon: <ArrowDown className="w-3 h-3" /> },
    };
    const config = levelMap[level] || levelMap.medium;
    return (
      <Badge variant={config.variant} size="sm" dot>
        {config.label}
      </Badge>
    );
  };

  const getAreaColor = (level: DemandLevel) => {
    const colorMap: Record<DemandLevel, string> = {
      'very-high': 'bg-danger-500',
      high: 'bg-warning-500',
      medium: 'bg-primary-500',
      low: 'bg-success-500',
    };
    return colorMap[level] || colorMap.medium;
  };

  const getAreaBgColor = (level: DemandLevel) => {
    const colorMap: Record<DemandLevel, string> = {
      'very-high': 'bg-danger-500/30 border-danger-500/50',
      high: 'bg-warning-500/30 border-warning-500/50',
      medium: 'bg-primary-500/30 border-primary-500/50',
      low: 'bg-success-500/30 border-success-500/50',
    };
    return colorMap[level] || colorMap.medium;
  };

  const sortedData = [...heatmapData].sort((a, b) => {
    if (activeTab === 'bikes') {
      return b.bikeCount - a.bikeCount;
    }
    return b.demandCount - a.demandCount;
  });

  const maxValue = activeTab === 'bikes'
    ? Math.max(...heatmapData.map(d => d.bikeCount))
    : Math.max(...heatmapData.map(d => d.demandCount));

  return (
    <Layout title="热力图" sidebarItems={dispatcherSidebarItems}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">热力图</h2>
            <p className="text-gray-500 mt-1">查看车辆分布和人流需求热力图</p>
          </div>
          <Button
            variant="outline"
            icon={<RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            刷新数据
          </Button>
        </div>

        <Card padding="none">
          <div className="px-5 pt-5">
            <Tabs items={viewTabs} activeKey={activeTab} onChange={setActiveTab} variant="pills" />
          </div>
          <CardContent className="pt-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                {loading ? (
                  <div className="aspect-video bg-gray-100 rounded-2xl animate-pulse" />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute inset-4 grid grid-cols-3 grid-rows-2 gap-4">
                    {heatmapData.map((area) => {
                      const value = activeTab === 'bikes' ? area.bikeCount : area.demandCount;
                      const sizePercent = (value / maxValue) * 100;
                      
                      return (
                        <div
                          key={area.areaId}
                          className="relative flex items-center justify-center"
                        >
                          <div
                            className={`${getAreaBgColor(area.demandLevel)} rounded-2xl border-2 flex flex-col items-center justify-center p-4 transition-all duration-500 cursor-pointer hover:scale-105`}
                            style={{
                              width: `${Math.max(60, Math.min(100, sizePercent + 50))}%`,
                              height: `${Math.max(60, Math.min(100, sizePercent + 50))}%`,
                            }}
                          >
                            <p className="text-white font-bold text-lg drop-shadow-md">
                              {activeTab === 'bikes' ? `${area.bikeCount}辆` : `${area.demandCount}人`}
                            </p>
                            <p className="text-white/90 text-xs font-medium drop-shadow-md">
                              {area.areaName}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                    <p className="text-xs font-medium text-gray-700 mb-2">图例</p>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-danger-500" />
                        <span className="text-xs text-gray-600">极高</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-warning-500" />
                        <span className="text-xs text-gray-600">高</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary-500" />
                        <span className="text-xs text-gray-600">中</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-success-500" />
                        <span className="text-xs text-gray-600">低</span>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-500" />
                  区域列表
                </h3>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {sortedData.map((area, index) => (
                      <Card key={area.areaId} hoverable padding="sm" className="cursor-pointer">
                        <CardContent className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${getAreaColor(area.demandLevel)} flex items-center justify-center text-white font-bold`}>
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{area.areaName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {getDemandLevelBadge(area.demandLevel)}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">
                              {activeTab === 'bikes' ? (
                                <span className="flex items-center gap-1">
                                  <Bike className="w-4 h-4 text-primary-500" />
                                  {area.bikeCount}
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <Users className="w-4 h-4 text-secondary-500" />
                                  {area.demandCount}
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500">
                              {activeTab === 'bikes' ? '车辆数' : '需求量'}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
