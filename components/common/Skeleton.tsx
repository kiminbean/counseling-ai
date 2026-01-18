interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
}

export function Skeleton({ className = '', variant = 'rect' }: SkeletonProps) {
  const variantClasses = {
    circle: 'rounded-full',
    text: 'rounded h-4',
    rect: 'rounded-lg',
  };

  return (
    <div
      className={`
        animate-pulse bg-gray-200
        ${variantClasses[variant]}
        ${className}
      `}
    />
  );
}

// 채팅 메시지 스켈레톤
export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3 mb-4">
      <Skeleton variant="circle" className="w-10 h-10" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// 여러 메시지 스켈레톤
export function ChatSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="p-4 space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <ChatMessageSkeleton key={i} />
      ))}
    </div>
  );
}
