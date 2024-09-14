import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { getAzureResponse } from '@/utils/azure';
import { PusherInstance } from '@/utils/pusher';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { conversation_id, message } = req.body;

  if (!conversation_id || !message) {
    return res.status(400).json({ message: 'Conversation ID and message are required.' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('your-database-name');
    const conversations = db.collection('conversations');

    const conversation = await conversations.findOne({
      conversation_id,
      user_id: user.id,
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found.' });
    }

    // Add user's message to the conversation
    await conversations.updateOne(
      { conversation_id },
      {
        $push: {
          messages: { role: 'user', content: message },
        },
        $set: { updated_at: new Date() },
      }
    );

    // Get assistant's response from Azure OpenAI API
    const assistantResponse = await getAzureResponse([...conversation.messages, { role: 'user', content: message }]);

    // Add assistant's response to the conversation
    await conversations.updateOne(
      { conversation_id },
      {
        $push: {
          messages: { role: 'assistant', content: assistantResponse },
        },
        $set: { updated_at: new Date() },
      }
    );

    // Emit the messages via Pusher
    const pusher = PusherInstance;
    pusher.trigger('chat-channel', 'new-message', {
      conversation_id,
      role: 'user',
      content: message,
    });
    pusher.trigger('chat-channel', 'new-message', {
      conversation_id,
      role: 'assistant',
      content: assistantResponse,
    });

    res.status(200).json({ message: 'Message sent successfully.' });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
}
