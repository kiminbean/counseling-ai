/**
 * 공통 상수 정의
 * 하드코딩된 값들을 중앙에서 관리
 */

// ============================================
// 위기 상담 전화번호
// ============================================
export const CRISIS_HOTLINES = {
  suicidePrevention: {
    number: '1393',
    name: '자살예방상담전화',
    nameEn: 'Suicide Prevention Hotline',
    available: '24시간',
  },
  mentalHealth: {
    number: '1577-0199',
    name: '정신건강위기상담전화',
    nameEn: 'Mental Health Crisis Hotline',
    available: '24시간',
  },
  childAbuse: {
    number: '112',
    name: '아동학대신고',
    nameEn: 'Child Abuse Report',
    available: '24시간',
  },
  domesticViolence: {
    number: '1366',
    name: '여성긴급전화',
    nameEn: 'Women\'s Emergency Hotline',
    available: '24시간',
  },
} as const;

// 간편 접근용
export const HOTLINE_SUICIDE = CRISIS_HOTLINES.suicidePrevention.number;
export const HOTLINE_MENTAL_HEALTH = CRISIS_HOTLINES.mentalHealth.number;

// ============================================
// 감정 색상 매핑
// ============================================
export const EMOTION_COLORS = {
  // 긍정적 감정
  happy: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  joy: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  excited: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  grateful: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
  hopeful: { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200' },

  // 평온한 감정
  calm: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  peaceful: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
  relaxed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  content: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },

  // 중립적 감정
  neutral: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200' },
  confused: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200' },

  // 부정적 감정 - 슬픔 계열
  sad: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  lonely: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  disappointed: { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200' },

  // 부정적 감정 - 불안 계열
  anxious: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  worried: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
  nervous: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200' },
  stressed: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },

  // 부정적 감정 - 분노 계열
  angry: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  frustrated: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  irritated: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },

  // 피로 계열
  tired: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-200' },
  exhausted: { bg: 'bg-zinc-100', text: 'text-zinc-600', border: 'border-zinc-200' },
} as const;

// 감정 이모지 매핑
export const EMOTION_EMOJIS: Record<string, string> = {
  happy: '😊',
  joy: '😄',
  excited: '🤩',
  grateful: '🙏',
  hopeful: '🌟',
  calm: '😌',
  peaceful: '☮️',
  relaxed: '😴',
  content: '😊',
  neutral: '😐',
  confused: '😕',
  sad: '😢',
  lonely: '😔',
  disappointed: '😞',
  anxious: '😰',
  worried: '😟',
  nervous: '😬',
  stressed: '😫',
  angry: '😠',
  frustrated: '😤',
  irritated: '😑',
  tired: '😪',
  exhausted: '🥱',
};

// 감정 색상 타입
export type EmotionColor = {
  bg: string;
  text: string;
  border: string;
};

// 기본 감정 색상 (매핑되지 않은 감정용)
export const DEFAULT_EMOTION_COLOR: EmotionColor = EMOTION_COLORS.neutral;

/**
 * 감정에 따른 색상 클래스 가져오기
 */
export function getEmotionColors(emotion: string): EmotionColor {
  const lowerEmotion = emotion.toLowerCase();
  return (EMOTION_COLORS as Record<string, EmotionColor>)[lowerEmotion] || DEFAULT_EMOTION_COLOR;
}

/**
 * 감정에 따른 이모지 가져오기
 */
export function getEmotionEmoji(emotion: string): string {
  const lowerEmotion = emotion.toLowerCase();
  return EMOTION_EMOJIS[lowerEmotion] || '💭';
}

// ============================================
// 기분 체크인 옵션
// ============================================
export const MOOD_OPTIONS = [
  { value: 'great', label: '아주 좋음', emoji: '😄', color: 'emerald' },
  { value: 'good', label: '좋음', emoji: '🙂', color: 'green' },
  { value: 'okay', label: '보통', emoji: '😐', color: 'gray' },
  { value: 'bad', label: '안 좋음', emoji: '😔', color: 'blue' },
  { value: 'terrible', label: '매우 안 좋음', emoji: '😢', color: 'indigo' },
] as const;

export const MOOD_TRIGGERS = [
  { id: 'work', label: '업무/학업', emoji: '💼' },
  { id: 'relationship', label: '인간관계', emoji: '👥' },
  { id: 'health', label: '건강', emoji: '🏥' },
  { id: 'finance', label: '재정', emoji: '💰' },
  { id: 'family', label: '가족', emoji: '👨‍👩‍👧' },
  { id: 'sleep', label: '수면', emoji: '😴' },
  { id: 'exercise', label: '운동', emoji: '🏃' },
  { id: 'other', label: '기타', emoji: '📝' },
] as const;

export const MOOD_ACTIVITIES = [
  { id: 'exercise', label: '운동', emoji: '🏃' },
  { id: 'meditation', label: '명상', emoji: '🧘' },
  { id: 'social', label: '사람들과 교류', emoji: '👥' },
  { id: 'hobby', label: '취미 활동', emoji: '🎨' },
  { id: 'rest', label: '충분한 휴식', emoji: '😴' },
  { id: 'nature', label: '자연 속 시간', emoji: '🌳' },
  { id: 'music', label: '음악 감상', emoji: '🎵' },
  { id: 'reading', label: '독서', emoji: '📚' },
] as const;

// ============================================
// 앱 설정
// ============================================
export const APP_CONFIG = {
  name: 'MindBridge AI',
  version: '1.0.0',
  description: 'AI 심리상담 플랫폼',
  maxStoredMessages: 50,
  defaultLanguage: 'ko',
} as const;

// ============================================
// 세션 설정
// ============================================
export const SESSION_CONFIG = {
  maxStoredMessages: 50,
  sessionTimeout: 30 * 60 * 1000, // 30분
  autoSaveInterval: 5000, // 5초
} as const;

// ============================================
// API 설정
// ============================================
export const API_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
} as const;
