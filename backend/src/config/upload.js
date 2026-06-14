const multer = require("multer");
const path = require("path");
const fs = require("fs");

// --- โฟลเดอร์หลักสำหรับเก็บไฟล์อัปโหลด ---
const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");

// --- ประเภทโฟลเดอร์ย่อย ---
const UPLOAD_DIRS = {
  profiles: path.join(UPLOAD_ROOT, "profiles"),       // รูปโปรไฟล์ผู้ใช้
  slips: path.join(UPLOAD_ROOT, "slips"),             // สลิปการชำระเงิน
  sources: path.join(UPLOAD_ROOT, "sources"),         // รูปต้นฉบับจากลูกค้า
  aiGenerated: path.join(UPLOAD_ROOT, "ai-generated"), // รูปที่สร้างจาก AI
  gallery: path.join(UPLOAD_ROOT, "gallery"),         // รูปแกลเลอรี
};

// --- สร้างโฟลเดอร์อัตโนมัติหากยังไม่มี ---
Object.values(UPLOAD_DIRS).forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// --- ไฟล์ที่อนุญาตให้อัปโหลด ---
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

// --- ฟังก์ชันกรองไฟล์ ---
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("อนุญาตเฉพาะไฟล์รูปภาพ (JPEG, PNG, WebP, GIF)"), false);
  }
};

// --- สร้างชื่อไฟล์ที่ไม่ซ้ำกัน ---
const generateFilename = (file) => {
  const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  return `${uniqueSuffix}${ext}`;
};

// --- Storage สำหรับแต่ละประเภท ---

// 1) Profile Image Storage
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIRS.profiles),
  filename: (req, file, cb) => cb(null, `profile-${generateFilename(file)}`),
});

// 2) Payment Slip Storage
const slipStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIRS.slips),
  filename: (req, file, cb) => cb(null, `slip-${generateFilename(file)}`),
});

// 3) Source Image Storage (รูปต้นฉบับจากลูกค้า)
const sourceStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIRS.sources),
  filename: (req, file, cb) => cb(null, `source-${generateFilename(file)}`),
});

// 4) AI Generated Image Storage
const aiStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIRS.aiGenerated),
  filename: (req, file, cb) => cb(null, `ai-${generateFilename(file)}`),
});

// 5) Gallery Image Storage
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIRS.gallery),
  filename: (req, file, cb) => cb(null, `gallery-${generateFilename(file)}`),
});

// --- Multer Instances ---

const uploadProfile = multer({
  storage: profileStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadSlip = multer({
  storage: slipStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadSource = multer({
  storage: sourceStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const uploadAI = multer({
  storage: aiStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

const uploadGallery = multer({
  storage: galleryStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

module.exports = {
  UPLOAD_ROOT,
  UPLOAD_DIRS,
  uploadProfile,
  uploadSlip,
  uploadSource,
  uploadAI,
  uploadGallery,
};
