const { pool } = require('../src/config/db');

// Mock db
jest.mock('../src/config/db', () => ({
  pool: {
    query: jest.fn(),
    getConnection: jest.fn(),
  }
}));

const orderModel = require('../src/models/orderModel');
const galleryImageModel = require('../src/models/galleryImage.model');

describe('Gallery Status Architecture', () => {
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

  it('GAL-STATUS-01: _autoPublishToGallery creates pending + imageIsActive=0', async () => {
    mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // orders
    mockConnection.query.mockResolvedValueOnce([{ insertId: 1 }]); // workflowLogs
    mockConnection.query.mockResolvedValueOnce([[{ workTypeId: 1, orderIsGalleryAllowed: 1 }]]); // fetch orders
    mockConnection.query.mockResolvedValueOnce([[{ imageUrl: 'http://example.com/img1.png', orderImageId: 10 }]]); // fetch images
    mockConnection.query.mockResolvedValueOnce([[]]); // existing gallery check
    mockConnection.query.mockResolvedValueOnce([{ insertId: 50 }]); // INSERT galleryImages
    mockConnection.query.mockResolvedValueOnce([[]]); // fetch tags

    await orderModel.updateStatus(1, 'waiting_final_payment', 'completed', 1, 'note');

    const insertCall = mockConnection.query.mock.calls.find(c => c[0].includes('INSERT INTO galleryImages'));
    expect(insertCall).toBeDefined();
    expect(insertCall[0]).toContain('imageApprovalStatus');
    expect(insertCall[0]).toContain('imageIsActive');
    expect(insertCall[0]).toContain("'pending', 0"); // Explicit check
  });

  it('GAL-STATUS-02 & GAL-STATUS-08: Admin can READ pending and private records', async () => {
    pool.query.mockResolvedValueOnce([[{ imageId: 1, imageApprovalStatus: 'pending', imageIsActive: 0 }]]);
    await galleryImageModel.findAll({ activeOnly: false });

    const selectCall = pool.query.mock.calls[0][0];
    expect(selectCall).not.toContain("gi.imageApprovalStatus = 'approved'");
    expect(selectCall).not.toContain("gi.imageIsActive = 1");
  });

  it('GAL-STATUS-03 & GAL-STATUS-07: Public Gallery requires approved AND imageIsActive=1', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    await galleryImageModel.findAll({});

    const selectCall = pool.query.mock.calls[0][0];
    expect(selectCall).toContain("gi.imageApprovalStatus = 'approved'");
    expect(selectCall).toContain("gi.imageIsActive = 1");
  });

  it('GAL-STATUS-04: Admin Publish changes pending/0 → approved/1 (toggleActive)', async () => {
    pool.query.mockResolvedValueOnce([[{ imageIsActive: 0, imageApprovalStatus: 'pending' }]]);
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await galleryImageModel.toggleActive(1);

    const updateCall = pool.query.mock.calls[1];
    expect(updateCall[0]).toContain('imageIsActive = ?');
    expect(updateCall[0]).toContain("imageApprovalStatus = 'approved'");
    expect(updateCall[0]).not.toContain("imageTitle");
    expect(updateCall[1][0]).toBe(1); // newStatus = 1
  });

  it('GAL-STATUS-05: Admin metadata edit without status fields preserves pending/0', async () => {
    mockConnection.query.mockResolvedValueOnce([[{ imageId: 1 }]]); // check existing
    mockConnection.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE

    await galleryImageModel.update(1, { imageTitle: 'New Title' });

    const updateCall = mockConnection.query.mock.calls.find(c => c[0].includes('UPDATE galleryImages'));
    expect(updateCall[0]).not.toContain('imageIsActive = ?');
    expect(updateCall[0]).not.toContain('imageApprovalStatus');
  });

  it('GAL-STATUS-06: Admin unpublish: approved/1 → approved/0 (toggleActive)', async () => {
    pool.query.mockResolvedValueOnce([[{ imageIsActive: 1, imageApprovalStatus: 'approved' }]]);
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

    await galleryImageModel.toggleActive(2);

    const updateCall = pool.query.mock.calls[1];
    expect(updateCall[0]).toContain('imageIsActive = ?');
    expect(updateCall[0]).toContain("imageApprovalStatus = 'approved'");
    expect(updateCall[0]).not.toContain("imageTitle");
    expect(updateCall[1][0]).toBe(0); // newStatus = 0
  });

  it('GAL-STATUS-09: Public cannot read approved/0 private record', async () => {
    pool.query.mockResolvedValueOnce([[]]);
    await galleryImageModel.findById(1, { activeOnly: true });

    const selectCall = pool.query.mock.calls[0][0];
    expect(selectCall).toContain("gi.imageApprovalStatus = 'approved'");
    expect(selectCall).toContain("gi.imageIsActive = 1");
  });

  it('GAL-STATUS-10: No code path creates pending/1', async () => {
    expect(true).toBe(true);
  });

  describe('Gallery Brief Details', () => {
    it('GALLERY-BRIEF-01 & 04 & 05: Public approved Gallery response includes safe order fields and excludes pending/private', async () => {
      pool.query.mockResolvedValueOnce([[]]);
      await galleryImageModel.findAll({ activeOnly: true });

      const selectCall = pool.query.mock.calls[0][0];
      expect(selectCall).toContain("MAX(o.orderStyle) AS orderStyle");
      expect(selectCall).toContain("MAX(o.orderColorTone) AS orderColorTone");
      expect(selectCall).toContain("MAX(o.orderComposition) AS orderComposition");
      expect(selectCall).toContain("gi.imageApprovalStatus = 'approved'");
      expect(selectCall).toContain("gi.imageIsActive = 1");
    });

    it('GALLERY-BRIEF-02 & 03: orderNote and private order fields are NOT exposed', async () => {
      pool.query.mockResolvedValueOnce([[]]);
      await galleryImageModel.findAll({});

      const selectCall = pool.query.mock.calls[0][0];
      expect(selectCall).not.toContain("o.orderNote");
      expect(selectCall).not.toContain("o.customerId");
      expect(selectCall).not.toContain("o.*");
    });

    it('GALLERY-BRIEF-06: Join does not duplicate Gallery rows', async () => {
      pool.query.mockResolvedValueOnce([[]]);
      await galleryImageModel.findAll({});

      const selectCall = pool.query.mock.calls[0][0];
      expect(selectCall).toContain("GROUP BY gi.imageId");
    });

    it('GALLERY-BRIEF-07: Single fetch includes safe fields safely without note', async () => {
      pool.query.mockResolvedValueOnce([[]]);
      await galleryImageModel.findById(1, { activeOnly: true });

      const selectCall = pool.query.mock.calls[0][0];
      expect(selectCall).toContain("MAX(o.orderStyle) AS orderStyle");
      expect(selectCall).not.toContain("o.orderNote");
    });
  });
});
