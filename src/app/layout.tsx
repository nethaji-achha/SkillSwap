import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SkillSwapProvider } from '@/context/SkillSwapContext';
import { AppShell } from '@/components/layout/AppShell';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Skill Swap — Teach what you know. Learn what you want.',
  description: 'Connect with people who can teach what you want to learn while sharing the skills you are already good at. Simple, modern skill exchange.',
  keywords: ['Skill Swap', 'Learn', 'Teach', 'Peer Learning', 'Mentorship', 'React', 'Figma', 'Python', 'Skill Exchange'],
  icons: {
    icon: '/skillswap-logo.png',
    shortcut: '/skillswap-logo.png',
    apple: '/skillswap-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen overflow-x-hidden">
        <SkillSwapProvider>
          <AppShell>{children}</AppShell>
        </SkillSwapProvider>
      </body>
    </html>
  );
}
