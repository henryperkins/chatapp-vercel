// File: apps/backend/pages/api/search_conversations.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { apiHandler } from '@/utils/apiHandler';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = authenticate(req, res);
  if (!user) {
    throw { statusCode: 401, message: 'Unauthorized' };
  }

  if (req.method !== 'POST') {
    throw { statusCode: 405, message: `Method ${req.method} Not Allowed` };
  }

  const { query } = req.body;

  if (!query) {
    throw { statusCode: 400, message: 'Search query is required.' };
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  const conversations = db.collection('conversations');

  const results = await conversations
    .find({
      user_id: user.id,
      'messages.content': { $regex: query, $options: 'i' },
    })
    .project({ conversation_id: 1, title: 1, updated_at: 1 })
    .toArray();

  res.status(200).json({ results });
};

export default apiHandler(handler);
