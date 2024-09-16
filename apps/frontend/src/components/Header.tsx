import React, { useContext, useEffect, useState } from 'react';
import LogoutButton from './LogoutButton';
import { ConversationContext } from '../contexts/ConversationContext';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import './Header.css'; // Create this CSS file for styling

const notyf = new Notyf();

const Header: React.FC = () => {
  const { conversationId } = useContext(ConversationContext);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Simple check for authentication status
    // This can be enhanced by verifying token validity
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/protected_route', { method: 'GET' });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <header className="app-header">
      <h1>ChatApp Vercel-D</h1>
      {isAuthenticated && <LogoutButton />}
    </header>
  );
};

export default Header;