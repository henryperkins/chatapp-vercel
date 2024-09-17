// File: apps/backend/pages/api/reset_conversation.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import { resetConversation } from '@/utils/conversation'; // Import the consolidated function
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
    const success = await resetConversation(conversation_id, user.id); // Use the consolidated function

    if (success) {
      res.status(200).json({ message: 'Conversation reset successfully.' });
    } else {
      const error = new Error('Conversation not found.');
      (error as any).status = 404;
      throw error;
    }
  } catch (error) {
    // Let the errorHandler handle any errors from resetConversation
    throw error;
  }
};

export default errorHandler(handler);
