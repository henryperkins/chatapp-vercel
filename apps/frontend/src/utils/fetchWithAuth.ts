// File: apps/frontend/src/utils/fetchWithAuth.ts

import { API_BASE_URL } from './config';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('jwt_token');

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...headers,
      // If sending JSON, set the Content-Type
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
  }

  // Attempt to parse JSON, fallback to text
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else {
    return response.text();
  }
};

export default fetchWithAuth;
