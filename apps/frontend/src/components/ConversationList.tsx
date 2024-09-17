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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth('/api/list_conversations', {
        method: 'GET',
      });
      const data: ApiResponse<{ conversations: Conversation[] }> = await response.json();
      
      if (response.ok) {
        setConversations(data.conversations || []);
      } else {
        throw new Error(data.error || 'Failed to load conversations');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred while loading conversations');
      notyf.error(error.message || 'Failed to load conversations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationClick = async (conversation_id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchWithAuth(`/api/load_conversation/${conversation_id}`, {
        method: 'GET',
      });
      const data = await response.json();

      if (response.ok) {
        setConversationId(conversation_id);
        notyf.success('Conversation loaded successfully.');
      } else {
        throw new Error(data.error || 'Failed to load conversation');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred while loading the conversation');
      notyf.error(error.message || 'Failed to load conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="conversation-list">Loading conversations...</div>;
  }

  if (error) {
    return (
      <div className="conversation-list">
        <div className="error-message">{error}</div>
        <button onClick={fetchConversations}>Retry</button>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      <h2>Conversations</h2>
      {conversations.length === 0 ? (
        <p>No conversations found. Start a new one!</p>
      ) : (
        <ul>
          {conversations.map((conv) => (
            <li key={conv.conversation_id}>
              <button onClick={() => handleConversationClick(conv.conversation_id)}>
                {conv.title || 'Untitled Conversation'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ConversationList;