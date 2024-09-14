import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

interface User {
  id: string;
  email: string;
}

export function authenticate(req: NextApiRequest, res: NextApiResponse): User | null {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Authorization token missing.' });
    return null;
  }

  try {
    const secret = process.env.JWT_SECRET || 'your_jwt_secret';
    const decoded = jwt.verify(token, secret) as User;
    return decoded;
  } catch (error) {
    res.status(401).json({ message: 'Invalid authorization token.' });
    return null;
  }
}
