'use client';

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'brand' | 'gray' | 'white';
  className?: string;
}

/**
 * 로딩 점 애니메이션
 *
 * @example
 * ```tsx
 * <LoadingDots />
 * <LoadingDots size="lg" color="brand" />
 * ```
 */
export function LoadingDots({
  size = 'md',
  color = 'gray',
  className = '',
}: LoadingDotsProps) {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const colorClasses = {
    brand: 'bg-brand-500',
    gray: 'bg-gray-400',
    white: 'bg-white',
  };

  const dotClass = `${sizeClasses[size]} ${colorClasses[color]} rounded-full`;

  return (
    <span
      className={`inline-flex items-center gap-1 ${className}`}
      role="status"
      aria-label="로딩 중"
    >
      <span
        className={`${dotClass} animate-bounce`}
        style={{ animationDelay: '0ms' }}
      />
      <span
        className={`${dotClass} animate-bounce`}
        style={{ animationDelay: '150ms' }}
      />
      <span
        className={`${dotClass} animate-bounce`}
        style={{ animationDelay: '300ms' }}
      />
    </span>
  );
}

export default LoadingDots;
