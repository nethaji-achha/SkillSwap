'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { SkillSwapRequestModal } from '@/components/modals/SkillSwapRequestModal';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  // Determine if full-bleed landing page or auth screens
  const isLanding = pathname === '/';
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/onboarding';

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          {children}
        </main>
        <SkillSwapRequestModal />
      </div>
    );
  }

  if (isLanding) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 pb-16 sm:pb-0">{children}</main>
        <BottomNav />
        <SkillSwapRequestModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex w-full">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 min-w-0">
          {children}
        </main>
      </div>
      <BottomNav />
      <SkillSwapRequestModal />
    </div>
  );
};

export default AppShell;
