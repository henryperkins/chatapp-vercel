// File: apps/backend/pages/api/search_conversations.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  try {
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
  } catch (error: any) {
    console.error('Error searching conversations:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
}
