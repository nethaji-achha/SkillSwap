'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { Avatar } from '@/components/ui/Avatar';
import { ResumeModal } from '@/components/profile/ResumeModal';
import { 
  MapPin, 
  Clock, 
  BookOpen, 
  GraduationCap, 
  Edit3, 
  ShieldCheck, 
  Coins, 
  Star,
  FileText,
  Briefcase,
  Award,
  Code,
  Globe,
  Github,
  Linkedin,
  Sparkles
} from 'lucide-react';

export default function CurrentUserProfilePage() {
  const { user, wallet } = useSkillSwap();
  const [resumeOpen, setResumeOpen] = useState(false);

  if (!user) {
    return (
      <div className="py-20 text-center text-slate-400">
        Loading profile...
      </div>
    );
  }

  const socialLinks = user.socialLinks || user.social_links || {};
  const hasSocials = socialLinks.github || socialLinks.linkedin || socialLinks.portfolio || socialLinks.website;
  const achievements = user.achievements || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 pb-12">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar src={user.avatar} name={user.name} size="xl" isOnline={true} />
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
            <p className="text-xs sm:text-sm font-medium text-slate-600">{user.headline || 'Skill Swap Member & Peer Mentor'}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              {user.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {user.location}
                </span>
              )}
              <span className="flex items-center gap-1 font-semibold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                ★ {(user.rating || 5.0).toFixed(1)} ({user.reviewsCount || 0} reviews)
              </span>
              <span>•</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                {wallet?.available_balance || 0} 🪙 in wallet
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setResumeOpen(true)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Resume</span>
            </button>
            <Link
              href="/profile/edit"
              className="w-full sm:w-auto px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
          </div>
        </div>

        {/* Social Links Bar */}
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

      {/* Badges & Achievements Section */}
      {achievements.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Verified Badges & Achievements ({achievements.length})
            </h3>
            <Link href="/progress" className="text-xs font-semibold text-brand-blue-600 hover:underline">
              View Progress →
            </Link>
          </div>

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

      {/* Bio Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">About & Background</h3>
          <Link href="/profile/edit" className="text-xs font-semibold text-brand-blue-600 hover:text-brand-blue-700">
            Edit
          </Link>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {user.bio || 'No bio provided yet. Click "Edit Profile" to tell peers about your background, experience, and learning goals.'}
        </p>
      </div>

      {/* Skills Offered & Wanted */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Teach */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Skills I Teach
            </h3>
            <Link href="/skills" className="text-xs font-semibold text-brand-blue-600 hover:underline">
              Manage
            </Link>
          </div>

          {user.skillsTeaching.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No teaching skills added yet.</p>
          ) : (
            <div className="space-y-2.5">
              {user.skillsTeaching.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{s.name}</span>
                    <p className="text-[10px] text-slate-400">{s.level} • {s.category}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{s.sessionPrice || 12} 🪙 / hr</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learn */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-blue-500" />
              Learning Goals
            </h3>
            <Link href="/skills" className="text-xs font-semibold text-brand-blue-600 hover:underline">
              Manage
            </Link>
          </div>

          {user.skillsLearning.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No learning goals added yet.</p>
          ) : (
            <div className="space-y-2.5">
              {user.skillsLearning.map((s) => (
                <div key={s.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-900">{s.name}</span>
                    <p className="text-[10px] text-slate-400">Target: {s.targetLevel || 'Advanced'}</p>
                  </div>
                  <span className="text-xs font-semibold text-brand-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">Learning</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Experience & Projects */}
      {((user.experience || []).length > 0 || (user.projects || []).length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Experience */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Experience
              </h3>
              <Link href="/profile/edit" className="text-xs font-semibold text-brand-blue-600 hover:underline">
                Edit
              </Link>
            </div>

            {(user.experience || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No experience added yet.</p>
            ) : (
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
            )}
          </div>

          {/* Projects */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-600" />
                Projects & Portfolio
              </h3>
              <Link href="/profile/edit" className="text-xs font-semibold text-brand-blue-600 hover:underline">
                Edit
              </Link>
            </div>

            {(user.projects || []).length === 0 ? (
              <p className="text-xs text-slate-400 italic">No projects listed yet.</p>
            ) : (
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
            )}
          </div>
        </div>
      )}

      {/* Education & Certifications & Languages */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Education */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-brand-blue-500" />
            Education
          </h3>
          {(user.education || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic">No education listed.</p>
          ) : (
            <div className="space-y-2">
              {user.education!.map((edu, idx) => (
                <div key={idx} className="text-xs">
                  <p className="font-bold text-slate-800">{edu.degree}</p>
                  <p className="text-slate-500 text-[11px]">{edu.institution} {edu.year ? `(${edu.year})` : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certifications */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            Certifications
          </h3>
          {(user.certifications || []).length === 0 ? (
            <p className="text-xs text-slate-400 italic">No certifications added.</p>
          ) : (
            <div className="space-y-2">
              {user.certifications!.map((cert, idx) => (
                <div key={idx} className="text-xs">
                  <p className="font-bold text-slate-800">{cert.name}</p>
                  <p className="text-slate-500 text-[11px]">{cert.issuer} {cert.year ? `(${cert.year})` : ''}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Languages & Interests */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Languages & Topics</h3>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {(user.languages || ['English']).map((lang, idx) => (
                <span key={idx} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-md">
                  {lang}
                </span>
              ))}
            </div>
            {(user.interests || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {user.interests!.map((interest, idx) => (
                  <span key={idx} className="px-2.5 py-0.5 bg-blue-50 text-brand-blue-700 text-[11px] font-semibold rounded-md border border-blue-100">
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-blue-500" />
          Session Availability
        </h3>
        <div className="flex flex-wrap gap-2">
          {(user.availability || []).length > 0 ? (
            user.availability.map((avail, idx) => (
              <span key={idx} className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                {avail}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">Flexible scheduling (add availability in profile edit).</span>
          )}
        </div>
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
