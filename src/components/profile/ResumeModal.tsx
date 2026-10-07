'use client';

import React from 'react';
import { UserProfile } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { 
  X, 
  Printer, 
  MapPin, 
  Mail, 
  Globe, 
  Github, 
  Linkedin, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code, 
  BookOpen,
  Star
} from 'lucide-react';

interface ResumeModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ user, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const socialLinks = user.socialLinks || user.social_links || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Modal Controls (Hidden in print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Skill Swap Resume</span>
            <span className="text-xs font-semibold text-brand-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/60">
              Verified Profile
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Resume Content */}
        <div className="p-8 sm:p-12 space-y-8 bg-white text-slate-900" id="printable-resume">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-200 pb-8">
            <div className="space-y-1.5 flex-1">
              <h1 className="text-3xl font-black text-slate-950 tracking-tight">{user.name}</h1>
              <p className="text-base font-semibold text-brand-blue-600">{user.headline || 'Skill Swap Specialist & Peer Mentor'}</p>
              
              {/* Contact & Meta */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                {user.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {user.email}
                  </span>
                )}
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {user.location}
                  </span>
                )}
                {user.username && (
                  <span className="font-mono text-slate-400">
                    @{user.username}
                  </span>
                )}
                <span className="flex items-center gap-1 font-semibold text-amber-600">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ★ {(user.rating || 5.0).toFixed(1)} Reputation ({user.sessionsCompleted || 0} sessions completed)
                </span>
              </div>

              {/* Social Links */}
              {(socialLinks.github || socialLinks.linkedin || socialLinks.portfolio || socialLinks.website) && (
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-2">
                  {socialLinks.github && (
                    <span className="flex items-center gap-1 text-slate-700">
                      <Github className="w-3.5 h-3.5" /> {socialLinks.github}
                    </span>
                  )}
                  {socialLinks.linkedin && (
                    <span className="flex items-center gap-1 text-slate-700">
                      <Linkedin className="w-3.5 h-3.5" /> {socialLinks.linkedin}
                    </span>
                  )}
                  {(socialLinks.portfolio || socialLinks.website) && (
                    <span className="flex items-center gap-1 text-slate-700">
                      <Globe className="w-3.5 h-3.5" /> {socialLinks.portfolio || socialLinks.website}
                    </span>
                  )}
                </div>
              )}
            </div>

            <Avatar src={user.avatar} name={user.name} size="xl" />
          </div>

          {/* About Summary */}
          {user.bio && (
            <div className="space-y-2">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Professional Summary</h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{user.bio}</p>
            </div>
          )}

          {/* Skills Grid: Teaching & Learning */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Teaching Expertise */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                Teaching Expertise & Skills
              </h2>
              {user.skillsTeaching.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No teaching skills listed.</p>
              ) : (
                <div className="space-y-2">
                  {user.skillsTeaching.map((s) => (
                    <div key={s.id} className="text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{s.name}</span>
                        <span className="font-semibold text-emerald-700 text-[11px]">{s.level} • {s.yearsExperience || 1} yrs</span>
                      </div>
                      {s.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{s.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Learning Goals */}
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h2 className="text-xs font-bold text-brand-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-brand-blue-600" />
                Learning Goals & Targets
              </h2>
              {user.skillsLearning.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No learning goals listed.</p>
              ) : (
                <div className="space-y-2">
                  {user.skillsLearning.map((s) => (
                    <div key={s.id} className="text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{s.name}</span>
                        <span className="font-semibold text-brand-blue-700 text-[11px]">Target: {s.targetLevel || 'Advanced'}</span>
                      </div>
                      {s.learningGoal && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{s.learningGoal}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Work Experience */}
          {(user.experience || []).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                Experience
              </h2>
              <div className="space-y-3">
                {user.experience!.map((exp, idx) => (
                  <div key={idx} className="border-l-2 border-slate-200 pl-4 space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-900">{exp.title}</span>
                      <span className="text-slate-400 font-medium text-[11px]">{exp.period}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600">{exp.company}</p>
                    {exp.description && (
                      <p className="text-xs text-slate-500 pt-0.5 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {(user.education || []).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                Education
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.education!.map((edu, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{edu.degree}</p>
                    <p className="text-xs text-slate-600">{edu.institution}</p>
                    {edu.year && <p className="text-[11px] text-slate-400 mt-0.5">{edu.year}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {(user.projects || []).length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-slate-500" />
                Key Projects & Artifacts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {user.projects!.map((proj, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{proj.title}</span>
                      {proj.link && (
                        <span className="text-[10px] text-brand-blue-600 font-semibold">{proj.link}</span>
                      )}
                    </div>
                    {proj.description && (
                      <p className="text-xs text-slate-500 leading-relaxed">{proj.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications & Languages & Interests */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {(user.certifications || []).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Certifications
                </h3>
                <div className="space-y-1.5 text-xs text-slate-700">
                  {user.certifications!.map((cert, idx) => (
                    <div key={idx}>
                      <span className="font-semibold text-slate-900">{cert.name}</span>
                      <p className="text-[10px] text-slate-400">{cert.issuer} {cert.year ? `(${cert.year})` : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(user.languages || []).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Languages</h3>
                <div className="flex flex-wrap gap-1.5">
                  {user.languages!.map((lang, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(user.interests || []).length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interests</h3>
                <div className="flex flex-wrap gap-1.5">
                  {user.interests!.map((interest, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
