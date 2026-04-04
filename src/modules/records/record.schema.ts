import { z } from 'zod';

export const createRecordSchema = z.object({
  amount: z.number().int().positive('Amount must be a positive integer (in cents)'),
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.string().min(1, 'Category is required').max(50),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  description: z.string().max(500).optional(),
});

export const updateRecordSchema = z.object({
  amount: z.number().int().positive().optional(),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().min(1).max(50).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  description: z.string().max(500).optional(),
});

export const listRecordsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z.string().optional(),
  createdBy: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type CreateRecordInput = z.infer<typeof createRecordSchema>;
export type UpdateRecordInput = z.infer<typeof updateRecordSchema>;
export type ListRecordsQuery = z.infer<typeof listRecordsQuerySchema>;
