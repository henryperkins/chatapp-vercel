// File: apps/backend/pages/api/reset_conversation.ts

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

  const { conversation_id } = req.body;

  if (!conversation_id) {
    return res.status(400).json({ message: 'Conversation ID is required.' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const conversations = db.collection('conversations');

    await conversations.updateOne(
      { conversation_id, user_id: user.id },
      {
        $set: {
          messages: [],
          updated_at: new Date(),
        },
      }
    );

    res.status(200).json({ message: 'Conversation reset successfully.' });
  } catch (error: any) {
    console.error('Error resetting conversation:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
}
