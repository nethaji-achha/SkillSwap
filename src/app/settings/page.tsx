'use client';

import React, { useState, useEffect } from 'react';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { 
  User, 
  Mail, 
  Lock, 
  Bell, 
  Shield, 
  Check, 
  Loader2
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUserProfile, showToast } = useSkillSwap();
  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'notifications' | 'privacy'>('profile');

  // Form states
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeadline(user.headline || '');
      setLocation(user.location || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name,
        headline,
        location,
        bio,
      });
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your profile details, notification preferences, and account security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Navigation Sidebar */}
          <div className="md:col-span-1 space-y-1">
            {[
              { id: 'profile', label: 'Public Profile', icon: User },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'privacy', label: 'Privacy & Security', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold text-left transition-all ${
                    isActive
                      ? 'bg-brand-blue/10 text-brand-blue-dark shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Container */}
          <div className="md:col-span-3 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <h3 className="font-bold text-base text-slate-900 mb-4">Public Profile Information</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Title / Headline</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Engineer • React Specialist"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA (Remote)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bio</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your background and expertise..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:bg-white resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-blue/15 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-slate-900">Notification Settings</h3>
                <div className="space-y-3">
                  {[
                    { label: 'New Skill Match Alerts', desc: 'Notify me when an AI skill match is found' },
                    { label: 'Session Reminders', desc: 'Receive reminders 1 hour before scheduled sessions' },
                    { label: 'Payment & Wallet Updates', desc: 'Confirmations for token purchases and escrow releases' }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <div className="text-xs font-bold text-slate-900">{item.label}</div>
                        <p className="text-[11px] text-slate-500">{item.desc}</p>
                      </div>
                      <input type="checkbox" defaultChecked className="rounded text-brand-blue focus:ring-brand-blue w-4 h-4 cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-4">
                <h3 className="font-bold text-base text-slate-900">Privacy & Data Controls</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <div className="text-xs font-bold text-slate-900">Public Marketplace Visibility</div>
                      <p className="text-[11px] text-slate-500">Allow other members to discover your skills</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-brand-blue focus:ring-brand-blue w-4 h-4 cursor-pointer" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
