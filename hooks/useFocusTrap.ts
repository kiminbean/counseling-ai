'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseFocusTrapOptions {
  /**
   * 포커스 트랩 활성화 여부
   */
  isActive: boolean;

  /**
   * 트랩 해제 시 포커스를 돌려놓을 요소
   */
  returnFocusOnDeactivate?: boolean;

  /**
   * ESC 키로 닫기 콜백
   */
  onEscape?: () => void;
}

/**
 * 모달/다이얼로그에서 포커스를 가두는 훅
 *
 * @example
 * ```tsx
 * function Modal({ isOpen, onClose }) {
 *   const containerRef = useFocusTrap({
 *     isActive: isOpen,
 *     onEscape: onClose,
 *   });
 *
 *   return <div ref={containerRef}>...</div>;
 * }
 * ```
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  options: UseFocusTrapOptions
) {
  const { isActive, returnFocusOnDeactivate = true, onEscape } = options;
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // 포커스 가능한 요소들을 가져오는 함수
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors)
    ).filter((el) => el.offsetParent !== null); // visible only
  }, []);

  // 키보드 이벤트 핸들러
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC 키 처리
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      // Tab 키 처리
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift+Tab: 첫 번째 요소에서 마지막으로
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
        return;
      }

      // Tab: 마지막 요소에서 첫 번째로
      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onEscape, getFocusableElements]);

  // 활성화 시 첫 번째 요소에 포커스
  useEffect(() => {
    if (isActive) {
      // 현재 포커스된 요소 저장
      previousActiveElement.current = document.activeElement as HTMLElement;

      // 첫 번째 포커스 가능한 요소에 포커스
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        // 약간의 딜레이 후 포커스 (애니메이션 고려)
        requestAnimationFrame(() => {
          focusableElements[0].focus();
        });
      }
    } else if (returnFocusOnDeactivate && previousActiveElement.current) {
      // 비활성화 시 이전 요소로 포커스 복원
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isActive, returnFocusOnDeactivate, getFocusableElements]);

  return containerRef;
}

export default useFocusTrap;
