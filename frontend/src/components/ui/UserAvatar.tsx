import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  isAvailable?: boolean;
}

const WomanPlaceholder = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="w-full h-full">
    {/* Background */}
    <rect width="100" height="100" fill="#fce7f3" />
    {/* Head */}
    <ellipse cx="50" cy="32" rx="16" ry="18" fill="#f9a8d4" />
    {/* Hair */}
    <ellipse cx="50" cy="20" rx="17" ry="10" fill="#be185d" />
    <ellipse cx="35" cy="30" rx="5" ry="12" fill="#be185d" />
    <ellipse cx="65" cy="30" rx="5" ry="12" fill="#be185d" />
    {/* Neck */}
    <rect x="45" y="48" width="10" height="8" rx="3" fill="#f9a8d4" />
    {/* Body / dress */}
    <path d="M 28 80 Q 32 56 50 56 Q 68 56 72 80 Z" fill="#ec4899" />
    {/* Shoulders */}
    <ellipse cx="50" cy="57" rx="14" ry="5" fill="#f472b6" />
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
    sm:  'h-8 w-8 text-xs',
    md:  'h-10 w-10 text-sm',
    lg:  'h-16 w-16 text-lg',
    xl:  'h-24 w-24 text-2xl',
    '2xl': 'h-32 w-32 text-3xl',
  };

  const showImage = src && !imgError;

  return (
    <div className="relative inline-block">
      {showImage ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-xl object-cover border-2 border-pink-100',
            sizeClasses[size],
            className
          )}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={cn(
            'rounded-xl overflow-hidden border-2 border-pink-100',
            sizeClasses[size],
            className
          )}
        >
          <WomanPlaceholder />
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
