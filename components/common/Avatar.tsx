import { Bot, User, Heart } from 'lucide-react';

interface AvatarProps {
  type: 'user' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  isCrisis?: boolean;
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

const iconSizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function Avatar({ type, size = 'md', className = '', isCrisis = false }: AvatarProps) {
  const isAI = type === 'ai';

  return (
    <div
      className={`
        ${sizeMap[size]}
        rounded-full flex items-center justify-center flex-shrink-0
        ${isAI
          ? isCrisis
            ? 'bg-gradient-to-br from-rose-400 to-rose-500'
            : 'bg-gradient-to-br from-brand-400 to-brand-500'
          : 'bg-gradient-to-br from-gray-200 to-gray-300'
        }
        ${className}
      `}
    >
      {isAI ? (
        isCrisis ? (
          <Heart size={iconSizeMap[size]} className="text-white" />
        ) : (
          <Bot size={iconSizeMap[size]} className="text-white" />
        )
      ) : (
        <User size={iconSizeMap[size]} className="text-gray-600" />
      )}
    </div>
  );
}
