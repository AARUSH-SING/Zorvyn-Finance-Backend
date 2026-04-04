import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';

let adminToken: string;
let viewerToken: string;
let analystToken: string;

describe('Auth', () => {
  it('should login admin successfully', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@zorvyn.dev',
      password: 'Admin@123',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    adminToken = res.body.data.token;
  });

  it('should login viewer successfully', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'viewer@zorvyn.dev',
      password: 'Viewer@123',
    });
    expect(res.status).toBe(200);
    viewerToken = res.body.data.token;
  });

  it('should login analyst successfully', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'analyst@zorvyn.dev',
      password: 'Analyst@123',
    });
    expect(res.status).toBe(200);
    analystToken = res.body.data.token;
  });

  it('should reject invalid credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@zorvyn.dev',
      password: 'wrong',
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should reject missing fields', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({});
    expect(res.status).toBe(400);
  });
});

describe('RBAC', () => {
  beforeAll(async () => {
    if (!adminToken) {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@zorvyn.dev',
        password: 'Admin@123',
      });
      adminToken = res.body.data.token;
    }
    if (!viewerToken) {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'viewer@zorvyn.dev',
        password: 'Viewer@123',
      });
      viewerToken = res.body.data.token;
    }
  });

  it('should allow admin to list users', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it('should deny viewer from listing users', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(403);
  });

  it('should allow viewer to read records', async () => {
    const res = await request(app)
      .get('/api/v1/records')
      .set('Authorization', `Bearer ${viewerToken}`);
    expect(res.status).toBe(200);
  });

  it('should deny viewer from creating records', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({ amount: 1000, type: 'INCOME', category: 'Test', date: '2024-01-01' });
    expect(res.status).toBe(403);
  });

  it('should allow admin to create records', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 5000, type: 'INCOME', category: 'Bonus', date: '2024-05-01', description: 'Test record' });
    expect(res.status).toBe(201);
    expect(res.body.data.amount).toBe(5000);
  });
});

describe('Dashboard', () => {
  beforeAll(async () => {
    if (!analystToken) {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'analyst@zorvyn.dev',
        password: 'Analyst@123',
      });
      analystToken = res.body.data.token;
    }
  });

  it('should return dashboard summary', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.totalIncome).toBeDefined();
    expect(res.body.data.totalExpenses).toBeDefined();
    expect(res.body.data.netBalance).toBeDefined();
  });

  it('should return category breakdown', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/category-breakdown')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return trends', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/trends?groupBy=month')
      .set('Authorization', `Bearer ${analystToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should deny unauthenticated access', async () => {
    const res = await request(app).get('/api/v1/dashboard/summary');
    expect(res.status).toBe(401);
  });
});

describe('Validation', () => {
  beforeAll(async () => {
    if (!adminToken) {
      const res = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@zorvyn.dev',
        password: 'Admin@123',
      });
      adminToken = res.body.data.token;
    }
  });

  it('should reject record with negative amount', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: -100, type: 'INCOME', category: 'Test', date: '2024-01-01' });
    expect(res.status).toBe(400);
  });

  it('should reject record with invalid type', async () => {
    const res = await request(app)
      .post('/api/v1/records')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 100, type: 'INVALID', category: 'Test', date: '2024-01-01' });
    expect(res.status).toBe(400);
  });
});
