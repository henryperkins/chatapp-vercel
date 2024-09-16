// File: apps/frontend/src/utils/fetchWithAuth.ts

import { API_BASE_URL } from './config';
import { getToken } from './auth';

export const fetchWithAuth = async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
  const token = getToken();

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.body && !(options.body instanceof FormData)
        ? { 'Content-Type': 'application/json' }
        : {}),
    },
  });

  const contentType = response.headers.get('content-type');
  let data: any;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const error = data?.message || `HTTP error! Status: ${response.status}`;
    throw new Error(error);
  }

  return data;
};

export default fetchWithAuth;
