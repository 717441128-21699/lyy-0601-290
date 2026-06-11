import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  X,
  AlertCircle,
  Clock,
  CheckCircle,
  User,
  MessageSquare,
  Send,
  Bike,
  DollarSign,
  MoreHorizontal,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Skeleton from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/toastStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import api from '@/utils/api';
import type { ComplaintType, Complaint } from '@shared/types';

const complaintTypes: { key: ComplaintType; label: string; icon: typeof Bike; desc: string }[] = [
  { key: 'bike-fault', label: '车辆故障', icon: Bike, desc: '车辆损坏、故障等问题' },
  { key: 'billing-dispute', label: '扣费争议', icon: DollarSign, desc: '费用、时长有疑问' },
  { key: 'other', label: '其他问题', icon: MoreHorizontal, desc: '其他需要反馈的问题' },
];

export default function ComplaintDetail() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const isNew = id === 'new';
  const [type, setType] = useState<ComplaintType>('bike-fault');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const fetchComplaint = async () => {
    if (!id || isNew) return;
    try {
      setLoading(true);
      const res = await api.get<Complaint>(`/complaints/${id}`);
      if (res.code === 200 && res.data) {
        setComplaint(res.data);
      }
    } catch (error) {
      console.error('获取投诉详情失败:', error);
      toast.error('获取投诉详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id, isNew]);

  const handleImageUpload = () => {
    const newImage = `https://picsum.photos/200/200?random=${Date.now()}`;
    setImages((prev) => [...prev, newImage]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !user) return;
    try {
      setSubmitting(true);
      const res = await api.post<Complaint>('/complaints', {
        userId: user.id,
        userName: user.nickname,
        type,
        title,
        description,
        images,
        orderId: orderId || undefined,
      });
      if (res.code === 201) {
        toast.success('投诉提交成功');
        navigate('/user/complaints');
      } else {
        toast.error(res.message || '提交失败');
      }
    } catch (error) {
      console.error('提交投诉失败:', error);
      toast.error('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserConfirm = async () => {
    if (!id || isNew) return;
    try {
      setConfirming(true);
      const res = await api.post<Complaint>(`/complaints/${id}/user-confirm`);
      if (res.code === 200 && res.data) {
        setComplaint(res.data);
        toast.success('已确认问题解决');
      } else {
        toast.error(res.message || '确认失败');
      }
    } catch (error) {
      console.error('确认失败:', error);
      toast.error('确认失败');
    } finally {
      setConfirming(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '待处理', variant: 'warning' as const, icon: Clock };
      case 'processing':
        return { label: '处理中', variant: 'primary' as const, icon: AlertCircle };
      case 'resolved':
        return { label: '已解决', variant: 'success' as const, icon: CheckCircle };
      case 'closed':
        return { label: '已关闭', variant: 'default' as const, icon: CheckCircle };
      default:
        return { label: '未知', variant: 'default' as const, icon: AlertCircle };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bike-fault':
        return '车辆故障';
      case 'billing-dispute':
        return '扣费争议';
      case 'other':
        return '其他';
      default:
        return '其他';
    }
  };

  const formatDate = (dateStr: string) => {
    return dateStr.replace(' ', ' · ');
  };

  const canSubmit = title.trim().length > 0 && description.trim().length > 0;

  if (!isNew && loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100 px-4 pt-8 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <Skeleton variant="text" width={120} />
          </div>
        </div>
        <div className="p-4 space-y-4">
          <Card padding="lg" hoverable={false}>
            <div className="space-y-3">
              <Skeleton variant="text" width={160} className="h-5" />
              <Skeleton variant="text" width="100%" className="h-4" />
              <Skeleton variant="text" width="80%" className="h-4" />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!isNew && complaint) {
    const statusConfig = getStatusConfig(complaint.status);
    const StatusIcon = statusConfig.icon;

    return (
      <div className="min-h-screen bg-gray-50 pb-8">
        <div className="bg-white border-b border-gray-100 px-4 pt-8 pb-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">投诉详情</h1>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Card padding="lg">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-warning-50 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-warning-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{complaint.title}</h2>
                  <p className="text-sm text-gray-500">{formatDate(complaint.createTime)}</p>
                </div>
              </div>
              <Badge variant={statusConfig.variant} size="sm">
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" size="sm">
                {getTypeLabel(complaint.type)}
              </Badge>
              {complaint.orderId && (
                <Badge variant="default" size="sm">
                  订单：{complaint.orderId}
                </Badge>
              )}
              <Badge variant="outline" size="sm">
                #{complaint.id}
              </Badge>
            </div>

            <p className="text-gray-600 leading-relaxed">{complaint.description}</p>

            {complaint.images && complaint.images.length > 0 && (
              <div className="flex gap-2 mt-4">
                {complaint.images.map((img, index) => (
                  <div
                    key={index}
                    className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {complaint.status !== 'pending' && (
            <Card padding="lg">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                处理进度
              </h3>

              <div className="space-y-4">
                {complaint.handleTime && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-primary-500" />
                      </div>
                      <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {complaint.handlerName || '工作人员'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {complaint.handleTime?.split(' ')[1]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">已受理，正在处理中</p>
                    </div>
                  </div>
                )}

                {complaint.handleResult && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-success-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-success-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">处理完成</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{complaint.handleResult}</p>
                    </div>
                  </div>
                )}

                {complaint.status === 'closed' && complaint.closeTime && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">用户已确认关闭</span>
                        <span className="text-xs text-gray-400">
                          {complaint.closeTime?.split(' ')[1]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">投诉已关闭</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {complaint.status === 'resolved' && !complaint.userConfirmed && user?.role === 'user' && (
            <Button
              fullWidth
              size="lg"
              variant="secondary"
              loading={confirming}
              onClick={handleUserConfirm}
            >
              确认问题已解决
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b border-gray-100 px-4 pt-8 pb-4 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">提交投诉</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {orderId && (
          <Card padding="md" hoverable={false}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">关联订单</p>
                <p className="font-medium text-gray-900">{orderId}</p>
              </div>
            </div>
          </Card>
        )}

        <Card padding="lg" hoverable={false}>
          <h3 className="font-semibold text-gray-900 mb-4">投诉类型</h3>
          <div className="space-y-2">
            {complaintTypes.map((item) => {
              const Icon = item.icon;
              const isSelected = type === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setType(item.key)}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left',
                    isSelected
                      ? 'border-primary-400 bg-primary-50'
                      : 'border-gray-100 hover:border-gray-200'
                  )}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                    isSelected ? 'bg-primary-100' : 'bg-gray-100'
                  )}>
                    <Icon className={cn(
                      'w-5 h-5',
                      isSelected ? 'text-primary-500' : 'text-gray-500'
                    )} />
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      'font-medium',
                      isSelected ? 'text-primary-700' : 'text-gray-900'
                    )}>
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <Card padding="lg" hoverable={false}>
          <h3 className="font-semibold text-gray-900 mb-4">投诉内容</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                标题 <span className="text-danger-500">*</span>
              </label>
              <Input
                placeholder="请简要描述您的问题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
              />
              <p className="text-right text-xs text-gray-400 mt-1">{title.length}/50</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                详细描述 <span className="text-danger-500">*</span>
              </label>
              <textarea
                placeholder="请详细描述您遇到的问题，以便我们更好地为您解决..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={5}
                className={cn(
                  'w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl',
                  'focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400',
                  'transition-all duration-200 placeholder:text-gray-400 resize-none'
                )}
              />
              <p className="text-right text-xs text-gray-400 mt-1">{description.length}/500</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上传图片（可选）
              </label>
              <div className="flex flex-wrap gap-2">
                {images.map((img, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-gray-800/80 rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
                {images.length < 6 && (
                  <button
                    onClick={handleImageUpload}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                  >
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-xs">上传</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">最多可上传6张图片，图片将帮助我们更快定位问题</p>
            </div>
          </div>
        </Card>

        <div className="bg-warning-50 rounded-xl p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900 text-sm">温馨提示</p>
              <p className="text-sm text-gray-600 mt-1">
                提交投诉后，工作人员会在24小时内处理您的问题。紧急情况请拨打客服电话。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-area-bottom z-40">
        <Button
          fullWidth
          size="lg"
          variant="secondary"
          icon={<Send className="w-5 h-5" />}
          loading={submitting}
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          提交投诉
        </Button>
      </div>
    </div>
  );
}
