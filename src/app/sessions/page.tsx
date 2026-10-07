'use client';

import React, { useState } from 'react';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { SessionCard } from '@/components/cards/SessionCard';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { ScheduleSessionModal } from '@/components/modals/ScheduleSessionModal';
import { ReviewSessionModal } from '@/components/modals/ReviewSessionModal';
import { LearningSession } from '@/types';
import { Calendar, Plus, Video, Clock } from 'lucide-react';

export default function SessionsPage() {
  const { sessions } = useSkillSwap();
  const [activeTab, setActiveTab] = useState<string>('scheduled');
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [reviewingSession, setReviewingSession] = useState<LearningSession | null>(null);

  const filteredSessions = sessions.filter((s) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'scheduled') return s.status === 'scheduled' || s.status === 'in_progress';
    return s.status === activeTab;
  });

  const tabItems: TabItem[] = [
    { id: 'scheduled', label: 'Upcoming', count: sessions.filter(s => s.status === 'scheduled' || s.status === 'in_progress').length },
    { id: 'completed', label: 'Completed', count: sessions.filter(s => s.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: sessions.filter(s => s.status === 'cancelled').length },
  ];

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Learning Sessions
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Manage your 1-on-1 peer teaching and mentorship exchanges with token escrow.
            </p>
          </div>

          <button
            onClick={() => setIsScheduleOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-blue/15 transition flex items-center justify-center gap-1.5 self-start sm:self-auto active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Session</span>
          </button>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabItems} activeTab={activeTab} onChange={setActiveTab} />

        {/* Sessions Grid */}
        {filteredSessions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {activeTab === 'scheduled'
                ? "You don't have any upcoming sessions"
                : activeTab === 'completed'
                ? 'No completed sessions yet'
                : 'No cancelled sessions'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Connect with a skill match from Discover and schedule your first 1-on-1 exchange.
            </p>
            {activeTab === 'scheduled' && (
              <button
                onClick={() => setIsScheduleOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-blue/15"
              >
                Schedule a Session
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onReview={() => setReviewingSession(session)}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <ScheduleSessionModal
          isOpen={isScheduleOpen}
          onClose={() => setIsScheduleOpen(false)}
        />

        <ReviewSessionModal
          session={reviewingSession}
          isOpen={!!reviewingSession}
          onClose={() => setReviewingSession(null)}
        />
      </div>
    </>
  );
}
