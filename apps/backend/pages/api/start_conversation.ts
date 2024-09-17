// File: apps/backend/pages/api/start_conversation.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import { startConversation } from '@/utils/conversation'; // Import the consolidated function
import { errorHandler } from '@/middleware/errorHandler';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  try {
    const conversationId = await startConversation(user.id); // Use the consolidated function
    res.status(200).json({ conversation_id: conversationId });
  } catch (error) {
    // Let the errorHandler handle any errors from startConversation
    throw error; 
  }
};

export default errorHandler(handler); 
