// API Request/Response Types

export interface ChatRequest {
  user_id: string;
  message: string;
  session_id: string;
  language: string;
}

export interface ChatResponse {
  session_id: string;
  response_text?: string;
  response?: string;
  emotion_analysis?: {
    primary_emotion: string;
    intensity: number;
    secondary_emotions: string[];
  };
  emotion?: {
    label: string;
    confidence: number;
    intensity: number;
    secondary: string[];
  };
  supervisor_feedback?: {
    intervention_needed: boolean;
    quality_score: number;
  };
  is_crisis?: boolean;
  suggested_techniques: string[];
  safety_resources?: Record<string, string>;
}

// Frontend UI Types

export interface EmotionData {
  label: string;
  confidence: number;
  intensity: number;
  secondary: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  emotion?: string;
  isCrisis?: boolean;
  timestamp: number;
}

export interface ChatResponseFormatted {
  session_id: string;
  response: string;
  emotion: EmotionData;
  is_crisis: boolean;
  suggested_techniques: string[];
  safety_resources?: Record<string, string>;
}
