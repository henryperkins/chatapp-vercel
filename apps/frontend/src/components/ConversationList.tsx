// File: apps/frontend/src/components/ConversationList.tsx

import React, { useState, useEffect } from 'react';
import fetchWithAuth from '../utils/fetchWithAuth';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { Conversation } from '@/types/models';

interface Props {
  loadConversation: (conversation_id: string) => void;
}

const notyf = new Notyf();

const ConversationList: React.FC<Props> = ({ loadConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
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

  return (
    <div className="conversation-list">
      <h2>Conversations</h2>
      {loading ? (
        <p>Loading...</p>
      ) : conversations.length === 0 ? (
        <p>No conversations found.</p>
      ) : (
        <ul>
          {conversations.map((conv) => (
            <li key={conv.conversation_id}>
              <button onClick={() => handleConversationClick(conv.conversation_id)}>
                {conv.title || `Conversation ${conv.conversation_id.slice(0, 8)}`}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConversationList;
