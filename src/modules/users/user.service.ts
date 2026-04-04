import bcrypt from 'bcryptjs';
import prisma from '../../common/utils/prisma';
import { NotFoundError, ConflictError } from '../../common/errors';
import { CreateUserInput, UpdateUserInput, UpdateStatusInput } from './user.schema';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
};

export class UserService {
  async create(input: CreateUserInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await bcrypt.hash(input.password, 10);
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role,
      },
      select: userSelect,
    });
  }

  async findAll() {
    return prisma.user.findMany({ select: userSelect, orderBy: { createdAt: 'desc' } });
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({ where: { id }, select: userSelect });
    if (!user) throw new NotFoundError('User not found');
    return user;
  }

  async update(id: string, input: UpdateUserInput) {
    await this.findById(id);
    if (input.email) {
      const existing = await prisma.user.findFirst({ where: { email: input.email, NOT: { id } } });
      if (existing) throw new ConflictError('Email already in use');
    }
    return prisma.user.update({ where: { id }, data: input, select: userSelect });
  }

  async updateStatus(id: string, input: UpdateStatusInput) {
    await this.findById(id);
    return prisma.user.update({ where: { id }, data: { status: input.status }, select: userSelect });
  }
}

export const userService = new UserService();
