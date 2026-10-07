'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { userService } from '@/services/user.service';
import { Avatar } from '@/components/ui/Avatar';
import { 
  ArrowLeft, 
  Upload, 
  Trash2, 
  Plus, 
  Check, 
  Loader2, 
  AlertCircle, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code, 
  Globe, 
  Github, 
  Linkedin,
  MapPin,
  Clock,
  BookOpen
} from 'lucide-react';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, refreshUserAndWallet, showToast } = useSkillSwap();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [languagesInput, setLanguagesInput] = useState('');
  const [interestsInput, setInterestsInput] = useState('');
  const [availability, setAvailability] = useState<string[]>([]);
  
  // Structured lists
  const [experience, setExperience] = useState<Array<{ title: string; company: string; period: string; description: string }>>([]);
  const [education, setEducation] = useState<Array<{ degree: string; institution: string; year: string }>>([]);
  const [projects, setProjects] = useState<Array<{ title: string; description: string; link?: string }>>([]);
  const [certifications, setCertifications] = useState<Array<{ name: string; issuer: string; year: string }>>([]);
  
  // Social links
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [website, setWebsite] = useState('');

  // Status state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setUsername(user.username || '');
      setHeadline(user.headline || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setAvatarUrl(user.avatar || '');
      setLanguagesInput((user.languages || ['English']).join(', '));
      setInterestsInput((user.interests || []).join(', '));
      setAvailability(user.availability || ['Weekday evenings', 'Weekends']);
      setExperience(user.experience || []);
      setEducation(user.education || []);
      setProjects(user.projects || []);
      setCertifications(user.certifications || []);
      
      const socials = user.socialLinks || user.social_links || {};
      setGithub(socials.github || '');
      setLinkedin(socials.linkedin || '');
      setPortfolio(socials.portfolio || '');
      setWebsite(socials.website || '');
    }
  }, [user]);

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      const res = await userService.uploadAvatar(file);
      setAvatarUrl(res.avatar_url);
      await refreshUserAndWallet();
      showToast('Profile photo uploaded!');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async () => {
    setAvatarUrl('');
    try {
      await userService.updateMyProfile({ avatar_url: '' });
      await refreshUserAndWallet();
      showToast('Profile photo removed.');
    } catch (err) {}
  };

  const toggleAvailabilityOption = (slot: string) => {
    if (availability.includes(slot)) {
      setAvailability(availability.filter(a => a !== slot));
    } else {
      setAvailability([...availability, slot]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus('saving');
    setErrorMessage('');

    const parsedLanguages = languagesInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const parsedInterests = interestsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      full_name: fullName.trim(),
      username: username.trim().replace(/^@/, ''),
      headline: headline.trim(),
      bio: bio.trim(),
      location: location.trim(),
      avatar_url: avatarUrl,
      languages: parsedLanguages,
      interests: parsedInterests,
      availability: availability,
      experience: experience.filter(e => e.title || e.company),
      education: education.filter(e => e.degree || e.institution),
      projects: projects.filter(p => p.title),
      certifications: certifications.filter(c => c.name),
      social_links: {
        github: github.trim(),
        linkedin: linkedin.trim(),
        portfolio: portfolio.trim(),
        website: website.trim()
      }
    };

    try {
      await userService.updateMyProfile(payload);
      await refreshUserAndWallet();
      setSaveStatus('saved');
      showToast('Saved successfully!');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMessage(err.message || 'Unable to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="py-24 text-center text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-blue-500" />
        Loading profile...
      </div>
    );
  }

  const availabilityOptions = [
    'Weekday mornings',
    'Weekday afternoons',
    'Weekday evenings',
    'Weekend mornings',
    'Weekend afternoons',
    'Weekend evenings',
    'Flexible scheduling'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Edit Complete Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Your public identity, background, skills, and availability.
            </p>
          </div>
        </div>

        {/* Live Saving Status Feedback */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200/60">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60">
              <Check className="w-3.5 h-3.5" /> Saved successfully
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200/60">
              <AlertCircle className="w-3.5 h-3.5" /> {errorMessage || 'Unable to save changes'}
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-gradient-to-r from-[#6be000] to-[#0878f9] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-md transition active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Profile Photo & Basic Identity */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            1. Profile Photo & Core Details
          </h2>

          {/* Avatar Upload / Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar src={avatarUrl} name={fullName || user.name} size="xl" />
            <div className="space-y-2 text-center sm:text-left">
              <p className="text-xs font-bold text-slate-800">Profile Image</p>
              <p className="text-[11px] text-slate-500">
                Upload a clear photo. If none is provided, a personalized initial avatar is generated.
              </p>
              <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 border border-slate-200"
                >
                  {isUploadingPhoto ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  <span>{avatarUrl ? 'Change Photo' : 'Upload Photo'}</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username Handle (@handle) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 text-xs font-bold">@</span>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  placeholder="alexmorgan"
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-3.5 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Professional Headline
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer & UI/UX Mentor"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA or Remote"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bio & About
              </label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell potential peers and students about your background, what you love teaching, and what goals you are working towards..."
                className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue-500 resize-none leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Availability & Languages & Interests */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-blue-500" />
            2. Availability, Languages & Interests
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Available Time Slots for Learning & Teaching
              </label>
              <div className="flex flex-wrap gap-2">
                {availabilityOptions.map((opt) => {
                  const isSelected = availability.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleAvailabilityOption(opt)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition border ${
                        isSelected
                          ? 'bg-brand-blue-500 text-white border-brand-blue-600 shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Languages Spoken (comma separated)
                </label>
                <input
                  type="text"
                  value={languagesInput}
                  onChange={(e) => setLanguagesInput(e.target.value)}
                  placeholder="English, Spanish, French"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Interests & Topics (comma separated)
                </label>
                <input
                  type="text"
                  value={interestsInput}
                  onChange={(e) => setInterestsInput(e.target.value)}
                  placeholder="AI, Full Stack, UI Design, Open Source"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Professional Experience */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              3. Experience
            </h2>
            <button
              type="button"
              onClick={() => setExperience([...experience, { title: '', company: '', period: '', description: '' }])}
              className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-emerald-200/60"
            >
              <Plus className="w-3.5 h-3.5" /> Add Role
            </button>
          </div>

          {experience.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No experience entries added yet. Click &quot;Add Role&quot; above.</p>
          ) : (
            <div className="space-y-4">
              {experience.map((exp, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Role Title</label>
                      <input
                        type="text"
                        value={exp.title}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].title = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="e.g. Senior Engineer"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Company / Team</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].company = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="e.g. Vercel"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">Period</label>
                      <input
                        type="text"
                        value={exp.period}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[idx].period = e.target.value;
                          setExperience(updated);
                        }}
                        placeholder="e.g. 2021 - Present"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Key Responsibilities / Impact</label>
                    <textarea
                      rows={2}
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[idx].description = e.target.value;
                        setExperience(updated);
                      }}
                      placeholder="Led frontend architecture, redesigned design system..."
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Education & Certifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Education */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-brand-blue-500" />
                Education
              </h2>
              <button
                type="button"
                onClick={() => setEducation([...education, { degree: '', institution: '', year: '' }])}
                className="px-2.5 py-1 bg-blue-50 text-brand-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {education.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No education entries added.</p>
            ) : (
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...education];
                        updated[idx].degree = e.target.value;
                        setEducation(updated);
                      }}
                      placeholder="Degree / Certificate"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].institution = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="Institution / School"
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                      />
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].year = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="Year (e.g. 2022)"
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Certifications
              </h2>
              <button
                type="button"
                onClick={() => setCertifications([...certifications, { name: '', issuer: '', year: '' }])}
                className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>

            {certifications.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No certifications added.</p>
            ) : (
              <div className="space-y-3">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                      className="absolute top-2 right-2 text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => {
                        const updated = [...certifications];
                        updated[idx].name = e.target.value;
                        setCertifications(updated);
                      }}
                      placeholder="Certification Name"
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => {
                          const updated = [...certifications];
                          updated[idx].issuer = e.target.value;
                          setCertifications(updated);
                        }}
                        placeholder="Issuer (e.g. AWS, Google)"
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                      />
                      <input
                        type="text"
                        value={cert.year}
                        onChange={(e) => {
                          const updated = [...certifications];
                          updated[idx].year = e.target.value;
                          setCertifications(updated);
                        }}
                        placeholder="Year"
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section 5: Projects & Portfolio */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Code className="w-4 h-4 text-purple-600" />
              5. Projects & Portfolio Work
            </h2>
            <button
              type="button"
              onClick={() => setProjects([...projects, { title: '', description: '', link: '' }])}
              className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-purple-200/60"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>

          {projects.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No projects listed. Add code repositories, apps, or design case studies.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 relative">
                  <button
                    type="button"
                    onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                    className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Project Title</label>
                    <input
                      type="text"
                      value={proj.title}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].title = e.target.value;
                        setProjects(updated);
                      }}
                      placeholder="e.g. Next.js SaaS Starter"
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Link (optional)</label>
                    <input
                      type="text"
                      value={proj.link || ''}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].link = e.target.value;
                        setProjects(updated);
                      }}
                      placeholder="https://github.com/..."
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Summary</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[idx].description = e.target.value;
                        setProjects(updated);
                      }}
                      placeholder="What you built, stack used, and outcomes..."
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 6: Social Links */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand-blue-500" />
            6. Social & Portfolio Links
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Github className="w-3.5 h-3.5" /> GitHub Profile
              </label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                placeholder="https://github.com/yourname"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile
              </label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Portfolio URL
              </label>
              <input
                type="text"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                placeholder="https://yourportfolio.dev"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Personal Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yoursite.com"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-brand-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Bottom Save Action Bar */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/skills"
            className="text-xs font-bold text-brand-blue-600 hover:text-brand-blue-700 flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" /> Manage Teaching & Learning Skills →
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-gradient-to-r from-[#6be000] to-[#0878f9] hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
