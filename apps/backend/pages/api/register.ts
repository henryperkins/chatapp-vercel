import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/utils/mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { errorHandler } from '@/middleware/errorHandler';

interface RegisterRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
  };
}

const handler = async (req: RegisterRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { email, password } = req.body;

  if (!email || !password) {
    const error = new Error('Email and password are required.');
    (error as any).status = 400;
    throw error;
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  const users = db.collection('users');

  const existingUser = await users.findOne({ email });
  if (existingUser) {
    const error = new Error('Email is already registered.');
    (error as any).status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await users.insertOne({
    email,
    passwordHash,
    created_at: new Date(),
  });

  const token = jwt.sign({ id: newUser.insertedId, email }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '7d',
  });

  res.status(201).json({ token });
};

export default errorHandler(handler);
