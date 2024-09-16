import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/utils/mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { errorHandler } from '@/middleware/errorHandler';

interface LoginRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
  };
}

const handler = async (req: LoginRequest, res: NextApiResponse) => {
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

  const user = await users.findOne({ email });
  if (!user) {
    const error = new Error('Invalid email or password.');
    (error as any).status = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid email or password.');
    (error as any).status = 401;
    throw error;
  }

  const token = jwt.sign({ id: user._id, email }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '7d',
  });

  res.status(200).json({ token });
};

export default errorHandler(handler);
