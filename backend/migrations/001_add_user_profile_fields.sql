-- Migration 001: Add profile image & contact channels to users table
-- Run this script if your database was created before these fields were added
-- This migration is idempotent (safe to run multiple times)

-- เพิ่มฟิลด์ userProfileImage (URL รูปโปรไฟล์)
-- ตรวจสอบก่อนว่ามีฟิลด์อยู่แล้วหรือไม่
SET @dbname = DATABASE();

-- Add userProfileImage column
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'users' AND COLUMN_NAME = 'userProfileImage') > 0,
  'SELECT 1',
  'ALTER TABLE `users` ADD COLUMN `userProfileImage` VARCHAR(500) NULL AFTER `userAddress`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add userContactChannels column (JSON)
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'users' AND COLUMN_NAME = 'userContactChannels') > 0,
  'SELECT 1',
  'ALTER TABLE `users` ADD COLUMN `userContactChannels` JSON NULL AFTER `userProfileImage`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add userResetToken column
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'users' AND COLUMN_NAME = 'userResetToken') > 0,
  'SELECT 1',
  'ALTER TABLE `users` ADD COLUMN `userResetToken` VARCHAR(255) NULL AFTER `userRole`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add userResetTokenExpiry column
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'users' AND COLUMN_NAME = 'userResetTokenExpiry') > 0,
  'SELECT 1',
  'ALTER TABLE `users` ADD COLUMN `userResetTokenExpiry` TIMESTAMP NULL AFTER `userResetToken`'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- แสดงโครงสร้างตาราง users หลังจาก migration
DESCRIBE `users`;
