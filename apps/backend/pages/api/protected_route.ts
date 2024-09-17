import { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/middleware/auth';
import { apiHandler } from '@/utils/apiHandler';

interface ProtectedRouteResponse {
  message: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<ProtectedRouteResponse>) => {
  authenticate(req, res, () => {
    res.status(200).json({ message: 'You have access to this protected route' });
  });
};

export default apiHandler(handler);