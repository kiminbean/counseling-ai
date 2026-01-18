'use client';

/**
 * useTheme 훅 - ThemeContext 래퍼
 *
 * @example
 * ```tsx
 * const { theme, setTheme, resolvedTheme } = useTheme();
 *
 * // 테마 변경
 * setTheme('dark');
 *
 * // 현재 적용된 테마 확인 (system일 경우 실제 값)
 * console.log(resolvedTheme); // 'light' or 'dark'
 * ```
 */
export { useTheme } from '@/contexts/ThemeContext';
