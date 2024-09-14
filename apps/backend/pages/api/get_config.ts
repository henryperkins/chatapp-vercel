import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const config = {
      max_tokens: process.env.MAX_TOKENS || '128000',
      reply_tokens: process.env.REPLY_TOKENS || '800',
      chunk_size_tokens: process.env.CHUNK_SIZE_TOKENS || '1000',
    };

    res.status(200).json({ config });
  } catch (error: any) {
    console.error('Error getting config:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
}
