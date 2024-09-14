// apps/frontend/src/components/Chat.tsx

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faPlus, faRedo, faHistory, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import './Chat.css';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [userMessage, setUserMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    setIsTyping(true);
    // Simulate sending message to backend and getting response
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setUserMessage('');
    // Simulate assistant response
    setTimeout(() => {
      setMessages([...newMessages, { role: 'assistant', content: 'This is an AI response' }]);
      setIsTyping(false);
    }, 2000);
  };

  useEffect(() => {
    chatHistoryRef.current?.scrollTo({
      top: chatHistoryRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className={`chat-page ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Sidebar */}
      <aside className={`conversation-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          <h2>Conversations</h2>
          {/* Add conversation list here */}
        </div>
      </aside>

      <main className={`chat-main ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Header */}
        <header className="chat-header">
          <h1>Llama Token Chatbot</h1>
          <nav className="chat-nav">
            <button onClick={toggleSidebar} title="Toggle Conversation History">
              <FontAwesomeIcon icon={faBars} />
            </button>
            <button onClick={sendMessage} title="New Conversation">
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <button title="Reset Conversation">
              <FontAwesomeIcon icon={faRedo} />
            </button>
            <button title="Conversation History">
              <FontAwesomeIcon icon={faHistory} />
            </button>
            <button onClick={toggleDarkMode} title="Toggle Dark Mode">
              {isDarkMode ? <FontAwesomeIcon icon={faSun} /> : <FontAwesomeIcon icon={faMoon} />}
            </button>
          </nav>
        </header>

        {/* Chat History */}
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
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          {/* Message Input */}
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
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setUserMessage(e.target.value)}
                placeholder="Type your message and press Enter..."
                className="message-input-field"
                rows={1}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button type="submit" className="send-button">
                Send
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;