import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = authenticate(req, res);
  if (!user) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { user_prompt, assistant_response } = req.body;

  if (!user_prompt || !assistant_response) {
    return res.status(400).json({ message: 'User prompt and assistant response are required.' });
  }

  try {
    const client = await clientPromise;
    const db = client.db('your-database-name');
    const fewShotExamples = db.collection('few_shot_examples');

    await fewShotExamples.insertOne({
      user_id: user.id,
      user_prompt,
      assistant_response,
      created_at: new Date(),
    });

    res.status(200).json({ message: 'Few-shot example added successfully.' });
  } catch (error: any) {
    console.error('Error adding few-shot example:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
}
