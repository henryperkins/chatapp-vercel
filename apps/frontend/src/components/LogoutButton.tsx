import React from 'react';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { API_BASE_URL } from '../utils/config';
import { useRouter } from 'next/router';
import './LogoutButton.css'; // Create this CSS file for styling

const notyf = new Notyf();

const LogoutButton: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logout`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        notyf.success('Logged out successfully.');
        router.push('/login'); // Redirect to login page
      } else {
        notyf.error(data.message || 'Logout failed.');
      }
    } catch (error: any) {
      notyf.error(error.message || 'Logout failed.');
    }
  };

  return (
    <button className="btn btn-logout" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;