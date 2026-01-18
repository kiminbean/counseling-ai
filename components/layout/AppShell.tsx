'use client';

import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { useIsDesktop } from '@/hooks/useMediaQuery';

interface AppShellProps {
  children: ReactNode;
  showSidebar?: boolean;
  sidebarContent?: ReactNode;
}

export function AppShell({ children, showSidebar = false, sidebarContent }: AppShellProps) {
  const isDesktop = useIsDesktop();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 flex flex-col pb-16 lg:pb-0 overflow-hidden">
        {children}
      </main>

      {/* Desktop Sidebar */}
      {isDesktop && showSidebar && sidebarContent && (
        <aside className="w-80 bg-white border-l border-gray-200 overflow-y-auto hidden lg:block">
          {sidebarContent}
        </aside>
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
