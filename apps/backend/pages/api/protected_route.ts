import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/auth';
import { errorHandler } from '@/middleware/errorHandler';

interface ProtectedRouteResponse {
  message: string;
}

const handler = async (_req: NextApiRequest, res: NextApiResponse<ProtectedRouteResponse>) => {
  const user = authenticate(_req, res);
  if (!user) return;

  res.status(200).json({ message: 'Authenticated' });
};

export default errorHandler(handler);