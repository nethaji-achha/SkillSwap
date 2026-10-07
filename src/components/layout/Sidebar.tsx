'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { Avatar } from '@/components/ui/Avatar';
import { 
  LayoutDashboard, 
  Compass, 
  BookMarked, 
  Users, 
  MessageSquare, 
  Calendar, 
  TrendingUp, 
  User, 
  Settings, 
  Sparkles, 
  Bot,
  Coins,
  Crown,
  Shield,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, wallet, unreadMessageCount, matches, logout } = useSkillSwap();

  const pendingMatchesCount = matches.filter(m => m.status === 'recommended' || m.status === 'pending').length;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Discover', href: '/discover', icon: Compass },
    { label: 'My Skills', href: '/skills', icon: BookMarked },
    { label: 'Matches', href: '/matches', icon: Users, badge: pendingMatchesCount > 0 ? pendingMatchesCount : undefined },
    { label: 'Wallet', href: '/wallet', icon: Coins, highlightCoin: true },
    { label: 'Messages', href: '/messages', icon: MessageSquare, badge: unreadMessageCount > 0 ? unreadMessageCount : undefined },
    { label: 'Sessions', href: '/sessions', icon: Calendar },
    { label: 'Progress', href: '/progress', icon: TrendingUp },
    { label: 'Pricing', href: '/pricing', icon: Crown },
    { label: 'AI Match', href: '/ai-match', icon: Sparkles, highlight: true },
    { label: 'AI Assistant', href: '/ai-assistant', icon: Bot },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  if (user?.role === 'admin') {
    navItems.push({ label: 'Admin Portal', href: '/admin', icon: Shield });
  }

  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 bg-[#071321] text-slate-300 border-r border-[#11263a] h-[calc(100vh-4rem)] sticky top-16 self-start p-4 justify-between overflow-y-auto">
      {/* Navigation list */}
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-all group',
                isActive
                  ? 'bg-[#0d1d2d] text-white font-bold border border-brand-blue-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-[#0d1d2d]/60',
                item.highlight && !isActive && 'text-brand-blue-400 hover:bg-[#0d1d2d]'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive ? 'text-brand-blue-400' : 'text-slate-400 group-hover:text-slate-200',
                    item.highlight && 'text-brand-blue-400'
                  )}
                />
                <span className={cn(isActive && 'text-white')}>{item.label}</span>
              </div>

              {item.highlightCoin && (
                <span className="font-extrabold text-[#ff8a00] text-[11px] bg-[#ff8a00]/10 px-2 py-0.5 rounded-md border border-[#ff8a00]/30">
                  {wallet?.available_balance || 0} 🪙
                </span>
              )}

              {typeof item.badge === 'number' && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-[10px] rounded-full font-bold',
                    isActive
                      ? 'bg-brand-blue-600 text-white'
                      : 'bg-[#11263a] text-slate-300 group-hover:bg-[#1e3a52]'
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User profile footer */}
      {user && (
        <div className="pt-4 border-t border-[#11263a] mt-4 space-y-2">
          <Link
            href="/profile"
            className="flex items-center gap-3 p-2 rounded-2xl hover:bg-[#0d1d2d] transition-colors group"
          >
            <Avatar src={user.avatar} name={user.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-brand-blue-400">
                {user.name}
              </p>
              <p className="text-[11px] text-brand-orange-400 truncate">
                ★ {user.rating} reputation
              </p>
            </div>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 rounded-xl transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
