import React from 'react';
import Link from 'next/link';
import { UserProfile } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { SkillBadge } from '@/components/ui/SkillBadge';
import { MapPin, Clock, Star, Award } from 'lucide-react';
import { useSkillSwap } from '@/context/SkillSwapContext';

export interface UserCardProps {
  user: UserProfile;
  onRequestSwap?: (user?: UserProfile) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onRequestSwap }) => {
  const { openSwapModal } = useSkillSwap();

  const handleSwap = () => {
    if (onRequestSwap) {
      onRequestSwap(user);
    } else {
      openSwapModal(user);
    }
  };

  const highestBadge = user.achievements?.find(a => a.badge_level?.toUpperCase() === 'GOLD')
    ? 'GOLD'
    : user.achievements?.find(a => a.badge_level?.toUpperCase() === 'SILVER')
    ? 'SILVER'
    : user.achievements?.find(a => a.badge_level?.toUpperCase() === 'BRONZE')
    ? 'BRONZE'
    : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-subtle hover:shadow-hover transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top bar: Avatar + Rating */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Avatar src={user.avatar} name={user.name} size="lg" isOnline={user.isOnline} />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link
                  href={`/profile/${user.username || user.id}`}
                  className="font-bold text-slate-900 hover:text-brand-blue-600 transition-colors"
                >
                  {user.name}
                </Link>
                {highestBadge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-800 border border-amber-500/20">
                    {highestBadge === 'GOLD' ? '🥇 Gold' : highestBadge === 'SILVER' ? '🥈 Silver' : '🥉 Bronze'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{user.headline}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {(user.location || 'Remote').split(',')[0]}
                </span>
                <span>•</span>
                <span>{user.sessionsCompleted || 0} sessions</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60 text-[#ff8a00] text-xs font-bold flex-shrink-0">
            <Star className="w-3.5 h-3.5 fill-[#ff8a00] text-[#ff8a00]" />
            <span>{(user.rating || 5.0).toFixed(1)}</span>
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
            {user.bio}
          </p>
        )}

        {/* Skills I Teach */}
        <div className="space-y-1.5 mb-3">
          <span className="text-[11px] font-bold text-brand-green-dark uppercase tracking-wider block">
            Teaches
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(user.skillsTeaching || []).slice(0, 3).map((s) => (
              <SkillBadge key={s.id} name={s.name} level={s.level} type="teach" size="sm" />
            ))}
            {(user.skillsTeaching || []).length > 3 && (
              <span className="text-xs text-slate-400 self-center">
                +{(user.skillsTeaching || []).length - 3} more
              </span>
            )}
            {(user.skillsTeaching || []).length === 0 && (
              <span className="text-xs text-slate-400 italic">No skills listed yet</span>
            )}
          </div>
        </div>

        {/* Skills I Want */}
        <div className="space-y-1.5 mb-4">
          <span className="text-[11px] font-bold text-brand-blue-600 uppercase tracking-wider block">
            Wants to Learn
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(user.skillsLearning || []).slice(0, 3).map((s) => (
              <SkillBadge key={s.id} name={s.name} type="learn" size="sm" />
            ))}
            {(user.skillsLearning || []).length > 3 && (
              <span className="text-xs text-slate-400 self-center">
                +{(user.skillsLearning || []).length - 3} more
              </span>
            )}
            {(user.skillsLearning || []).length === 0 && (
              <span className="text-xs text-slate-400 italic">Exploring topics</span>
            )}
          </div>
        </div>

        {/* Availability */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-4">
          <Clock className="w-3 h-3 text-slate-400" />
          <span className="line-clamp-1">{(user.availability || ['Flexible availability']).join(' • ')}</span>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
        <Link href={`/profile/${user.username || user.id}`} className="flex-1">
          <Button variant="outline" size="sm" className="w-full">
            Profile
          </Button>
        </Link>
        <Button
          variant="gradient"
          size="sm"
          onClick={handleSwap}
          className="flex-1"
        >
          Request Swap
        </Button>
      </div>
    </div>
  );
};

export default UserCard;
