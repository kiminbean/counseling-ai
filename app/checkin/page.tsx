'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Types
interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  labelEn: string;
  color: string;
}

interface CheckInData {
  mood: string;
  intensity: number;
  note: string;
  triggers: string[];
  activities: string[];
}

interface CheckInResponse {
  checkin_id: string;
  mood: string;
  streak: number;
  message: string;
}

interface MoodHistoryItem {
  date: string;
  mood: string;
  intensity: number;
  note?: string;
}

// Constants
const MOOD_OPTIONS: MoodOption[] = [
  { id: 'happy', emoji: '😊', label: '행복해요', labelEn: 'Happy', color: 'bg-yellow-100 border-yellow-400' },
  { id: 'calm', emoji: '😌', label: '평온해요', labelEn: 'Calm', color: 'bg-green-100 border-green-400' },
  { id: 'neutral', emoji: '😐', label: '그저 그래요', labelEn: 'Neutral', color: 'bg-gray-100 border-gray-400' },
  { id: 'anxious', emoji: '😰', label: '불안해요', labelEn: 'Anxious', color: 'bg-purple-100 border-purple-400' },
  { id: 'sad', emoji: '😢', label: '슬퍼요', labelEn: 'Sad', color: 'bg-blue-100 border-blue-400' },
  { id: 'angry', emoji: '😤', label: '화나요', labelEn: 'Angry', color: 'bg-red-100 border-red-400' },
  { id: 'tired', emoji: '😫', label: '지쳐요', labelEn: 'Tired', color: 'bg-orange-100 border-orange-400' },
  { id: 'stressed', emoji: '😩', label: '스트레스', labelEn: 'Stressed', color: 'bg-pink-100 border-pink-400' },
];

const TRIGGERS = [
  { id: 'work', label: '업무/학업' },
  { id: 'relationship', label: '관계' },
  { id: 'health', label: '건강' },
  { id: 'money', label: '금전' },
  { id: 'family', label: '가족' },
  { id: 'sleep', label: '수면' },
  { id: 'other', label: '기타' },
];

const ACTIVITIES = [
  { id: 'exercise', label: '운동' },
  { id: 'social', label: '사람 만남' },
  { id: 'hobby', label: '취미' },
  { id: 'rest', label: '휴식' },
  { id: 'work', label: '업무' },
  { id: 'outdoor', label: '야외활동' },
];

