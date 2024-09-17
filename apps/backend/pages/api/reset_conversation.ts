import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../utils/mongodb';
import { ObjectId } from 'mongodb';
import { apiHandler } from '../../utils/apiHandler';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    throw { statusCode: 405, message: 'Method not allowed' };
  }

  const { conversation_id } = req.body;

  if (!conversation_id) {
    throw { statusCode: 400, message: 'Conversation ID is required' };
  }

  const { db } = await connectToDatabase();
  const conversationsCollection = db.collection('conversations');

  // Find the conversation and reset its messages
  const result = await conversationsCollection.updateOne(
    { _id: new ObjectId(conversation_id) },
    { $set: { messages: [] } }
  );

  if (result.modifiedCount === 0) {
    throw { statusCode: 404, message: 'Conversation not found' };
  }

  res.status(200).json({ message: 'Conversation reset successfully' });
};

export default apiHandler(handler);
