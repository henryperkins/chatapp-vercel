import React, { useState, useEffect, useRef, useContext } from 'react';
import Pusher from 'pusher-js';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import './Chat.css';
import fetchWithAuth from '../utils/fetchWithAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPlus, faRedo, faPaperPlane, faHistory, faUpload, faLightbulb, faSearch } from '@fortawesome/free-solid-svg-icons';
import ConversationList from './ConversationList';
import { ConversationContext } from '../contexts/ConversationContext';
import { countTokens } from '../utils/azure';
import FileUploadForm from './FileUploadForm';
import FewShotForm from './FewShotForm';
import SearchForm from './SearchForm';
import { Message, AnalysisResult, ErrorResponse } from '../types';

const notyf = new Notyf();

const Chat: React.FC = () => {
  const { conversationId, setConversationId, messages, setMessages, totalTokensUsed, setTotalTokensUsed } = useContext(ConversationContext);
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1);
  const [maxTokens, setMaxTokens] = useState(1000);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const maxContextTokens = 4000;
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

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe('chat-channel');
    channel.bind('new-message', (data: Message) => {
      if (data.id === conversationId) {
        setMessages((prevMessages) => [...prevMessages, data]);
        setIsTyping(false);
        setTotalTokensUsed((prevTokens) => prevTokens + countTokens(data.content));
      }
    });

    return () => {
      pusher.unsubscribe('chat-channel');
      pusher.disconnect();
    };
  }, [conversationId, setMessages, setTotalTokensUsed]);

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

    if (totalTokensUsed + newMessageTokens > maxContextTokens) {
      setError(`Message exceeds context window limit (${maxContextTokens} tokens). Please start a new conversation.`);
      return;
    }

    const newMessage: Message = {
      id: conversationId,
      sender: 'user',
      content: message,
      timestamp: Date.now()
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setUserMessage('');
    setIsTyping(true);
    setError(null);

    try {
      const response = await fetchWithAuth('/api/send_message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          conversation_id: conversationId, 
          message,
          temperature,
          top_p: topP,
          max_tokens: maxTokens,
        }),
      });

      const data: AnalysisResult | ErrorResponse = await response.json();

      if (response.ok) {
        setTotalTokensUsed((prevTokens) => prevTokens + newMessageTokens);
      } else {
        setError((data as ErrorResponse).error || 'Failed to send message. Please try again.');
        setIsTyping(false);
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred. Please try again.');
      setIsTyping(false);
    }
  };

  const startNewConversation = async () => {
    try {
      const response = await fetchWithAuth('/api/start_conversation', { method: 'POST' });
      const data: { conversation_id: string } | ErrorResponse = await response.json();

      if (response.ok && 'conversation_id' in data) {
        setConversationId(data.conversation_id);
        setMessages([]);
        setTotalTokensUsed(0);
        notyf.success('Started a new conversation.');
        setIsSidebarOpen(false);
        setError(null);
      } else {
        setError((data as ErrorResponse).error || 'Failed to start a new conversation. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred while starting a new conversation.');
    }
  };

  const resetConversation = async () => {
    if (!conversationId) return;

    try {
      const response = await fetchWithAuth('/api/reset_conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversation_id: conversationId }),
      });

      const data: AnalysisResult | ErrorResponse = await response.json();

      if (response.ok) {
        setMessages([]);
        setTotalTokensUsed(0);
        notyf.success('Conversation has been reset.');
        setError(null);
      } else {
        setError((data as ErrorResponse).error || 'Failed to reset conversation. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred while resetting the conversation.');
    }
  };

  const loadConversation = async (convId: string) => {
    try {
      const response = await fetchWithAuth(`/api/load_conversation/${convId}`, { method: 'GET' });
      const data: { conversation: Message[] } | ErrorResponse = await response.json();

      if (response.ok && 'conversation' in data) {
        setMessages(data.conversation);
        setTotalTokensUsed(data.conversation.reduce((total, msg) => total + countTokens(msg.content), 0));
        notyf.success('Conversation loaded.');
        setIsSidebarOpen(false);
        setError(null);
      } else {
        setError((data as ErrorResponse).error || 'Failed to load conversation. Please try again.');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred while loading the conversation.');
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

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case 'fileUpload':
        return <FileUploadForm />;
      case 'fewShot':
        return <FewShotForm />;
      case 'search':
        return <SearchForm />;
      default:
        return null;
    }
  };

  return (
    <div className={`chat-page ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <aside className={`conversation-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <ConversationList />
      </aside>

      <main className="chat-main">
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

        <div className="chat-container">
          <div className="chat-content">
            <div className="chat-history" ref={chatHistoryRef}>
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  <div className="message-content">{msg.content}</div>
                </div>
              ))}
              {isTyping && (
                <div className="message bot">
                  <div className="message-content typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>

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

              {error && <div className="error-message">{error}</div>}

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
                    max="4000"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              </div>

              <div className="token-usage">
                Tokens Used: {totalTokensUsed} / {maxContextTokens}
              </div>
            </div>
          </div>

          <div className="feature-sidebar">
            <button onClick={() => setActiveFeature('fileUpload')} title="File Upload" aria-label="File Upload">
              <FontAwesomeIcon icon={faUpload} />
            </button>
            <button onClick={() => setActiveFeature('fewShot')} title="Few-Shot Learning" aria-label="Few-Shot Learning">
              <FontAwesomeIcon icon={faLightbulb} />
            </button>
            <button onClick={() => setActiveFeature('search')} title="Search" aria-label="Search">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>

          {renderActiveFeature()}
        </div>
      </main>
    </div>
  );
};

export default Chat;
