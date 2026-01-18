'use client';

/**
 * Skip Link 컴포넌트
 *
 * 키보드 사용자가 반복 콘텐츠를 건너뛰고 메인 콘텐츠로 이동할 수 있게 함
 * Tab 키로 포커스 시에만 표시됨
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-[100]
        focus:px-4 focus:py-2
        focus:bg-brand-600 focus:text-white
        focus:rounded-lg focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2
        transition-all
      "
    >
      메인 콘텐츠로 건너뛰기
    </a>
  );
}

export default SkipLink;
