// File: apps/frontend/src/utils/fetchWithAuth.ts

import { API_BASE_URL } from './config';
import { getToken } from './auth';

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! Status: ${response.status}`);
  }

  return data;
};

export default fetchWithAuth;
