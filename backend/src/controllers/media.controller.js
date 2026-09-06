const path = require("path");
const MediaModel = require("../models/media.model");
const { resolveStoredMediaPath } = require("../utils/mediaFile");

const parseRecordId = (value) => {
  if (!/^-?\d+$/.test(String(value))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
};

const notFound = (res) => res.status(404).json({ message: "ไม่พบไฟล์" });

const sendStoredFile = async (res, next, storedUrl, assetContext) => {
  const filePath = await resolveStoredMediaPath(storedUrl, assetContext);
  if (!filePath) return notFound(res);

  res.type(path.extname(filePath));
  return res.sendFile(filePath, (err) => {
    if (!err) return;
    if (!res.headersSent) return notFound(res);

    const safeError = new Error("ไม่สามารถอ่านไฟล์ได้");
    safeError.statusCode = 500;
    return next(safeError);
  });
};

exports.getGalleryMedia = async (req, res, next) => {
  try {
    const imageId = parseRecordId(req.params.imageId);
    if (imageId === null) return notFound(res);

    const image = await MediaModel.findGalleryImage(imageId);
    const isAdmin = req.session?.userRole === "admin";
    if (!image || (!isAdmin && Number(image.imageIsActive) !== 1)) return notFound(res);

    return await sendStoredFile(res, next, image.imageUrl, "gallery");
  } catch (err) {
    return next(err);
  }
};

exports.getOrderImageMedia = async (req, res, next) => {
  try {
    const orderImageId = parseRecordId(req.params.orderImageId);
    if (orderImageId === null) return notFound(res);

    const image = await MediaModel.findOrderImage(orderImageId);
    if (!image) return notFound(res);

    const { userId, userRole } = req.session;
    const isAdmin = userRole === "admin";
    const isOwner = userRole === "customer" && Number(image.customerId) === Number(userId);
    const isAssignedEditor = userRole === "editor" && Number(image.editorId) === Number(userId);

    let allowed = false;
    let assetContext = "orderImage";
    if (image.imageType === "source") {
      allowed = isAdmin || isOwner || isAssignedEditor;
      assetContext = "source";
    } else if (image.imageType === "ai_generated") {
      allowed = isAdmin || isAssignedEditor || (isOwner && image.orderStatus === "waiting_selection");
    } else if (image.imageType === "selected_final") {
      allowed = isAdmin || isOwner || isAssignedEditor;
    }

    if (!allowed) return notFound(res);
    return await sendStoredFile(res, next, image.imageUrl, assetContext);
  } catch (err) {
    return next(err);
  }
};

exports.getPaymentSlipMedia = async (req, res, next) => {
  try {
    const paymentId = parseRecordId(req.params.paymentId);
    if (paymentId === null) return notFound(res);

    const payment = await MediaModel.findPaymentSlip(paymentId);
    if (!payment) return notFound(res);

    const { userId, userRole } = req.session;
    const allowed = userRole === "admin"
      || (userRole === "customer" && Number(payment.customerId) === Number(userId));
    if (!allowed) return notFound(res);

    return await sendStoredFile(res, next, payment.paymentSlipUrl, "slip");
  } catch (err) {
    return next(err);
  }
};

exports.getProfileMedia = async (req, res, next) => {
  try {
    const requestedUserId = parseRecordId(req.params.userId);
    if (requestedUserId === null) return notFound(res);

    const user = await MediaModel.findProfileImage(requestedUserId);
    if (!user || !user.userProfileImage) return notFound(res);

    const isAdmin = req.session.userRole === "admin";
    const isOwner = Number(req.session.userId) === Number(user.userId);
    if (!isAdmin && !isOwner) return notFound(res);

    return await sendStoredFile(res, next, user.userProfileImage, "profile");
  } catch (err) {
    return next(err);
  }
};

exports.parseRecordId = parseRecordId;
