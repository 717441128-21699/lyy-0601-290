import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  variant?: 'default' | 'pills';
  className?: string;
}

export default function Tabs({
  items,
  activeKey,
  onChange,
  variant = 'default',
  className,
}: TabsProps) {
  return (
    <div className={cn('', className)}>
      <div
        className={cn(
          'flex',
          variant === 'default' ? 'border-b border-gray-200' : 'bg-gray-100 p-1 rounded-xl'
        )}
      >
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <button
              key={item.key}
              onClick={() => !item.disabled && onChange(item.key)}
              disabled={item.disabled}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200',
                variant === 'default'
                  ? cn(
                      'border-b-2 -mb-px',
                      isActive
                        ? 'border-primary-400 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    )
                  : cn(
                      'rounded-lg',
                      isActive
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    ),
                item.disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
