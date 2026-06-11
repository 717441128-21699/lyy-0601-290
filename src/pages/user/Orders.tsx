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
import { toast } from '@/components/ui/toastStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/utils/api';
import { cn } from '@/lib/utils';
import type { Order } from '@shared/types';

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params: Record<string, unknown> = {};
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      const res = await api.get<Order[]>(`/orders/user/${user.id}`, params);
      if (res.code === 200) {
        setOrders(res.data || []);
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
      toast.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, user?.id]);

  const filteredOrders = orders;

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
              onClick={() => navigate(`/user/order/${order.id}`)}
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
