// File: apps/backend/pages/api/start_conversation.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import { startConversation } from '@/utils/conversation';
import { apiHandler } from '@/utils/apiHandler';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const user = authenticate(req, res);
    if (!user) {
      throw { statusCode: 401, message: 'Unauthorized: Invalid or missing authentication token.' };
    }

    if (req.method !== 'POST') {
      throw { statusCode: 405, message: `Method ${req.method} Not Allowed. Use POST to start a new conversation.` };
    }

    const conversationId = await startConversation(user.id);
    if (!conversationId) {
      throw { statusCode: 500, message: 'Failed to start a new conversation. Please try again.' };
    }

    res.status(200).json({ conversation_id: conversationId, message: 'New conversation started successfully.' });
  } catch (error: any) {
    console.error('Start Conversation Error:', error);
    if (error.statusCode) {
      throw error;
    } else {
      throw { statusCode: 500, message: `Internal Server Error: ${error.message || 'An unexpected error occurred while starting a new conversation.'}` };
    }
  }
};

export default apiHandler(handler);
