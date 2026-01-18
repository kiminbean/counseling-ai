'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Send } from 'lucide-react';
import { sendMessage, ChatResponseFormatted } from '@/lib/api';
import { ChatMessage } from '@/components/ChatMessage';
import { Sidebar } from '@/components/Sidebar';
import { Message, EmotionData } from '@/types';

// Unique ID generator
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lastEmotion, setLastEmotion] = useState<EmotionData | null>(null);
  const [techniques, setTechniques] = useState<string[]>([]);
  // Lazy initialization for userId
  const [userId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    const userMsgId = generateId();

    setInput('');
    setMessages(prev => [...prev, {
      id: userMsgId,
      role: 'user',
      content: userMsg,
      timestamp: Date.now()
    }]);
    setIsLoading(true);

    try {
      const data = await sendMessage(userMsg, userId, sessionId);

      setSessionId(data.session_id);
      setLastEmotion(data.emotion);
      setTechniques(data.suggested_techniques);

      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: data.response,
        emotion: data.emotion.label,
        isCrisis: data.is_crisis,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: '죄송합니다. 오류가 발생했습니다.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, userId, sessionId]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full bg-white shadow-xl my-4 rounded-2xl overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            MindBridge AI
            <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
              Phase 3
            </span>
          </h1>
          <div className="text-sm text-gray-500">
            Session: {sessionId ? sessionId.slice(0, 8) : 'New'}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-20">
              <p className="text-lg">안녕하세요! 무엇을 도와드릴까요?</p>
              <p className="text-sm mt-2">편안하게 이야기를 들려주세요.</p>
            </div>
          )}
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              emotion={msg.emotion}
              isCrisis={msg.isCrisis}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:75ms]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="여기에 이야기를 입력하세요..."
              className="flex-1 p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-brand-600 text-white p-3 rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      {/* Analysis Sidebar */}
      <Sidebar currentEmotion={lastEmotion} techniques={techniques} />
    </div>
  );
}
