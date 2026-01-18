/**
 * Mood Check-In Component
 * 저장 경로: frontend/components/MoodCheckIn.tsx
 *
 * 기분 체크인 컴포넌트 (Wysa/Woebot 스타일)
 */
'use client';

import { useState } from 'react';

interface MoodCheckInProps {
  onComplete: (mood: MoodResult) => void;
  language?: string;
}

interface MoodResult {
  mood: string;
  intensity: number;
  note?: string;
}

interface MoodOption {
  id: string;
  emoji: string;
  label: { ko: string; en: string };
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { id: 'great', emoji: '😊', label: { ko: '좋아요', en: 'Great' }, color: 'bg-green-100 border-green-300 hover:bg-green-200' },
  { id: 'good', emoji: '🙂', label: { ko: '괜찮아요', en: 'Good' }, color: 'bg-lime-100 border-lime-300 hover:bg-lime-200' },
  { id: 'okay', emoji: '😐', label: { ko: '그저 그래요', en: 'Okay' }, color: 'bg-yellow-100 border-yellow-300 hover:bg-yellow-200' },
  { id: 'down', emoji: '😔', label: { ko: '우울해요', en: 'Down' }, color: 'bg-orange-100 border-orange-300 hover:bg-orange-200' },
  { id: 'bad', emoji: '😢', label: { ko: '힘들어요', en: 'Bad' }, color: 'bg-red-100 border-red-300 hover:bg-red-200' },
];

const INTENSITY_LABELS = {
  ko: ['약간', '보통', '많이', '매우'],
  en: ['Slightly', 'Moderately', 'Quite', 'Very'],
};

const MESSAGES = {
  ko: {
    title: '오늘 기분이 어떠세요?',
    subtitle: '지금 느끼는 감정을 선택해 주세요',
    intensityLabel: '어느 정도인가요?',
    noteLabel: '더 나누고 싶은 이야기가 있으신가요? (선택)',
    notePlaceholder: '오늘 있었던 일이나 느낌을 자유롭게 적어주세요...',
    submit: '기록하기',
    skip: '건너뛰기',
  },
  en: {
    title: 'How are you feeling today?',
    subtitle: 'Select how you feel right now',
    intensityLabel: 'How much?',
    noteLabel: 'Anything you want to share? (Optional)',
    notePlaceholder: 'Feel free to write about your day or feelings...',
    submit: 'Record',
    skip: 'Skip',
  },
};

export function MoodCheckIn({ onComplete, language = 'ko' }: MoodCheckInProps) {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(2);
  const [note, setNote] = useState('');
  const [step, setStep] = useState<'mood' | 'intensity' | 'note'>('mood');

  const messages = MESSAGES[language as keyof typeof MESSAGES] || MESSAGES.ko;
  const intensityLabels = INTENSITY_LABELS[language as keyof typeof INTENSITY_LABELS] || INTENSITY_LABELS.ko;

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    setStep('intensity');
  };

  const handleIntensityChange = (value: number) => {
    setIntensity(value);
  };

  const handleNext = () => {
    if (step === 'intensity') {
      setStep('note');
    }
  };

  const handleSubmit = () => {
    if (!selectedMood) return;

    onComplete({
      mood: selectedMood,
      intensity: intensity / 4, // 0-1 스케일로 변환
      note: note.trim() || undefined,
    });
  };

  const handleSkip = () => {
    onComplete({
      mood: 'skipped',
      intensity: 0,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md mx-auto">
      {/* Step: Mood Selection */}
      {step === 'mood' && (
        <div className="animate-in fade-in duration-200">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
            {messages.title}
          </h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            {messages.subtitle}
          </p>

          <div className="grid grid-cols-5 gap-3">
            {MOOD_OPTIONS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood.id)}
                className={`
                  flex flex-col items-center p-3 rounded-xl border-2 transition-all
                  ${mood.color}
                  ${selectedMood === mood.id ? 'ring-2 ring-brand-500 scale-105' : ''}
                `}
              >
                <span className="text-3xl mb-1">{mood.emoji}</span>
                <span className="text-xs text-gray-600">
                  {mood.label[language as keyof typeof mood.label] || mood.label.ko}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSkip}
            className="w-full mt-6 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            {messages.skip}
          </button>
        </div>
      )}

      {/* Step: Intensity */}
      {step === 'intensity' && selectedMood && (
        <div className="animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-center mb-6">
            <span className="text-5xl">
              {MOOD_OPTIONS.find(m => m.id === selectedMood)?.emoji}
            </span>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 text-center mb-4">
            {messages.intensityLabel}
          </h3>

          {/* Intensity Slider */}
          <div className="px-4 mb-6">
            <input
              type="range"
              min="1"
              max="4"
              value={intensity}
              onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between mt-2">
              {intensityLabels.map((label, index) => (
                <span
                  key={index}
                  className={`text-xs ${intensity === index + 1 ? 'text-brand-600 font-semibold' : 'text-gray-400'}`}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={handleNext}
            className="w-full py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
          >
            다음
          </button>
        </div>
      )}

      {/* Step: Note */}
      {step === 'note' && (
        <div className="animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl">
              {MOOD_OPTIONS.find(m => m.id === selectedMood)?.emoji}
            </span>
            <span className="ml-2 text-lg font-medium text-gray-700">
              {intensityLabels[intensity - 1]}
            </span>
          </div>

          <label className="block text-sm font-medium text-gray-700 mb-2">
            {messages.noteLabel}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={messages.notePlaceholder}
            className="w-full p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            rows={4}
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
            >
              {messages.submit}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
