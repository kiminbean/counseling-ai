'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Types
interface ExerciseStep {
  order: number;
  instruction: string;
  duration_seconds: number | null;
  audio_cue: string | null;
}

interface Exercise {
  id: string;
  name: string;
  name_en: string;
  category: string;
  description: string;
  duration_minutes: number;
  difficulty: string;
  benefits: string[];
  suitable_emotions: string[];
  steps: ExerciseStep[];
  tips: string[];
}

// Category config
const CATEGORIES = [
  { id: 'breathing', name: '호흡법', emoji: '🌬️' },
  { id: 'grounding', name: '그라운딩', emoji: '🌍' },
  { id: 'cbt', name: 'CBT', emoji: '🧠' },
  { id: 'dbt', name: 'DBT', emoji: '💪' },
  { id: 'mindfulness', name: '마음챙김', emoji: '🧘' },
  { id: 'relaxation', name: '이완', emoji: '😌' },
  { id: 'journaling', name: '저널링', emoji: '📝' },
];

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: '쉬움',
  intermediate: '보통',
  advanced: '어려움',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepTimer, setStepTimer] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch exercises
  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      // Mock data (실제로는 API 호출)
      const mockExercises: Exercise[] = [
        {
          id: 'breathing_478',
          name: '4-7-8 호흡법',
          name_en: '4-7-8 Breathing',
          category: 'breathing',
          description: '4초 들이쉬고, 7초 참고, 8초 내쉬는 호흡법입니다. 부교감 신경을 활성화하여 빠르게 안정을 찾을 수 있어요.',
          duration_minutes: 5,
          difficulty: 'beginner',
          benefits: ['불안 감소', '수면 개선', '스트레스 해소'],
          suitable_emotions: ['anxious', 'stressed', 'angry'],
          steps: [
            { order: 1, instruction: '편안한 자세로 앉거나 누워주세요.', duration_seconds: 10, audio_cue: null },
            { order: 2, instruction: '입을 다물고 코로 4초 동안 숨을 들이쉬세요.', duration_seconds: 4, audio_cue: '들이쉬세요...' },
            { order: 3, instruction: '숨을 참고 7초를 세세요.', duration_seconds: 7, audio_cue: '참으세요...' },
            { order: 4, instruction: '입으로 8초 동안 천천히 내쉬세요.', duration_seconds: 8, audio_cue: '내쉬세요...' },
            { order: 5, instruction: '이 과정을 4회 반복하세요.', duration_seconds: 60, audio_cue: null },
          ],
          tips: ['처음에는 7초 참기가 어려울 수 있어요. 4-4-6으로 시작해도 괜찮아요.'],
        },
        {
          id: 'grounding_54321',
          name: '5-4-3-2-1 그라운딩',
          name_en: '5-4-3-2-1 Grounding',
          category: 'grounding',
          description: '다섯 가지 감각을 활용하여 현재 순간에 집중하는 기법입니다.',
          duration_minutes: 5,
          difficulty: 'beginner',
          benefits: ['불안 감소', '현재 집중', '과각성 완화'],
          suitable_emotions: ['anxious', 'fear', 'panic'],
          steps: [
            { order: 1, instruction: '주변을 둘러보세요.', duration_seconds: 10, audio_cue: null },
            { order: 2, instruction: '보이는 것 5가지를 찾아 말해보세요.', duration_seconds: 30, audio_cue: '다섯 가지...' },
            { order: 3, instruction: '만질 수 있는 것 4가지를 찾아 만져보세요.', duration_seconds: 30, audio_cue: '네 가지...' },
            { order: 4, instruction: '들리는 소리 3가지를 찾아보세요.', duration_seconds: 20, audio_cue: '세 가지...' },
            { order: 5, instruction: '맡을 수 있는 냄새 2가지를 찾아보세요.', duration_seconds: 20, audio_cue: '두 가지...' },
            { order: 6, instruction: '맛볼 수 있는 것 1가지를 떠올려보세요.', duration_seconds: 15, audio_cue: '한 가지...' },
          ],
          tips: ['불안할 때 바로 시작할 수 있도록 미리 연습해 두세요.'],
        },
        {
          id: 'relaxation_pmr',
          name: '점진적 근육 이완법',
          name_en: 'Progressive Muscle Relaxation',
          category: 'relaxation',
          description: '근육을 의도적으로 긴장시켰다가 이완하여 신체 긴장을 푸는 기법입니다.',
          duration_minutes: 15,
          difficulty: 'beginner',
          benefits: ['근육 긴장 완화', '불안 감소', '수면 개선'],
          suitable_emotions: ['anxious', 'stressed', 'tense'],
          steps: [
            { order: 1, instruction: '편안하게 앉거나 누워 눈을 감으세요.', duration_seconds: 15, audio_cue: null },
            { order: 2, instruction: '오른손을 주먹 쥐고 5초간 힘을 주세요.', duration_seconds: 5, audio_cue: '긴장...' },
            { order: 3, instruction: '힘을 빼고 10초간 이완감을 느끼세요.', duration_seconds: 10, audio_cue: '이완...' },
            { order: 4, instruction: '왼손도 같은 방법으로 반복하세요.', duration_seconds: 15, audio_cue: null },
            { order: 5, instruction: '어깨를 귀 쪽으로 올려 긴장-이완하세요.', duration_seconds: 15, audio_cue: null },
          ],
          tips: ['통증이 있는 부위는 건너뛰세요.'],
        },
        {
          id: 'journaling_gratitude',
          name: '감사 일기',
          name_en: 'Gratitude Journaling',
          category: 'journaling',
          description: '매일 감사한 것 3가지를 적는 간단하지만 효과적인 긍정 심리학 기법입니다.',
          duration_minutes: 5,
          difficulty: 'beginner',
          benefits: ['긍정 감정 증가', '우울 감소', '수면 개선'],
          suitable_emotions: ['sad', 'neutral', 'stressed'],
          steps: [
            { order: 1, instruction: '조용한 곳에서 노트나 앱을 준비하세요.', duration_seconds: 15, audio_cue: null },
            { order: 2, instruction: '오늘 감사한 것 3가지를 떠올려 보세요.', duration_seconds: 60, audio_cue: null },
            { order: 3, instruction: '각각을 구체적으로 적어보세요.', duration_seconds: 120, audio_cue: null },
            { order: 4, instruction: '적은 내용을 다시 읽으며 그 감정을 느껴보세요.', duration_seconds: 30, audio_cue: null },
          ],
          tips: ['작은 것도 괜찮아요. 따뜻한 커피 한 잔도 감사의 대상이 될 수 있어요.'],
        },
      ];

      setExercises(mockExercises);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter exercises by category
  const filteredExercises = selectedCategory
    ? exercises.filter(ex => ex.category === selectedCategory)
    : exercises;

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isPlaying && selectedExercise) {
      const currentStepData = selectedExercise.steps[currentStep];
      const duration = currentStepData?.duration_seconds || 30;

      if (stepTimer < duration) {
        timer = setTimeout(() => {
          setStepTimer(prev => prev + 1);
        }, 1000);
      } else {
        // Move to next step
        if (currentStep < selectedExercise.steps.length - 1) {
          setCurrentStep(prev => prev + 1);
          setStepTimer(0);
        } else {
          // Exercise complete
          setIsPlaying(false);
        }
      }
    }

    return () => clearTimeout(timer);
  }, [isPlaying, stepTimer, currentStep, selectedExercise]);

  const handleStartExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setCurrentStep(0);
    setStepTimer(0);
    setIsPlaying(false);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNextStep = () => {
    if (selectedExercise && currentStep < selectedExercise.steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setStepTimer(0);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setStepTimer(0);
    }
  };

  const handleClose = () => {
    setSelectedExercise(null);
    setIsPlaying(false);
    setCurrentStep(0);
    setStepTimer(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500">운동 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-gray-600 hover:text-gray-900">
            ← 돌아가기
          </Link>
          <h1 className="text-lg font-semibold text-gray-800">치료적 운동</h1>
          <div className="w-8" />
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === null
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise List */}
        <div className="space-y-4">
          {filteredExercises.map(exercise => {
            const category = CATEGORIES.find(c => c.id === exercise.category);
            return (
              <div
                key={exercise.id}
                className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleStartExercise(exercise)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{category?.emoji}</span>
                      <h3 className="font-semibold text-gray-800">{exercise.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {exercise.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        ⏱️ {exercise.duration_minutes}분
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[exercise.difficulty]}`}>
                        {DIFFICULTY_LABELS[exercise.difficulty]}
                      </span>
                    </div>
                  </div>
                  <button className="text-purple-600 hover:text-purple-800">
                    시작 →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">해당 카테고리의 운동이 없습니다.</p>
          </div>
        )}
      </main>

      {/* Exercise Player Modal */}
      {selectedExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-t-3xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">{selectedExercise.name}</h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>단계 {currentStep + 1} / {selectedExercise.steps.length}</span>
                  <span>
                    {Math.floor(stepTimer / 60)}:
                    {(stepTimer % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 transition-all duration-300"
                    style={{
                      width: `${((currentStep + 1) / selectedExercise.steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Current Step */}
              <div className="text-center py-8">
                <div className="text-6xl mb-6">
                  {currentStep === 0 ? '🧘' : isPlaying ? '✨' : '⏸️'}
                </div>
                <p className="text-xl text-gray-800 mb-4">
                  {selectedExercise.steps[currentStep]?.instruction}
                </p>
                {selectedExercise.steps[currentStep]?.audio_cue && (
                  <p className="text-purple-600 italic">
                    "{selectedExercise.steps[currentStep]?.audio_cue}"
                  </p>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 py-6">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStep === 0}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
                >
                  ⏮️
                </button>

                {isPlaying ? (
                  <button
                    onClick={handlePause}
                    className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl hover:bg-purple-700"
                  >
                    ⏸️
                  </button>
                ) : (
                  <button
                    onClick={handlePlay}
                    className="w-16 h-16 rounded-full bg-purple-600 text-white flex items-center justify-center text-2xl hover:bg-purple-700"
                  >
                    ▶️
                  </button>
                )}

                <button
                  onClick={handleNextStep}
                  disabled={currentStep === selectedExercise.steps.length - 1}
                  className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50"
                >
                  ⏭️
                </button>
              </div>

              {/* Tips */}
              {selectedExercise.tips.length > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
                  <p className="text-sm font-medium text-yellow-800 mb-1">💡 팁</p>
                  <p className="text-sm text-yellow-700">{selectedExercise.tips[0]}</p>
                </div>
              )}

              {/* Benefits */}
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">효과</p>
                <div className="flex flex-wrap gap-2">
                  {selectedExercise.benefits.map((benefit, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
