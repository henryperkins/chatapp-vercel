// File: apps/backend/pages/api/load_conversation/[conversation_id].ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import { loadConversation } from '@/utils/conversation'; // Import the consolidated function
import { errorHandler } from '@/middleware/errorHandler'; // Import errorHandler

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
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
    const messages = await loadConversation(conversation_id, user.id); // Use the consolidated function

    if (messages) {
      res.status(200).json({ conversation: messages });
    } else {
      const error = new Error('Conversation not found.');
      (error as any).status = 404;
      throw error; // Let errorHandler handle this
    }
  } catch (error) {
    // Let the errorHandler handle any errors from loadConversation
    throw error; 
  }
};

export default errorHandler(handler); // Apply errorHandler
