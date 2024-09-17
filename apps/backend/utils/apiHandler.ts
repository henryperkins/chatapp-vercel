import { NextApiRequest, NextApiResponse } from 'next';

export function apiHandler(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      const statusCode = error.statusCode || 500;
      const message = error.message || 'An unexpected error occurred';
      res.status(statusCode).json({ error: message });
    }
  };
}