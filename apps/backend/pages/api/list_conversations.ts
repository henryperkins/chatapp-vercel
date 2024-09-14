// File: apps/backend/pages/api/list_conversations.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const conversations = db.collection('conversations');

    const convos = await conversations
      .find({ user_id: user.id })
      .project({ conversation_id: 1, title: 1, updated_at: 1 })
      .sort({ updated_at: -1 })
      .toArray();

    res.status(200).json({ conversations: convos });
  } catch (error: any) {
    console.error('Error listing conversations:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
}
