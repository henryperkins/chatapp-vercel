// File: apps/frontend/src/components/ConversationList.tsx

import React, { useState, useEffect, useContext } from 'react';
import fetchWithAuth from '../utils/fetchWithAuth';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { ConversationContext } from '../contexts/ConversationContext';

interface Conversation {
  conversation_id: string;
  title?: string;
  updated_at: string;
}

const notyf = new Notyf();

const ConversationList: React.FC = () => {
  const { setConversationId } = useContext(ConversationContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setConversationId(conversation_id);
    // Optionally, emit an event to notify other components
    window.dispatchEvent(new CustomEvent('loadConversation', { detail: conversation_id }));
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