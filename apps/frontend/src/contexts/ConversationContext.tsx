// File: apps/frontend/src/contexts/ConversationContext.tsx

import React, { createContext, useState, ReactNode } from 'react';

interface ConversationContextType {
  conversationId: string;
  setConversationId: (id: string) => void;
}

export const ConversationContext = createContext<ConversationContextType>({
  conversationId: '',
  setConversationId: () => {},
});

interface Props {
  children: ReactNode;
}

export const ConversationProvider: React.FC<Props> = ({ children }) => {
  const [conversationId, setConversationId] = useState<string>('');

  return (
    <ConversationContext.Provider value={{ conversationId, setConversationId }}>
      {children}
    </ConversationContext.Provider>
  );
};