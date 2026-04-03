import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  isAvailable?: boolean;
}

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
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl',
    '2xl': 'h-32 w-32 text-3xl'
  };

  const showImage = src && !imgError;

  return (
    <div className="relative inline-block">
      {showImage ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-xl object-cover border border-gray-200',
            sizeClasses[size],
            className
          )}
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={cn(
            'rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400',
            sizeClasses[size],
            className
          )}
        >
          <svg className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a9.75 9.75 0 0115 0" />
          </svg>
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
