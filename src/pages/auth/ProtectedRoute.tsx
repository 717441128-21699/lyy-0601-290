import { Navigate, useLocation } from 'react-router-dom';
import { Shield, Lock, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@shared/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <Card padding="lg" className="max-w-md w-full text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-warning-100 rounded-full mb-6">
            <Shield className="w-10 h-10 text-warning-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">无访问权限</h2>
          <p className="text-gray-500 mb-6">
            您的账号角色为 <span className="font-medium text-gray-700">{user.role}</span>，
            无权访问此页面。如有疑问，请联系管理员。
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={() => window.history.back()}
            >
              返回上一页
            </Button>
            <Button
              variant="primary"
              icon={<Lock className="w-4 h-4" />}
              onClick={() => window.location.href = '/login'}
            >
              重新登录
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
