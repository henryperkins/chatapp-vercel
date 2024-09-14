// File: apps/backend/pages/api/register.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { hash } from 'bcrypt';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { User } from '@/types/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // If user is already authenticated, deny access to register
  const existingUser = authenticate(req, res, false);
  if (existingUser) {
    return res.status(403).json({ message: 'Already authenticated.' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const users = db.collection<User>('users');

    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const passwordHash = await hash(password, 10);

    const newUser: User = {
      id: '', // MongoDB will generate _id
      email,
      passwordHash,
      created_at: new Date(),
    };

    const result = await users.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertedId.toString(), email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({ token });
  } catch (error: any) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
}
