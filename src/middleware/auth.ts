import { NextApiRequest, NextApiResponse } from 'next';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import jwt, { JwtPayload } from 'jsonwebtoken';

import { JWT_SECRET } from '@/config/env';

interface AuthenticatedRequest extends NextApiRequest {
  userId?: number;
}

/**
 * Middleware to protect routes with authentication.
 * Verifies the JWT token in the authorization header.
 * Calls the handler with the user's ID if valid.
 */
export function withAuth(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    userId: number
  ) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined');
      return res.status(500).json({ message: 'Internal server error' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
        userId: number;
      };

      // Ensure the userId is present in the decoded token
      if (typeof decoded.userId !== 'number') {
        throw new Error('Invalid token payload');
      }

      return handler(req, res, decoded.userId);
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

/**
 * Middleware for validating login input.
 * Ensures username and password meet specified criteria.
 * Returns a 400 error with details if validation fails.
 */
export function validateLoginInput(req: NextApiRequest, res: NextApiResponse) {
  return [
    body('username').isLength({ min: 3, max: 30 }).trim().escape(),
    body('password').isLength({ min: 8 }).trim().escape(),
    (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ error: 'Invalid input', details: errors.array() });
      }
      next();
    }
  ];
}

/**
 * Generates a unique key for each IP address based on the request headers.
 */
const keyGenerator = (req: NextApiRequest) => {
  // Try to extract the IP from the request headers
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  if (Array.isArray(ip)) return ip[0]; // In case x-forwarded-for returns multiple IPs
  return ip || ''; // Fallback to empty string if no IP is found
};

/**
 * Rate limiter middleware to limit login attempts from a single IP.
 * Limits to 5 requests per 15 minutes.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message:
    'Too many login attempts from this IP, please try again after 15 minutes',
  headers: true,
  keyGenerator
});
