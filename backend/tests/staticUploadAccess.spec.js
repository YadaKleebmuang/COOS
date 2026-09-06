jest.mock('../src/config/db', () => ({
  testConnection: jest.fn(),
  pool: {}
}));

jest.mock('../src/middlewares/rateLimit.middleware', () => ({
  globalLimiter: (_req, _res, next) => next()
}));

jest.mock('../src/routes/index.route', () => jest.fn());

const request = require('supertest');
const app = require('../src/app');

describe('legacy uploaded-file static access', () => {
  it.each([
    '/uploads/test-private.png',
    '/uploads/profiles/test-profile.png',
    '/uploads/slips/test-slip.png',
    '/uploads/sources/test-source.png',
    '/uploads/ai-generated/test-draft.png',
    '/uploads/gallery/test-gallery.png'
  ])('does not expose file bytes at %s', async (url) => {
    const response = await request(app).get(url);

    expect(response.status).not.toBe(200);
  });
});
