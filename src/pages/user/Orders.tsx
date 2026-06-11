import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bike,
  Clock,
  MapPin,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import Empty from '@/components/ui/Empty';
import { SkeletonCard } from '@/components/ui/Skeleton';
import BottomNav from '@/components/layout/BottomNav';
import { cn } from '@/lib/utils';
import type { Order } from '@shared/types';

const mockOrders: Order[] = [
  {
    id: 'order-001',
    userId: 'user-001',
    userName: '骑行达人',
    bikeId: 'bike-001',
    bikeNo: 'EB001',
    status: 'completed',
    startTime: '2026-06-11 08:30:00',
    endTime: '2026-06-11 08:45:30',
    duration: 930,
    distance: 3200,
    startLng: 116.4074,
    startLat: 39.9042,
    endLng: 116.3974,
    endLat: 39.9842,
    baseFee: 2,
    durationFee: 1.5,
    distanceFee: 1.6,
    discount: 0,
    totalAmount: 5.1,
    paidAmount: 5.1,
  },
  {
    id: 'order-002',
    userId: 'user-001',
    userName: '骑行达人',
    bikeId: 'bike-002',
    bikeNo: 'EB002',
    status: 'completed',
    startTime: '2026-06-10 18:20:00',
    endTime: '2026-06-10 18:35:00',
    duration: 900,
    distance: 2800,
    startLng: 116.3974,
    startLat: 39.9842,
    endLng: 116.4074,
    endLat: 39.9042,
    baseFee: 2,
    durationFee: 1.5,
    distanceFee: 1.4,
    discount: 0.5,
    totalAmount: 4.4,
    paidAmount: 4.4,
  },
  {
    id: 'order-003',
    userId: 'user-001',
    userName: '骑行达人',
    bikeId: 'bike-005',
    bikeNo: 'EB005',
    status: 'completed',
    startTime: '2026-06-09 12:10:00',
    endTime: '2026-06-09 12:25:30',
    duration: 930,
    distance: 3500,
    startLng: 116.3174,
    startLat: 39.9942,
    endLng: 116.3974,
    endLat: 39.9842,
    baseFee: 2,
    durationFee: 1.5,
    distanceFee: 1.75,
    discount: 0,
    totalAmount: 5.25,
    paidAmount: 5.25,
  },
  {
    id: 'order-004',
    userId: 'user-001',
    userName: '骑行达人',
    bikeId: 'bike-008',
    bikeNo: 'EB008',
    status: 'completed',
    startTime: '2026-06-08 09:00:00',
    endTime: '2026-06-08 09:12:00',
    duration: 720,
    distance: 2100,
    startLng: 116.4574,
    startLat: 39.9242,
    endLng: 116.4074,
    endLat: 39.9042,
    baseFee: 2,
    durationFee: 0,
    distanceFee: 1.05,
    discount: 0,
    totalAmount: 3.05,
    paidAmount: 3.05,
  },
  {
    id: 'order-005',
    userId: 'user-001',
    userName: '骑行达人',
    bikeId: 'bike-015',
    bikeNo: 'EB015',
    status: 'cancelled',
    startTime: '2026-06-07 14:30:00',
    duration: 0,
    distance: 0,
    startLng: 116.4174,
    startLat: 39.9542,
    baseFee: 0,
    durationFee: 0,
    distanceFee: 0,
    discount: 0,
    totalAmount: 0,
    paidAmount: 0,
  },
];

export default function Orders() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders(mockOrders);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
  };

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return '--';
    const mins = Math.floor(seconds / 60);
    return `${mins}分钟`;
  };

  const formatDistance = (meters: number) => {
    if (meters === 0) return '--';
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)}km`;
    }
    return `${meters}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <Badge variant="primary" size="sm">骑行中</Badge>;
      case 'completed':
        return <Badge variant="success" size="sm">已完成</Badge>;
      case 'cancelled':
        return <Badge variant="default" size="sm">已取消</Badge>;
      default:
        return <Badge size="sm">未知</Badge>;
    }
  };

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'ongoing', label: '进行中' },
    { key: 'completed', label: '已完成' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="px-4 pt-8 pb-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">我的订单</h1>
          <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} variant="pills" />
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : filteredOrders.length === 0 ? (
          <Empty
            title="暂无订单"
            description="还没有骑行记录，快去扫码骑行吧"
          />
        ) : (
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              padding="md"
              className="cursor-pointer"
              onClick={() => navigate(`/order-detail/${order.id}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Bike className="w-5 h-5 text-primary-500" />
                  </div>
                  <span className="font-semibold text-gray-900">{order.bikeNo}</span>
                </div>
                {getStatusBadge(order.status)}
              </div>

              <div className="flex items-center gap-4 mb-3 text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(order.duration)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{formatDistance(order.distance)}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(order.startTime)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <p className="text-gray-500 text-sm">
                  {order.status === 'cancelled' ? '未产生费用' : '实付金额'}
                </p>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    'text-lg font-bold',
                    order.status === 'cancelled' ? 'text-gray-400' : 'text-secondary-500'
                  )}>
                    ¥{order.paidAmount.toFixed(2)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}
