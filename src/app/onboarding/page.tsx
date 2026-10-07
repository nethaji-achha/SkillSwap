'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { skillService } from '@/services/skill.service';
import { userService } from '@/services/user.service';
import { SkillLevel, AvailabilityTime } from '@/types';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  Search, 
  BookOpen, 
  GraduationCap, 
  Clock,
  Layers,
  Loader2,
  Plus
} from 'lucide-react';

const POPULAR_SKILLS = [
  'React', 'Python', 'UI/UX Design', 'Figma', 'Next.js', 'JavaScript', 
  'FastAPI', 'Machine Learning', 'Docker', 'SEO Strategy', 'Product Design', 
  'TypeScript', 'Golang', 'Digital Marketing', 'Tailwind CSS', 'SQL & Databases',
  'Graphic Design', 'Public Speaking', 'Spanish', 'Video Editing'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUserAndWallet, showToast } = useSkillSwap();
  const [step, setStep] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customSkillInput, setCustomSkillInput] = useState<string>('');
  
  // Wizard state
  const [teachSkills, setTeachSkills] = useState<string[]>([]);
  const [learnSkills, setLearnSkills] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<SkillLevel>('Intermediate');
  const [availability, setAvailability] = useState<AvailabilityTime[]>(['Weekday evenings', 'Weekends']);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const toggleTeachSkill = (skill: string) => {
    setTeachSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomTeachSkill = () => {
    if (customSkillInput.trim() && !teachSkills.includes(customSkillInput.trim())) {
      setTeachSkills([...teachSkills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const toggleLearnSkill = (skill: string) => {
    setLearnSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const addCustomLearnSkill = () => {
    if (customSkillInput.trim() && !learnSkills.includes(customSkillInput.trim())) {
      setLearnSkills([...learnSkills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const toggleAvailability = (item: AvailabilityTime) => {
    setAvailability(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const filteredSkills = POPULAR_SKILLS.filter(s =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // 1. Add teach skills
      for (const skillName of teachSkills) {
        await skillService.addSkill({
          skill_name: skillName,
          skill_type: 'teach',
          category: 'Technology',
          level: experienceLevel,
          yearsExperience: 2.0,
          sessionPrice: 12,
          isPublished: true,
          description: `Experienced in teaching practical ${skillName} fundamentals and real-world projects.`
        });
      }

      // 2. Add learn skills
      for (const skillName of learnSkills) {
        await skillService.addSkill({
          skill_name: skillName,
          skill_type: 'learn',
          category: 'General',
          level: 'Beginner',
          targetLevel: 'Advanced',
          learningGoal: `Master core concepts and build portfolio projects in ${skillName}.`,
          priority: 'High'
        });
      }

      // 3. Update Profile metadata
      await userService.updateMyProfile({
        availability: availability,
        headline: `${teachSkills[0] || 'Skill'} Practitioner & Lifelong Learner`,
        bio: `Passionate about sharing knowledge in ${teachSkills.join(', ')} while learning ${learnSkills.join(', ')}.`,
        onboardingCompleted: true
      });

      await refreshUserAndWallet();
      showToast('Profile setup complete! Ready to discover skill matches.');
      router.push('/dashboard');
    } catch (err: any) {
      showToast(err.message || 'Error saving onboarding profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl shadow-slate-100 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            <span>Step {step} of 4</span>
            <span className="text-brand-blue-600 font-bold">
              {step === 1 && 'What can you teach?'}
              {step === 2 && 'What do you want to learn?'}
              {step === 3 && 'Experience Level'}
              {step === 4 && 'Your Availability'}
            </span>
          </div>

          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#6be000] to-[#0878f9] transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: What can you teach? */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#6be000]" />
                What skills can you teach?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select or add skills you are confident mentoring others in to earn Skill Swap tokens.
              </p>
            </div>

            {/* Search / Custom input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search popular skills or type a new one..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:bg-white"
                />
              </div>
              {searchQuery && !filteredSkills.includes(searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    toggleTeachSkill(searchQuery.trim());
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-2 bg-[#6be000] text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1 hover:opacity-95"
                >
                  <Plus className="w-3.5 h-3.5" /> Add &quot;{searchQuery}&quot;
                </button>
              )}
            </div>

            {/* Skill tags */}
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredSkills.map((skill) => {
                const isSelected = teachSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleTeachSkill(skill)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#6be000] text-slate-900 border-[#6be000] font-bold shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-[#6be000]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Selected: <strong className="text-[#6be000]">{teachSkills.length} skills</strong>
            </div>
          </div>
        )}

        {/* STEP 2: What do you want to learn? */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-brand-blue-600" />
                What do you want to learn?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select skills you want to level up in. Our AI engine uses this to find reciprocal matches.
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search learning goals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-blue-500 focus:bg-white"
              />
            </div>

            {/* Skill tags */}
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
              {filteredSkills.map((skill) => {
                const isSelected = learnSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleLearnSkill(skill)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-brand-blue-600 text-white border-brand-blue-600 font-bold shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-brand-blue-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Selected: <strong className="text-brand-blue-600">{learnSkills.length} goals</strong>
            </div>
          </div>
        )}

        {/* STEP 3: Experience Level */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-6 h-6 text-brand-blue-600" />
                Your General Experience Level
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Helps calculate accurate pricing and compatibility with peers.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {[
                { level: 'Beginner' as SkillLevel, desc: '0–1 years. Exploring fundamentals and building foundational skills.' },
                { level: 'Intermediate' as SkillLevel, desc: '1–3 years. Solid hands-on experience, building projects independently.' },
                { level: 'Advanced' as SkillLevel, desc: '3–6 years. Deep practical mastery, architectural patterns, and mentoring.' },
                { level: 'Expert' as SkillLevel, desc: '6+ years. Recognized specialist, strategic expertise, and leadership.' },
              ].map((item) => (
                <div
                  key={item.level}
                  onClick={() => setExperienceLevel(item.level)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    experienceLevel === item.level
                      ? 'border-brand-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-brand-blue-600'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{item.level}</span>
                    {experienceLevel === item.level && (
                      <div className="w-5 h-5 rounded-full bg-brand-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Availability */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Clock className="w-6 h-6 text-brand-blue-600" />
                When are you available for sessions?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                You can adjust your custom schedule later in settings.
              </p>
            </div>

            <div className="space-y-3">
              {[
                'Weekday mornings' as AvailabilityTime,
                'Weekday evenings' as AvailabilityTime,
                'Weekends' as AvailabilityTime,
              ].map((item) => {
                const isSelected = availability.includes(item);
                return (
                  <div
                    key={item}
                    onClick={() => toggleAvailability(item)}
                    className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-brand-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-brand-blue-600'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="font-bold text-slate-900 text-sm">{item}</span>
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition ${
                      isSelected ? 'bg-brand-blue-600 border-brand-blue-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-8 border-t border-slate-100 mt-8">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && teachSkills.length === 0) {
                  showToast('Please select at least 1 skill you can teach.');
                  return;
                }
                if (step === 2 && learnSkills.length === 0) {
                  showToast('Please select at least 1 skill you want to learn.');
                  return;
                }
                setStep(step + 1);
              }}
              className="px-6 py-2.5 rounded-xl bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 active:scale-95"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleComplete}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#6be000] to-[#0878f9] hover:opacity-95 text-white font-bold text-xs shadow-lg transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  Complete Setup & Go to Dashboard
                  <Sparkles className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
