// File: apps/backend/pages/api/add_few_shot_example.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { errorHandler } from '@/middleware/errorHandler';

interface AddFewShotRequest extends NextApiRequest {
  body: {
    user_prompt: string;
    assistant_response: string;
  };
}

const handler = async (req: AddFewShotRequest, res: NextApiResponse) => {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { user_prompt, assistant_response } = req.body;

  if (!user_prompt || !assistant_response) {
    const error = new Error('User prompt and assistant response are required.');
    (error as any).status = 400;
    throw error;
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  const fewShotExamples = db.collection('few_shot_examples');

  await fewShotExamples.insertOne({
    user_id: user.id,
    user_prompt,
    assistant_response,
    created_at: new Date(),
  });

  res.status(200).json({ message: 'Few-shot example added successfully.' });
};

export default errorHandler(handler);
