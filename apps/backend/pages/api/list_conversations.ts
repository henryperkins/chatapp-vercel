// File: apps/backend/pages/api/list_conversations.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { Conversation } from '@/types/models';
import { errorHandler } from '@/middleware/errorHandler';

interface ListConversationsResponse {
  conversations: Conversation[];
}

const handler = async (_req: NextApiRequest, res: NextApiResponse<ListConversationsResponse>) => {
  const user = authenticate(_req, res);
  if (!user) return;

  if (_req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ conversations: [] });
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const conversations = db.collection('conversations');

    const userConversations = await conversations
      .find({ user_id: user.id })
      .sort({ updated_at: -1 })
      .toArray();

    res.status(200).json({ conversations: userConversations });
  } catch (error: any) {
    console.error('List Conversations Error:', error);
    res.status(500).json({ conversations: [] });
  }
};

export default errorHandler(handler);
