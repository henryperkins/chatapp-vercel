// File: chatapp-vercel/apps/frontend/src/components/ConversationList.tsx

import React, { useState, useEffect, useContext } from 'react';
import { ConversationContext } from '../contexts/ConversationContext';
import fetchWithAuth from '../utils/fetchWithAuth';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { Conversation, ApiResponse } from '../utils/types';
import './ConversationList.css';

const notyf = new Notyf();

const ConversationList: React.FC = () => {
  const { setConversationId } = useContext(ConversationContext);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const data: ApiResponse<{ conversations: Conversation[] }> = await fetchWithAuth('/api/list_conversations', {
        method: 'GET',
      });
      setConversations(data.conversations || []);
    } catch (error: any) {
      notyf.error(error.message || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = (conversation_id: string) => {
    setConversationId(conversation_id);
    notyf.success('Conversation loaded successfully.');
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