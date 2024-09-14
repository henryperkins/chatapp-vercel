// File: apps/backend/types/models.ts

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Conversation {
  conversation_id: string;
  user_id: string;
  messages: Message[];
  created_at: Date;
  updated_at: Date;
  title?: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  created_at?: Date;
}

export interface FewShotExample {
  user_id: string;
  user_prompt: string;
  assistant_response: string;
  created_at: Date;
}