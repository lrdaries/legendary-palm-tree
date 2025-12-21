// test/health.test.js
const request = require('supertest');
const app = require('../server');
const { connectDB, disconnectDB } = require('../config/database');

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('Health Check', () => {
  it('should return 200 and server status', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});