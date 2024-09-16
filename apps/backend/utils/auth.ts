import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { serialize, parse } from 'cookie';

interface UserPayload {
  id: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const COOKIE_NAME = process.env.COOKIE_NAME || 'chatapp_token';
const COOKIE_EXPIRES_IN = parseInt(process.env.COOKIE_EXPIRES_IN || '7', 10);
const COOKIE_SECURE = process.env.COOKIE_SECURE === 'true';

export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function setTokenCookie(res: NextApiResponse, token: string): void {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: COOKIE_SECURE, // Set to true in production
    sameSite: 'strict',
    path: '/',
    maxAge: COOKIE_EXPIRES_IN * 24 * 60 * 60, // Convert days to seconds
  });

  res.setHeader('Set-Cookie', cookie);
}

export function removeTokenCookie(res: NextApiResponse): void {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: COOKIE_SECURE, // Set to true in production
    sameSite: 'strict',
    path: '/',
    expires: new Date(0),
  });

  res.setHeader('Set-Cookie', cookie);
}

export function getTokenFromCookie(req: NextApiRequest): string | null {
  const cookies = req.headers.cookie;
  if (!cookies) return null;

  const parsedCookies = parse(cookies);
  return parsedCookies[COOKIE_NAME] || null;
}

export function authenticate(req: NextApiRequest, res: NextApiResponse): UserPayload | null {
  const token = getTokenFromCookie(req);
  if (!token) {
    res.status(401).json({ message: 'Authentication token missing.' });
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired authentication token.' });
    return null;
  }
}