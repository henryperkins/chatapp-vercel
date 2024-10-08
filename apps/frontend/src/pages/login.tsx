import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import { API_BASE_URL } from '../utils/config';
import './login.css'; // Create this CSS file for styling

const notyf = new Notyf();

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      notyf.error('Email and password are required.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        notyf.success('Logged in successfully.');
        router.push('/chat'); // Redirect to chat page
      } else {
        notyf.error(data.message || 'Login failed.');
      }
    } catch (error: any) {
      notyf.error(error.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
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
        <button type="submit" className="btn btn-login" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <p className="redirect-text">
          Don't have an account? <a href="/register">Register here</a>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;