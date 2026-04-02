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
            'rounded-full bg-gray-100 border border-gray-200',
            sizeClasses[size],
            className
          )}
        />
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
