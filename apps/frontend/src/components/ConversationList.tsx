    import React, { useState, useEffect } from 'react';
import fetchWithAuth from '../utils/fetchWithAuth';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

const notyf = new Notyf();

interface Conversation {
  conversation_id: string;
  title: string;
  last_updated: string;
}

interface Props {
  loadConversation: (conversation_id: string) => void;
}

const ConversationList: React.FC<Props> = ({ loadConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetchWithAuth('/api/list_conversations', { method: 'GET' });
      const data = await response.json();
      setConversations(data.conversations);
    } catch (error: any) {
      notyf.error(error.message || 'Failed to load conversations.');
    }
  };

  const handleConversationClick = (conversation_id: string) => {
    loadConversation(conversation_id);
  };

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