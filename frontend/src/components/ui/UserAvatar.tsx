import React from 'react';
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
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-14 w-14 text-lg',
    xl: 'h-[72px] w-[72px] text-2xl',
    '2xl': 'h-24 w-24 text-3xl'
  };

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  };

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover border border-gray-200',
            sizeClasses[size],
            className
          )}
          onError={(e) => {
            // Fallback if image fails to load
            (e.target as HTMLImageElement).style.display = 'none';
            (e.target as HTMLImageElement).parentElement?.classList.add('bg-gray-600');
          }}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-gray-600 text-white font-semibold flex items-center justify-center text-center',
            sizeClasses[size],
            className
          )}
        >
          {getInitials(name)}
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
