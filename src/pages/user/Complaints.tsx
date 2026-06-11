import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import Empty from '@/components/ui/Empty';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { toast } from '@/components/ui/toastStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/utils/api';
import { cn } from '@/lib/utils';
import type { Complaint, ComplaintStatus } from '@shared/types';

export default function Complaints() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [confirming, setConfirming] = useState(false);

  const fetchComplaints = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params: Record<string, unknown> = {};
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      const res = await api.get<Complaint[]>(`/complaints/user/${user.id}`, params);
      if (res.code === 200) {
        setComplaints(res.data || []);
      }
    } catch (error) {
      console.error('获取投诉列表失败:', error);
      toast.error('获取投诉列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [activeTab, user?.id]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: '待处理', variant: 'warning' as const, icon: Clock };
      case 'processing':
        return { label: '处理中', variant: 'primary' as const, icon: AlertCircle };
      case 'resolved':
        return { label: '已解决', variant: 'success' as const, icon: CheckCircle };
      case 'closed':
        return { label: '已关闭', variant: 'default' as const, icon: XCircle };
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
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${minutes}`;
  };

  const handleConfirmResolve = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setShowConfirmModal(true);
  };

  const handleConfirmClose = async () => {
    if (!selectedComplaint) return;
    try {
      setConfirming(true);
      const res = await api.post<Complaint>(`/complaints/${selectedComplaint.id}/user-confirm`);
      if (res.code === 200 && res.data) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === selectedComplaint.id ? res.data! : c))
        );
        toast.success('已确认问题解决');
        setShowConfirmModal(false);
        setSelectedComplaint(null);
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

  const tabItems = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待处理' },
    { key: 'processing', label: '处理中' },
    { key: 'resolved', label: '已解决' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white sticky top-0 z-30 border-b border-gray-100">
        <div className="px-4 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">投诉中心</h1>
          </div>
          <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} variant="pills" />
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 pb-24">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : complaints.length === 0 ? (
          <Empty
            title="暂无投诉"
            description="还没有投诉记录，有问题可以随时提交"
          />
        ) : (
          complaints.map((complaint) => {
            const statusConfig = getStatusConfig(complaint.status);
            const StatusIcon = statusConfig.icon;
            const canConfirm = complaint.status === 'resolved' && !complaint.userConfirmed && user?.role === 'user';

            return (
              <Card
                key={complaint.id}
                padding="md"
                className="cursor-pointer"
                onClick={() => navigate(`/user/complaint/${complaint.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      complaint.type === 'bike-fault' && 'bg-danger-50',
                      complaint.type === 'billing-dispute' && 'bg-warning-50',
                      complaint.type === 'other' && 'bg-gray-100',
                    )}>
                      <MessageSquare className={cn(
                        'w-4 h-4',
                        complaint.type === 'bike-fault' && 'text-danger-500',
                        complaint.type === 'billing-dispute' && 'text-warning-500',
                        complaint.type === 'other' && 'text-gray-500',
                      )} />
                    </div>
                    <span className="text-sm text-gray-500">{getTypeLabel(complaint.type)}</span>
                  </div>
                  <Badge variant={statusConfig.variant} size="sm">
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{complaint.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                  {complaint.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{formatDate(complaint.createTime)}</span>
                  <div className="flex items-center gap-2">
                    {canConfirm && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmResolve(complaint);
                        }}
                      >
                        确认解决
                      </Button>
                    )}
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 safe-area-bottom z-40">
        <Button
          fullWidth
          size="lg"
          variant="secondary"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => navigate('/user/complaint/new')}
        >
          提交投诉
        </Button>
      </div>

      <Modal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="确认解决"
        description="确认投诉问题已解决吗？"
      >
        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowConfirmModal(false)}
            disabled={confirming}
          >
            再看看
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handleConfirmClose}
            loading={confirming}
          >
            确认解决
          </Button>
        </div>
      </Modal>
    </div>
  );
}
