// File: apps/frontend/src/utils/auth.ts

import jwtDecode from 'jwt-decode';

interface User {
  id: string;
  email: string;
}

export function saveToken(token: string): void {
  localStorage.setItem('jwt_token', token);
}

export function getToken(): string | null {
  return localStorage.getItem('jwt_token');
}

export function removeToken(): void {
  localStorage.removeItem('jwt_token');
}

export function getUser(): User | null {
  const token = getToken();
  if (token) {
    try {
      const user = jwtDecode<User>(token);
      return user;
    } catch (error) {
      console.error('Invalid token:', error);
      removeToken();
    }
  }
  return null;
}