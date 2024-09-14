// File: apps/frontend/src/pages/_app.tsx

import React, { useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faPlus, faRedo, faPaperPlane, faHistory, faSearch } from '@fortawesome/free-solid-svg-icons';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS
import { ConversationProvider } from '../contexts/ConversationContext';

config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically

library.add(faBars, faPlus, faRedo, faPaperPlane, faHistory, faSearch);

const MyApp = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    const handleLoadConversation = (e: Event) => {
      const customEvent = e as CustomEvent;
      const conversation_id = customEvent.detail;
      // Implement logic to load conversation, e.g., via context or global state
      // For simplicity, you can use window.postMessage or other methods
      window.location.href = `/?conversation_id=${conversation_id}`;
    };

    window.addEventListener('loadConversation', handleLoadConversation);

    return () => {
      window.removeEventListener('loadConversation', handleLoadConversation);
    };
  }, []);

  return (
    <ConversationProvider>
      <Component {...pageProps} />
    </ConversationProvider>
  );
};

export default MyApp;
