import React from 'react';
import { cn, getInitials } from '@/lib/utils';

export interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  isOnline?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
  isOnline,
}) => {
  const [imgError, setImgError] = React.useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-xl font-bold',
  };

  const badgeSizeClasses = {
    xs: 'w-1.5 h-1.5 bottom-0 right-0',
    sm: 'w-2 h-2 bottom-0 right-0 ring-1 ring-white',
    md: 'w-2.5 h-2.5 bottom-0.5 right-0.5 ring-2 ring-white',
    lg: 'w-3 h-3 bottom-0.5 right-0.5 ring-2 ring-white',
    xl: 'w-3.5 h-3.5 bottom-1 right-1 ring-2 ring-white',
  };

  const isValidSrc =
    Boolean(src) &&
    typeof src === 'string' &&
    src.trim() !== '' &&
    src.trim() !== 'image' &&
    (src.startsWith('http://') ||
      src.startsWith('https://') ||
      src.startsWith('/') ||
      src.startsWith('data:image/'));

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={cn(
          'rounded-2xl overflow-hidden flex items-center justify-center bg-blue-100 text-brand-blue-700 font-bold border border-slate-200 select-none shadow-xs',
          sizeClasses[size],
          className
        )}
      >
        {isValidSrc && !imgError ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {isOnline !== undefined && (
        <span
          className={cn(
            'absolute rounded-full',
            badgeSizeClasses[size],
            isOnline ? 'bg-emerald-500' : 'bg-slate-300'
          )}
          title={isOnline ? 'Online' : 'Offline'}
        />
      )}
    </div>
  );
};

export default Avatar;
