import React from 'react';
import { clsx } from 'clsx';
import { Bot, User, AlertTriangle } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  emotion?: string;
  isCrisis?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, emotion, isCrisis }) => {
  const isUser = role === 'user';
  
  return (
    <div className={clsx(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start"
    )}>
      <div className={clsx(
        "flex max-w-[80%] rounded-2xl p-4 shadow-sm",
        isUser ? "bg-brand-600 text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100",
        isCrisis && !isUser && "border-red-500 bg-red-50"
      )}>
        <div className="mr-3 mt-1">
          {isUser ? <User size={20} /> : <Bot size={20} />}
        </div>
        <div>
          {isCrisis && !isUser && (
             <div className="flex items-center text-red-600 text-sm font-bold mb-1">
               <AlertTriangle size={16} className="mr-1" />
               위기 감지됨
             </div>
          )}
          <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
          {emotion && !isUser && (
            <div className="mt-2 text-xs text-gray-400 bg-gray-50 inline-block px-2 py-1 rounded">
              감정: {emotion}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
