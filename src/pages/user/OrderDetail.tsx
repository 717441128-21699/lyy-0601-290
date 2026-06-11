import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Bike,
  Clock,
  Route,
  CreditCard,
  Tag,
  FileText,
  AlertCircle,
  ChevronRight,
  CheckCircle,
  MapPin,
  User,
  Calendar,
  Receipt,
  X,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/ui/Modal';
import { toast } from '@/components/ui/toastStore';
import api from '@/utils/api';
import type { Order } from '@shared/types';

export default function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  const fetchOrder = async () => {
    if (!orderId) return;
    try {
      setLoading(true);
      const res = await api.get<Order>(`/orders/${orderId}`);
      if (res.code === 200 && res.data) {
        setOrder(res.data);
      } else {
        toast.error(res.message || '获取订单详情失败');
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
      toast.error('获取订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}分${secs}秒`;
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} 公里`;
    }
    return `${meters} 米`;
  };

  const formatTime = (timeStr: string) => {
    return timeStr.split(' ')[1];
  };

  const formatDate = (dateStr: string) => {
    return dateStr.split(' ')[0];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <Badge variant="primary">骑行中</Badge>;
      case 'completed':
        return <Badge variant="success">已完成</Badge>;
      case 'cancelled':
        return <Badge variant="default">已取消</Badge>;
      default:
        return <Badge>未知</Badge>;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing':
        return '骑行中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

  const getPaymentStatus = (paidAmount: number, totalAmount: number) => {
    if (paidAmount >= totalAmount) {
      return { text: '已支付', variant: 'success' as const };
    }
    return { text: '待支付', variant: 'warning' as const };
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">订单号不存在</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 pt-8 pb-12 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-white">订单详情</h1>
        </div>

        {loading ? (
          <div className="text-center">
            <Skeleton variant="text" width={120} className="mx-auto mb-2 bg-white/30" />
            <Skeleton variant="text" width={80} className="mx-auto bg-white/20" />
          </div>
        ) : order ? (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-6 h-6 text-secondary-400" />
              <span className="text-white/80 text-sm">{getStatusText(order.status)}</span>
            </div>
            <p className="text-4xl font-bold text-white mb-1">
              ¥{order.paidAmount.toFixed(2)}
            </p>
            <p className="text-white/60 text-sm">实付金额</p>
          </div>
        ) : null}
      </div>

      <div className="px-4 -mt-8 space-y-4">
        {loading ? (
          <div className="space-y-4">
            <Card padding="lg">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton variant="circle" width={48} height={48} />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width={100} />
                    <Skeleton variant="text" width={80} />
                  </div>
                </div>
              </div>
            </Card>
            <Card padding="lg">
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton variant="text" width={80} />
                    <Skeleton variant="text" width={60} />
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : order ? (
          <>
            <Card padding="lg">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                      <Bike className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.bikeNo}</h3>
                      <p className="text-sm text-gray-500">{formatDate(order.startTime)}</p>
                    </div>
                  </div>
                  {getStatusBadge(order.status)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">用户</p>
                      <p className="font-medium text-gray-900">{order.userName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">订单编号</p>
                      <p className="font-medium text-gray-900 text-xs">{order.id}</p>
                    </div>
                  </div>
                </div>

                <div className="relative py-4">
                  <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gray-200" />

                  <div className="flex items-start gap-4 mb-6 relative">
                    <div className="w-4 h-4 rounded-full bg-primary-500 mt-1.5 z-10 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary-500" />
                        <p className="text-gray-900 font-medium">起点</p>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatTime(order.startTime)} 开始骑行
                      </p>
                    </div>
                  </div>

                  {order.endTime && order.endLng !== undefined && order.endLat !== undefined && (
                    <div className="flex items-start gap-4 relative">
                      <div className="w-4 h-4 rounded-full bg-secondary-500 mt-1.5 z-10 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-secondary-500" />
                          <p className="text-gray-900 font-medium">终点</p>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatTime(order.endTime)} 结束骑行
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                      <Clock className="w-4 h-4" />
                      <span>骑行时长</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDuration(order.duration)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mb-1">
                      <Route className="w-4 h-4" />
                      <span>骑行里程</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatDistance(order.distance)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary-500" />
                  <h3 className="font-semibold text-gray-900">费用明细</h3>
                </div>
                <Badge variant={getPaymentStatus(order.paidAmount, order.totalAmount).variant} size="sm">
                  {getPaymentStatus(order.paidAmount, order.totalAmount).text}
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    起步价
                  </span>
                  <span className="text-gray-900">¥{order.baseFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">时长费</span>
                  <span className="text-gray-900">¥{order.durationFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">里程费</span>
                  <span className="text-gray-900">¥{order.distanceFee.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">优惠减免</span>
                    <span className="text-success-600">-¥{order.discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-gray-100 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">订单总额</span>
                    <span className="text-lg font-bold text-gray-900">
                      ¥{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium text-gray-900">实付金额</span>
                    <span className="text-xl font-bold text-secondary-500">
                      ¥{order.paidAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="none" hoverable={false}>
              <button
                onClick={() => navigate(`/user/complaint/new?orderId=${orderId}`)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-warning-50 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-warning-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">投诉建议</p>
                    <p className="text-sm text-gray-500">对订单有疑问？提交投诉</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </Card>

            <Card padding="none" hoverable={false}>
              <button
                onClick={() => setReceiptModalOpen(true)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">电子账单</p>
                    <p className="text-sm text-gray-500">查看完整电子凭证</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </Card>

            <div className="pt-4">
              <Button variant="outline" fullWidth onClick={() => navigate('/user')}>
                再来一单
              </Button>
            </div>
          </>
        ) : (
          <Card padding="lg">
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">订单不存在</p>
            </div>
          </Card>
        )}
      </div>

      <Modal
        open={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="电子账单"
        width="md"
      >
        {order && (
          <div className="space-y-6">
            <div className="text-center pb-6 border-b border-dashed border-gray-200">
              <Receipt className="w-12 h-12 text-primary-500 mx-auto mb-3" />
              <p className="text-sm text-gray-500 mb-1">电子账单凭证</p>
              <p className="text-3xl font-bold text-gray-900">¥{order.paidAmount.toFixed(2)}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">订单编号</span>
                <span className="font-medium text-gray-900">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">车辆编号</span>
                <span className="font-medium text-gray-900">{order.bikeNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">用户</span>
                <span className="font-medium text-gray-900">{order.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">开始时间</span>
                <span className="font-medium text-gray-900">{order.startTime}</span>
              </div>
              {order.endTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">结束时间</span>
                  <span className="font-medium text-gray-900">{order.endTime}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">骑行时长</span>
                <span className="font-medium text-gray-900">{formatDuration(order.duration)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">骑行里程</span>
                <span className="font-medium text-gray-900">{formatDistance(order.distance)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">费用明细</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">起步价</span>
                  <span className="text-gray-900">¥{order.baseFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">时长费</span>
                  <span className="text-gray-900">¥{order.durationFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">里程费</span>
                  <span className="text-gray-900">¥{order.distanceFee.toFixed(2)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">优惠减免</span>
                    <span className="text-success-600">-¥{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-900">实付金额</span>
                  <span className="text-xl font-bold text-secondary-500">¥{order.paidAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1">支付状态</p>
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success-500" />
                  <span className="font-semibold text-success-600">
                    {getPaymentStatus(order.paidAmount, order.totalAmount).text}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" fullWidth onClick={() => setReceiptModalOpen(false)}>
                <X className="w-4 h-4 mr-2" />
                关闭
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
