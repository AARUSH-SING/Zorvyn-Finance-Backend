import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set to instantiate PrismaClient');
}

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: databaseUrl }),
});

async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const analystPassword = await bcrypt.hash('Analyst@123', 10);
  const viewerPassword = await bcrypt.hash('Viewer@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@zorvyn.dev' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@zorvyn.dev',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@zorvyn.dev' },
    update: {},
    create: {
      name: 'Analyst User',
      email: 'analyst@zorvyn.dev',
      passwordHash: analystPassword,
      role: 'ANALYST',
      status: 'ACTIVE',
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@zorvyn.dev' },
    update: {},
    create: {
      name: 'Viewer User',
      email: 'viewer@zorvyn.dev',
      passwordHash: viewerPassword,
      role: 'VIEWER',
      status: 'ACTIVE',
    },
  });

  // Create financial records
  const categories = ['Salary', 'Consulting', 'Office Supplies', 'Software', 'Marketing', 'Travel', 'Utilities', 'Equipment'];
  const records = [
    { amount: 500000, type: 'INCOME', category: 'Salary', date: new Date('2024-01-15'), description: 'January salary' },
    { amount: 250000, type: 'INCOME', category: 'Consulting', date: new Date('2024-01-20'), description: 'Client project payment' },
    { amount: 15000, type: 'EXPENSE', category: 'Office Supplies', date: new Date('2024-01-10'), description: 'Stationery and printer ink' },
    { amount: 49900, type: 'EXPENSE', category: 'Software', date: new Date('2024-01-12'), description: 'Annual IDE license' },
    { amount: 120000, type: 'EXPENSE', category: 'Marketing', date: new Date('2024-02-01'), description: 'Google Ads campaign' },
    { amount: 500000, type: 'INCOME', category: 'Salary', date: new Date('2024-02-15'), description: 'February salary' },
    { amount: 35000, type: 'EXPENSE', category: 'Travel', date: new Date('2024-02-18'), description: 'Client visit travel' },
    { amount: 8500, type: 'EXPENSE', category: 'Utilities', date: new Date('2024-02-20'), description: 'Internet bill' },
    { amount: 180000, type: 'INCOME', category: 'Consulting', date: new Date('2024-03-05'), description: 'Workshop facilitation' },
    { amount: 75000, type: 'EXPENSE', category: 'Equipment', date: new Date('2024-03-10'), description: 'Monitor purchase' },
    { amount: 500000, type: 'INCOME', category: 'Salary', date: new Date('2024-03-15'), description: 'March salary' },
    { amount: 22000, type: 'EXPENSE', category: 'Software', date: new Date('2024-03-20'), description: 'Cloud hosting monthly' },
    { amount: 500000, type: 'INCOME', category: 'Salary', date: new Date('2024-04-15'), description: 'April salary' },
    { amount: 95000, type: 'EXPENSE', category: 'Marketing', date: new Date('2024-04-10'), description: 'Social media ads' },
    { amount: 300000, type: 'INCOME', category: 'Consulting', date: new Date('2024-04-22'), description: 'Quarterly retainer' },
  ];

  for (const record of records) {
    await prisma.record.create({
      data: {
        ...record,
        createdById: admin.id,
      },
    });
  }

  console.log(`✅ Seeded ${records.length} records`);
  console.log('✅ Seeded users:');
  console.log('   admin@zorvyn.dev / Admin@123 (ADMIN)');
  console.log('   analyst@zorvyn.dev / Analyst@123 (ANALYST)');
  console.log('   viewer@zorvyn.dev / Viewer@123 (VIEWER)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
