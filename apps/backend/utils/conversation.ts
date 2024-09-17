//apps/backend/utils/conversation.ts
import { v4 as uuidv4 } from 'uuid';
import clientPromise from './mongodb';
import { Conversation, Message } from '../types/models';

export const startConversation = async (userId: string): Promise<string> => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  const conversations = db.collection<Conversation>('conversations');

  const conversationId = uuidv4();
  await conversations.insertOne({
    conversation_id: conversationId,
    user_id: userId,
    messages: [],
    created_at: new Date(),
    updated_at: new Date(),
  });

  return conversationId;
};

export const resetConversation = async (conversationId: string, userId: string): Promise<boolean> => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  const conversations = db.collection<Conversation>('conversations');

  const result = await conversations.updateOne(
    { conversation_id: conversationId, user_id: userId },
    { $set: { messages: [], updated_at: new Date() } }
  );

  return result.modifiedCount === 1;
};

export const loadConversation = async (conversationId: string, userId: string): Promise<Message[] | null> => {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  const conversations = db.collection<Conversation>('conversations');

  const conversation = await conversations.findOne({
    conversation_id: conversationId,
    user_id: userId,
  });

  return conversation ? conversation.messages : null;
};
