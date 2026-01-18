import { getEmotionColors } from '@/lib/constants';

interface EmotionBadgeProps {
  emotion: string;
  size?: 'sm' | 'md';
}

// 감정 한국어 번역
const emotionLabels: Record<string, string> = {
  happy: '기쁨',
  joy: '기쁨',
  excited: '설렘',
  grateful: '감사',
  hopeful: '희망',
  calm: '평온',
  peaceful: '평화',
  relaxed: '편안',
  content: '만족',
  neutral: '중립',
  confused: '혼란',
  sad: '슬픔',
  sadness: '슬픔',
  lonely: '외로움',
  disappointed: '실망',
  angry: '분노',
  anger: '분노',
  frustrated: '좌절',
  irritated: '짜증',
  anxious: '불안',
  anxiety: '불안',
  worried: '걱정',
  nervous: '긴장',
  fear: '두려움',
  stressed: '스트레스',
  tired: '피로',
  exhausted: '탈진',
  surprised: '놀람',
  disgust: '혐오',
  love: '사랑',
};

export function EmotionBadge({ emotion, size = 'sm' }: EmotionBadgeProps) {
  const lowerEmotion = emotion.toLowerCase();
  const colors = getEmotionColors(lowerEmotion);
  const label = emotionLabels[lowerEmotion] || emotion;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${colors.bg} ${colors.text}
        ${sizeClasses[size]}
      `}
    >
      {label}
    </span>
  );
}
