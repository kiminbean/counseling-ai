import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmotionBadge } from '@/components/chat/EmotionBadge';

describe('EmotionBadge', () => {
  it('renders emotion label', () => {
    render(<EmotionBadge emotion="happy" />);
    expect(screen.getByText('기쁨')).toBeInTheDocument();
  });

  it('renders Korean translation for known emotions', () => {
    render(<EmotionBadge emotion="sad" />);
    expect(screen.getByText('슬픔')).toBeInTheDocument();
  });

  it('renders original emotion for unknown emotions', () => {
    render(<EmotionBadge emotion="custom_emotion" />);
    expect(screen.getByText('custom_emotion')).toBeInTheDocument();
  });

  it('applies correct size classes for sm', () => {
    const { container } = render(<EmotionBadge emotion="happy" size="sm" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('text-xs');
  });

  it('applies correct size classes for md', () => {
    const { container } = render(<EmotionBadge emotion="happy" size="md" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('text-sm');
  });

  it('applies emotion-specific colors', () => {
    const { container } = render(<EmotionBadge emotion="happy" />);
    const badge = container.querySelector('span');
    expect(badge?.className).toContain('bg-amber-100');
    expect(badge?.className).toContain('text-amber-700');
  });

  it('handles case-insensitive emotion names', () => {
    render(<EmotionBadge emotion="HAPPY" />);
    expect(screen.getByText('기쁨')).toBeInTheDocument();
  });
});
