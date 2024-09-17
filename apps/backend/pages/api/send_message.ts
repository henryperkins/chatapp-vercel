import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { getAzureResponse, countTokens, manageContextWindow } from '@/utils/azure';
import { PusherInstance } from '@/utils/pusher';
import { errorHandler } from '@/middleware/errorHandler';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { conversation_id, message } = req.body;

  if (!conversation_id || !message) {
    const error = new Error('Conversation ID and message are required.');
    (error as any).status = 400;
    throw error;
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const conversations = db.collection('conversations');
    const fewShotExamples = db.collection('few_shot_examples');

    const conversation = await conversations.findOne({
      conversation_id,
      user_id: user.id,
    });

    if (!conversation) {
      const error = new Error('Conversation not found.');
      (error as any).status = 404;
      throw error;
    }

    // Retrieve few-shot examples
    const examples = await fewShotExamples
      .find({ user_id: user.id })
      .project({ user_prompt: 1, assistant_response: 1, _id: 0 })
      .toArray();

    // Construct the prompt with few-shot examples
    const promptMessages = examples.map((ex) => ({
      role: 'system',
      content: `User: ${ex.user_prompt}\nAssistant: ${ex.assistant_response}`,
    }));

    // Manage the context window (e.g., keep only the last 4000 tokens)
    const maxContextTokens = 4000; // Adjust this based on your model's context window size
    let contextWindow = manageContextWindow([...promptMessages, ...conversation.messages], maxContextTokens);

    // Add the current user message to the context window
    contextWindow.push({ role: 'user', content: message });

    // Calculate remaining tokens for the response
    const remainingTokens = maxContextTokens - countTokens(contextWindow.map(m => m.content).join(' '));

    // Get assistant's response from Azure OpenAI API
    const assistantResponse = await getAzureResponse(contextWindow, remainingTokens);

    // Add user's message to the conversation
    await conversations.updateOne(
      { conversation_id },
      {
        $push: {
          messages: { role: 'user', content: message, timestamp: new Date() },
        },
        $set: { updated_at: new Date() },
      }
    );

    // Add assistant's response to the conversation
    await conversations.updateOne(
      { conversation_id },
      {
        $push: {
          messages: { role: 'assistant', content: assistantResponse, timestamp: new Date() },
        },
        $set: { updated_at: new Date() },
      }
    );

    // Emit the messages via Pusher
    await PusherInstance.trigger('chat-channel', 'new-message', {
      conversation_id,
      role: 'assistant',
      content: assistantResponse,
    });

    res.status(200).json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Error in send_message handler:', error);
    throw error; // Let the errorHandler handle the error
  }
};

export default errorHandler(handler);
