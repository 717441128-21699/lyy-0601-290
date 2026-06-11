import { cn } from '@/lib/utils';
import { Bell, Search, Menu, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import Badge from '@/components/ui/Badge';
import { useState } from 'react';

interface HeaderProps {
  title?: string;
  showMenu?: boolean;
  onMenuClick?: () => void;
  className?: string;
}

export default function Header({
  title,
  showMenu = false,
  onMenuClick,
  className,
}: HeaderProps) {
  const { user } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header
      className={cn(
        'h-16 bg-white border-b border-gray-100 flex items-center px-4 md:px-6 sticky top-0 z-30',
        className
      )}
    >
      {showMenu && (
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mr-2"
        >
          <Menu className="w-5 h-5" />
        </button>
      )}

      {title && (
        <h1 className="text-lg font-semibold text-gray-900 mr-auto">{title}</h1>
      )}

      {!title && <div className="flex-1" />}

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索..."
            className="w-64 pl-9 pr-4 py-2 text-sm bg-gray-50 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-gray-200 transition-all"
          />
        </div>

        <button className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-danger-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pr-3 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <img
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
              alt="avatar"
              className="w-8 h-8 rounded-full bg-gray-200"
            />
            <span className="hidden md:block text-sm font-medium text-gray-700">
              {user?.nickname || '用户'}
            </span>
            <ChevronDown className="hidden md:block w-4 h-4 text-gray-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-scale-in origin-top-right z-50">
              <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                个人中心
              </button>
              <button className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                账号设置
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button className="w-full px-4 py-2.5 text-left text-sm text-danger-600 hover:bg-danger-50 transition-colors">
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
