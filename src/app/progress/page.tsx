'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { skillService } from '@/services/skill.service';
import { sessionService } from '@/services/session.service';
import { AchievementItem, SkillAssessmentItem, SessionSummaryItem } from '@/types';
import { SessionSummaryModal } from '@/components/modals/SessionSummaryModal';
import { SkillAssessmentModal } from '@/components/modals/SkillAssessmentModal';
import { 
  Award, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Star, 
  Calendar, 
  Sparkles, 
  ArrowRight,
  CheckCircle2,
  FileText,
  Loader2
} from 'lucide-react';

export default function ProgressPage() {
  const { user, sessions } = useSkillSwap();
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [assessments, setAssessments] = useState<SkillAssessmentItem[]>([]);
  const [summaries, setSummaries] = useState<SessionSummaryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedSummary, setSelectedSummary] = useState<SessionSummaryItem | null>(null);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  useEffect(() => {
    loadProgressData();
  }, [user?.id]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      const [achData, assData, sumData] = await Promise.all([
        skillService.getMyAchievements().catch(() => []),
        skillService.getMyAssessments().catch(() => []),
        sessionService.getMySummaries().catch(() => [])
      ]);
      setAchievements(achData);
      setAssessments(assData);
      setSummaries(sumData);
    } catch (err) {
      console.error('Failed to load progress details', err);
    } finally {
      setLoading(false);
    }
  };

  const completedSessions = sessions.filter(s => s.status === 'completed');
  const teachingHours = user?.teachingHours || 0;
  const learningHours = user?.learningHours || 0;
  const totalHours = teachingHours + learningHours;
  const completedCount = user?.sessionsCompleted || completedSessions.length;

  const teachingSkills = user?.skillsTeaching || [];
  const learningSkills = user?.skillsLearning || [];

  // Count badges
  const bronzeCount = achievements.filter(a => a.badge_level?.toUpperCase() === 'BRONZE').length;
  const silverCount = achievements.filter(a => a.badge_level?.toUpperCase() === 'SILVER').length;
  const goldCount = achievements.filter(a => a.badge_level?.toUpperCase() === 'GOLD').length;

  // Assessments stats
  const completedAssessments = assessments.filter(a => a.status === 'completed');
  const avgScore = completedAssessments.length > 0
    ? (completedAssessments.reduce((acc, a) => acc + (a.percentage || 0), 0) / completedAssessments.length).toFixed(1)
    : null;

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-200 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Learning & Teaching Progress
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live statistics tracking your exchanged hours, reputation ratings, Bronze/Silver/Gold badges, and AI session summaries.
            </p>
          </div>

          <Link
            href="/skills"
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition self-start sm:self-auto shadow-sm"
          >
            Manage My Skills
          </Link>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Total Hours Exchanged
            </span>
            <h3 className="text-3xl font-black text-slate-900">
              {totalHours.toFixed(1)}h
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Exchanged 1-on-1</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Teaching Hours
            </span>
            <h3 className="text-3xl font-black text-brand-green-dark">
              {teachingHours.toFixed(1)}h
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {teachingSkills.length} skills shared
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Learning Hours
            </span>
            <h3 className="text-3xl font-black text-brand-blue">
              {learningHours.toFixed(1)}h
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {learningSkills.length} goals advanced
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Reputation Score
            </span>
            <h3 className="text-3xl font-black text-brand-orange-dark flex items-center gap-1">
              {(user?.rating || 5.0).toFixed(1)}
              <Star className="w-5 h-5 fill-brand-orange text-brand-orange" />
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {user?.reviewsCount || 0} reviews received
            </p>
          </div>
        </div>

        {/* Badge & Assessment Achievements Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-700/10 text-amber-800 flex items-center justify-center font-black text-xl">
              🥉
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Bronze Badges</span>
              <h4 className="text-2xl font-black text-slate-900">{bronzeCount}</h4>
              <p className="text-[10px] text-slate-400">Awarded upon session completion</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-800 flex items-center justify-center font-black text-xl">
              🥈
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Silver Badges</span>
              <h4 className="text-2xl font-black text-slate-900">{silverCount}</h4>
              <p className="text-[10px] text-slate-400">Score 60–79% on quiz</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-800 flex items-center justify-center font-black text-xl">
              🥇
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gold Badges</span>
              <h4 className="text-2xl font-black text-slate-900">{goldCount}</h4>
              <p className="text-[10px] text-slate-400">Score 80–100% on quiz</p>
            </div>
          </div>
        </div>

        {/* Empty or Real Progress Breakdown */}
        {completedCount === 0 && summaries.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-sm">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No session history yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              Your learning progress, Bronze/Silver/Gold achievements, and AI session summaries will appear here after your first completed session.
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              <span>Explore Discover Community</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Recent Session Summaries */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-green to-brand-blue flex items-center justify-center text-white shadow-md">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Recent AI Learning Summaries</h3>
                    <p className="text-xs text-slate-500">Key concepts, mentor takeaways, and revision notes from your completed sessions</p>
                  </div>
                </div>
              </div>

              {summaries.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No summaries generated yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summaries.map((sm) => (
                    <div
                      key={sm.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{sm.skill_name}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(sm.session_date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {sm.learning_objective || 'Master fundamental concepts and real-world patterns.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="text-[10px] text-slate-400">
                          Mentor: <strong className="text-slate-700">{sm.teacher_name}</strong>
                        </span>
                        <button
                          onClick={() => setSelectedSummary(sm)}
                          className="px-3 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-lg transition flex items-center gap-1 shadow-sm"
                        >
                          <FileText className="w-3.5 h-3.5 text-brand-blue" />
                          <span>View Summary</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Teaching Mastery & Learning Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teaching Mastery */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-green-dark" />
                  Teaching Contributions
                </h3>
                <div className="space-y-3">
                  {teachingSkills.map((s) => (
                    <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900">{s.name}</span>
                        <p className="text-[10px] text-slate-400">{s.level} • {s.category}</p>
                      </div>
                      <span className="text-xs font-bold text-brand-orange-dark bg-brand-orange/10 px-2 py-0.5 rounded border border-brand-orange/20">
                        {s.sessionPrice || 12} 🪙 / session
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Goals */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-blue" />
                  Active Learning Progress & Assessments
                </h3>
                <div className="space-y-3">
                  {learningSkills.map((s) => {
                    const matchAssessment = assessments.find(a => a.skill_name.toLowerCase() === s.name.toLowerCase());
                    return (
                      <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="font-bold text-xs text-slate-900">{s.name}</span>
                          <p className="text-[10px] text-slate-400">Target: {s.targetLevel || 'Advanced'}</p>
                        </div>
                        {matchAssessment ? (
                          <button
                            onClick={() => setSelectedAssessmentId(matchAssessment.id)}
                            className="text-xs font-bold text-brand-blue-dark bg-brand-blue/10 border border-brand-blue/20 px-2.5 py-1 rounded-lg hover:bg-brand-blue/20 transition flex items-center gap-1"
                          >
                            <span>{matchAssessment.status === 'completed' ? `Quiz (${matchAssessment.percentage}%)` : 'Take Quiz'}</span>
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">In Progress</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedSummary && (
        <SessionSummaryModal
          summary={selectedSummary}
          isOpen={!!selectedSummary}
          onClose={() => setSelectedSummary(null)}
        />
      )}

      {selectedAssessmentId && (
        <SkillAssessmentModal
          assessmentId={selectedAssessmentId}
          isOpen={!!selectedAssessmentId}
          onClose={() => setSelectedAssessmentId(null)}
          onCompleted={() => loadProgressData()}
        />
      )}
    </>
  );
}