export default function CheckInPage() {
  // State
  const [step, setStep] = useState<'mood' | 'intensity' | 'details' | 'complete'>('mood');
  const [checkInData, setCheckInData] = useState<CheckInData>({
    mood: '',
    intensity: 3,
    note: '',
    triggers: [],
    activities: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<CheckInResponse | null>(null);
  const [history, setHistory] = useState<MoodHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // User ID (실제로는 인증에서 가져옴)
  const userId = 'anonymous_' + (typeof window !== 'undefined' ? localStorage.getItem('userId') || 'user' : 'user');

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v3/checkin/mood/history?user_id=${userId}&days=7`
      );
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleMoodSelect = (moodId: string) => {
    setCheckInData(prev => ({ ...prev, mood: moodId }));
    setStep('intensity');
  };

  const handleIntensitySelect = (intensity: number) => {
    setCheckInData(prev => ({ ...prev, intensity }));
    setStep('details');
  };

  const handleTriggerToggle = (triggerId: string) => {
    setCheckInData(prev => ({
      ...prev,
      triggers: prev.triggers.includes(triggerId)
        ? prev.triggers.filter(t => t !== triggerId)
        : [...prev.triggers, triggerId],
    }));
  };

  const handleActivityToggle = (activityId: string) => {
    setCheckInData(prev => ({
      ...prev,
      activities: prev.activities.includes(activityId)
        ? prev.activities.filter(a => a !== activityId)
        : [...prev.activities, activityId],
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v3/checkin/mood`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            mood: checkInData.mood,
            intensity: checkInData.intensity,
            note: checkInData.note || null,
            triggers: checkInData.triggers.length > 0 ? checkInData.triggers : null,
            activities: checkInData.activities.length > 0 ? checkInData.activities : null,
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
        setStep('complete');
        fetchHistory(); // Refresh history
      } else {
        throw new Error('Failed to submit check-in');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('체크인 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCheckInData({
      mood: '',
      intensity: 3,
      note: '',
      triggers: [],
      activities: [],
    });
    setResponse(null);
    setStep('mood');
  };

  const selectedMood = MOOD_OPTIONS.find(m => m.id === checkInData.mood);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← 돌아가기
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">기분 체크인</h1>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showHistory ? '닫기' : '기록'}
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* History Panel */}
        {showHistory && (
          <div className="mb-6 bg-white rounded-xl shadow-sm p-4">
            <h2 className="text-lg font-semibold mb-3">최근 7일 기록</h2>
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">아직 기록이 없어요</p>
            ) : (
              <div className="space-y-2">
                {history.map((item, idx) => {
                  const mood = MOOD_OPTIONS.find(m => m.id === item.mood);
                  return (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{mood?.emoji || '😐'}</span>
                        <span className="text-sm text-gray-600">{item.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i <= item.intensity ? 'bg-blue-500' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 1: Mood Selection */}
        {step === 'mood' && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                지금 기분이 어때요?
              </h2>
              <p className="text-gray-500">가장 가까운 감정을 선택해 주세요</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MOOD_OPTIONS.map(mood => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood.id)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${mood.color}`}
                >
                  <span className="text-4xl block mb-2">{mood.emoji}</span>
                  <span className="text-sm font-medium text-gray-700">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Intensity */}
        {step === 'intensity' && (
          <div className="space-y-6">
            <button
              onClick={() => setStep('mood')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 이전
            </button>

            <div className="text-center">
              <span className="text-6xl block mb-4">{selectedMood?.emoji}</span>
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                얼마나 {selectedMood?.label}?
              </h2>
              <p className="text-gray-500">감정의 강도를 선택해 주세요</p>
            </div>

            <div className="flex justify-center gap-4">
              {[1, 2, 3, 4, 5].map(level => (
                <button
                  key={level}
                  onClick={() => handleIntensitySelect(level)}
                  className={`w-14 h-14 rounded-full border-2 transition-all hover:scale-110 flex items-center justify-center ${
                    level <= 2
                      ? 'bg-green-100 border-green-400 hover:bg-green-200'
                      : level === 3
                      ? 'bg-yellow-100 border-yellow-400 hover:bg-yellow-200'
                      : 'bg-red-100 border-red-400 hover:bg-red-200'
                  }`}
                >
                  <span className="text-lg font-bold text-gray-700">{level}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between text-sm text-gray-500 px-2">
              <span>약하게</span>
              <span>강하게</span>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 'details' && (
          <div className="space-y-6">
            <button
              onClick={() => setStep('intensity')}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 이전
            </button>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-4xl">{selectedMood?.emoji}</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i <= checkInData.intensity ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-500">조금 더 알려주세요 (선택사항)</p>
            </div>

            {/* Triggers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                이유가 있나요?
              </label>
              <div className="flex flex-wrap gap-2">
                {TRIGGERS.map(trigger => (
                  <button
                    key={trigger.id}
                    onClick={() => handleTriggerToggle(trigger.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      checkInData.triggers.includes(trigger.id)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {trigger.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Activities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                오늘 뭐 했어요?
              </label>
              <div className="flex flex-wrap gap-2">
                {ACTIVITIES.map(activity => (
                  <button
                    key={activity.id}
                    onClick={() => handleActivityToggle(activity.id)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      checkInData.activities.includes(activity.id)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {activity.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                메모 (선택)
              </label>
              <textarea
                value={checkInData.note}
                onChange={e => setCheckInData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="오늘 하루를 간단히 적어보세요..."
                className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '저장 중...' : '체크인 완료'}
            </button>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && response && (
          <div className="space-y-6 text-center">
            <div className="py-8">
              <span className="text-6xl block mb-4">✨</span>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                체크인 완료!
              </h2>

              {response.streak > 1 && (
                <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-4">
                  <span>🔥</span>
                  <span className="font-semibold">{response.streak}일 연속!</span>
                </div>
              )}

              <p className="text-gray-600 mt-4 px-4">
                {response.message}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleReset}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                다시 체크인하기
              </button>

              <Link
                href="/"
                className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                상담하러 가기
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-lg mx-auto px-4 py-6 text-center text-gray-400 text-sm">
        매일 기분을 기록하면 패턴을 파악할 수 있어요
      </footer>
    </div>
  );
}
