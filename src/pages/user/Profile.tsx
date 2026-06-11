import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Phone,
  Shield,
  FileText,
  AlertCircle,
  ChevronRight,
  Settings,
  HelpCircle,
  LogOut,
  Zap,
  Wallet,
  CheckCircle,
  Clock,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import BottomNav from '@/components/layout/BottomNav';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAction, setDepositAction] = useState<'pay' | 'refund'>('pay');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const creditScore = user?.creditScore || 780;
  const maxCreditScore = 950;
  const creditPercentage = (creditScore / maxCreditScore) * 100;

  const getCreditLevel = (score: number) => {
    if (score >= 850) return { level: '极好', color: 'text-success-600', bg: 'bg-success-50' };
    if (score >= 750) return { level: '优秀', color: 'text-primary-600', bg: 'bg-primary-50' };
    if (score >= 650) return { level: '良好', color: 'text-warning-600', bg: 'bg-warning-50' };
    return { level: '一般', color: 'text-danger-600', bg: 'bg-danger-50' };
  };

  const creditLevel = getCreditLevel(creditScore);

  const handleDepositClick = () => {
    setDepositAction(user?.depositPaid ? 'refund' : 'pay');
    setShowDepositModal(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    {
      icon: FileText,
      label: '我的订单',
      description: '查看全部骑行订单',
      onClick: () => navigate('/orders'),
      badge: null,
    },
    {
      icon: AlertCircle,
      label: '投诉建议',
      description: '问题反馈与投诉',
      onClick: () => navigate('/complaints'),
      badge: <Badge variant="warning" size="sm">2</Badge>,
    },
    {
      icon: Shield,
      label: '实名认证',
      description: user?.realNameVerified ? '已认证' : '去认证',
      onClick: () => {},
      badge: user?.realNameVerified ? (
        <Badge variant="success" size="sm">已认证</Badge>
      ) : (
        <Badge variant="warning" size="sm">去认证</Badge>
      ),
    },
    {
      icon: HelpCircle,
      label: '帮助中心',
      description: '常见问题解答',
      onClick: () => {},
      badge: null,
    },
    {
      icon: Settings,
      label: '设置',
      description: '账号与偏好设置',
      onClick: () => {},
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 pt-8 pb-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-white">个人中心</h1>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-10 h-10 text-white/80" />
                  </div>
                )}
              </div>
              {user?.realNameVerified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center border-2 border-primary-500">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{user?.nickname || '骑行达人'}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4 text-white/70" />
                <span className="text-white/70 text-sm">
                  {user?.phone || '138****8001'}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-white/20 text-white border-none">
                  <Zap className="w-3 h-3 mr-1" />
                  信用分 {creditScore}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-8 space-y-4 relative z-10">
        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-secondary-500" />
              <h3 className="font-semibold text-gray-900">信用分</h3>
            </div>
            <Badge variant="primary" size="sm">{creditLevel.level}</Badge>
          </div>

          <div className="mb-3">
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-gray-900">{creditScore}</span>
              <span className="text-sm text-gray-500">/ {maxCreditScore}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full transition-all duration-1000"
                style={{ width: `${creditPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">28</p>
              <p className="text-xs text-gray-500">完成骑行</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">3</p>
              <p className="text-xs text-gray-500">上报故障</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-900">0</p>
              <p className="text-xs text-gray-500">违规记录</p>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900">押金管理</h3>
            </div>
            {user?.depositPaid ? (
              <Badge variant="success" size="sm">已缴纳</Badge>
            ) : (
              <Badge variant="warning" size="sm">待缴纳</Badge>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                ¥{user?.depositAmount || 199}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {user?.depositPaid ? '押金已缴纳，可随时申请退还' : '缴纳押金后即可骑行'}
              </p>
            </div>
            <Button
              size="sm"
              variant={user?.depositPaid ? 'outline' : 'primary'}
              onClick={handleDepositClick}
            >
              {user?.depositPaid ? '申请退还' : '立即缴纳'}
            </Button>
          </div>

          {user?.depositPaid && (
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>押金退还将在1-3个工作日内到账</span>
            </div>
          )}
        </Card>

        <Card padding="none" hoverable={false}>
          <div className="divide-y divide-gray-100">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      index === 0 && 'bg-primary-50',
                      index === 1 && 'bg-warning-50',
                      index === 2 && 'bg-success-50',
                      index === 3 && 'bg-secondary-50',
                      index === 4 && 'bg-gray-100',
                    )}>
                      <Icon className={cn(
                        'w-5 h-5',
                        index === 0 && 'text-primary-500',
                        index === 1 && 'text-warning-500',
                        index === 2 && 'text-success-500',
                        index === 3 && 'text-secondary-500',
                        index === 4 && 'text-gray-500',
                      )} />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge}
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <BottomNav />

      <Modal
        open={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        title={depositAction === 'pay' ? '缴纳押金' : '退还押金'}
        description={depositAction === 'pay' ? '缴纳押金后即可开始骑行' : '押金将在1-3个工作日内原路返回'}
      >
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-sm mb-1">
              {depositAction === 'pay' ? '需缴纳押金' : '可退还押金'}
            </p>
            <p className="text-3xl font-bold text-secondary-500">
              ¥{user?.depositAmount || 199}
            </p>
          </div>

          {depositAction === 'refund' && (
            <div className="bg-warning-50 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">温馨提示</p>
                  <p className="text-sm text-gray-600 mt-1">
                    退还押金后您将无法继续骑行，如需再次骑行需重新缴纳押金。
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowDepositModal(false)}
            >
              取消
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowDepositModal(false)}
            >
              {depositAction === 'pay' ? '立即缴纳' : '确认退还'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="退出登录"
        description="确定要退出当前账号吗？"
      >
        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={() => setShowLogoutModal(false)}
          >
            取消
          </Button>
          <Button
            variant="danger"
            fullWidth
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </div>
      </Modal>
    </div>
  );
}
