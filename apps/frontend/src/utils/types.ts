// File: apps/frontend/src/utils/types.ts

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  conversation_id: string;
  title?: string;
  updated_at: string;
}

export interface FewShotExample {
  user_prompt: string;
  assistant_response: string;
}

export interface ApiResponse<T> {
  message?: string;
  token?: string;
  conversation_id?: string;
  conversations?: Conversation[];
  conversation?: Message[];
  analysis?: string;
  results?: Conversation[];
}