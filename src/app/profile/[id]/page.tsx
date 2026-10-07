'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { userService } from '@/services/user.service';
import { reviewService } from '@/services/review.service';
import { UserProfile } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { ResumeModal } from '@/components/profile/ResumeModal';
import { 
  MapPin, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Star,
  Coins, 
  Loader2, 
  Briefcase,
  Award,
  Code,
  Globe,
  Github,
  Linkedin,
  FileText
} from 'lucide-react';
import Link from 'next/link';

export default function CommunityUserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { openSwapModal } = useSkillSwap();
  
  const userIdOrUsername = params.id as string;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [resumeOpen, setResumeOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const uData = await userService.getUserById(userIdOrUsername).catch(() => null);
        if (uData) {
          setUser(uData);
          const rData = await reviewService.getUserReviews(uData.id).catch(() => []);
          setReviews(rData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [userIdOrUsername]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-blue" />
        Loading member profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto space-y-4">
        <h2 className="text-lg font-bold text-slate-900">User not found</h2>
        <p className="text-xs text-slate-500">This profile does not exist in the Skill Swap network.</p>
        <Link
          href="/discover"
          className="inline-block px-5 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue text-white font-semibold text-xs rounded-xl shadow-md"
        >
          Back to Discover
        </Link>
      </div>
    );
  }

  const socialLinks = user.socialLinks || user.social_links || {};
  const hasSocials = socialLinks.github || socialLinks.linkedin || socialLinks.portfolio || socialLinks.website;
  const achievements = user.achievements || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 pb-12">
      <div>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discover Marketplace</span>
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar src={user.avatar} name={user.name} size="xl" isOnline={user.isOnline} />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {user.name}
              </h1>
              {user.username && (
                <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
                  @{user.username}
                </span>
              )}
              {user.isVerified && (
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified Member
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-600">{user.headline || 'Skill Swap Member'}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user.location}
                </span>
              )}
              <span className="flex items-center gap-1 font-semibold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ★ {(user.rating || 5.0).toFixed(1)} ({user.reviewsCount || reviews.length} reviews)
              </span>
              <span>•</span>
              <span>{user.sessionsCompleted || 0} completed sessions</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setResumeOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-200"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resume</span>
            </button>
            <button
              onClick={() => openSwapModal(user)}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Request Skill Swap</span>
            </button>
          </div>
        </div>

        {/* Social Links */}
        {hasSocials && (
          <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-slate-100">
            {socialLinks.github && (
              <a
                href={socialLinks.github.startsWith('http') ? socialLinks.github : `https://${socialLinks.github}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
              >
                <Github className="w-3.5 h-3.5 text-slate-800" />
                <span>GitHub</span>
              </a>
            )}
            {socialLinks.linkedin && (
              <a
                href={socialLinks.linkedin.startsWith('http') ? socialLinks.linkedin : `https://${socialLinks.linkedin}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold text-brand-blue-700 transition"
              >
                <Linkedin className="w-3.5 h-3.5 text-brand-blue-600" />
                <span>LinkedIn</span>
              </a>
            )}
            {(socialLinks.portfolio || socialLinks.website) && (
              <a
                href={(socialLinks.portfolio || socialLinks.website)!.startsWith('http') ? (socialLinks.portfolio || socialLinks.website)! : `https://${socialLinks.portfolio || socialLinks.website}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
              >
                <Globe className="w-3.5 h-3.5 text-slate-600" />
                <span>Website / Portfolio</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Verified Badges & Achievements Section */}
      {achievements.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Verified Badges & Achievements ({achievements.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {achievements.map((a, idx) => {
              const badge = (a.badge_level || 'BRONZE').toUpperCase();
              return (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border flex items-center gap-3 ${
                    badge === 'GOLD'
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-900'
                      : badge === 'SILVER'
                      ? 'bg-slate-100 border-slate-300 text-slate-800'
                      : 'bg-amber-700/10 border-amber-700/20 text-amber-950'
                  }`}
                >
                  <span className="text-2xl">{badge === 'GOLD' ? '🥇' : badge === 'SILVER' ? '🥈' : '🥉'}</span>
                  <div>
                    <h4 className="font-bold text-xs">{a.skill_name}</h4>
                    <span className="text-[10px] font-bold tracking-wider uppercase block opacity-80">{badge} TIER</span>
                    {a.latest_score !== undefined && a.latest_score !== null && (
                      <span className="text-[10px] font-semibold opacity-70">Score: {a.latest_score}%</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bio */}
      {user.bio && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-2">
          <h3 className="font-bold text-base text-slate-900">About & Background</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{user.bio}</p>
        </div>
      )}

      {/* Skills Offered & Learning Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            Skills {user.name.split(' ')[0]} Teaches
          </h3>
          {user.skillsTeaching.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No teaching skills listed.</p>
          ) : (
            <div className="space-y-2.5">
              {user.skillsTeaching.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{s.name}</span>
                    <p className="text-[10px] text-slate-400">{s.level} • {s.category}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {s.sessionPrice || 12} 🪙 / hr
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-brand-blue-500" />
            Skills {user.name.split(' ')[0]} Wants to Learn
          </h3>
          {user.skillsLearning.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No learning goals listed.</p>
          ) : (
            <div className="space-y-2.5">
              {user.skillsLearning.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{s.name}</span>
                    <p className="text-[10px] text-slate-400">Target: {s.targetLevel || 'Advanced'}</p>
                  </div>
                  <span className="text-xs font-semibold text-brand-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    Learning
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Experience & Projects if available */}
      {((user.experience || []).length > 0 || (user.projects || []).length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(user.experience || []).length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Experience
              </h3>
              <div className="space-y-3">
                {user.experience!.map((exp, idx) => (
                  <div key={idx} className="border-l-2 border-slate-200 pl-3.5 space-y-0.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{exp.title}</span>
                      <span className="text-[11px] font-normal text-slate-400">{exp.period}</span>
                    </div>
                    <p className="text-xs font-medium text-slate-600">{exp.company}</p>
                    {exp.description && (
                      <p className="text-[11px] text-slate-500 pt-0.5">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(user.projects || []).length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-600" />
                Key Projects
              </h3>
              <div className="space-y-3">
                {user.projects!.map((proj, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{proj.title}</span>
                      {proj.link && (
                        <a href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`} target="_blank" rel="noreferrer" className="text-[10px] text-brand-blue-600 hover:underline font-semibold">
                          View Link ↗
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-[11px] text-slate-500 leading-relaxed">{proj.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Real Reviews Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          Verified Reviews & Reputation ({reviews.length})
        </h3>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No reviews yet for this member.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((r) => (
              <div key={r.id} className="py-4 space-y-1.5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">{r.reviewer_name}</span>
                  <span className="text-xs font-bold text-amber-700">★ {r.overall_rating}.0</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resume Modal */}
      <ResumeModal
        user={user}
        isOpen={resumeOpen}
        onClose={() => setResumeOpen(false)}
      />
    </div>
  );
}
