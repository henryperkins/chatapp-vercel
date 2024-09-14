import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import Pusher from 'pusher-js';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import './Chat.css';
import fetchWithAuth from '../utils/fetchWithAuth';
import { API_BASE_URL } from '../utils/config';

const notyf = new Notyf();

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    startNewConversation();
    setupPusher();

    // Auto-focus input field on component mount
    inputRef.current?.focus();

    // Clean up Pusher subscriptions on unmount
    return () => {
      Pusher.instances.forEach((instance) => instance.disconnect());
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom when messages update
    chatHistoryRef.current?.scrollTo({
      top: chatHistoryRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const setupPusher = () => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY || '', {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '',
    });

    const channel = pusher.subscribe('chat-channel');

    channel.bind('new-message', (data: Message & { conversation_id: string }) => {
      if (data.conversation_id !== conversationId) return;

      setMessages((prevMessages) => [...prevMessages, { role: data.role, content: data.content }]);

      if (data.role === 'assistant') {
        setIsTyping(false);
      }
    });
  };

  const startNewConversation = async () => {
    try {
      const response = await fetchWithAuth('/api/start_conversation', { method: 'POST' });
      const data = await response.json();
      setConversationId(data.conversation_id);
      setMessages([]);
      notyf.success('Started a new conversation.');
    } catch (error: any) {
      notyf.error(error.message || 'Failed to start a new conversation.');
    }
  };

  const sendMessage = async () => {
    if (!userMessage.trim()) return;

    const message = userMessage.trim();
    setMessages((prevMessages) => [...prevMessages, { role: 'user', content: message }]);
    setUserMessage('');
    setIsTyping(true);

    try {
      await fetchWithAuth('/api/send_message', {
        method: 'POST',
        body: JSON.stringify({ conversation_id: conversationId, message }),
      });
    } catch (error: any) {
      notyf.error(error.message || 'Failed to send message.');
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setUserMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Placeholder functions for navigation buttons
  const resetConversation = async () => {
    try {
      await fetchWithAuth('/api/reset_conversation', {
        method: 'POST',
        body: JSON.stringify({ conversation_id: conversationId }),
      });
      setMessages([]);
      notyf.success('Conversation reset.');
    } catch (error: any) {
      notyf.error(error.message || 'Failed to reset conversation.');
    }
  };

  const listConversations = () => {
    // Implement conversation listing logic
    toggleSidebar();
  };

  const loadConversation = async (conversation_id: string) => {
    try {
      const response = await fetchWithAuth(`/api/load_conversation/${conversation_id}`, {
        method: 'GET',
      });
      const data = await response.json();
      setConversationId(conversation_id);
      setMessages(data.conversation);
      notyf.success('Conversation loaded.');
    } catch (error: any) {
      notyf.error(error.message || 'Failed to load conversation.');
    }
  };

  return (
    <div className={`chat-page ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {/* Sidebar for Conversation List */}
      <aside className={`conversation-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <ConversationList loadConversation={loadConversation} />
      </aside>

      {/* Main Chat Area */}
      <main className="chat-main">
        {/* Header */}
        <header className="chat-header">
          <h1>Llama Token Chatbot</h1>
          <nav className="chat-nav">
            <button onClick={toggleSidebar} title="Toggle Conversation History" aria-label="Toggle Conversation History">
              <i className="fas fa-bars"></i>
            </button>
            <button onClick={startNewConversation} title="New Conversation" aria-label="Start New Conversation">
              <i className="fas fa-plus"></i>
            </button>
            <button onClick={resetConversation} title="Reset Conversation" aria-label="Reset Conversation">
              <i className="fas fa-redo"></i>
            </button>
            {/* Add more buttons as needed */}
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
                ref={inputRef}
                value={userMessage}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Type your message and press Enter..."
                className="message-input-field"
                rows={1}
              />
              <button type="submit" className="send-button" aria-label="Send Message">
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;