import React from 'react';

interface SidebarProps {
  currentEmotion: any;
  techniques: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ currentEmotion, techniques }) => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full p-6 hidden lg:block overflow-y-auto">
      <h2 className="text-lg font-bold mb-6 text-gray-800">실시간 분석</h2>
      
      {currentEmotion ? (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">현재 감정</h3>
            <div className="text-3xl font-bold text-brand-600 capitalize">
              {currentEmotion.label}
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-brand-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${currentEmotion.confidence * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-right mt-1 text-gray-500">
              신뢰도: {Math.round(currentEmotion.confidence * 100)}%
            </p>
          </div>

          {currentEmotion.secondary && currentEmotion.secondary.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">복합 감정</h3>
              <div className="flex flex-wrap gap-2">
                {currentEmotion.secondary.map((emo: string, idx: number) => (
                  <span key={idx} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                    {emo}
                  </span>
                ))}
              </div>
            </div>
          )}

          {techniques.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">제안된 기법</h3>
              <ul className="space-y-2">
                {techniques.map((tech, idx) => (
                  <li key={idx} className="flex items-center text-sm text-gray-700 bg-green-50 p-2 rounded border border-green-100">
                    ✨ {tech}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-400 mt-20">
          <p>대화를 시작하면<br/>분석 결과가 표시됩니다.</p>
        </div>
      )}
    </div>
  );
};
