import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  TrendingDown,
  Bike,
  FileText,
  ArrowRight,
  Clock,
  Zap,
  Check,
  X,
  Flame,
  Snowflake,
} from 'lucide-react';
import type { SidebarItem } from '@/components/layout/Sidebar';
import { useNavigate } from 'react-router-dom';
import api from '@/utils/api';
import type { HeatmapData, DispatchSuggestion, Bike as BikeType } from '@shared/types';

const dispatcherSidebarItems: SidebarItem[] = [
  { key: 'dashboard', label: '调度首页', icon: LayoutDashboard, path: '/dispatcher/dashboard' },
  { key: 'heatmap', label: '热力图', icon: Flame, path: '/dispatcher/heatmap' },
  { key: 'suggestions', label: '调度建议', icon: Zap, path: '/dispatcher/suggestions' },
  { key: 'tasks', label: '调度任务', icon: FileText, path: '/dispatcher/tasks' },
];

export default function DispatcherDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBikes: 0,
    todayTasks: 0,
    highDensityAreas: 0,
    lowDensityAreas: 0,
  });
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([]);
  const [suggestions, setSuggestions] = useState<DispatchSuggestion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [heatmapRes, suggestionsRes, bikesRes] = await Promise.all([
          api.get<HeatmapData[]>('/dispatch/heatmap'),
          api.get<DispatchSuggestion[]>('/dispatch/suggestions', { status: 'pending' }),
          api.get<BikeType[]>('/bikes'),
        ]);

        const heatmap = heatmapRes.data || [];
        const sug = suggestionsRes.data || [];
        const bikes = bikesRes.data || [];

        const highDensity = heatmap.filter(h => h.demandLevel === 'high' || h.demandLevel === 'very-high').length;
        const lowDensity = heatmap.filter(h => h.demandLevel === 'low').length;

        setStats({
          totalBikes: bikes.length,
          todayTasks: sug.length,
          highDensityAreas: highDensity,
          lowDensityAreas: lowDensity,
        });

        setHeatmapData(heatmap);
        setSuggestions(sug.slice(0, 5));
      } catch (error) {
        console.error('获取数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { variant: 'default' | 'primary' | 'success' | 'warning' | 'danger'; label: string }> = {
      high: { variant: 'danger', label: '高优先级' },
      medium: { variant: 'warning', label: '中优先级' },
      low: { variant: 'default', label: '低优先级' },
    };
    const config = priorityMap[priority] || priorityMap.low;
    return <Badge variant={config.variant} size="sm">{config.label}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  const handleConfirm = async (id: string) => {
    try {
      await api.post(`/dispatch/suggestions/${id}/confirm`);
      setSuggestions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('确认建议失败:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.post(`/dispatch/suggestions/${id}/reject`);
      setSuggestions(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('拒绝建议失败:', error);
    }
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <Layout title="调度首页" sidebarItems={dispatcherSidebarItems}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">欢迎回来，调度员</h2>
            <p className="text-gray-500 mt-1">{dateStr}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          ) : (
            <>
              <Card hoverable padding="md" className="bg-gradient-to-br from-primary-50 to-primary-100">
                <CardContent className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center text-white shadow-lg shadow-primary-200">
                    <Bike className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">车辆总数</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalBikes}</p>
                    <p className="text-xs text-primary-600 mt-1">在运营</p>
                  </div>
                </CardContent>
              </Card>

              <Card hoverable padding="md" className="bg-gradient-to-br from-secondary-50 to-secondary-100">
                <CardContent className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary-500 flex items-center justify-center text-white shadow-lg shadow-secondary-200">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">今日调度任务</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.todayTasks}</p>
                    <p className="text-xs text-secondary-600 mt-1">待确认</p>
                  </div>
                </CardContent>
              </Card>

              <Card hoverable padding="md" className="bg-gradient-to-br from-danger-50 to-danger-100">
                <CardContent className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-danger-500 flex items-center justify-center text-white shadow-lg shadow-danger-200">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">高密度区域</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.highDensityAreas}</p>
                    <p className="text-xs text-danger-600 mt-1">需调度</p>
                  </div>
                </CardContent>
              </Card>

              <Card hoverable padding="md" className="bg-gradient-to-br from-success-50 to-success-100">
                <CardContent className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-success-500 flex items-center justify-center text-white shadow-lg shadow-success-200">
                    <Snowflake className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">低密度区域</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.lowDensityAreas}</p>
                    <p className="text-xs text-success-600 mt-1">车辆充足</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card padding="md" className="cursor-pointer" onClick={() => navigate('/dispatcher/heatmap')}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>车辆密度热力图</CardTitle>
              <Button variant="ghost" size="sm">
                查看详情
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
              ) : (
                <div className="h-48 bg-gradient-to-br from-primary-100 via-secondary-100 to-danger-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-3 p-6 w-full h-full">
                    {heatmapData.slice(0, 6).map((area, idx) => {
                    const intensity = area.bikeCount / 50;
                    const bgColor = intensity > 0.7 ? 'bg-danger-400/60' : intensity > 0.4 ? 'bg-warning-400/60' : 'bg-success-400/60';
                    return (
                      <div
                        key={area.areaId}
                        className={`${bgColor} rounded-xl flex items-center justify-center text-white text-xs font-medium shadow-sm`}
                        style={{ opacity: 0.5 + intensity * 0.5 }}
                      >
                        <div className="text-center">
                          <p className="font-bold text-sm">{area.bikeCount}</p>
                          <p className="text-xs opacity-80">{area.areaName.slice(0, 4)}</p>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-gray-600">
                    点击查看详情 →
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card padding="md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>最新调度建议</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dispatcher/suggestions')}>
                查看全部
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {suggestion.fromAreaName}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900">
                            {suggestion.toAreaName}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-1">
                          {suggestion.reason}
                        </p>
                      </div>
                      {getPriorityBadge(suggestion.priority)}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Bike className="w-3 h-3" />
                        <span>{suggestion.bikeCount} 辆</span>
                        <span className="mx-1">·</span>
                        <Clock className="w-3 h-3" />
                        <span>{formatDate(suggestion.createTime)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-danger-600 hover:text-danger-700 hover:bg-danger-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleReject(suggestion.id);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          className="h-7 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleConfirm(suggestion.id);
                          }}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">暂无待确认建议</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card hoverable padding="md" className="cursor-pointer" onClick={() => navigate('/dispatcher/heatmap')}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">热力图</p>
                <p className="text-xs text-gray-500">查看车辆分布</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>

          <Card hoverable padding="md" className="cursor-pointer" onClick={() => navigate('/dispatcher/suggestions')}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center text-secondary-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">调度建议</p>
                <p className="text-xs text-gray-500">智能调度方案</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>

          <Card hoverable padding="md" className="cursor-pointer" onClick={() => navigate('/dispatcher/tasks')}>
            <CardContent className="flex items-center justify-between">
              <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center text-success-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">调度任务</p>
                <p className="text-xs text-gray-500">任务执行进度</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
