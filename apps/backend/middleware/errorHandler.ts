// File: apps/backend/middleware/errorHandler.ts

import type { NextApiRequest, NextApiResponse } from 'next';

interface CustomError extends Error {
  status?: number;
}

/**
 * Centralized error handling middleware for API routes.
 * Catches errors thrown in the route handler and formats the response.
 * @param fn - The API route handler function.
 * @returns A wrapped API route handler with error handling.
 */
export const errorHandler = (fn: Function) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await fn(req, res);
    } catch (error: any) {
      const customError: CustomError = error;
      const status = customError.status || 500;
      const message = customError.message || 'Internal Server Error';

      res.status(status).json({ message });
    }
  };
};
