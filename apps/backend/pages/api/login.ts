import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import clientPromise from '@/utils/mongodb';
import { generateToken, setTokenCookie } from '@/utils/auth';
import { apiHandler } from '@/utils/apiHandler';

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
    throw { statusCode: 405, message: `Method ${req.method} Not Allowed` };
  }

  const { email, password } = req.body;

  if (!email || !password) {
    throw { statusCode: 400, message: 'Email and password are required.' };
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME);
  const users = db.collection('users');

  const user = await users.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw { statusCode: 401, message: 'Invalid email or password.' };
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw { statusCode: 401, message: 'Invalid email or password.' };
  }

  const token = generateToken({ id: user._id.toString(), email: email.toLowerCase() });
  setTokenCookie(res, token);

  res.status(200).json({ message: 'Logged in successfully.' });
};

export default apiHandler(handler);
