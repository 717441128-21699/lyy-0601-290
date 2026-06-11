import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function Empty({
  title = '暂无数据',
  description = '这里还没有任何内容',
  icon,
  action,
  className,
}: EmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="w-20 h-20 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
        {icon || <Inbox className="w-10 h-10 text-gray-400" />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-xs">{description}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
