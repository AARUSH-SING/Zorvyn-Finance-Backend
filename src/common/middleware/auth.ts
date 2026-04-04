import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { JwtPayload } from '../types';
import { UnauthorizedError, ForbiddenError } from '../errors';
import prisma from '../utils/prisma';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid authorization header');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Check if user is still active
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || user.status === 'INACTIVE') {
      throw new ForbiddenError('Account is inactive');
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      return next(error);
    }
    next(new UnauthorizedError('Invalid or expired token'));
  }
}
