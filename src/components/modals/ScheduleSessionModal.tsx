'use client';

import React, { useState } from 'react';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { UserProfile } from '@/types';
import { X, Calendar, Clock, Sparkles, Loader2, Coins, ArrowRight } from 'lucide-react';

interface ScheduleSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPartner?: UserProfile;
  defaultSkill?: string;
}

export const ScheduleSessionModal: React.FC<ScheduleSessionModalProps> = ({
  isOpen,
  onClose,
  defaultPartner,
  defaultSkill,
}) => {
  const { communityUsers, bookLearningSession, wallet, showToast } = useSkillSwap();
  const [partnerId, setPartnerId] = useState<string>(defaultPartner?.id || communityUsers[0]?.id || '');
  const [skill, setSkill] = useState<string>(defaultSkill || 'General Mentorship');
  const [date, setDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [time, setTime] = useState<string>('18:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [tokenPrice, setTokenPrice] = useState<number>(15);
  const [objective, setObjective] = useState<string>('Walk through codebase examples and clarify key concepts.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (defaultPartner) {
      setPartnerId(defaultPartner.id);
      if (defaultPartner.skillsTeaching.length > 0) {
        setSkill(defaultPartner.skillsTeaching[0].name);
        setTokenPrice(defaultPartner.skillsTeaching[0].sessionPrice || 15);
      }
    }
  }, [defaultPartner]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerId) {
      showToast('Please select a teacher/partner.');
      return;
    }

    const availableTokens = wallet?.available_balance || 0;
    if (availableTokens < tokenPrice) {
      showToast(`Insufficient tokens. You have ${availableTokens} 🪙, need ${tokenPrice} 🪙.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledDateTime = new Date(`${date}T${time}:00`);
      await bookLearningSession({
        teacherId: partnerId,
        skillName: skill,
        scheduledAt: scheduledDateTime.toISOString(),
        durationMinutes: durationMinutes,
        tokenPrice: tokenPrice,
        objective: objective,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Calendar className="w-4 h-4 text-brand-blue" />
            <span>Schedule Learning Session</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Partner Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Teacher / Partner
            </label>
            {communityUsers.length === 0 ? (
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 border border-slate-200">
                No other members registered in database yet. Invite someone to exchange skills!
              </div>
            ) : (
              <select
                value={partnerId}
                onChange={(e) => {
                  setPartnerId(e.target.value);
                  const found = communityUsers.find(u => u.id === e.target.value);
                  if (found && found.skillsTeaching.length > 0) {
                    setSkill(found.skillsTeaching[0].name);
                    setTokenPrice(found.skillsTeaching[0].sessionPrice || 15);
                  }
                }}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                {communityUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.headline || 'Member'}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Skill & Token Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Topic / Skill
              </label>
              <input
                type="text"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                placeholder="e.g. Next.js, Figma"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Token Price (🪙)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={tokenPrice}
                onChange={(e) => setTokenPrice(parseInt(e.target.value) || 10)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                required
              />
            </div>
          </div>

          {/* Objective */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Session Objective
            </label>
            <textarea
              rows={2}
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
              placeholder="What do you plan to achieve during this session?"
              required
            />
          </div>

          {/* Balance info */}
          <div className="p-3 bg-brand-orange/5 border border-brand-orange/20 rounded-xl flex items-center justify-between text-xs text-slate-800">
            <span>Available Balance: <strong className="text-brand-orange-dark">{wallet?.available_balance || 0} 🪙</strong></span>
            <span>Held in Escrow: <strong className="text-brand-orange-dark">{tokenPrice} 🪙</strong></span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || communityUsers.length === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-blue/20 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  Schedule & Place Escrow Hold
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
