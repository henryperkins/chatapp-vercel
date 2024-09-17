import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/utils/auth';

export const authenticate = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw { statusCode: 401, message: 'Authentication required' };
    }

    const decoded = verifyToken(token);

    // Attach user info to the request object
    (req as any).user = decoded;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};