// File: apps/frontend/src/components/ConversationList.tsx

import React, { useState, useEffect } from 'react';
import fetchWithAuth from '../utils/fetchWithAuth';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

// Define the structure of a conversation
interface Conversation {
  conversation_id: string;
  title?: string;
  updated_at: string;
}

// Define the props for ConversationList
interface ConversationListProps {
  loadConversation: (conversation_id: string) => void;
}

const notyf = new Notyf();

const ConversationList: React.FC<ConversationListProps> = ({ loadConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await fetchWithAuth('/api/list_conversations', { method: 'GET' });
      setConversations(data.conversations);
    } catch (error: any) {
      notyf.error(error.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversation_id: string) => {
    loadConversation(conversation_id);
  };

  if (loading) {
    return <div className="conversation-list">Loading...</div>;
  }

  return (
    <div className="conversation-list">
      <h2>Conversations</h2>
      <ul>
        {conversations.map((conv) => (
          <li key={conv.conversation_id}>
            <button onClick={() => handleConversationClick(conv.conversation_id)}>
              {conv.title || 'Untitled Conversation'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
