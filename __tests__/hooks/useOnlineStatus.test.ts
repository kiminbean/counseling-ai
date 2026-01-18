import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

describe('useOnlineStatus', () => {
  // 원본 navigator.onLine 저장
  const originalNavigatorOnline = Object.getOwnPropertyDescriptor(navigator, 'onLine');

  beforeEach(() => {
    vi.useFakeTimers();
    // 기본적으로 온라인 상태로 설정
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    // navigator.onLine 복원
    if (originalNavigatorOnline) {
      Object.defineProperty(navigator, 'onLine', originalNavigatorOnline);
    }
  });

  it('returns online status correctly', () => {
    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.lastOnlineAt).toBeInstanceOf(Date);
  });

  it('detects offline status', () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    });

    const { result } = renderHook(() => useOnlineStatus());

    expect(result.current.isOnline).toBe(false);
    expect(result.current.lastOnlineAt).toBeNull();
  });

  it('calls onStatusChange when going offline', async () => {
    const onStatusChange = vi.fn();
    renderHook(() => useOnlineStatus({ onStatusChange }));

    // 오프라인 이벤트 발생
    await act(async () => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(onStatusChange).toHaveBeenCalledWith(false);
  });

  it('calls onStatusChange when coming back online', async () => {
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      configurable: true,
      value: false,
    });

    const onStatusChange = vi.fn();
    renderHook(() => useOnlineStatus({ onStatusChange }));

    // 온라인 이벤트 발생
    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });

    expect(onStatusChange).toHaveBeenCalledWith(true);
  });

  it('updates lastOnlineAt when coming back online', async () => {
    const { result } = renderHook(() => useOnlineStatus());
    const initialTime = result.current.lastOnlineAt;

    // 시간 진행
    await act(async () => {
      vi.advanceTimersByTime(1000);
      window.dispatchEvent(new Event('offline'));
    });

    await act(async () => {
      vi.advanceTimersByTime(1000);
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.lastOnlineAt).not.toEqual(initialTime);
  });

  it('sets isServerReachable to false when offline', async () => {
    const { result } = renderHook(() => useOnlineStatus({ pingUrl: '/api/health' }));

    await act(async () => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isServerReachable).toBe(false);
  });

  it('provides checkServer function', () => {
    const { result } = renderHook(() => useOnlineStatus());

    expect(typeof result.current.checkServer).toBe('function');
  });

  it('returns true from checkServer when no pingUrl provided', async () => {
    const { result } = renderHook(() => useOnlineStatus());

    const serverReachable = await act(async () => {
      return result.current.checkServer();
    });

    expect(serverReachable).toBe(true);
  });
});
