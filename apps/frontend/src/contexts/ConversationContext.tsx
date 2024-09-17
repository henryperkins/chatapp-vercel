import React, { createContext, useState, ReactNode } from 'react';

interface MessageType {
  role: string;
  content: string;
}

interface ConversationContextProps {
  conversationId: string;
  setConversationId: (id: string) => void;
  messages: MessageType[];
  setMessages: (messages: MessageType[]) => void;
}

export const ConversationContext = createContext<ConversationContextProps | null>(null);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<MessageType[]>([]);

  return (
    <ConversationContext.Provider
      value={{ conversationId, setConversationId, messages, setMessages }}
    >
      {children}
    </ConversationContext.Provider>
  );
};