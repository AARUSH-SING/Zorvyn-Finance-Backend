import { execSync } from 'child_process';

// Reset DB for testing
execSync('npx prisma migrate reset --force', {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: 'file:./test.db' },
});

execSync('npx tsx prisma/seed.ts', {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: 'file:./test.db' },
});

// Set test DB URL
process.env.DATABASE_URL = 'file:./test.db';
