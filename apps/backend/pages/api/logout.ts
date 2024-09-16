import { NextApiRequest, NextApiResponse } from 'next';
import { removeTokenCookie } from '@/utils/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    return;
  }

  removeTokenCookie(res);
  res.status(200).json({ message: 'Logged out successfully.' });
}
