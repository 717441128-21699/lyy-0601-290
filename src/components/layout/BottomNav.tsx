import { cn } from '@/lib/utils';
import { Home, Map, FileText, User, type LucideIcon } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

interface BottomNavProps {
  items?: NavItem[];
  className?: string;
}

const defaultItems: NavItem[] = [
  { key: 'home', label: '首页', icon: Home, path: '/' },
  { key: 'map', label: '地图', icon: Map, path: '/map' },
  { key: 'orders', label: '订单', icon: FileText, path: '/orders' },
  { key: 'profile', label: '我的', icon: User, path: '/profile' },
];

export default function BottomNav({ items = defaultItems, className }: BottomNavProps) {
  const location = useLocation();

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 safe-area-bottom',
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.key}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 py-2 transition-colors duration-200',
                isActive ? 'text-primary-500' : 'text-gray-500'
              )}
            >
              <Icon className={cn('w-6 h-6 mb-1', isActive && 'scale-110 transition-transform')} />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
