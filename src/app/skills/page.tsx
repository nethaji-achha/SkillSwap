'use client';

import React, { useState, useEffect } from 'react';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { skillService } from '@/services/skill.service';
import { AddSkillModal } from '@/components/modals/AddSkillModal';
import { SkillAssessmentModal } from '@/components/modals/SkillAssessmentModal';
import { AchievementItem, SkillAssessmentItem } from '@/types';
import { 
  Plus, 
  BookOpen, 
  GraduationCap, 
  Trash2, 
  Coins, 
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function MySkillsPage() {
  const { user, removeUserSkill, refreshUserAndWallet } = useSkillSwap();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<'teach' | 'learn'>('teach');
  
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [assessments, setAssessments] = useState<SkillAssessmentItem[]>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  useEffect(() => {
    loadAchievementsAndAssessments();
  }, [user?.id]);

  const loadAchievementsAndAssessments = async () => {
    try {
      const [achData, assData] = await Promise.all([
        skillService.getMyAchievements(),
        skillService.getMyAssessments()
      ]);
      setAchievements(achData);
      setAssessments(assData);
    } catch (err) {
      console.error('Failed to load achievements/assessments', err);
    }
  };

  const openAddModal = (type: 'teach' | 'learn') => {
    setModalDefaultType(type);
    setAddModalOpen(true);
  };

  const teachingSkills = user?.skillsTeaching || [];
  const learningSkills = user?.skillsLearning || [];

  const getAchievementForSkill = (skillName: string) => {
    return achievements.find(a => a.skill_name.toLowerCase() === skillName.toLowerCase());
  };

  const getAssessmentForSkill = (skillName: string) => {
    return assessments.find(a => a.skill_name.toLowerCase() === skillName.toLowerCase());
  };

  const renderBadgeTag = (badgeLevel?: string) => {
    if (!badgeLevel) return null;
    const badge = badgeLevel.toUpperCase();
    if (badge === 'GOLD') {
      return (
        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-800 border border-amber-500/30 flex items-center gap-1 shadow-sm">
          <span>🥇</span> GOLD BADGE
        </span>
      );
    }
    if (badge === 'SILVER') {
      return (
        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 border border-slate-300 flex items-center gap-1 shadow-sm">
          <span>🥈</span> SILVER BADGE
        </span>
      );
    }
    return (
      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-700/10 text-amber-900 border border-amber-700/20 flex items-center gap-1">
        <span>🥉</span> BRONZE BADGE
      </span>
    );
  };

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-200 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Skills & Learning Goals
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Configure what you can teach, track your Bronze/Silver/Gold badges, and take Skill Assessments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => openAddModal('teach')}
              className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-xl shadow-md shadow-brand-green/20 transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Offer a Skill</span>
            </button>
            <button
              onClick={() => openAddModal('learn')}
              className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white font-bold text-xs rounded-xl shadow-md shadow-brand-blue/20 transition flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Learning Goal</span>
            </button>
          </div>
        </div>

        {/* Section 1: Skills I Teach */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-green/10 text-brand-green-dark flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Skills I Teach</h2>
                <p className="text-xs text-slate-500">Earn tokens by offering sessions in these subjects</p>
              </div>
            </div>

            <button
              onClick={() => openAddModal('teach')}
              className="px-3 py-1.5 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green-dark font-semibold text-xs rounded-xl transition"
            >
              + Add Teaching Skill
            </button>
          </div>

          {teachingSkills.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">No teaching skills offered yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add skills you can share to start receiving swap requests and earning tokens.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teachingSkills.map((skill) => {
                const ach = getAchievementForSkill(skill.name);
                return (
                  <div
                    key={skill.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-base">{skill.name}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-green/10 text-brand-green-dark border border-brand-green/30 px-2 py-0.5 rounded-md">
                            {skill.level}
                          </span>
                          {renderBadgeTag(ach?.badge_level || skill.badge)}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{skill.category} • {skill.yearsExperience || 1} yrs exp</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-brand-orange-dark bg-brand-orange/10 px-2.5 py-1 rounded-lg border border-brand-orange/20">
                          {skill.sessionPrice || 12} 🪙 / hr
                        </span>
                        <button
                          onClick={() => removeUserSkill(skill.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                          title="Remove Skill"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {skill.description && (
                      <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                        {skill.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Skills I Want to Learn & Achievements */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 text-brand-blue flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Skills I Want to Learn & Badges</h2>
                <p className="text-xs text-slate-500">Track active goals, scheduled assessments, and earned Bronze/Silver/Gold achievements</p>
              </div>
            </div>

            <button
              onClick={() => openAddModal('learn')}
              className="px-3 py-1.5 bg-brand-blue/10 hover:bg-brand-blue/20 text-brand-blue-dark font-semibold text-xs rounded-xl transition"
            >
              + Add Learning Goal
            </button>
          </div>

          {learningSkills.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
              <GraduationCap className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs font-semibold text-slate-700">No learning goals configured yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add skills you want to learn so our AI engine can recommend the best teachers.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {learningSkills.map((skill) => {
                const ach = getAchievementForSkill(skill.name);
                const assessment = getAssessmentForSkill(skill.name);

                return (
                  <div
                    key={skill.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between space-y-3.5"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-base">{skill.name}</h4>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-blue/10 text-brand-blue-dark border border-brand-blue/30 px-2 py-0.5 rounded-md">
                            Goal: {skill.targetLevel || 'Advanced'}
                          </span>
                          {renderBadgeTag(ach?.badge_level || skill.badge)}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{skill.category} • Priority: {skill.priority || 'Medium'}</p>
                      </div>

                      <button
                        onClick={() => removeUserSkill(skill.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg transition"
                        title="Remove Goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {skill.learningGoal && (
                      <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                        🎯 {skill.learningGoal}
                      </p>
                    )}

                    {/* Assessment & Achievement status strip */}
                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Assessment Status</span>
                        <span className="text-xs font-semibold text-slate-800">
                          {assessment?.status === 'completed'
                            ? `Graded (${assessment.percentage}%)`
                            : assessment
                            ? 'Scheduled (2-Day Unlock)'
                            : ach
                            ? 'Bronze Awarded'
                            : 'Pending first completed session'}
                        </span>
                      </div>

                      {assessment && (
                        <button
                          onClick={() => setSelectedAssessmentId(assessment.id)}
                          className="px-3 py-1.5 bg-gradient-to-r from-brand-green to-brand-blue text-white font-bold text-xs rounded-lg shadow-sm hover:opacity-95 transition flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{assessment.status === 'completed' ? 'Review Quiz' : 'Take Quiz'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AddSkillModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        defaultType={modalDefaultType}
      />

      {selectedAssessmentId && (
        <SkillAssessmentModal
          assessmentId={selectedAssessmentId}
          isOpen={!!selectedAssessmentId}
          onClose={() => setSelectedAssessmentId(null)}
          onCompleted={() => {
            loadAchievementsAndAssessments();
            refreshUserAndWallet();
          }}
        />
      )}
    </>
  );
}
