// File: apps/backend/pages/api/get_config.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import { apiHandler } from '@/utils/apiHandler';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = authenticate(req, res);
  if (!user) {
    throw { statusCode: 401, message: 'Unauthorized' };
  }

  if (req.method !== 'GET') {
    throw { statusCode: 405, message: `Method ${req.method} Not Allowed` };
  }

  const config = {
    max_tokens: process.env.MAX_TOKENS || '128000',
    reply_tokens: process.env.REPLY_TOKENS || '800',
    chunk_size_tokens: process.env.CHUNK_SIZE_TOKENS || '1000',
  };

  res.status(200).json({ config });
};

export default apiHandler(handler);
