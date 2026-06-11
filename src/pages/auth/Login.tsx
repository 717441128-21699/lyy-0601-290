import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, Bike, Wrench, ClipboardList, DollarSign, Shield, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Tabs from '@/components/ui/Tabs';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/utils/api';
import type { UserRole, LoginResponse } from '@shared/types';

const roleTabs = [
  { key: 'user', label: '用户', icon: <Bike className="w-4 h-4" /> },
  { key: 'operator', label: '运维', icon: <Wrench className="w-4 h-4" /> },
  { key: 'dispatcher', label: '调度', icon: <ClipboardList className="w-4 h-4" /> },
  { key: 'finance', label: '财务', icon: <DollarSign className="w-4 h-4" /> },
  { key: 'admin', label: '管理员', icon: <Shield className="w-4 h-4" /> },
];

const roleRedirectMap: Record<UserRole, string> = {
  user: '/user',
  operator: '/operator',
  dispatcher: '/dispatcher',
  finance: '/finance',
  admin: '/admin',
};

export default function Login() {
  const [role, setRole] = useState<UserRole>('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = roleRedirectMap[user.role] || '/user';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedRole = localStorage.getItem('rememberedRole') as UserRole;
    if (savedUsername && savedRole) {
      setUsername(savedUsername);
      setRole(savedRole);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        role,
        username,
        password,
      });

      if (response.code === 200 && response.data) {
        login(response.data.user, response.data.token);

        if (rememberMe) {
          localStorage.setItem('rememberedUsername', username);
          localStorage.setItem('rememberedRole', role);
        } else {
          localStorage.removeItem('rememberedUsername');
          localStorage.removeItem('rememberedRole');
        }

        const redirectPath = roleRedirectMap[role] || '/user';
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const from = (location.state as { from?: string })?.from;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-slow"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4 animate-bounce-slow">
            <Bike className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">智慧共享单车</h1>
          <p className="text-primary-100">绿色出行，智慧生活</p>
        </div>

        <Card padding="lg" className="shadow-2xl animate-slide-in-bottom">
          <Tabs
            items={roleTabs}
            activeKey={role}
            onChange={(key) => {
              setRole(key as UserRole);
              setError('');
            }}
            variant="pills"
            className="mb-6"
          />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="text-center">
              <Badge variant="primary" size="md">
                {roleTabs.find(r => r.key === role)?.label}登录
              </Badge>
            </div>

            <Input
              label="用户名"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              leftIcon={<User className="w-5 h-5" />}
              required
              autoComplete="username"
            />

            <Input
              label="密码"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              leftIcon={<Lock className="w-5 h-5" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              }
              required
              autoComplete="current-password"
            />

            {error && (
              <div className="text-sm text-danger-500 bg-danger-50 px-4 py-2 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center ${
                      rememberMe
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-gray-300 group-hover:border-primary-400'
                    }`}
                  >
                    {rememberMe && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                </div>
                <span className="text-sm text-gray-600">记住我</span>
              </label>
              <button
                type="button"
                className="text-sm text-primary-500 hover:text-primary-600 transition-colors"
              >
                忘记密码？
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              fullWidth
              loading={loading}
              className="mt-2"
            >
              登 录
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">测试账号</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-gray-500">用户：</span>
                <span className="text-gray-700 font-medium">user001 / 123456</span>
              </div>
              <div className="bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-gray-500">运维：</span>
                <span className="text-gray-700 font-medium">operator1 / 123456</span>
              </div>
              <div className="bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-gray-500">调度：</span>
                <span className="text-gray-700 font-medium">dispatcher1 / 123456</span>
              </div>
              <div className="bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-gray-500">财务：</span>
                <span className="text-gray-700 font-medium">finance1 / 123456</span>
              </div>
              <div className="bg-gray-50 px-3 py-2 rounded-lg col-span-2">
                <span className="text-gray-500">管理员：</span>
                <span className="text-gray-700 font-medium">admin1 / 123456</span>
              </div>
            </div>
          </div>
        </Card>

        <p className="text-center text-primary-200 text-sm mt-6">
          © 2024 智慧共享单车 版权所有
        </p>
      </div>
    </div>
  );
}
