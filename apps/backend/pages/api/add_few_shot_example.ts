// File: apps/backend/pages/api/add_few_shot_example.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { apiHandler } from '@/utils/apiHandler';

interface AddFewShotRequest extends NextApiRequest {
  body: {
    user_prompt: string;
    assistant_response: string;
  };
}

const handler = async (req: AddFewShotRequest, res: NextApiResponse) => {
  const user = authenticate(req, res);
  if (!user) {
    throw { statusCode: 401, message: 'Unauthorized' };
  }

  if (req.method !== 'POST') {
    throw { statusCode: 405, message: `Method ${req.method} Not Allowed` };
  }

  const { user_prompt, assistant_response } = req.body;

  if (!user_prompt || !assistant_response) {
    throw { statusCode: 400, message: 'User prompt and assistant response are required.' };
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

export default apiHandler(handler);
