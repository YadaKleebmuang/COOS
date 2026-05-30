-- COOS Database Schema
-- Created for E-commerce Application

-- Create Database
CREATE DATABASE IF NOT EXISTS `coosdb`;
USE `coosdb`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `userId` INT AUTO_INCREMENT PRIMARY KEY,
  `userFirstName` VARCHAR(100) NOT NULL,
  `userLastName` VARCHAR(100) NOT NULL,
  `userEmail` VARCHAR(150) NOT NULL UNIQUE,
  `userPassword` VARCHAR(255) NOT NULL,
  `userPhone` VARCHAR(20),
  `userAddress` TEXT,
  `userRole` ENUM('admin', 'customer', 'editor') DEFAULT 'customer',
  `userCreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_userEmail` (`userEmail`),
  INDEX `idx_userRole` (`userRole`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Work Types Table
CREATE TABLE IF NOT EXISTS `workTypes` (
  `workTypeId`          INT           AUTO_INCREMENT PRIMARY KEY,
  `workTypeName`        VARCHAR(100)  NOT NULL,
  `workTypeDescription` TEXT          NULL,
  `workTypeIsActive`    TINYINT(1)   NOT NULL DEFAULT 1,
  `workTypeCreatedAt`   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  `workTypeUpdatedAt`   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE `uq_workTypeName` (`workTypeName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Packages Table
CREATE TABLE IF NOT EXISTS `packages` (
  `packageId`               INT             AUTO_INCREMENT PRIMARY KEY,
  `packageName`             VARCHAR(100)    NOT NULL,
  `packageDescription`      TEXT            NULL,
  `packageImageCount`       INT             NOT NULL,
  `packageResolution`       ENUM('FullHD', '4K')  NOT NULL,
  `packageDeliveryDays`     INT             NOT NULL,
  `packagePrice`            DECIMAL(10,2)  NOT NULL,
  `packageUrgentPrice`      DECIMAL(10,2)  NULL,
  `packageGalleryDiscount`  DECIMAL(5,2)   NOT NULL DEFAULT 20.00,
  `packageIsActive`         TINYINT(1)     NOT NULL DEFAULT 1,
  `packageCreatedAt`        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `packageUpdatedAt`        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_packageIsActive` (`packageIsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- galleryImages Table
CREATE TABLE IF NOT EXISTS `galleryImages` (
  `imageId`           INT AUTO_INCREMENT PRIMARY KEY,
  `imageUrl`          VARCHAR(255) NOT NULL,
  `workTypeId`        INT NOT NULL,
  `imageTitle`        VARCHAR(150) NULL,
  `imageDescription`  TEXT NULL,
  `imageTags`         VARCHAR(255) NULL,  -- เก็บแท็กที่เกี่ยวข้องคั่นด้วยจุลภาค เช่น 'minimal, retro, anime'
  `imageIsActive`     TINYINT(1) NOT NULL DEFAULT 1,
  `imageCreatedAt`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `imageUpdatedAt`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_workTypeId` (`workTypeId`),
  INDEX `idx_imageIsActive` (`imageIsActive`),

  CONSTRAINT `fk_gallery_workType`
    FOREIGN KEY (`workTypeId`)
    REFERENCES `workTypes`(`workTypeId`)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- policies Table
CREATE TABLE IF NOT EXISTS `policies` (
  `policyId`        INT AUTO_INCREMENT PRIMARY KEY,
  `policyTitle`     VARCHAR(150) NOT NULL,
  `policyContent`   TEXT NOT NULL,
  `policyType`      ENUM('refund', 'terms', 'privacy') NOT NULL,
  `policyIsActive`  TINYINT(1) NOT NULL DEFAULT 1,
  `policyCreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `policyUpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX `idx_policyType` (`policyType`),
  INDEX `idx_policyIsActive` (`policyIsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1. ตารางคำสั่งงานสั่งสร้างภาพ (Orders)
CREATE TABLE IF NOT EXISTS `orders` (
  `orderId`             INT AUTO_INCREMENT PRIMARY KEY,
  `customerId`          INT NOT NULL,
  `editorId`            INT NULL,          -- Editor ที่ได้รับมอบหมาย
  `packageId`           INT NOT NULL,
  `workTypeId`          INT NOT NULL,
  `orderStyle`          VARCHAR(255) NULL,  -- สไตล์ภาพ
  `orderColorTone`      VARCHAR(100) NULL,  -- โทนสี
  `orderComposition`    TEXT NULL,          -- องค์ประกอบฉาก
  `orderNote`           TEXT NULL,          -- หมายเหตุเพิ่มเติม
  `orderRequiredDate`   DATE NOT NULL,      -- วันที่ต้องการรับผลงาน
  `orderIsUrgent`       TINYINT(1) NOT NULL DEFAULT 0, -- บริการเร่งด่วน
  `orderIsGalleryAllowed` TINYINT(1) NOT NULL DEFAULT 0, -- อนุญาตให้นำไปโชว์ Gallery
  `orderBasePrice`      DECIMAL(10,2) NOT NULL, -- ราคาแพ็กเกจตั้งต้น
  `orderUrgentPrice`    DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- ค่าบริการเร่งด่วนเพิ่ม
  `orderDiscount`       DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- ส่วนลด (หากอนุญาตโชว์ Gallery)
  `orderTotalPrice`     DECIMAL(10,2) NOT NULL, -- ราคาสุทธิ (Base + Urgent - Discount)
  `orderStatus`         ENUM(
                          'waiting_deposit',       -- รอชำระเงินค่ามัดจำ
                          'waiting_assignment',    -- รอผู้ดูแลมอบหมายงาน
                          'waiting_to_start',      -- รอเริ่มดำเนินการ
                          'in_progress',           -- อยู่ระหว่างดำเนินการ
                          'waiting_selection',     -- รอคัดเลือกและตรวจสอบผลงาน
                          'waiting_final_payment', -- รอชำระเงินส่วนที่เหลือ
                          'delivered',             -- ส่งมอบผลงานให้ลูกค้าแล้ว
                          'completed',             -- เสร็จสมบูรณ์
                          'cancelled'              -- ยกเลิกออเดอร์
                        ) DEFAULT 'waiting_deposit',
  `orderCreatedAt`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `orderUpdatedAt`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (`customerId`) REFERENCES `users`(`userId`) ON DELETE RESTRICT,
  FOREIGN KEY (`editorId`) REFERENCES `users`(`userId`) ON DELETE SET NULL,
  FOREIGN KEY (`packageId`) REFERENCES `packages`(`packageId`) ON DELETE RESTRICT,
  FOREIGN KEY (`workTypeId`) REFERENCES `workTypes`(`workTypeId`) ON DELETE RESTRICT,
  INDEX `idx_orderStatus` (`orderStatus`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ตารางเก็บไฟล์รูปภาพประกอบคำสั่งงาน + Prompt การสร้างภาพ (Order Images & AI Prompt)
CREATE TABLE IF NOT EXISTS `orderImages` (
  `orderImageId`        INT AUTO_INCREMENT PRIMARY KEY,
  `orderId`             INT NOT NULL,
  `imageType`           ENUM('source', 'ai_generated', 'selected_final') NOT NULL, 
  `imageUrl`            VARCHAR(255) NOT NULL,
  `imageThumbnailUrl`   VARCHAR(255) NULL,
  
  -- ส่วนข้อมูล AI Prompt ที่ยุบรวมเข้ามา (เป็น NULL ได้สำหรับรูป source ของลูกค้า)
  `aiEngine`            VARCHAR(100) NULL,                 -- เครื่องมือที่ใช้ (เช่น Midjourney, Stable Diffusion, Flux)
  `positivePrompt`      TEXT NULL,                         -- Prompt ที่ใช้สร้าง
  `negativePrompt`      TEXT NULL,                         -- Negative Prompt
  `cfgScale`            FLOAT NULL,
  `steps`               INT NULL,
  `seed`                VARCHAR(100) NULL,
  
  `imageCreatedAt`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (`orderId`) REFERENCES `orders`(`orderId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ตารางบันทึกการชำระเงิน (Payments)
CREATE TABLE IF NOT EXISTS `payments` (
  `paymentId`           INT AUTO_INCREMENT PRIMARY KEY,
  `orderId`             INT NOT NULL,
  `paymentType`         ENUM('deposit', 'final') NOT NULL, -- มัดจำ 30% หรือ ส่วนที่เหลือ 70%
  `paymentAmount`       DECIMAL(10,2) NOT NULL,
  `paymentSlipUrl`      VARCHAR(255) NOT NULL,             -- ไฟล์สลิปเงินโอน
  `paymentStatus`       ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  `paymentCreatedAt`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `paymentVerifiedAt`   TIMESTAMP NULL,
  `verifiedByAdminId`   INT NULL,

  FOREIGN KEY (`orderId`) REFERENCES `orders`(`orderId`) ON DELETE CASCADE,
  FOREIGN KEY (`verifiedByAdminId`) REFERENCES `users`(`userId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ตารางบันทึกประวัติการเปลี่ยนสถานะการทำงาน (Workflow Logs)
CREATE TABLE IF NOT EXISTS `workflowLogs` (
  `logId`               INT AUTO_INCREMENT PRIMARY KEY,
  `orderId`             INT NOT NULL,
  `fromStatus`          VARCHAR(50) NOT NULL,
  `toStatus`            VARCHAR(50) NOT NULL,
  `changedById`         INT NULL,                          -- ผู้ปรับเปลี่ยนสถานะ
  `changedAt`           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `logNote`             TEXT NULL,

  FOREIGN KEY (`orderId`) REFERENCES `orders`(`orderId`) ON DELETE CASCADE,
  FOREIGN KEY (`changedById`) REFERENCES `users`(`userId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Data (Optional)
-- Insert sample users
INSERT INTO `users` (`userFirstName`, `userLastName`, `userEmail`, `userPassword`, `userPhone`, `userAddress`, `userRole`) VALUES
('Admin', 'User', 'admin@coos.com', '123123', '0800000001', '123 Admin Street', 'admin'),
('John', 'Doe', 'john@example.com', '123123', '0812345678', '456 Main Street', 'customer'),
('Jane', 'Smith', 'jane@example.com', '123123', '0887654321', '789 Oak Avenue', 'editor');

-- Work Types
INSERT INTO `worktypes` (`workTypeName`) VALUES
  ('Pre-wedding'),
  ('รับปริญญา'),
  ('Portrait'),
  ('ครอบครัว');

-- Packages
INSERT INTO `packages`
  (`packageName`, `packageImageCount`, `packageResolution`, `packageDeliveryDays`, `packagePrice`)
VALUES
  ('Basic',    10, 'FullHD', 5,  199.00),
  ('Standard', 20, 'FullHD', 7,  399.00),
  ('Pro',      30, '4K',    10, 599.00);

-- Example Query
-- Select gallery images with their work type and associated tags
SELECT 
  gi.imageId,
  gi.imageTitle,
  gi.imageUrl,
  gi.imageTags,
  wt.workTypeName
FROM galleryImages gi
JOIN workTypes wt ON gi.workTypeId = wt.workTypeId
WHERE gi.imageIsActive = 1;

-- filter by work type + tag (using LIKE for simple comma-separated string)
SELECT gi.*
FROM galleryImages gi
WHERE gi.workTypeId = 1
  AND gi.imageTags LIKE '%anime%';