'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/navigation';

type Language = 'en' | 'hi';

export default function Sidebar({ language = 'en' }: { language?: Language }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[language] || NAV_ITEMS.en;

  return (
    <aside className="hidden lg:block w-64 h-full border-r border-white/10 bg-black/30 backdrop-blur shrink-0 overflow-y-auto max-h-[calc(100vh-80px)] sticky top-20">
      <nav className="p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const href = item.id === 'home' ? '/home' : `/${item.id}`;
          const active = pathname === href;

          return (
            <Link
              key={item.id}
              href={href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition group
                ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-gray-300 hover:bg-white/10'
                }
              `}
            >
              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  active ? 'scale-110' : 'group-hover:scale-110'
                }`}
              />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}