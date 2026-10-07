import React from 'react';
import { cn } from '@/lib/utils';
import { SkillLevel } from '@/types';

interface SkillBadgeProps {
  name: string;
  level?: SkillLevel;
  type?: 'teach' | 'learn' | 'neutral' | 'highlight';
  size?: 'sm' | 'md';
  onRemove?: () => void;
  className?: string;
}

export const SkillBadge: React.FC<SkillBadgeProps> = ({
  name,
  level,
  type = 'neutral',
  size = 'md',
  onRemove,
  className,
}) => {
  const typeStyles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200/80',
    teach: 'bg-[#6be000]/15 text-[#306800] border-[#6be000]/40 font-semibold',
    learn: 'bg-blue-50 text-brand-blue-700 border-blue-200/80 font-semibold',
    highlight: 'bg-[#ff8a00]/15 text-[#c2410c] border-[#ff8a00]/30 font-semibold',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 rounded-lg font-medium',
    md: 'text-sm px-3 py-1 rounded-xl font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border transition-colors',
        typeStyles[type],
        sizeStyles[size],
        className
      )}
    >
      <span>{name}</span>
      {level && (
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75 border-l border-current/20 pl-1.5">
          {level}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:opacity-75 focus:outline-none ml-0.5"
          aria-label={`Remove ${name}`}
        >
          ×
        </button>
      )}
    </span>
  );
};

export default SkillBadge;
