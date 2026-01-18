'use client';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'brand' | 'gray' | 'white';
  className?: string;
}

/**
 * 로딩 스피너
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" color="brand" />
 * ```
 */
export function Spinner({
  size = 'md',
  color = 'brand',
  className = '',
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
  };

  const colorClasses = {
    brand: 'border-brand-500 border-t-transparent',
    gray: 'border-gray-400 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClasses[color]}
        rounded-full animate-spin
        ${className}
      `}
      role="status"
      aria-label="로딩 중"
    >
      <span className="sr-only">로딩 중...</span>
    </div>
  );
}

export default Spinner;
