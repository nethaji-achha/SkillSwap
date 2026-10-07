'use client';

import React, { useState } from 'react';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { Avatar } from '@/components/ui/Avatar';
import { X, Sparkles, Send, Coins, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';

export const SkillSwapRequestModal: React.FC = () => {
  const { user, wallet, activeSwapModalUser, closeSwapModal, bookLearningSession, showToast } = useSkillSwap();
  const [selectedLearnSkill, setSelectedLearnSkill] = useState<string>('');
  const [selectedTeachSkill, setSelectedTeachSkill] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (activeSwapModalUser && user) {
      const targetTeaches = activeSwapModalUser.skillsTeaching.map(s => s.name);
      const userWants = user.skillsLearning.map(s => s.name);
      const userTeaches = user.skillsTeaching.map(s => s.name);
      const targetWants = activeSwapModalUser.skillsLearning.map(s => s.name);

      const defaultLearn = targetTeaches.find(s => userWants.includes(s)) || targetTeaches[0] || 'Web Development';
      const defaultTeach = userTeaches.find(s => targetWants.includes(s)) || userTeaches[0] || 'Programming';

      setSelectedLearnSkill(defaultLearn);
      setSelectedTeachSkill(defaultTeach);
      setMessage(`Hi ${activeSwapModalUser.name.split(' ')[0]}! I would love to connect for a session to learn ${defaultLearn} and share insights in ${defaultTeach}.`);
    }
  }, [activeSwapModalUser, user]);

  if (!activeSwapModalUser || !user) return null;

  // Calculate token price for selected target skill
  const targetSkillObj = activeSwapModalUser.skillsTeaching.find(s => s.name === selectedLearnSkill);
  const tokenPrice = targetSkillObj?.sessionPrice || 12;
  const currentBalance = wallet?.available_balance || 0;
  const balanceAfter = currentBalance - tokenPrice;
  const hasSufficientBalance = currentBalance >= tokenPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLearnSkill) return;

    if (!hasSufficientBalance) {
      showToast(`Insufficient balance. You need ${tokenPrice} 🪙 but have ${currentBalance} 🪙.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + 2); // Default to in 2 days
      scheduledDate.setHours(18, 0, 0, 0);

      await bookLearningSession({
        teacherId: activeSwapModalUser.id,
        skillName: selectedLearnSkill,
        scheduledAt: scheduledDate.toISOString(),
        durationMinutes: durationMinutes,
        tokenPrice: tokenPrice,
        objective: message
      });
      closeSwapModal();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Sparkles className="w-4 h-4 text-brand-blue" />
            <span>Request Skill Swap Session</span>
          </div>
          <button
            onClick={closeSwapModal}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Provider / Target User */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <Avatar src={activeSwapModalUser.avatar} name={activeSwapModalUser.name} size="lg" />
            <div>
              <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Provider</p>
              <h4 className="font-bold text-slate-900 text-base">{activeSwapModalUser.name}</h4>
              <p className="text-xs text-slate-500">{activeSwapModalUser.headline || 'Skill Swap Expert'}</p>
            </div>
          </div>

          {/* Skill to learn */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Skill to Learn:
            </label>
            <div className="flex flex-wrap gap-2">
              {activeSwapModalUser.skillsTeaching.length > 0 ? (
                activeSwapModalUser.skillsTeaching.map((skill) => (
                  <button
                    type="button"
                    key={skill.id}
                    onClick={() => setSelectedLearnSkill(skill.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selectedLearnSkill === skill.name
                        ? 'bg-brand-blue text-white border-brand-blue shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-brand-blue/40'
                    }`}
                  >
                    {skill.name} ({skill.sessionPrice || 12} 🪙)
                  </button>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic">No specific teaching skills listed yet.</div>
              )}
            </div>
          </div>

          {/* Duration Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Session Duration:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[30, 60, 90].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDurationMinutes(mins)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    durationMinutes === mins
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {mins} minutes
                </button>
              ))}
            </div>
          </div>

          {/* Token Escrow & Balance Breakdown */}
          <div className="bg-brand-orange/5 rounded-2xl p-4 border border-brand-orange/20 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Session Cost ({selectedLearnSkill || 'Skill'}):</span>
              <span className="font-extrabold text-brand-orange-dark flex items-center gap-1">
                {tokenPrice} <span className="text-sm">🪙</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 border-t border-brand-orange/10 pt-2">
              <span>Your current balance:</span>
              <span className="font-bold text-slate-900">{currentBalance} 🪙</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 border-t border-brand-orange/10 pt-2">
              <span>Balance after transaction:</span>
              <span className={`font-extrabold ${balanceAfter < 0 ? 'text-rose-600' : 'text-brand-green-dark'}`}>
                {balanceAfter} 🪙
              </span>
            </div>

            <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-blue shrink-0" />
              <span>Tokens will be held in pending escrow until session completion.</span>
            </div>
          </div>

          {/* Proposal Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Session Objective & Note</label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue transition-all resize-none"
              placeholder="What specifically would you like to focus on?"
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={closeSwapModal}
              className="w-1/3 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasSufficientBalance}
              className={`w-2/3 py-3 rounded-xl text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 ${
                !hasSufficientBalance
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand-green to-brand-blue hover:opacity-95 shadow-brand-blue/20 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Placing Escrow Hold...
                </>
              ) : !hasSufficientBalance ? (
                'Insufficient Tokens'
              ) : (
                <>
                  Confirm & Request
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
