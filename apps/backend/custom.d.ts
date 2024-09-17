// apps/backend/custom.d.ts

declare module 'nextjs-cors' {
  import { NextApiRequest, NextApiResponse } from 'next';
  export default function cors(
    req: NextApiRequest,
    res: NextApiResponse,
    options: {
      origin?: string | string[];
      methods?: string | string[];
      allowedHeaders?: string | string[];
      exposedHeaders?: string | string[];
      credentials?: boolean;
      maxAge?: number;
    }
  ): Promise<void>;
}

