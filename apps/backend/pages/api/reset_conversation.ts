// File: apps/backend/pages/api/reset_conversation.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { errorHandler } from '@/middleware/errorHandler';

interface ResetConversationResponse {
  message: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<ResetConversationResponse>) => {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    return;
  }

  const { conversation_id } = req.body;

  if (!conversation_id) {
    const error = new Error('Conversation ID is required.');
    (error as any).status = 400;
    throw error;
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
      const error = new Error('Conversation not found.');
      (error as any).status = 404;
      throw error;
    }

    // Reset the conversation by clearing messages
    await conversations.updateOne(
      { conversation_id },
      { $set: { messages: [], updated_at: new Date() } }
    );

    res.status(200).json({ message: 'Conversation reset successfully.' });
  } catch (error: any) {
    console.error('Reset Conversation Error:', error);
    throw error;
  }
};

export default errorHandler(handler);
