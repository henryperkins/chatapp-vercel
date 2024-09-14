// File: apps/frontend/src/pages/index.tsx

import React, { useEffect } from 'react';
import Chat from '../components/Chat';
import SearchForm from '../components/SearchForm';
import { getUser } from '../utils/auth';
import { useRouter } from 'next/router';

const HomePage: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="home-page">
      <SearchForm />
      <Chat />
    </div>
  );
};

export default HomePage;
