import { NextApiRequest, NextApiResponse } from 'next';
import { removeTokenCookie } from '@/utils/auth';
import { apiHandler } from '@/utils/apiHandler';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    throw { statusCode: 405, message: `Method ${req.method} Not Allowed` };
  }

  removeTokenCookie(res);
  res.status(200).json({ message: 'Logged out successfully.' });
};

export default apiHandler(handler);
