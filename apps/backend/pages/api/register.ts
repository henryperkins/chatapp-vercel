import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import clientPromise from '@/utils/mongodb';
import { generateToken, setTokenCookie } from '@/utils/auth';
import { errorHandler } from '@/middleware/errorHandler';

interface RegisterRequest extends NextApiRequest {
  body: {
    email: string;
    password: string;
  };
}

interface RegisterResponse {
  message: string;
}

const handler = async (req: RegisterRequest, res: NextApiResponse<RegisterResponse>) => {
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

    const existingUser = await users.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ message: 'Email is already registered.' });
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await users.insertOne({
      email: email.toLowerCase(),
      passwordHash: hashedPassword,
      createdAt: new Date(),
    });

    const token = generateToken({ id: newUser.insertedId.toString(), email: email.toLowerCase() });
    setTokenCookie(res, token);

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error: any) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Internal Server Error.' });
  }
};

export default errorHandler(handler);