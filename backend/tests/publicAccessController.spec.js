const GalleryImageModel = require('../src/models/galleryImage.model');
const PolicyModel = require('../src/models/policy.model');
const GalleryController = require('../src/controllers/galleryImage.controller');
const PolicyController = require('../src/controllers/policy.controller');

jest.mock('../src/models/galleryImage.model');
jest.mock('../src/models/policy.model');

const roles = [undefined, 'customer', 'editor'];

const createRequest = ({ role, query = {}, id } = {}) => ({
  query,
  params: id === undefined ? {} : { id },
  session: role ? { userId: 1, userRole: role } : undefined
});

const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn()
});

describe('Public inactive-record access control', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe.each([
    ['gallery', GalleryController.getGalleryImages, GalleryImageModel.findAll],
    ['policy', PolicyController.getPolicies, PolicyModel.findAll]
  ])('%s list', (_name, handler, findAll) => {
    it.each(roles)('keeps role %s active-only even with all=true', async (role) => {
      const req = createRequest({ role, query: { all: 'true' } });
      const res = createResponse();
      findAll.mockResolvedValue([]);

      await handler(req, res, jest.fn());

      expect(findAll).toHaveBeenCalledWith(expect.objectContaining({ activeOnly: true }));
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('allows an authenticated admin to request inactive records', async () => {
      const req = createRequest({ role: 'admin', query: { all: 'true' } });
      const res = createResponse();
      findAll.mockResolvedValue([]);

      await handler(req, res, jest.fn());

      expect(findAll).toHaveBeenCalledWith(expect.objectContaining({ activeOnly: false }));
    });
  });

  describe.each([
    ['gallery', GalleryController.getGalleryImageById, GalleryImageModel.findById],
    ['policy', PolicyController.getPolicyById, PolicyModel.findById]
  ])('%s by ID', (_name, handler, findById) => {
    it.each(roles)('hides an inactive record from role %s', async (role) => {
      const req = createRequest({ role, id: '-1' });
      const res = createResponse();
      findById.mockResolvedValue(undefined);

      await handler(req, res, jest.fn());

      expect(findById).toHaveBeenCalledWith('-1', { activeOnly: true });
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('allows an authenticated admin to request an inactive record', async () => {
      const req = createRequest({ role: 'admin', id: '-1' });
      const res = createResponse();
      findById.mockResolvedValue({ id: -1 });

      await handler(req, res, jest.fn());

      expect(findById).toHaveBeenCalledWith('-1', { activeOnly: false });
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
