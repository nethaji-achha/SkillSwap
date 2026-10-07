'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { MatchCard } from '@/components/cards/MatchCard';
import { SessionCard } from '@/components/cards/SessionCard';
import EmptyState from '@/components/ui/EmptyState';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Users, 
  Calendar, 
  Coins, 
  Plus, 
  Compass,
  TrendingUp,
  Award
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, wallet, matches, sessions, openSwapModal, isLoading } = useSkillSwap();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-200 rounded-2xl" />
          <div className="h-24 bg-slate-200 rounded-2xl" />
          <div className="h-24 bg-slate-200 rounded-2xl" />
          <div className="h-24 bg-slate-200 rounded-2xl" />
        </div>
        <div className="h-64 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' || s.status === 'in_progress');
  const teachCount = user?.skillsTeaching?.length || 0;
  const learnCount = user?.skillsLearning?.length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header Greeting Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Welcome, {user?.name ? user.name.split(' ')[0] : 'Member'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Your decentralized skill exchange dashboard. Connect, teach, and learn with peers.
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href="/ai-match"
              className="px-4 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-blue/15 transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Skill Match
            </Link>
            <Link
              href="/discover"
              className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              Discover
            </Link>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat 1: Wallet Tokens */}
          <Link href="/wallet" className="group">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-orange/40 hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Wallet Balance
                </p>
                <h3 className="text-2xl font-black text-slate-900">
                  {wallet?.available_balance || 0} 🪙
                </h3>
                <p className="text-[11px] text-brand-orange-dark mt-1">
                  +{wallet?.pending_balance || 0} held in escrow
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange-dark flex items-center justify-center group-hover:scale-105 transition">
                <Coins className="w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Stat 2: Skills */}
          <Link href="/skills" className="group">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-blue/40 hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  My Skills
                </p>
                <h3 className="text-2xl font-black text-slate-900">
                  {teachCount + learnCount}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  <span className="text-brand-green-dark font-medium">{teachCount} teach</span> • <span className="text-brand-blue-dark font-medium">{learnCount} learn</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center group-hover:scale-105 transition">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Stat 3: Matches */}
          <Link href="/matches" className="group">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-blue/40 hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Skill Matches
                </p>
                <h3 className="text-2xl font-black text-slate-900">
                  {matches.length}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Complementary matches
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 text-brand-blue flex items-center justify-center group-hover:scale-105 transition">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Stat 4: Reputation / Sessions */}
          <Link href="/progress" className="group">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-brand-green/40 hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Reputation
                </p>
                <h3 className="text-2xl font-black text-slate-900">
                  ★ {user?.rating || 5.0}
                </h3>
                <p className="text-[11px] text-brand-green-dark mt-1">
                  {user?.sessionsCompleted || 0} sessions completed
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-brand-green/10 text-brand-green-dark flex items-center justify-center group-hover:scale-105 transition">
                <Award className="w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>

        {/* Upcoming Sessions Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-blue" />
              <h2 className="text-lg font-bold text-slate-900">Upcoming Learning Sessions</h2>
            </div>
            <Link href="/sessions" className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark">
              View All ({sessions.length}) →
            </Link>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">No scheduled sessions</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Browse matches or search the community to book your first skill exchange session.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSessions.slice(0, 2).map((s) => (
                <SessionCard key={s.id} session={s} />
              ))}
            </div>
          )}
        </div>

        {/* Recommended Matches Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recommended Matches for You</h2>
              <p className="text-xs text-slate-500">AI-matched peers based on your teaching and learning profile</p>
            </div>
            <Link href="/matches" className="text-xs font-semibold text-brand-blue hover:text-brand-blue-dark">
              See All Matches →
            </Link>
          </div>

          {matches.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No matches yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
                Complete your profile and add learning goals to discover complementary skill matches in our network.
              </p>
              <button
                onClick={() => router.push('/skills')}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-blue/15"
              >
                Add Your Skills & Goals
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {matches.slice(0, 6).map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onRequestSwap={() => openSwapModal(match.user)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
