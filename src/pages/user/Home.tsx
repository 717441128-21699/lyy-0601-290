import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Battery,
  QrCode,
  Bell,
  User,
  Navigation,
  Zap,
  Bike,
} from 'lucide-react';
import type { Bike as BikeType } from '@shared/types';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import BottomNav from '@/components/layout/BottomNav';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import api from '@/utils/api';
import { toast } from '@/components/ui/toastStore';

const mockBikes: BikeType[] = [
  { id: 'bike-001', bikeNo: 'EB001', status: 'available', battery: 85, lng: 116.4074, lat: 39.9042, distance: 120, areaId: 'area-001', areaName: '中心商务区', totalRides: 156, faultCount: 2 },
  { id: 'bike-002', bikeNo: 'EB002', status: 'available', battery: 92, lng: 116.4084, lat: 39.9052, distance: 180, areaId: 'area-001', areaName: '中心商务区', totalRides: 203, faultCount: 1 },
  { id: 'bike-004', bikeNo: 'EB004', status: 'low-battery', battery: 15, lng: 116.4094, lat: 39.9062, distance: 250, areaId: 'area-001', areaName: '中心商务区', totalRides: 245, faultCount: 0 },
  { id: 'bike-005', bikeNo: 'EB005', status: 'available', battery: 78, lng: 116.3974, lat: 39.9842, distance: 320, areaId: 'area-002', areaName: '科技园区', totalRides: 189, faultCount: 1 },
  { id: 'bike-006', bikeNo: 'EB006', status: 'available', battery: 45, lng: 116.3984, lat: 39.9852, distance: 400, areaId: 'area-002', areaName: '科技园区', totalRides: 167, faultCount: 2 },
];

