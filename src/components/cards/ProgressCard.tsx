import React from 'react';
import { SkillItem } from '@/types';
import { BookOpen, Clock, Award, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressCardProps {
  skill: SkillItem;
  type: 'teaching' | 'learning';
  onEdit?: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({ skill, type, onEdit }) => {
  const percentage = skill.progressPercentage || (type === 'teaching' ? 85 : 50);
  const hours = skill.hoursSpent || (skill.sessionsCount ? skill.sessionsCount * 1.5 : 4);
  const sessions = skill.sessionsCount || 3;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-subtle hover:shadow-hover transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <span
            className={cn(
              'text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md mb-2 inline-block',
              type === 'teaching'
                ? 'bg-brand-green/10 text-brand-green-dark border border-brand-green/30'
                : 'bg-brand-blue/10 text-brand-blue-dark border border-brand-blue/30'
            )}
          >
            {type === 'teaching' ? 'Teaching Mastery' : 'Learning Goal'}
          </span>
          <h3 className="font-bold text-lg text-slate-900">{skill.name}</h3>
          <p className="text-xs text-slate-400">{skill.category} • {skill.level}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-slate-900">{percentage}%</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-4">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            type === 'teaching'
              ? 'bg-brand-green'
              : 'bg-brand-blue'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400" />
          <span>
            <strong>{sessions}</strong> sessions {type === 'teaching' ? 'taught' : 'completed'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>
            <strong>{hours.toFixed(1)}</strong> hours {type === 'teaching' ? 'shared' : 'learned'}
          </span>
        </div>
      </div>

      {skill.description && (
        <p className="mt-3 text-xs text-slate-500 line-clamp-1 border-t border-slate-50 pt-2">
          {skill.description}
        </p>
      )}
    </div>
  );
};
