// File: apps/backend/pages/api/load_conversation/[conversation_id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  const { conversation_id } = req.query;

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (!conversation_id || typeof conversation_id !== 'string') {
    return res.status(400).json({ message: 'Conversation ID is required.' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const conversations = db.collection('conversations');

    const conversation = await conversations.findOne({
      conversation_id,
      user_id: user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    res.status(200).json({ conversation: conversation.messages });
  } catch (error: any) {
    console.error('Error loading conversation:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
}
