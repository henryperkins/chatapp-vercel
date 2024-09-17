export interface Message {
  id: string;
  sender: 'user' | 'bot';
  content: string;
  timestamp: number;
}

export interface AnalysisResult {
  analysis: string;
}

export interface ErrorResponse {
  error: string;
}