'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, Smile, Activity, User } from 'lucide-react';

const navItems = [
  { href: '/', icon: MessageCircle, label: '상담' },
  { href: '/checkin', icon: Smile, label: '기분체크' },
  { href: '/exercises', icon: Activity, label: '운동' },
  { href: '/profile', icon: User, label: '프로필' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 lg:hidden safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
                isActive
                  ? 'text-brand-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-xs mt-1 ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
