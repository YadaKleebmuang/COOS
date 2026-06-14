require('dotenv').config();
const express = require('express');
const path = require('path');
const corsMiddleware = require('./middlewares/cors.middleware');
const handleUploadError = require('./middlewares/upload.middleware');
const loadRoutes = require('./routes/index.route');
const { testConnection } = require('../src/config/db');

const app = express();

app.use(corsMiddleware);
app.use(express.json());

// Serve ไฟล์รูปภาพที่อัปโหลด (เข้าถึงผ่าน /uploads/...)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

testConnection();

loadRoutes(app);

// Multer error handler (ต้องอยู่หลัง routes)
app.use(handleUploadError);

module.exports = app;