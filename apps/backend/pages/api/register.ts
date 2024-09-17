import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import clientPromise from '@/utils/mongodb';
import { generateToken, setTokenCookie } from '@/utils/auth';
import { apiHandler } from '@/utils/apiHandler';

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
    throw { statusCode: 405, message: `Method ${req.method} Not Allowed` };
  }

  const { email, password } = req.body;

  if (!email || !password) {
    throw { statusCode: 400, message: 'Email and password are required.' };
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  const users = db.collection('users');

  const existingUser = await users.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw { statusCode: 409, message: 'Email is already registered.' };
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
};

export default apiHandler(handler);