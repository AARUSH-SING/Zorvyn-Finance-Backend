import prisma from '../../common/utils/prisma';
import { NotFoundError } from '../../common/errors';
import { CreateRecordInput, UpdateRecordInput, ListRecordsQuery } from './record.schema';
import { Record } from '@prisma/client';

export class RecordService {
  async create(input: CreateRecordInput, userId: string) {
    const record = await prisma.record.create({
      data: {
        amount: input.amount,
        type: input.type,
        category: input.category,
        date: new Date(input.date),
        description: input.description,
        createdById: userId,
      },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });

    await this.logAudit('CREATE', 'RECORD', record.id, userId);
    return record;
  }

  async findAll(query: ListRecordsQuery) {
    const where: Prisma.RecordWhereInput = { deletedAt: null };

    if (query.type) where.type = query.type;
    if (query.category) where.category = query.category;
    if (query.createdBy) where.createdById = query.createdBy;
    if (query.dateFrom || query.dateTo) {
      where.date = {};
      if (query.dateFrom) where.date.gte = new Date(query.dateFrom);
      if (query.dateTo) where.date.lte = new Date(query.dateTo);
    }

    const [records, total] = await Promise.all([
      prisma.record.findMany({
        where,
        include: { createdBy: { select: { id: true, name: true } } },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.record.count({ where }),
    ]);

    return {
      records,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findById(id: string) {
    const record = await prisma.record.findFirst({
      where: { id, deletedAt: null },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    });
    if (!record) throw new NotFoundError('Record not found');
    return record;
  }

  async update(id: string, input: UpdateRecordInput, userId: string) {
    await this.findById(id);
    const data: Prisma.RecordUpdateInput = { ...input };
    if (input.date) data.date = new Date(input.date);

    const record = await prisma.record.update({
      where: { id },
      data,
      include: { createdBy: { select: { id: true, name: true } } },
    });

    await this.logAudit('UPDATE', 'RECORD', id, userId, JSON.stringify(input));
    return record;
  }

  async softDelete(id: string, userId: string) {
    await this.findById(id);
    await prisma.record.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.logAudit('DELETE', 'RECORD', id, userId);
  }

  private async logAudit(action: string, entity: string, entityId: string, userId: string, details?: string) {
    await prisma.auditLog.create({
      data: { action, entity, entityId, userId, details },
    });
  }
}

export const recordService = new RecordService();
