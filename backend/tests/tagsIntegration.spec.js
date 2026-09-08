const request = require('supertest');
const express = require('express');
const { pool } = require('../src/config/db');

// Mock db
jest.mock('../src/config/db', () => ({
  pool: {
    query: jest.fn(),
    getConnection: jest.fn(),
  }
}));

const galleryImageController = require('../src/controllers/galleryImage.controller');
const tagController = require('../src/controllers/tag.controller');

const app = express();
app.use(express.json());

app.get('/api/v1/tags', tagController.getAll);
app.get('/api/v1/gallery-images/:id', galleryImageController.getGalleryImageById);
app.post('/api/v1/gallery-images', galleryImageController.createGalleryImage);
app.patch('/api/v1/gallery-images/:id', galleryImageController.updateGalleryImage);

describe('System-Wide Hashtag Integration', () => {
  let mockConnection;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConnection = {
      query: jest.fn(),
      beginTransaction: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
      release: jest.fn(),
    };

    pool.getConnection.mockResolvedValue(mockConnection);
  });

  describe('TAG-SYS-01, 02, 03: GET /tags', () => {
    it('TAG-SYS-01 returns imageCount, TAG-SYS-02 counts DISTINCT, TAG-SYS-03 0 for unused', async () => {
      pool.query.mockResolvedValueOnce([
        [
          { tagId: 1, tagName: 'Portrait', imageCount: 12 },
          { tagId: 2, tagName: 'UnusedTag', imageCount: 0 }
        ]
      ]);

      const res = await request(app).get('/api/v1/tags');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        { tagId: 1, tagName: 'Portrait', imageCount: 12 },
        { tagId: 2, tagName: 'UnusedTag', imageCount: 0 }
      ]);

      expect(pool.query.mock.calls[0][0]).toContain('COUNT(DISTINCT git.imageId) AS imageCount');
    });
  });

  describe('TAG-SYS-04: Admin Gallery create accepts existing tagIds', () => {
    it('creates gallery image and associates tagIds', async () => {
      mockConnection.query.mockResolvedValueOnce([[{ tagId: 1 }]]); // validate tag exists IN
      mockConnection.query.mockResolvedValueOnce([{ insertId: 100 }]); // Insert gallery image
      mockConnection.query.mockResolvedValueOnce([]); // Insert galleryImageTags

      const res = await request(app)
        .post('/api/v1/gallery-images')
        .send({
          workTypeId: 1,
          imageUrl: 'http://example.com/img.jpg',
          tagIds: [1]
        });

      expect(res.status).toBe(201);
      expect(mockConnection.query).toHaveBeenCalledWith(
        'INSERT IGNORE INTO galleryImageTags (imageId, tagId) VALUES (?, ?)',
        [100, 1]
      );
    });
  });

  describe('TAG-SYS-05: Admin Gallery update synchronizes tagIds', () => {
    it('clears old tags and inserts new ones', async () => {
      mockConnection.query.mockResolvedValueOnce([[{ imageId: 100 }]]); // Check image exists
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Update galleryImages
      mockConnection.query.mockResolvedValueOnce([[{ tagId: 4 }]]); // Validate tag IN
      mockConnection.query.mockResolvedValueOnce([]); // Delete old tags
      mockConnection.query.mockResolvedValueOnce([]); // Insert new tag

      const res = await request(app)
        .patch('/api/v1/gallery-images/100')
        .send({
          workTypeId: 1,
          imageUrl: 'http://example.com/img2.jpg',
          tagIds: [4]
        });

      expect(res.status).toBe(200);
      expect(mockConnection.query).toHaveBeenCalledWith(
        'DELETE FROM galleryImageTags WHERE imageId = ?',
        ['100']
      );
      expect(mockConnection.query).toHaveBeenCalledWith(
        'INSERT IGNORE INTO galleryImageTags (imageId, tagId) VALUES (?, ?)',
        ['100', 4]
      );
    });
  });

  describe('TAG-SYS-06: Unknown tagId is rejected', () => {
    it('rejects unknown tagIds during create with 400 and performs no mutation', async () => {
      mockConnection.query.mockResolvedValueOnce([[]]); // tagId 999 DOES NOT exist! Returns empty array for IN query.

      const res = await request(app)
        .post('/api/v1/gallery-images')
        .send({
          workTypeId: 1,
          imageUrl: 'http://example.com/img.jpg',
          tagIds: [999]
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("One or more tagIds are invalid");

      const insertGalleryCall = mockConnection.query.mock.calls.some(call => call[0].includes('INSERT INTO galleryImages'));
      const insertTagCall = mockConnection.query.mock.calls.some(call => call[0].includes('INSERT IGNORE INTO galleryImageTags'));

      expect(insertGalleryCall).toBe(false);
      expect(insertTagCall).toBe(false);
    });
  });

  describe('TAG-SYS-07: Duplicate tagIds do not create duplicate associations', () => {
    it('normalizes duplicate tagIds safely', async () => {
      mockConnection.query.mockResolvedValueOnce([[{ tagId: 2 }]]); // Validated length = 1
      mockConnection.query.mockResolvedValueOnce([{ insertId: 102 }]);

      const res = await request(app)
        .post('/api/v1/gallery-images')
        .send({
          workTypeId: 1,
          imageUrl: 'http://example.com/img.jpg',
          tagIds: [2, 2, 2]
        });

      expect(res.status).toBe(201);

      const insertCalls = mockConnection.query.mock.calls.filter(call => call[0].includes('INSERT IGNORE INTO galleryImageTags'));
      expect(insertCalls.length).toBe(1); // Only inserted once
    });
  });

  describe('TAG-SYS-08: Gallery create/update do not INSERT INTO tags', () => {
    it('does not execute INSERT INTO tags on create or update', async () => {
      mockConnection.query.mockResolvedValueOnce([[{ tagId: 3 }]]); // Validated length = 1
      mockConnection.query.mockResolvedValueOnce([{ insertId: 103 }]);

      await request(app)
        .post('/api/v1/gallery-images')
        .send({
          workTypeId: 1,
          imageUrl: 'http://example.com/img.jpg',
          tagIds: [3]
        });

      expect(mockConnection.query.mock.calls.some(call => call[0].includes('INSERT IGNORE INTO tags'))).toBe(false);
      expect(mockConnection.query.mock.calls.some(call => call[0].includes('INSERT INTO tags'))).toBe(false);

      jest.clearAllMocks();

      mockConnection.query.mockResolvedValueOnce([[{ imageId: 103 }]]); // check exists
      mockConnection.query.mockResolvedValueOnce([[{ tagId: 4 }]]); // Validate length = 1
      mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Update

      await request(app)
        .patch('/api/v1/gallery-images/103')
        .send({
          workTypeId: 1,
          imageUrl: 'http://example.com/img.jpg',
          tagIds: [4]
        });

      expect(mockConnection.query.mock.calls.some(call => call[0].includes('INSERT IGNORE INTO tags'))).toBe(false);
      expect(mockConnection.query.mock.calls.some(call => call[0].includes('INSERT INTO tags'))).toBe(false);
    });
  });

  describe('TAG-SYS-09: Gallery read returns tagIds: number[]', () => {
    it('returns empty array when no tags', async () => {
      pool.query.mockResolvedValueOnce([
        [{ imageId: 1, tagIds: null }] // DB returns null for GROUP_CONCAT when empty
      ]);

      const res = await request(app).get('/api/v1/gallery-images/1');
      expect(res.status).toBe(200);
      expect(res.body.tagIds).toEqual([]);
    });

    it('returns number array when tags exist', async () => {
      pool.query.mockResolvedValueOnce([
        [{ imageId: 1, tagIds: "1,5,3" }] // DB returns comma separated string
      ]);

      const res = await request(app).get('/api/v1/gallery-images/1');
      expect(res.status).toBe(200);
      expect(res.body.tagIds).toEqual([1, 5, 3]);
    });
  });

  describe('TAG-SYS-10: Existing Gallery hashtag filtering still resolves', () => {
    it('executes a proper JOIN query for hashtag filtering', async () => {
      const GalleryImageModel = require('../src/models/galleryImage.model');
      pool.query.mockResolvedValueOnce([[{ imageId: 1, imageTags: "TestTag" }]]);

      await GalleryImageModel.findAll({ tag: 'TestTag' });

      const executedQuery = pool.query.mock.calls[0][0];
      const queryParams = pool.query.mock.calls[0][1];

      // Verify the query includes the necessary JOINS and WHERE clause
      expect(executedQuery).toContain('FROM galleryImageTags git2');
      expect(executedQuery).toContain('JOIN tags t2 ON git2.tagId = t2.tagId');
      expect(executedQuery).toContain('WHERE t2.tagName = ?');
      expect(queryParams).toContain('TestTag');
    });
  });

  describe('TAG-SYNC: Editor Gallery hashtag synchronization', () => {
    const orderController = require('../src/controllers/orderController');
    const syncApp = express();
    syncApp.use(express.json());
    syncApp.use((req, res, next) => {
      req.session = { userId: 1, userRole: 'editor' };
      next();
    });
    syncApp.patch('/api/v1/orders/:id/images/:imageId/gallery-metadata', orderController.updateGalleryMetadata);

    it('TAG-SYNC-01: Completed order + Gallery pending -> orderImageTags and galleryImageTags updated', async () => {
      pool.query.mockResolvedValueOnce([[{ orderId: 14, editorId: 1 }]]);
      pool.query.mockResolvedValueOnce([[{ orderImageId: 100, imageType: 'selected_final', imageUrl: 'img.jpg' }]]);

      mockConnection.query.mockResolvedValueOnce([[{ tagId: 1 }, { tagId: 2 }]]); // Valid tags
      mockConnection.query.mockResolvedValueOnce([]); // DELETE orderImageTags
      mockConnection.query.mockResolvedValueOnce([]); // INSERT orderImageTags
      mockConnection.query.mockResolvedValueOnce([]); // INSERT orderImageTags
      mockConnection.query.mockResolvedValueOnce([[{ imageUrl: 'img.jpg' }]]); // SELECT imageUrl
      mockConnection.query.mockResolvedValueOnce([[{ imageId: 50, imageApprovalStatus: 'pending' }]]); // SELECT gallery image
      mockConnection.query.mockResolvedValueOnce([]); // DELETE galleryImageTags
      mockConnection.query.mockResolvedValueOnce([]); // INSERT galleryImageTags
      mockConnection.query.mockResolvedValueOnce([]); // INSERT galleryImageTags

      const res = await request(syncApp)
        .patch('/api/v1/orders/14/images/100/gallery-metadata')
        .send({ tagIds: [1, 2] });

      expect(res.status).toBe(200);
      expect(mockConnection.query.mock.calls.some(call => call[0].includes('DELETE FROM galleryImageTags WHERE imageId = ?'))).toBe(true);
      expect(mockConnection.query.mock.calls.filter(call => call[0].includes('INSERT IGNORE INTO galleryImageTags')).length).toBe(2);
    });

    it('TAG-SYNC-02: Pending Gallery: remove one previously selected tag', async () => {
      pool.query.mockResolvedValueOnce([[{ orderId: 14, editorId: 1 }]]);
      pool.query.mockResolvedValueOnce([[{ orderImageId: 100, imageType: 'selected_final', imageUrl: 'img.jpg' }]]);

      mockConnection.query.mockResolvedValueOnce([[{ tagId: 1 }]]); // Valid tag
      mockConnection.query.mockResolvedValueOnce([]); // DELETE orderImageTags
      mockConnection.query.mockResolvedValueOnce([]); // INSERT orderImageTags
      mockConnection.query.mockResolvedValueOnce([[{ imageUrl: 'img.jpg' }]]); // SELECT imageUrl
      mockConnection.query.mockResolvedValueOnce([[{ imageId: 50, imageApprovalStatus: 'pending' }]]); // SELECT gallery image
      mockConnection.query.mockResolvedValueOnce([]); // DELETE galleryImageTags
      mockConnection.query.mockResolvedValueOnce([]); // INSERT galleryImageTags

      const res = await request(syncApp)
        .patch('/api/v1/orders/14/images/100/gallery-metadata')
        .send({ tagIds: [1] });

      expect(res.status).toBe(200);
      expect(mockConnection.query.mock.calls.filter(call => call[0].includes('INSERT IGNORE INTO galleryImageTags')).length).toBe(1);
    });

    it('TAG-SYNC-03: Pending Gallery: duplicate tagIds in request', async () => {
      pool.query.mockResolvedValueOnce([[{ orderId: 14, editorId: 1 }]]);
      pool.query.mockResolvedValueOnce([[{ orderImageId: 100, imageType: 'selected_final', imageUrl: 'img.jpg' }]]);

      mockConnection.query.mockResolvedValueOnce([[{ tagId: 1 }]]); // Set removes duplicate, so length 1
      mockConnection.query.mockResolvedValueOnce([]); // DELETE orderImageTags
      mockConnection.query.mockResolvedValueOnce([]); // INSERT orderImageTags
      mockConnection.query.mockResolvedValueOnce([[{ imageUrl: 'img.jpg' }]]); // SELECT imageUrl
      mockConnection.query.mockResolvedValueOnce([[{ imageId: 50, imageApprovalStatus: 'pending' }]]); // SELECT gallery image
      mockConnection.query.mockResolvedValueOnce([]); // DELETE galleryImageTags
      mockConnection.query.mockResolvedValueOnce([]); // INSERT galleryImageTags

      const res = await request(syncApp)
        .patch('/api/v1/orders/14/images/100/gallery-metadata')
        .send({ tagIds: [1, 1, 1] });

      expect(res.status).toBe(200);
      expect(mockConnection.query.mock.calls.filter(call => call[0].includes('INSERT IGNORE INTO galleryImageTags')).length).toBe(1);
    });

    it('TAG-SYNC-04: Completed order + Gallery approved/public: galleryImageTags MUST remain unchanged', async () => {
      pool.query.mockResolvedValueOnce([[{ orderId: 14, editorId: 1 }]]);
      pool.query.mockResolvedValueOnce([[{ orderImageId: 100, imageType: 'selected_final', imageUrl: 'img.jpg' }]]);

      mockConnection.query.mockResolvedValueOnce([[{ tagId: 1 }]]); // Valid tags
      mockConnection.query.mockResolvedValueOnce([]); // DELETE orderImageTags
      mockConnection.query.mockResolvedValueOnce([]); // INSERT orderImageTags
      mockConnection.query.mockResolvedValueOnce([[{ imageUrl: 'img.jpg' }]]); // SELECT imageUrl
      mockConnection.query.mockResolvedValueOnce([[{ imageId: 50, imageApprovalStatus: 'approved' }]]); // SELECT gallery image (APPROVED)

      const res = await request(syncApp)
        .patch('/api/v1/orders/14/images/100/gallery-metadata')
        .send({ tagIds: [1] });

      expect(res.status).toBe(200);
      expect(mockConnection.query.mock.calls.some(call => call[0].includes('DELETE FROM galleryImageTags'))).toBe(false);
      expect(mockConnection.query.mock.calls.some(call => call[0].includes('INSERT IGNORE INTO galleryImageTags'))).toBe(false);
    });

    it('TAG-SYNC-05: Completed order + Gallery approved/private: galleryImageTags MUST remain unchanged', async () => {
      pool.query.mockResolvedValueOnce([[{ orderId: 14, editorId: 1 }]]);
      pool.query.mockResolvedValueOnce([[{ orderImageId: 100, imageType: 'selected_final', imageUrl: 'img.jpg' }]]);

      mockConnection.query.mockResolvedValueOnce([[{ tagId: 1 }]]); // Valid tags
      mockConnection.query.mockResolvedValueOnce([]); // DELETE orderImageTags
      mockConnection.query.mockResolvedValueOnce([]); // INSERT orderImageTags
      mockConnection.query.mockResolvedValueOnce([[{ imageUrl: 'img.jpg' }]]); // SELECT imageUrl
      mockConnection.query.mockResolvedValueOnce([[{ imageId: 50, imageApprovalStatus: 'approved' }]]); // SELECT gallery image (APPROVED)

      const res = await request(syncApp)
        .patch('/api/v1/orders/14/images/100/gallery-metadata')
        .send({ tagIds: [1] });

      expect(res.status).toBe(200);
      expect(mockConnection.query.mock.calls.some(call => call[0].includes('DELETE FROM galleryImageTags'))).toBe(false);
    });

    it('TAG-SYNC-06: No Gallery image exists yet: no Gallery error', async () => {
      pool.query.mockResolvedValueOnce([[{ orderId: 14, editorId: 1 }]]);
      pool.query.mockResolvedValueOnce([[{ orderImageId: 100, imageType: 'selected_final', imageUrl: 'img.jpg' }]]);

      mockConnection.query.mockResolvedValueOnce([[{ tagId: 1 }]]); // Valid tags
      mockConnection.query.mockResolvedValueOnce([]); // DELETE orderImageTags
      mockConnection.query.mockResolvedValueOnce([]); // INSERT orderImageTags
      mockConnection.query.mockResolvedValueOnce([[{ imageUrl: 'img.jpg' }]]); // SELECT imageUrl
      mockConnection.query.mockResolvedValueOnce([[]]); // No gallery image exists

      const res = await request(syncApp)
        .patch('/api/v1/orders/14/images/100/gallery-metadata')
        .send({ tagIds: [1] });

      expect(res.status).toBe(200);
      expect(mockConnection.query.mock.calls.some(call => call[0].includes('DELETE FROM galleryImageTags'))).toBe(false);
    });

    it('TAG-SYNC-07: Invalid Master Tag ID -> HTTP 400', async () => {
      pool.query.mockResolvedValueOnce([[{ orderId: 14, editorId: 1 }]]);
      pool.query.mockResolvedValueOnce([[{ orderImageId: 100, imageType: 'selected_final', imageUrl: 'img.jpg' }]]);

      mockConnection.query.mockResolvedValueOnce([[]]); // tag 999 does not exist

      const res = await request(syncApp)
        .patch('/api/v1/orders/14/images/100/gallery-metadata')
        .send({ tagIds: [999] });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("One or more tagIds are invalid");
      expect(mockConnection.query.mock.calls.some(call => call[0].includes('DELETE FROM orderImageTags'))).toBe(false);
      expect(mockConnection.query.mock.calls.some(call => call[0].includes('INSERT IGNORE INTO orderImageTags'))).toBe(false);
    });
  });
});
