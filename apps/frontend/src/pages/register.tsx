import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { saveToken } from '../utils/auth';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
import './register.css';
import Link from 'next/link';

const notyf = new Notyf();

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      notyf.error('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      notyf.error('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        saveToken(data.token);
        notyf.success('Registered successfully.');
        router.push('/');
      } else {
        notyf.error(data.message || 'Registration failed.');
      }
    } catch (error: any) {
      notyf.error(error.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <form className="register-form" onSubmit={handleRegister}>
        <h1>Register</h1>
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
        <div className="form-group">
          <label htmlFor="confirm-password">Confirm Password:</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            aria-label="Confirm Password"
            required
          />
        </div>
        <button type="submit" className="btn btn-register" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <p className="redirect-text">
          Already have an account? <Link href="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;