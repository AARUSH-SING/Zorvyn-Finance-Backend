import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../common/utils/prisma';
import { config } from '../../config';
import { UnauthorizedError, ForbiddenError } from '../../common/errors';
import { JwtPayload, Role } from '../../common/types';
import { LoginInput } from './auth.schema';

export class AuthService {
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } });
    if (!user) throw new UnauthorizedError('Invalid email or password');
    if (user.status === 'INACTIVE') throw new ForbiddenError('Account is inactive');

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as string,
    } as jwt.SignOptions);

    return {
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  }
}

export const authService = new AuthService();
