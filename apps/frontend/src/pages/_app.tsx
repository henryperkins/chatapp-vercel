// File: apps/frontend/src/pages/_app.tsx

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBars, faPlus, faRedo, faPaperPlane, faHistory, faSearch } from '@fortawesome/free-solid-svg-icons';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { ConversationProvider } from '../contexts/ConversationContext';
import Header from '../components/Header';

config.autoAddCss = false;

library.add(faBars, faPlus, faRedo, faPaperPlane, faHistory, faSearch);

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/protected_route', { method: 'GET' });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          if (router.pathname !== '/login' && router.pathname !== '/register') {
            router.push('/login');
          }
        }
      } catch {
        setIsAuthenticated(false);
        if (router.pathname !== '/login' && router.pathname !== '/register') {
          router.push('/login');
        }
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const handleLoadConversation = (e: Event) => {
      const customEvent = e as CustomEvent;
      const conversation_id = customEvent.detail;
      window.location.href = `/?conversation_id=${conversation_id}`;
    };

    window.addEventListener('loadConversation', handleLoadConversation);

    return () => {
      window.removeEventListener('loadConversation', handleLoadConversation);
    };
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return (
    <ConversationProvider>
      <Header />
      {isAuthenticated || router.pathname === '/login' || router.pathname === '/register' ? (
        <Component {...pageProps} />
      ) : null}
    </ConversationProvider>
  );
};

export default MyApp;