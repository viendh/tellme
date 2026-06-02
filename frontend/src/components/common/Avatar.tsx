import { getInitials } from '../../utils/formatters';
import type { User } from '../../types';

interface AvatarProps {
  user: User;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  xs: 'w-5 h-5 text-xs',
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-12 h-12 text-base',
};

const colorMap: Record<number, string> = {};
const colors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-red-500',
  'bg-indigo-500',
];

function getColor(userId: number): string {
  if (!colorMap[userId]) {
    colorMap[userId] = colors[userId % colors.length];
  }
  return colorMap[userId];
}

export function Avatar({ user, size = 'sm', className = '' }: AvatarProps) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={user.fullName}
        title={user.fullName}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      title={user.fullName}
      className={`${sizeClasses[size]} ${getColor(user.id)} rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 ${className}`}
    >
      {getInitials(user.fullName)}
    </div>
  );
}
