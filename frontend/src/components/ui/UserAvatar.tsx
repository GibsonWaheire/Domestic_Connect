import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  isAvailable?: boolean;
}

const WomanIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Head */}
    <circle cx="50" cy="32" r="18" fill="#c4a882" />
    {/* Hair */}
    <ellipse cx="50" cy="20" rx="18" ry="12" fill="#7a5c38" />
    <ellipse cx="33" cy="30" rx="6" ry="14" fill="#7a5c38" />
    <ellipse cx="67" cy="30" rx="6" ry="14" fill="#7a5c38" />
    {/* Body / shoulders */}
    <ellipse cx="50" cy="82" rx="28" ry="22" fill="#d4a5c9" />
    {/* Neck */}
    <rect x="44" y="48" width="12" height="12" rx="4" fill="#c4a882" />
  </svg>
);

const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = '?',
  size = 'md',
  className,
  isAvailable
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-[72px] w-[72px] text-2xl',
    '2xl': 'h-24 w-24 text-3xl'
  };

  const showImage = src && !imgError;

  return (
    <div className="relative inline-block">
      {showImage ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover border border-gray-200',
            sizeClasses[size],
            className
          )}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-pink-50 border border-pink-200 flex items-center justify-center overflow-hidden',
            sizeClasses[size],
            className
          )}
        >
          <WomanIcon className="w-full h-full" />
        </div>
      )}

      {isAvailable !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            size === 'sm' || size === 'md' ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5',
            isAvailable ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      )}
    </div>
  );
};

export default UserAvatar;
