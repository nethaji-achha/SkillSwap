'use client';

import React, { useState } from 'react';
import { useSkillSwap } from '@/context/SkillSwapContext';
import { LearningSession } from '@/types';
import { X, Star, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

interface ReviewSessionModalProps {
  session: LearningSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewSessionModal: React.FC<ReviewSessionModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const { completeSession, user } = useSkillSwap();
  const [overallRating, setOverallRating] = useState<number>(5);
  const [knowledge, setKnowledge] = useState<number>(5);
  const [communication, setCommunication] = useState<number>(5);
  const [reliability, setReliability] = useState<number>(5);
  const [teaching, setTeaching] = useState<number>(5);
  const [professionalism, setProfessionalism] = useState<number>(5);
  const [comment, setComment] = useState<string>('Great session! Extremely clear explanations and helpful guidance.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !session) return null;

  const partnerName = session.teacherName || 'Teacher';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await completeSession(session.id, {
        overall_rating: overallRating,
        knowledge,
        communication,
        reliability,
        teaching,
        professionalism,
        comment,
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
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Complete & Rate Session</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center pb-1">
            <p className="text-xs text-slate-500">Rate your learning experience with</p>
            <h4 className="font-bold text-slate-900 text-lg">{partnerName}</h4>
            <p className="text-xs text-brand-blue font-medium mt-0.5">{session.skillName} Session ({session.tokenPrice} 🪙)</p>
          </div>

          {/* Overall Rating Stars */}
          <div className="flex flex-col items-center justify-center py-2 space-y-1 bg-brand-orange/5 rounded-2xl border border-brand-orange/20 p-3">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setOverallRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star className={`w-6 h-6 ${
                    star <= overallRating ? 'text-brand-orange fill-brand-orange' : 'text-slate-300'
                  }`} />
                </button>
              ))}
            </div>
            <span className="text-xs font-bold text-brand-orange-dark">
              {overallRating === 5 ? '5.0 — Outstanding!' :
               overallRating === 4 ? '4.0 — Very Good' :
               overallRating === 3 ? '3.0 — Satisfactory' :
               overallRating === 2 ? '2.0 — Needs Improvement' : '1.0 — Poor'}
            </span>
          </div>

          {/* Detailed Criteria Scores */}
          <div className="space-y-2 text-xs">
            <label className="font-bold text-slate-700 uppercase tracking-wider block">Detailed Reputation Feedback</label>
            
            {[
              { label: 'Knowledge & Mastery', val: knowledge, set: setKnowledge },
              { label: 'Communication & Clarity', val: communication, set: setCommunication },
              { label: 'Punctuality & Reliability', val: reliability, set: setReliability },
              { label: 'Teaching & Mentorship', val: teaching, set: setTeaching },
              { label: 'Professionalism', val: professionalism, set: setProfessionalism }
            ].map((crit, idx) => (
              <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                <span className="text-slate-600 font-medium">{crit.label}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => crit.set(num)}
                      className={`w-6 h-6 rounded text-[11px] font-bold transition ${
                        crit.val === num
                          ? 'bg-brand-blue text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Feedback comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Written Review
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share what went well and what you learned..."
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
              required
            />
          </div>

          {/* Token Release Notice */}
          <div className="p-3 bg-brand-green/10 border border-brand-green/30 rounded-xl flex items-start gap-2 text-xs text-brand-green-dark">
            <ShieldCheck className="w-4 h-4 text-brand-green-dark shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Token Release:</span> Submitting this review confirms session completion and releases {session.tokenPrice} 🪙 held in escrow to the teacher.
            </div>
          </div>

          {/* Action buttons */}
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
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold text-xs rounded-xl shadow-md shadow-brand-green/20 transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Releasing Escrow...
                </>
              ) : (
                'Confirm & Release Tokens'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
