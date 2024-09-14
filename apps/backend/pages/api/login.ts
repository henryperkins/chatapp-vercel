// File: apps/backend/pages/api/login.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authenticate } from '@/utils/auth';
import clientPromise from '@/utils/mongodb';
import { User } from '@/types/models';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // If user is already authenticated, deny access to login
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

    const user = await users.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isPasswordValid = await compare(password, user.passwordHash || '');
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({ token });
  } catch (error: any) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'An error occurred.', error: error.message });
  }
}
