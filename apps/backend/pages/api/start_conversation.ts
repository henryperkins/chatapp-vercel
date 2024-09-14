// File: apps/backend/pages/api/start_conversation.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const conversations = db.collection('conversations');

    const conversationId = uuidv4();
    await conversations.insertOne({
      conversation_id: conversationId,
      user_id: user.id,
      messages: [],
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(200).json({ conversation_id: conversationId });
  } catch (error: any) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
}
