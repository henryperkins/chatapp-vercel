// File: apps/frontend/src/pages/index.tsx

import React, { useEffect, useState, useContext } from 'react';
import Chat from '../components/Chat';
import FewShotForm from '../components/FewShotForm';
import FileUploadForm from '../components/FileUploadForm';
import SearchForm from '../components/SearchForm';
import { useRouter } from 'next/router';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import fetchWithAuth from '../utils/fetchWithAuth';
import { getUser } from '../utils/auth';
import { ConversationContext } from '../contexts/ConversationContext';

const notyf = new Notyf();

const HomePage: React.FC = () => {
  const router = useRouter();
  const { conversationId, setConversationId } = useContext(ConversationContext);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
    } else {
      setIsAuthenticated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthenticated) {
    return <div>Loading...</div>; // Optionally, render a loading spinner
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <SearchForm />
      </header>
      <div className="main-content">
        <Chat />
        <aside className="side-panel">
          <FewShotForm />
          <FileUploadForm />
        </aside>
      </div>
    </div>
  );
};

export default HomePage;