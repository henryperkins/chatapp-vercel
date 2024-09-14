// File: apps/backend/middleware/cors.ts

import { NextApiRequest, NextApiResponse } from 'next';
import NextCors from 'nextjs-cors';

export async function cors(req: NextApiRequest, res: NextApiResponse) {
  await NextCors(req, res, {
    origin: (process.env.ALLOWED_ORIGINS || '*').split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 200,
  });
}
