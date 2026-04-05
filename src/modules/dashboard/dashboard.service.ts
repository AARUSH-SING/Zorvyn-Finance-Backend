import prisma from '../../common/utils/prisma';
import { Record } from '@prisma/client';

const activeRecordsWhere = { deletedAt: null };

export class DashboardService {
  async getSummary() {
    const [incomeResult, expenseResult] = await Promise.all([
      prisma.record.aggregate({
        where: { ...activeRecordsWhere, type: 'INCOME' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.record.aggregate({
        where: { ...activeRecordsWhere, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpenses = expenseResult._sum.amount || 0;

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      totalIncomeCount: incomeResult._count,
      totalExpenseCount: expenseResult._count,
    };
  }

  async getCategoryBreakdown() {
    const records = await prisma.record.groupBy({
      by: ['category', 'type'],
      where: activeRecordsWhere,
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    });

    return records.map((r: { category: string; type: string; _sum: { amount: number | null }; _count: number }) => ({
      category: r.category,
      type: r.type,
      total: r._sum.amount || 0,
      count: r._count,
    }));
  }

  async getRecentActivity(limit = 10) {
    return prisma.record.findMany({
      where: activeRecordsWhere,
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getTrends(groupBy: 'month' | 'week' = 'month') {
    const records = await prisma.record.findMany({
      where: activeRecordsWhere,
      select: { amount: true, type: true, date: true },
      orderBy: { date: 'asc' },
    });

    const grouped = new Map<string, { income: number; expense: number }>();

    for (const record of records) {
      const date = new Date(record.date);
      let key: string;

      if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        // ISO week
        const startOfYear = new Date(date.getFullYear(), 0, 1);
        const weekNum = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
        key = `${date.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
      }

      const existing = grouped.get(key) || { income: 0, expense: 0 };
      if (record.type === 'INCOME') {
        existing.income += record.amount;
      } else {
        existing.expense += record.amount;
      }
      grouped.set(key, existing);
    }

    return Array.from(grouped.entries()).map(([period, data]) => ({
      period,
      income: data.income,
      expense: data.expense,
      net: data.income - data.expense,
    }));
  }
}

export const dashboardService = new DashboardService();
