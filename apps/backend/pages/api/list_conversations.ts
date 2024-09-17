// File: apps/backend/pages/api/list_conversations.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { Conversation } from '@/types/models';
import { apiHandler } from '@/utils/apiHandler';

interface ListConversationsResponse {
  conversations: Conversation[];
}

const handler = async (req: NextApiRequest, res: NextApiResponse<ListConversationsResponse>) => {
  const user = authenticate(req, res);
  if (!user) {
    throw { statusCode: 401, message: 'Unauthorized' };
  }

  if (req.method !== 'GET') {
    throw { statusCode: 405, message: `Method ${req.method} Not Allowed` };
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  const conversations = db.collection('conversations');

  const userConversations = await conversations
    .find({ user_id: user.id })
    .sort({ updated_at: -1 })
    .toArray();

  res.status(200).json({ conversations: userConversations });
};

export default apiHandler(handler);
