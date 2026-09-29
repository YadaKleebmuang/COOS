const authMiddleware = require("../src/middlewares/auth.middleware");
const MediaModel = require("../src/models/media.model");
const MediaFile = require("../src/utils/mediaFile");
const { parseStoredUploadPath } = jest.requireActual("../src/utils/mediaFile");

jest.mock("../src/models/media.model");
jest.mock("../src/utils/mediaFile");

const controller = require("../src/controllers/media.controller");

const FILE_PATH = "/safe/uploads/example.png";
const createResponse = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  type: jest.fn().mockReturnThis(),
  sendFile: jest.fn().mockReturnThis(),
});

const request = ({ role, userId = 1, params = {} } = {}) => ({
  params,
  session: role ? { userRole: role, userId } : undefined,
});

describe("Media access boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MediaFile.resolveStoredMediaPath.mockResolvedValue(FILE_PATH);
  });

  const expectSent = (res) => expect(res.sendFile).toHaveBeenCalledWith(FILE_PATH, expect.any(Function));
  const expectHidden = (res) => expect(res.status).toHaveBeenCalledWith(404);

  describe("private authentication", () => {
    it("rejects a guest before private controller execution", () => {
      const req = { headers: {} };
      const res = createResponse();
      authMiddleware(req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe("gallery media", () => {
    it.each([undefined, "customer", "editor"])("serves active media to %s", async (role) => {
      MediaModel.findGalleryImage.mockResolvedValue({ imageUrl: "/uploads/gallery/a.png", imageIsActive: 1 });
      const res = createResponse();
      await controller.getGalleryMedia(request({ role, params: { imageId: "1" } }), res, jest.fn());
      expectSent(res);
    });

    it.each([undefined, "customer", "editor"])("hides inactive media from %s", async (role) => {
      MediaModel.findGalleryImage.mockResolvedValue({ imageUrl: "/uploads/gallery/a.png", imageIsActive: 0 });
      const res = createResponse();
      await controller.getGalleryMedia(request({ role, params: { imageId: "1" } }), res, jest.fn());
      expectHidden(res);
    });

    it.each([1, 0])("serves active=%s media to admin", async (imageIsActive) => {
      MediaModel.findGalleryImage.mockResolvedValue({ imageUrl: "/uploads/gallery/a.png", imageIsActive });
      const res = createResponse();
      await controller.getGalleryMedia(request({ role: "admin", params: { imageId: "1" } }), res, jest.fn());
      expectSent(res);
    });
  });

  describe.each([
    ["source", "in_progress"],
    ["selected_final", "delivered"],
  ])("%s order image", (imageType, orderStatus) => {
    beforeEach(() => MediaModel.findOrderImage.mockResolvedValue({
      imageUrl: "/uploads/example.png", imageType, orderStatus, customerId: 10, editorId: 20,
    }));

    it.each([
      ["customer", 10], ["editor", 20], ["admin", 30],
    ])("serves to %s", async (role, userId) => {
      const res = createResponse();
      await controller.getOrderImageMedia(request({ role, userId, params: { orderImageId: "1" } }), res, jest.fn());
      expectSent(res);
    });

    it.each([
      ["customer", 11], ["editor", 21],
    ])("hides from other %s", async (role, userId) => {
      const res = createResponse();
      await controller.getOrderImageMedia(request({ role, userId, params: { orderImageId: "1" } }), res, jest.fn());
      expectHidden(res);
    });
  });

  describe("draft order image", () => {
    const draft = { imageUrl: "/uploads/a.png", imageType: "ai_generated", customerId: 10, editorId: 20 };

    it.each([
      ["editor", 20, "in_progress"],
      ["customer", 10, "waiting_selection"],
      ["admin", 30, "in_progress"],
    ])("serves permitted %s", async (role, userId, orderStatus) => {
      MediaModel.findOrderImage.mockResolvedValue({ ...draft, orderStatus });
      const res = createResponse();
      await controller.getOrderImageMedia(request({ role, userId, params: { orderImageId: "1" } }), res, jest.fn());
      expectSent(res);
    });

    it.each([
      ["editor", 21, "in_progress"],
      ["customer", 10, "in_progress"],
      ["customer", 11, "waiting_selection"],
    ])("hides non-permitted %s", async (role, userId, orderStatus) => {
      MediaModel.findOrderImage.mockResolvedValue({ ...draft, orderStatus });
      const res = createResponse();
      await controller.getOrderImageMedia(request({ role, userId, params: { orderImageId: "1" } }), res, jest.fn());
      expectHidden(res);
    });
  });

  describe("payment slip", () => {
    beforeEach(() => MediaModel.findPaymentSlip.mockResolvedValue({ paymentSlipUrl: "/uploads/s.png", customerId: 10 }));

    it.each([["customer", 10], ["admin", 30]])("serves to %s", async (role, userId) => {
      const res = createResponse();
      await controller.getPaymentSlipMedia(request({ role, userId, params: { paymentId: "1" } }), res, jest.fn());
      expectSent(res);
    });

    it.each([["customer", 11], ["editor", 20]])("hides from %s", async (role, userId) => {
      const res = createResponse();
      await controller.getPaymentSlipMedia(request({ role, userId, params: { paymentId: "1" } }), res, jest.fn());
      expectHidden(res);
    });
  });

  describe("profile image", () => {
    beforeEach(() => MediaModel.findProfileImage.mockResolvedValue({ userId: 10, userProfileImage: "/uploads/p.png" }));

    it.each([["customer", 10], ["editor", 10], ["admin", 30]])("serves to %s", async (role, userId) => {
      const res = createResponse();
      await controller.getProfileMedia(request({ role, userId, params: { userId: "10" } }), res, jest.fn());
      expectSent(res);
    });

    it.each([["customer", 11], ["editor", 20]])("hides from other %s", async (role, userId) => {
      const res = createResponse();
      await controller.getProfileMedia(request({ role, userId, params: { userId: "10" } }), res, jest.fn());
      expectHidden(res);
    });
  });

  describe("safe failures", () => {
    it("rejects an invalid record ID without querying the database", async () => {
      const res = createResponse();
      await controller.getGalleryMedia(request({ params: { imageId: "..%2Fsecret" } }), res, jest.fn());
      expectHidden(res);
      expect(MediaModel.findGalleryImage).not.toHaveBeenCalled();
    });

    it("returns 404 for a missing record", async () => {
      MediaModel.findOrderImage.mockResolvedValue(undefined);
      const res = createResponse();
      await controller.getOrderImageMedia(request({ role: "admin", params: { orderImageId: "999" } }), res, jest.fn());
      expectHidden(res);
    });

    it("returns 404 when the stored file is missing", async () => {
      MediaModel.findGalleryImage.mockResolvedValue({ imageUrl: "/uploads/gallery/missing.png", imageIsActive: 1 });
      MediaFile.resolveStoredMediaPath.mockResolvedValue(null);
      const res = createResponse();
      await controller.getGalleryMedia(request({ params: { imageId: "1" } }), res, jest.fn());
      expectHidden(res);
    });
  });
});

describe("Stored media path parsing", () => {
  it.each([
    "/uploads/../secret.txt",
    "/uploads/%2e%2e/secret.txt",
    "/etc/passwd",
    "/uploads/gallery/a/b.png",
    "/uploads/gallery/%2e%2e",
    "/uploads/gallery/a%2Fb.png",
    "/uploads/gallery/a%5Cb.png",
    "/uploads/gallery/a\0.png",
  ])("rejects unsafe stored path %s", (storedUrl) => {
    expect(parseStoredUploadPath(storedUrl)).toBeNull();
  });
});
