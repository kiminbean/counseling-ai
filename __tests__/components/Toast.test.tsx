import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/components/common/Toast';
import { ReactNode } from 'react';

// Toast 훅을 테스트하기 위한 테스트 컴포넌트
function TestComponent() {
  const toast = useToast();

  return (
    <div>
      <button onClick={() => toast.success('성공', '작업이 완료되었습니다')}>
        Success Toast
      </button>
      <button onClick={() => toast.error('오류', '문제가 발생했습니다')}>
        Error Toast
      </button>
      <button onClick={() => toast.warning('경고', '주의가 필요합니다')}>
        Warning Toast
      </button>
      <button onClick={() => toast.info('정보', '알려드립니다')}>
        Info Toast
      </button>
    </div>
  );
}

function Wrapper({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders success toast when success is called', () => {
    render(<TestComponent />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('Success Toast'));

    expect(screen.getByText('성공')).toBeInTheDocument();
    expect(screen.getByText('작업이 완료되었습니다')).toBeInTheDocument();
  });

  it('renders error toast when error is called', () => {
    render(<TestComponent />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('Error Toast'));

    expect(screen.getByText('오류')).toBeInTheDocument();
    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
  });

  it('renders warning toast when warning is called', () => {
    render(<TestComponent />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('Warning Toast'));

    expect(screen.getByText('경고')).toBeInTheDocument();
    expect(screen.getByText('주의가 필요합니다')).toBeInTheDocument();
  });

  it('renders info toast when info is called', () => {
    render(<TestComponent />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('Info Toast'));

    expect(screen.getByText('정보')).toBeInTheDocument();
    expect(screen.getByText('알려드립니다')).toBeInTheDocument();
  });

  it('auto-removes toast after duration', async () => {
    render(<TestComponent />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('Success Toast'));
    expect(screen.getByText('성공')).toBeInTheDocument();

    // 5초 경과 (기본 duration)
    await act(async () => {
      vi.advanceTimersByTime(5100);
    });

    expect(screen.queryByText('성공')).not.toBeInTheDocument();
  });

  it('removes toast when close button is clicked', async () => {
    render(<TestComponent />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('Success Toast'));
    expect(screen.getByText('성공')).toBeInTheDocument();

    // 닫기 버튼 클릭
    const closeButton = screen.getByLabelText('알림 닫기');
    fireEvent.click(closeButton);

    // 애니메이션 시간 대기
    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.queryByText('성공')).not.toBeInTheDocument();
  });

  it('can show multiple toasts', () => {
    render(<TestComponent />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('Success Toast'));
    fireEvent.click(screen.getByText('Error Toast'));

    expect(screen.getByText('성공')).toBeInTheDocument();
    expect(screen.getByText('오류')).toBeInTheDocument();
  });

  it('has correct aria attributes for accessibility', () => {
    render(<TestComponent />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText('Success Toast'));

    const toast = screen.getByRole('alert');
    expect(toast).toBeInTheDocument();
  });

  it('throws error when useToast is used outside provider', () => {
    // 콘솔 에러 억제
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useToast must be used within a ToastProvider');

    consoleSpy.mockRestore();
  });
});
