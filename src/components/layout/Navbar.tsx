'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { Avatar } from '@/components/ui/Avatar';
import { NotificationDropdown } from './NotificationDropdown';
import { 
  Sparkles, 
  Coins, 
  Bell, 
  Menu, 
  X, 
  Bot,
  Crown,
  Shield,
  Plus
} from 'lucide-react';

import Image from 'next/image';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, wallet, unreadNotificationCount, logout } = useSkillSwap();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);

  const isAuthOrAppPage = pathname.startsWith('/dashboard') || 
    pathname.startsWith('/discover') || 
    pathname.startsWith('/matches') || 
    pathname.startsWith('/messages') || 
    pathname.startsWith('/sessions') || 
    pathname.startsWith('/progress') || 
    pathname.startsWith('/skills') || 
    pathname.startsWith('/wallet') || 
    pathname.startsWith('/profile') || 
    pathname.startsWith('/ai-') || 
    pathname.startsWith('/settings') ||
    pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Official Logo */}
        <Link href="/" className="flex items-center shrink-0 group">
          <Image
            src="/skillswap-logo.png"
            alt="Skill Swap"
            width={160}
            height={80}
            className="h-12 sm:h-[52px] w-auto object-contain transition-transform group-hover:scale-[1.02]"
            priority
          />
        </Link>

        {/* Center Navigation */}
        {!isAuthOrAppPage ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="/discover" className="hover:text-brand-blue-500 transition-colors">
              Discover
            </Link>
            <Link href="/#how-it-works" className="hover:text-brand-blue-500 transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="hover:text-brand-blue-500 transition-colors">
              Pricing
            </Link>
            <Link href="/ai-match" className="hover:text-brand-blue-600 transition-colors flex items-center gap-1.5 text-brand-blue-500 font-semibold">
              <Sparkles className="w-4 h-4 text-brand-blue-500" />
              AI Match
            </Link>
          </nav>
        ) : (
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              href="/ai-match"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 text-brand-blue-600 hover:bg-blue-100 transition-colors border border-blue-200/60"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-blue-500" />
              AI Match
            </Link>
            <Link
              href="/ai-assistant"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200/60"
            >
              <Bot className="w-3.5 h-3.5 text-slate-600" />
              AI Assistant
            </Link>
          </div>
        )}

        {/* Right side Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Token Wallet Badge (Orange) */}
              <Link
                href="/wallet"
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-xl transition shadow-sm text-xs font-bold text-amber-900 group"
              >
                <span>🪙</span>
                <span className="text-brand-orange-500 font-black">{wallet?.available_balance || 0}</span>
                <span className="hidden sm:inline text-amber-700 font-normal">Tokens</span>
                <Plus className="w-3.5 h-3.5 text-amber-700 group-hover:scale-110 transition" />
              </Link>

              {/* Admin Link if admin */}
              {user.role === 'admin' && (
                <Link
                  href="/admin"
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-slate-800"
                >
                  <Shield className="w-3.5 h-3.5 text-brand-green-400" />
                  Admin
                </Link>
              )}

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifsOpen(!notifsOpen)}
                  className="relative p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-blue-500 rounded-full ring-2 ring-white" />
                  )}
                </button>
                <NotificationDropdown isOpen={notifsOpen} onClose={() => setNotifsOpen(false)} />
              </div>

              {/* User Avatar link */}
              <Link href="/profile" className="flex items-center gap-2 group">
                <Avatar src={user.avatar} name={user.name} size="sm" />
                <span className="hidden lg:block text-xs font-semibold text-slate-700 group-hover:text-slate-900">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-gradient-to-r from-[#6be000] to-[#0878f9] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95"
              >
                Get Started Free
              </Link>
            </div>
          )}

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            href="/discover"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700"
          >
            Discover Community
          </Link>
          <Link
            href="/matches"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700"
          >
            Skill Matches
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700"
          >
            Pricing & Membership
          </Link>
          <Link
            href="/wallet"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-slate-700 flex items-center justify-between"
          >
            <span>Skill Swap Wallet</span>
            <span className="font-bold text-brand-orange-dark">{wallet?.available_balance || 0} 🪙</span>
          </Link>
          <Link
            href="/ai-assistant"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-semibold text-brand-blue hover:text-brand-blue-dark"
          >
            AI Learning Assistant
          </Link>
          {user && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full text-left py-2 text-sm font-semibold text-rose-600 border-t border-slate-100 pt-3"
            >
              Sign Out
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
