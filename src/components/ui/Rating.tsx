import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  max?: number;
  interactive?: boolean;
  onChange?: (val: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  count?: number;
  className?: string;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = 'md',
  showNumber = false,
  count,
  className,
}) => {
  const [hoverVal, setHoverVal] = React.useState<number | null>(null);

  const starSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  const currentVal = hoverVal !== null ? hoverVal : value;

  return (
    <div className={cn('inline-flex items-center gap-1.5', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= Math.round(currentVal);
          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onMouseEnter={() => interactive && setHoverVal(starIndex)}
              onMouseLeave={() => interactive && setHoverVal(null)}
              onClick={() => interactive && onChange?.(starIndex)}
              className={cn(
                'transition-transform',
                interactive && 'hover:scale-110 cursor-pointer focus:outline-none'
              )}
              aria-label={`${starIndex} star`}
            >
              <Star
                className={cn(
                  starSizes[size],
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-100 text-slate-300'
                )}
              />
            </button>
          );
        })}
      </div>
      {showNumber && (
        <span className="text-sm font-semibold text-slate-700 ml-0.5">
          {value.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span className="text-xs text-slate-500">
          ({count})
        </span>
      )}
    </div>
  );
};

export default Rating;
