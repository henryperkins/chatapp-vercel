import React, { useState, useEffect, useRef, useContext } from 'react';
import Pusher from 'pusher-js';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import './Chat.css';
import fetchWithAuth from '../utils/fetchWithAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPlus, faRedo, faPaperPlane, faHistory } from '@fortawesome/free-solid-svg-icons';
import ConversationList from './ConversationList';
import { ConversationContext } from '../contexts/ConversationContext';
import { countTokens } from '../utils/azure'; // Import countTokens

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const notyf = new Notyf();

const Chat: React.FC = () => {
  const { conversationId, setConversationId } = useContext(ConversationContext);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1);
  const [maxTokens, setMaxTokens] = useState(1000);
  const maxContextTokens = 4000; // Adjust based on your model
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!conversationId) {
      startNewConversation();
    } else {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
    });

    const channel = pusher.subscribe('chat-channel');
    channel.bind('new-message', (data: any) => {
      if (data.conversation_id === conversationId) {
        setMessages((prevMessages) => [...prevMessages, { role: data.role, content: data.content }]);
        setIsTyping(false);

        // Update total tokens used
        setTotalTokensUsed((prevTokens) => prevTokens + countTokens(data.content));
      }
    });

    return () => {
      pusher.unsubscribe('chat-channel');
      pusher.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const sendMessage = async () => {
    if (!userMessage.trim() || !conversationId) return;

    const message = userMessage.trim();
    const newMessageTokens = countTokens(message);

    // Check if adding the new message would exceed the context window limit
    if (totalTokensUsed + newMessageTokens > maxContextTokens) {
      notyf.error('Message exceeds context window limit. Please start a new conversation.');
      return;
    }

    setMessages((prevMessages) => [...prevMessages, { role: 'user', content: message }]);
    setUserMessage('');
    setIsTyping(true);

    try {
      const response = await fetchWithAuth('/api/send_message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          conversation_id: conversationId, 
          message,
          temperature, // Send model parameters to the backend
          top_p: topP,
          max_tokens: maxTokens,
        }),
      });

      if (response.message === 'Message sent successfully.') {
        // Assistant's response and token update will be handled via Pusher
        setTotalTokensUsed((prevTokens) => prevTokens + newMessageTokens);
      } else {
        notyf.error(response.message || 'Failed to send message.');
        setIsTyping(false);
      }
    } catch (error: any) {
      notyf.error(error.message || 'Failed to send message.');
      setIsTyping(false);
    }
  };

  const startNewConversation = async () => {
    try {
      const data = await fetchWithAuth('/api/start_conversation', { method: 'POST' });
      setConversationId(data.conversation_id);
      setMessages([]);
      setTotalTokensUsed(0); // Reset token count for new conversation
      notyf.success('Started a new conversation.');
      setIsSidebarOpen(false);
    } catch (error: any) {
      notyf.error(error.message || 'Failed to start a new conversation.');
    }
  };

  const resetConversation = async () => {
    if (!conversationId) return;

    try {
      const response = await fetchWithAuth('/api/reset_conversation', {
        method: 'POST',
        body: JSON.stringify({ conversation_id: conversationId }),
      });

      if (response.message === 'Conversation reset successfully.') {
        setMessages([]);
        setTotalTokensUsed(0); // Reset token count
        notyf.success('Conversation has been reset.');
      } else {
        notyf.error(response.message || 'Failed to reset conversation.');
      }
    } catch (error: any) {
      notyf.error(error.message || 'Failed to reset conversation.');
    }
  };

  const loadConversation = async (convId: string) => {
    try {
      const data = await fetchWithAuth(`/api/load_conversation/${convId}`, { method: 'GET' });
      setMessages(data.conversation);
      // Calculate and update total tokens used for the loaded conversation
      setTotalTokensUsed(data.conversation.reduce((total, msg) => total + countTokens(msg.content), 0));
      notyf.success('Conversation loaded.');
      setIsSidebarOpen(false);
    } catch (error: any) {
      notyf.error(error.message || 'Failed to load conversation.');
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserMessage(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`chat-page ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Sidebar for Conversation List */}
      <aside className={`conversation-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <ConversationList />
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        {/* Header */}
        <header className="chat-header">
          <h1>Chatbot</h1>
          <nav className="chat-nav">
            <button onClick={toggleSidebar} title="Toggle Conversation History" aria-label="Toggle Conversation History">
              <FontAwesomeIcon icon={faBars} />
            </button>
            <button onClick={startNewConversation} title="Start New Conversation" aria-label="Start New Conversation">
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button onClick={resetConversation} title="Reset Conversation" aria-label="Reset Conversation">
              <FontAwesomeIcon icon={faRedo} />
            </button>
            <button onClick={toggleSidebar} title="Conversation History" aria-label="Conversation History">
              <FontAwesomeIcon icon={faHistory} />
            </button>
          </nav>
        </header>

        {/* Conversation Area */}
        <div className="chat-container">
          <div className="chat-history" ref={chatHistoryRef}>
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {isTyping && (
              <div className="message assistant">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          {/* Message Input Area */}
          <div className="message-input">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <textarea
                value={userMessage}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Type your message and press Enter..."
                className="message-input-field"
                rows={1}
                aria-label="Message Input"
              />
              <button type="submit" className="send-button" aria-label="Send Message">
                <FontAwesomeIcon icon={faPaperPlane} />
              </button>
            </form>

            {/* Model Parameter Controls */}
            <div className="model-params">
              <div>
                <label htmlFor="temperature">Temperature ({temperature.toFixed(1)}):</label>
                <input
                  type="range"
                  id="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                />
              </div>
              {/* Add similar controls for top_p and max_tokens */}
              <div>
                <label htmlFor="topP">Top P ({topP.toFixed(1)}):</label>
                <input
                  type="range"
                  id="topP"
                  min="0"
                  max="1"
                  step="0.1"
                  value={topP}
                  onChange={(e) => setTopP(parseFloat(e.target.value))}
                />
              </div>
              <div>
                <label htmlFor="maxTokens">Max Tokens ({maxTokens}):</label>
                <input
                  type="number"
                  id="maxTokens"
                  min="1"
                  max="4000" // Adjust based on your model
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 1)}
                />
              </div>
            </div>

            {/* Token Usage Display */}
            <div className="token-usage">
              Tokens Used: {totalTokensUsed} / {maxContextTokens}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;
