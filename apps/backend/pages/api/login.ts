import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import clientPromise from '@/utils/mongodb';
import { generateToken, setTokenCookie } from '@/utils/auth';
import { errorHandler } from '@/middleware/errorHandler';

interface LoginRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
  };
}

interface LoginResponse {
  message: string;
}

const handler = async (req: LoginRequest, res: NextApiResponse<LoginResponse>) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    return;
  }

  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required.' });
    return;
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const users = db.collection('users');

    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({ id: user._id.toString(), email: email.toLowerCase() });
    setTokenCookie(res, token);

    res.status(200).json({ message: 'Logged in successfully.' });
  } catch (error: any) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};

export default errorHandler(handler);
