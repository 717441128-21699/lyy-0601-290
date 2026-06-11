import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Battery,
  Zap,
  Bike,
  ArrowDownToLine,
  AlertTriangle,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

const trackPoints = [
  { left: '50%', top: '80%' },
  { left: '45%', top: '70%' },
  { left: '55%', top: '60%' },
  { left: '50%', top: '50%' },
  { left: '60%', top: '40%' },
  { left: '55%', top: '30%' },
  { left: '50%', top: '20%' },
];

export default function Riding() {
  const navigate = useNavigate();
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  const [estimatedCost, setEstimatedCost] = useState(2.0);
  const [battery, setBattery] = useState(72);
  const [showEndModal, setShowEndModal] = useState(false);
  const [currentPointIndex, setCurrentPointIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const distanceTimer = setInterval(() => {
      setDistance((prev) => prev + Math.floor(Math.random() * 5) + 2);
      setCurrentPointIndex((prev) => (prev + 1) % trackPoints.length);
    }, 3000);
    return () => clearInterval(distanceTimer);
  }, []);

  useEffect(() => {
    const cost = 2 + Math.floor(duration / 900) * 1.5 + (distance / 1000) * 0.5;
    setEstimatedCost(Math.round(cost * 100) / 100);
    setBattery(Math.max(10, 72 - Math.floor(duration / 60) * 0.5));
  }, [duration, distance]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters} m`;
  };

  const handleEndRide = () => {
    setShowEndModal(true);
  };

  const confirmEndRide = () => {
    navigate('/order-detail/order-001');
  };

  const isLowBattery = battery < 20;

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-40 right-10 w-48 h-48 rounded-full bg-secondary-400/20 blur-3xl" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
        </div>

        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 400 800">
            <line x1="0" y1="100" x2="400" y2="100" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="0" y1="200" x2="400" y2="200" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="0" y1="300" x2="400" y2="300" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="0" y1="400" x2="400" y2="400" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="0" y1="500" x2="400" y2="500" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="0" y1="600" x2="400" y2="600" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="100" y1="0" x2="100" y2="800" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="200" y1="0" x2="200" y2="800" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
            <line x1="300" y1="0" x2="300" y2="800" stroke="white" strokeWidth="0.5" strokeDasharray="4,4" />
          </svg>
        </div>

        <svg className="absolute inset-0 w-full h-full opacity-40" viewBox="0 0 400 800" preserveAspectRatio="none">
          <path
            d="M 200 640 Q 180 560 220 480 Q 240 400 200 320 Q 160 240 240 160 Q 260 100 200 60"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="3"
            strokeDasharray="8,6"
            strokeLinecap="round"
          />
        </svg>

        {trackPoints.map((point, index) => (
          <div
            key={index}
            className={cn(
              'absolute w-2 h-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500',
              index <= currentPointIndex ? 'bg-secondary-400 opacity-100' : 'bg-white/30 opacity-50'
            )}
            style={{ left: point.left, top: point.top }}
          />
        ))}

        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ease-out"
          style={{
            left: trackPoints[currentPointIndex].left,
            top: trackPoints[currentPointIndex].top,
          }}
        >
          <div className="relative">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl">
              <Bike className="w-6 h-6 text-primary-500" />
            </div>
            <div className="absolute inset-0 bg-secondary-400 rounded-full animate-ping opacity-30" />
          </div>
        </div>
      </div>

      <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-8">
        <div className="glass rounded-2xl p-4 backdrop-blur-md bg-white/10 border border-white/20">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-white/70 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">骑行时长</span>
              </div>
              <p className="text-2xl font-bold text-white font-mono">
                {formatDuration(duration)}
              </p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-white/70 mb-1">
                <MapPin className="w-4 h-4" />
                <span className="text-xs">骑行里程</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatDistance(distance)}
              </p>
            </div>
            <div className="w-px h-12 bg-white/20" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-white/70 mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs">预估费用</span>
              </div>
              <p className="text-2xl font-bold text-secondary-400">
                ¥{estimatedCost.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-36 left-4 right-4 z-20">
        <div className="glass rounded-xl p-3 backdrop-blur-md bg-white/10 border border-white/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Battery className={cn('w-5 h-5', isLowBattery ? 'text-danger-400' : 'text-success-400')} />
              <span className={cn('text-sm font-medium', isLowBattery ? 'text-danger-400' : 'text-white')}>
                剩余电量 {Math.round(battery)}%
              </span>
            </div>
            {isLowBattery && (
              <div className="flex items-center gap-1 text-danger-400 text-xs animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                <span>电量不足</span>
              </div>
            )}
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isLowBattery ? 'bg-danger-500 animate-pulse' : 'bg-success-400'
              )}
              style={{ width: `${battery}%` }}
            />
          </div>
        </div>
      </div>

      <div className="absolute top-56 left-4 right-4 z-20">
        <div className="glass rounded-xl p-3 backdrop-blur-md bg-white/10 border border-white/20 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-400/30 rounded-full flex items-center justify-center">
            <Bike className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-medium">车辆编号</p>
            <p className="text-white/70 text-sm">EB001 · 已骑行 {Math.floor(duration / 60)} 分钟</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-20 pb-8 pt-6">
        <div className="px-6">
          <div className="bg-white/10 backdrop-blur-md rounded-t-3xl p-6 border-t border-x border-white/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/70 text-sm">还车区域</p>
                <p className="text-white font-medium">中心商务区 · 推荐停车点</p>
              </div>
              <span className="text-success-400 text-sm font-medium">
                已到还车区
              </span>
            </div>

            <Button
              size="lg"
              fullWidth
              variant="secondary"
              className="h-14 text-lg shadow-lg shadow-secondary-500/30"
              icon={<ArrowDownToLine className="w-5 h-5" />}
              onClick={handleEndRide}
            >
              一键还车
            </Button>

            <p className="text-center text-white/50 text-xs mt-3">
              请将车辆停放在指定区域内，规范停车
            </p>
          </div>
        </div>
      </div>

      <Modal
        open={showEndModal}
        onClose={() => setShowEndModal(false)}
        title="确认还车"
        description="请确认车辆已停放在指定区域"
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">骑行时长</span>
              <span className="font-medium text-gray-900">{formatDuration(duration)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">骑行里程</span>
              <span className="font-medium text-gray-900">{formatDistance(distance)}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between">
              <span className="text-gray-700 font-medium">预估费用</span>
              <span className="text-xl font-bold text-secondary-500">¥{estimatedCost.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowEndModal(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={confirmEndRide}
            >
              确认还车
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
