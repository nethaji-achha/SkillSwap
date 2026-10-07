'use client';

import React, { useState } from 'react';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { MatchCard } from '@/components/cards/MatchCard';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Users, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MatchesPage() {
  const { matches, openSwapModal } = useSkillSwap();
  const [activeTab, setActiveTab] = useState<string>('all');

  const filteredMatches = matches.filter((m) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return m.status === 'pending';
    if (activeTab === 'connected') return m.status === 'connected';
    if (activeTab === 'completed') return m.status === 'completed';
    return true;
  });

  const tabItems: TabItem[] = [
    { id: 'all', label: 'All Matches', count: matches.length },
    { id: 'connected', label: 'Connected', count: matches.filter(m => m.status === 'connected').length },
    { id: 'pending', label: 'Pending', count: matches.filter(m => m.status === 'pending').length },
    { id: 'completed', label: 'Completed', count: matches.filter(m => m.status === 'completed').length },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Skill Matches
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Peers with complementary skills discovered through explainable AI matching.
            </p>
          </div>

          <Link
            href="/ai-match"
            className="px-4 py-2 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-blue/15 transition flex items-center justify-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Deep Match Engine
          </Link>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

        {/* Matches Grid */}
        {filteredMatches.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {activeTab === 'pending'
                ? 'No pending swap requests'
                : activeTab === 'connected'
                ? 'No connected partners yet'
                : 'No matches yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Complete your profile and add learning goals to discover skill matches.
            </p>
            <Link
              href="/skills"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              <span>Manage Your Skills & Goals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onRequestSwap={() => openSwapModal(match.user)}
              />
            ))}
          </div>
        )}
      </div>
  );
}
