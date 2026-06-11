import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Bike,
  BatteryCharging,
  Wrench,
  MapPin,
  FileText,
  Settings,
  Users,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

export interface SidebarItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
  badge?: string;
}

interface SidebarProps {
  items?: SidebarItem[];
  collapsed?: boolean;
  className?: string;
}

const defaultItems: SidebarItem[] = [
  { key: 'dashboard', label: '数据概览', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'bikes', label: '车辆管理', icon: Bike, path: '/bikes' },
  { key: 'battery', label: '换电任务', icon: BatteryCharging, path: '/battery' },
  { key: 'maintenance', label: '维修管理', icon: Wrench, path: '/maintenance' },
  { key: 'dispatch', label: '调度管理', icon: MapPin, path: '/dispatch' },
  { key: 'orders', label: '订单管理', icon: FileText, path: '/orders' },
  { key: 'users', label: '用户管理', icon: Users, path: '/users' },
  { key: 'finance', label: '财务管理', icon: BarChart3, path: '/finance' },
  { key: 'settings', label: '系统设置', icon: Settings, path: '/settings' },
];

export default function Sidebar({
  items = defaultItems,
  collapsed = false,
  className,
}: SidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white border-r border-gray-100 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
        className
      )}
    >
      <div className={cn('h-16 flex items-center border-b border-gray-100', collapsed ? 'justify-center px-2' : 'px-5')}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
            <Bike className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-gray-900 text-base">骑行管理</span>
              <span className="text-xs text-gray-500">智慧出行平台</span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  collapsed && 'justify-center px-0'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-danger-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
