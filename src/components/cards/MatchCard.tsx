import React from 'react';
import Link from 'next/link';
import { SkillMatch } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { SkillBadge } from '@/components/ui/SkillBadge';
import { MapPin, ArrowRightLeft, Sparkles, Coins, Info, ArrowRight } from 'lucide-react';
import { useSkillSwap } from '@/context/SkillSwapContext';

interface MatchCardProps {
  match: SkillMatch;
  onRequestSwap?: () => void;
  compact?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onRequestSwap, compact = false }) => {
  const { openSwapModal } = useSkillSwap();
  const { user } = match;

  const handleAction = () => {
    if (onRequestSwap) {
      onRequestSwap();
    } else {
      openSwapModal(user);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Avatar
              src={user.avatar}
              name={user.name}
              size={compact ? 'md' : 'lg'}
              isOnline={user.isOnline}
            />
            <div>
              <Link
                href={`/profile/${user.username || user.id}`}
                className="font-bold text-slate-900 hover:text-brand-blue-600 transition-colors inline-flex items-center gap-1.5"
              >
                {user.name}
              </Link>
              <p className="text-xs text-slate-500 line-clamp-1">{user.headline || 'Skill Swap Member'}</p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {user.location.split(',')[0]}
                  </span>
                )}
                <span className="text-amber-600 font-semibold">
                  ★ {(user.rating || 5.0).toFixed(1)}
                </span>
                <span>•</span>
                <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                  {match.tokenPrice || 15} 🪙 / session
                </span>
              </div>
            </div>
          </div>

          {/* Match Score */}
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              {match.matchPercentage}% Match
            </span>
          </div>
        </div>

        {/* Explainable AI matching */}
        {match.explanations && match.explanations.length > 0 && (
          <div className="mb-3 bg-blue-50/60 rounded-xl p-2.5 border border-blue-100 text-[11px] text-slate-800 space-y-1">
            <div className="font-bold flex items-center gap-1 text-[10px] text-brand-blue-600 uppercase tracking-wider">
              <Info className="w-3 h-3" /> Why this match?
            </div>
            {match.explanations.slice(0, 2).map((exp, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-slate-700">
                <span className="w-1 h-1 rounded-full bg-brand-blue-500 shrink-0" />
                <span>{exp}</span>
              </div>
            ))}
          </div>
        )}

        {/* Skill Exchange Blueprint */}
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 my-2 space-y-2.5">
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-brand-blue-700 flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3" />
              They teach (what you want):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {match.theyTeachYou.length > 0 ? (
                match.theyTeachYou.map((s, idx) => (
                  <SkillBadge key={idx} name={s} type="learn" size="sm" />
                ))
              ) : (
                <span className="text-[11px] text-slate-400 italic">Exploring new skills</span>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200/60 pt-2 space-y-1">
            <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <ArrowRightLeft className="w-3 h-3 rotate-180" />
              They want (what you teach):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {match.youTeachThem.length > 0 ? (
                match.youTeachThem.map((s, idx) => (
                  <SkillBadge key={idx} name={s} type="teach" size="sm" />
                ))
              ) : (
                <span className="text-[11px] text-slate-400 italic">Open to all suggestions</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center gap-2 mt-2">
        <Link
          href={`/profile/${user.username || user.id}`}
          className="w-1/3 py-2 px-3 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
        >
          View Profile
        </Link>
        <button
          onClick={handleAction}
          className="w-2/3 py-2 px-3 bg-gradient-to-r from-[#6be000] to-[#0878f9] hover:opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
        >
          <span>Request Skill Swap</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default MatchCard;