const bikePositions = [
  { left: '30%', top: '35%' },
  { left: '60%', top: '25%' },
  { left: '75%', top: '50%' },
  { left: '20%', top: '60%' },
  { left: '50%', top: '70%' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [nearbyBikes, setNearbyBikes] = useState<BikeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBike, setSelectedBike] = useState<string | null>(null);
  const [recommendedBikes, setRecommendedBikes] = useState<BikeType[]>([]);
  const [showRecommendModal, setShowRecommendModal] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNearbyBikes(mockBikes);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleScan = async (bikeId?: string) => {
    if (!user) {
      toast.error('请先登录');
      return;
    }
    if (scanning) return;

    try {
      setScanning(true);
      const targetBikeId = bikeId || `bike-${Date.now()}`;
      const res = await api.post<{ success: boolean; orderId?: string; message?: string; recommendedBikes?: BikeType[] }>(
        '/orders/unlock',
        { userId: user.id, bikeId: targetBikeId }
      );

      if (res.code === 200 && res.data?.success) {
        toast.success('开锁成功');
        if (res.data.orderId) {
          localStorage.setItem('currentOrderId', res.data.orderId);
        }
        navigate('/user/riding');
      } else {
        toast.error(res.data?.message || '开锁失败');
        if (res.data?.recommendedBikes && res.data.recommendedBikes.length > 0) {
          setRecommendedBikes(res.data.recommendedBikes);
          setShowRecommendModal(true);
        }
      }
    } catch (error: any) {
      toast.error(error?.message || '开锁失败');
      if (error?.data?.recommendedBikes && error.data.recommendedBikes.length > 0) {
        setRecommendedBikes(error.data.recommendedBikes);
        setShowRecommendModal(true);
      }
    } finally {
      setScanning(false);
    }
  };

  const handleBikeClick = (bikeId: string) => {
    setSelectedBike(bikeId === selectedBike ? null : bikeId);
  };

  const getBatteryColor = (battery: number) => {
    if (battery >= 60) return 'text-success-500';
    if (battery >= 20) return 'text-warning-500';
    return 'text-danger-500';
  };

  const getBatteryBg = (battery: number) => {
    if (battery >= 60) return 'bg-success-500';
    if (battery >= 20) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="success" size="sm">可用</Badge>;
      case 'low-battery':
        return <Badge variant="warning" size="sm">低电量</Badge>;
      case 'in-use':
        return <Badge variant="primary" size="sm">骑行中</Badge>;
      case 'fault':
        return <Badge variant="danger" size="sm">故障</Badge>;
      default:
        return <Badge size="sm">未知</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative h-[55vh] bg-gradient-to-br from-primary-400 via-primary-500 to-primary-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-secondary-400/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="absolute inset-0 opacity-30">
          <svg className="w-full h-full" viewBox="0 0 400 400">
            <line x1="0" y1="80" x2="400" y2="80" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="0" y1="160" x2="400" y2="160" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="0" y1="240" x2="400" y2="240" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="0" y1="320" x2="400" y2="320" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="80" y1="0" x2="80" y2="400" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="160" y1="0" x2="160" y2="400" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="240" y1="0" x2="240" y2="400" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="320" y1="0" x2="320" y2="400" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
          </svg>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="w-4 h-4 bg-secondary-500 rounded-full border-4 border-white shadow-lg z-10 relative" />
            <div className="absolute inset-0 bg-secondary-400 rounded-full animate-ping opacity-40" />
            <div className="absolute -inset-2 bg-secondary-300/30 rounded-full animate-pulse" />
          </div>
        </div>

        {nearbyBikes.slice(0, 5).map((bike, index) => {
          const pos = bikePositions[index % bikePositions.length];
          const isSelected = selectedBike === bike.id;
          return (
            <button
              key={bike.id}
              className={cn(
                'absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-10',
                isSelected && 'scale-125 z-20'
              )}
              style={{ left: pos.left, top: pos.top }}
              onClick={() => handleBikeClick(bike.id)}
            >
              <div className="relative">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors',
                  bike.status === 'available' ? 'bg-white' : 'bg-gray-300',
                  isSelected && 'ring-4 ring-secondary-400 ring-opacity-50'
                )}>
                  <Bike className={cn(
                    'w-5 h-5',
                    bike.status === 'available' ? 'text-primary-500' : 'text-gray-500'
                  )} />
                </div>
                {isSelected && (
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-gray-700 shadow">
                      {bike.bikeNo} · {bike.distance}m
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}

        <div className="relative z-20 p-4 pt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-white font-medium">{user?.nickname || '用户'}</p>
                <div className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-secondary-400" />
                  <span className="text-white/80 text-xs">信用分 {user?.creditScore || 780}</span>
                </div>
              </div>
            </div>
            <button className="relative w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary-500 rounded-full" />
            </button>
          </div>

          <div className="mt-4 glass rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-500" />
            </div>
            <div className="flex-1">
              <p className="text-gray-500 text-xs">当前位置</p>
              <p className="text-gray-900 font-medium">中心商务区 · 国贸大厦附近</p>
            </div>
            <button className="text-primary-500 text-sm font-medium flex items-center gap-1">
              <Navigation className="w-4 h-4" />
              定位
            </button>
          </div>
        </div>

        <div className="absolute bottom-24 left-4 right-4 z-20">
          <div className="glass rounded-2xl p-3 flex items-center justify-around">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{nearbyBikes.length}</p>
              <p className="text-xs text-gray-600">附近车辆</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">
                {nearbyBikes.filter(b => b.status === 'available').length}
              </p>
              <p className="text-xs text-gray-600">可骑行</p>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <p className="text-2xl font-bold text-warning-600">
                {nearbyBikes.filter(b => b.status === 'low-battery').length}
              </p>
              <p className="text-xs text-gray-600">低电量</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative -mt-6 z-30">
        <div className="bg-gray-50 rounded-t-3xl pt-4 pb-6">
          <div className="px-4 mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">附近车辆</h2>
              <button className="text-primary-500 text-sm font-medium">查看全部</button>
            </div>
          </div>

          <div className="px-4 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} padding="md" hoverable={false}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                    <div className="w-16 h-8 bg-gray-100 rounded-full" />
                  </div>
                </Card>
              ))
            ) : (
              nearbyBikes.map((bike) => (
                <Card
                  key={bike.id}
                  padding="md"
                  className={cn(
                    'cursor-pointer transition-all',
                    selectedBike === bike.id && 'ring-2 ring-primary-400'
                  )}
                  onClick={() => handleBikeClick(bike.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      bike.status === 'available' ? 'bg-primary-50' : 'bg-gray-100'
                    )}>
                      <Bike className={cn(
                        'w-6 h-6',
                        bike.status === 'available' ? 'text-primary-500' : 'text-gray-400'
                      )} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{bike.bikeNo}</span>
                        {getStatusBadge(bike.status)}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1">
                          <Battery className={cn('w-4 h-4', getBatteryColor(bike.battery))} />
                          <span className={cn('text-sm', getBatteryColor(bike.battery))}>
                            {bike.battery}%
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{bike.distance}m</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={bike.status === 'available' ? 'primary' : 'secondary'}
                      disabled={scanning || bike.status === 'in-use' || bike.status === 'fault' || bike.status === 'maintenance'}
                      loading={scanning}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleScan(bike.id);
                      }}
                    >
                      扫码
                    </Button>
                  </div>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', getBatteryBg(bike.battery))}
                      style={{ width: `${bike.battery}%` }}
                    />
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => handleScan()}
        disabled={scanning}
        className={cn(
          'fixed bottom-24 left-1/2 -translate-x-1/2 z-40 w-16 h-16 rounded-full bg-gradient-to-r from-secondary-400 to-secondary-500 shadow-lg shadow-secondary-400/40 flex items-center justify-center text-white transition-transform',
          !scanning && 'hover:scale-105 active:scale-95',
          scanning && 'opacity-70 cursor-not-allowed'
        )}
      >
        <QrCode className={cn('w-7 h-7', scanning && 'animate-spin')} />
        <span className="absolute -bottom-7 text-xs text-gray-500 font-medium whitespace-nowrap">
          {scanning ? '开锁中...' : '扫码开锁'}
        </span>
      </button>

      <BottomNav />

      <Modal
        open={showRecommendModal}
        onClose={() => setShowRecommendModal(false)}
        title="推荐车辆"
        description="当前车辆不可用，为您推荐附近可用车辆"
        width="lg"
      >
        <div className="space-y-3">
          {recommendedBikes.map((bike) => (
            <div
              key={bike.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <Bike className="w-6 h-6 text-primary-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{bike.bikeNo}</span>
                  {getStatusBadge(bike.status)}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1">
                    <Battery className={cn('w-4 h-4', getBatteryColor(bike.battery))} />
                    <span className={cn('text-sm', getBatteryColor(bike.battery))}>
                      {bike.battery}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{bike.distance}m</span>
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="primary"
                icon={<QrCode className="w-4 h-4" />}
                onClick={() => {
                  setShowRecommendModal(false);
                  handleScan(bike.id);
                }}
              >
                立即扫码
              </Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
