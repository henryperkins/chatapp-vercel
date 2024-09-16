import type { NextApiRequest, NextApiResponse } from 'next';
import { removeTokenCookie } from '@/utils/auth';
import { errorHandler } from '@/middleware/errorHandler';

interface LogoutResponse {
  message: string;
}

const handler = async (_req: NextApiRequest, res: NextApiResponse<LogoutResponse>) => {
  if (_req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: `Method ${_req.method} Not Allowed` });
    return;
  }

  removeTokenCookie(res);
  res.status(200).json({ message: 'Logged out successfully.' });
};

export default errorHandler(handler);