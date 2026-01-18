import { ChatRequest, ChatResponse, ChatResponseFormatted } from '@/types';

export type { ChatResponseFormatted };

export async function sendMessage(
  message: string,
  userId: string,
  sessionId: string | null,
  language: string = 'ko'
): Promise<ChatResponseFormatted> {
  const res = await fetch('/api/v3/chat/multilingual', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': process.env.NEXT_PUBLIC_API_KEY || 'dev_token'
    },
    body: JSON.stringify({
      user_id: userId,
      message: message,
      session_id: sessionId || `session_${Date.now()}`,
      language: language
    } satisfies Partial<ChatRequest>),
  });

  if (!res.ok) {
    throw new Error('Network response was not ok');
  }

  const data: ChatResponse = await res.json();

  // Adapter: 백엔드 응답을 프론트엔드 형식으로 변환
  // v3 API (emotion_analysis)와 v1 API (emotion) 모두 대응
  const primaryEmotion = data.emotion_analysis?.primary_emotion || data.emotion?.label || 'neutral';

  return {
    session_id: data.session_id,
    response: data.response_text || data.response || "응답을 불러올 수 없습니다.",
    emotion: {
      label: primaryEmotion,
      confidence: data.emotion_analysis?.intensity || data.emotion?.confidence || 0.5,
      intensity: data.emotion_analysis?.intensity || data.emotion?.intensity || 0.5,
      secondary: data.emotion_analysis?.secondary_emotions || data.emotion?.secondary || []
    },
    is_crisis: data.supervisor_feedback?.intervention_needed || data.is_crisis || false,
    suggested_techniques: data.suggested_techniques || [],
    safety_resources: data.safety_resources
  };
}
