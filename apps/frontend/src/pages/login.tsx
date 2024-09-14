// File: apps/frontend/src/pages/login.tsx

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { saveToken } from '../utils/auth';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import '../styles/login.css';

const notyf = new Notyf();

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      notyf.error('Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        saveToken(data.token);
        notyf.success('Logged in successfully.');
        router.push('/');
      } else {
        notyf.error(data.message || 'Login failed.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      notyf.error('An error occurred during login.');
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleLogin} className="login-form">
        <h1>Login</h1>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            aria-label="Email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            aria-label="Password"
            required
          />
        </div>
        <button type="submit" className="btn btn-login">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
