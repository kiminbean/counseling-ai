'use client';

import { memo } from 'react';
import { Sparkles, TrendingUp, Activity, Lightbulb } from 'lucide-react';
import { EmotionData } from '@/types';
import { EmotionBadge } from '@/components/chat/EmotionBadge';

interface SidebarProps {
  currentEmotion: EmotionData | null;
  techniques: string[];
}

export const Sidebar = memo<SidebarProps>(function Sidebar({
  currentEmotion,
  techniques
}) {
  return (
    <div className="h-full p-6 overflow-y-auto">
      <h2 className="text-lg font-bold mb-6 text-gray-800 flex items-center gap-2">
        <Activity size={20} className="text-brand-500" />
        실시간 분석
      </h2>

      {currentEmotion ? (
        <div className="space-y-6">
          {/* 현재 감정 */}
          <div className="bg-gradient-to-br from-brand-50 to-brand-100/50 p-5 rounded-2xl border border-brand-100">
            <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
              <TrendingUp size={14} />
              현재 감정
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <EmotionBadge emotion={currentEmotion.label} size="md" />
              <span className="text-2xl font-bold text-gray-800 capitalize">
                {currentEmotion.label}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-400 to-brand-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${currentEmotion.confidence * 100}%` }}
              />
            </div>
            <p className="text-xs text-right mt-1.5 text-gray-500">
              신뢰도 {Math.round(currentEmotion.confidence * 100)}%
            </p>
          </div>

          {/* 복합 감정 */}
          {currentEmotion.secondary && currentEmotion.secondary.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                복합 감정
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentEmotion.secondary.map((emo, idx) => (
                  <EmotionBadge key={`${emo}-${idx}`} emotion={emo} />
                ))}
              </div>
            </div>
          )}

          {/* 감정 강도 */}
          {currentEmotion.intensity && (
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                감정 강도
              </h3>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`w-6 h-6 rounded-full transition-all ${
                      level <= Math.round(currentEmotion.intensity * 5)
                        ? 'bg-brand-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-600">
                  {Math.round(currentEmotion.intensity * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* 제안된 기법 */}
          {techniques.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-1.5">
                <Lightbulb size={14} />
                제안된 기법
              </h3>
              <ul className="space-y-2">
                {techniques.map((tech, idx) => (
                  <li
                    key={`${tech}-${idx}`}
                    className="flex items-start gap-2 text-sm text-gray-700 bg-emerald-50 p-3 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition-colors cursor-pointer"
                  >
                    <Sparkles size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{tech}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Activity size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            대화를 시작하면<br />
            분석 결과가 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
});
