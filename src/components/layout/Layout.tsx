import { cn } from '@/lib/utils';
import { useState, type ReactNode } from 'react';
import Sidebar, { type SidebarItem } from './Sidebar';
import Header from './Header';
import ToastContainer from '@/components/ui/ToastContainer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showSidebar?: boolean;
  sidebarItems?: SidebarItem[];
  className?: string;
}

export default function Layout({
  children,
  title,
  showSidebar = true,
  sidebarItems,
  className,
}: LayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {showSidebar && (
        <Sidebar collapsed={sidebarCollapsed} items={sidebarItems} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          showMenu={showSidebar}
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className={cn('flex-1 overflow-auto p-4 md:p-6', className)}>
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBottomNav?: boolean;
  className?: string;
}

export function MobileLayout({
  children,
  title,
  showBottomNav = true,
  className,
}: MobileLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {title && (
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-center px-4 sticky top-0 z-30">
          <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        </header>
      )}

      <main className={cn('flex-1 overflow-auto pb-20', showBottomNav && 'pb-20', className)}>
        {children}
      </main>

      {showBottomNav && null}

      <ToastContainer />
    </div>
  );
}
