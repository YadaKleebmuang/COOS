-- COOS Database Schema
-- Created for E-commerce Application

SET NAMES utf8mb4;

-- Create Database
CREATE DATABASE IF NOT EXISTS `coosdb`;
USE `coosdb`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `userId` INT AUTO_INCREMENT PRIMARY KEY,
  `userFirstName` VARCHAR(100) NOT NULL,
  `userLastName` VARCHAR(100) NOT NULL,
  `userEmail` VARCHAR(150) NOT NULL UNIQUE,
  `userPassword` VARCHAR(255) NOT NULL,
  `userPhone` VARCHAR(20),
  `userAddress` TEXT,
  `userProfileImage` VARCHAR(500) NULL,                    -- URL รูปโปรไฟล์
  `userContactChannels` JSON NULL,                         -- ช่องทางโซเชียล เช่น {"line":"@coos","facebook":"coos.studio","instagram":"coos_art"}
  `userRole` ENUM('admin', 'customer', 'editor') DEFAULT 'customer',
  `userResetToken` VARCHAR(255) NULL,                      -- Token สำหรับกู้คืนรหัสผ่าน
  `userResetTokenExpiry` TIMESTAMP NULL,                   -- วันหมดอายุของ Token
  `userCreatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `userUpdatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_userEmail` (`userEmail`),
  INDEX `idx_userRole` (`userRole`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Work Types Table
CREATE TABLE IF NOT EXISTS `workTypes` (
  `workTypeId`          INT           AUTO_INCREMENT PRIMARY KEY,
  `workTypeName`        VARCHAR(100)  NOT NULL,
  `workTypeDescription` TEXT          NULL,
  `workTypeIsActive`    TINYINT(1)   NOT NULL DEFAULT 1,
  `workTypeCreatedAt`   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  `workTypeUpdatedAt`   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE `uq_workTypeName` (`workTypeName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Packages Table
CREATE TABLE IF NOT EXISTS `packages` (
  `packageId`               INT             AUTO_INCREMENT PRIMARY KEY,
  `packageName`             VARCHAR(100)    NOT NULL,
  `packageDescription`      TEXT            NULL,
  `packageImageCount`       INT             NOT NULL,
  `packageResolution`       ENUM('FullHD', '4K')  NOT NULL,
  `packageDeliveryDays`     INT             NOT NULL,
  `packagePrice`            DECIMAL(10,2)  NOT NULL,
  `packageUrgentPrice`      DECIMAL(10,2)  NULL,
  `packageGalleryDiscount`  DECIMAL(5,2)   NOT NULL DEFAULT 20.00 CHECK (`packageGalleryDiscount` BETWEEN 0 AND 100),
  `packageIsActive`         TINYINT(1)     NOT NULL DEFAULT 1,
  `packageCreatedAt`        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
  `packageUpdatedAt`        TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_packageIsActive` (`packageIsActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. galleryImages Table
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

-- 5. policies Table
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

-- 6. Orders Table
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

-- 7. Order Images & AI Prompt Table
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

-- 8. Payments Table
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

-- 9. Workflow Logs Table
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

-- 10. System Settings Table
CREATE TABLE IF NOT EXISTS `systemSettings` (
  `settingKey`          VARCHAR(100) PRIMARY KEY,
  `settingValue`        TEXT NULL,
  `updatedAt`           TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updatedByAdminId`    INT NULL,
  
  FOREIGN KEY (`updatedByAdminId`) REFERENCES `users`(`userId`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT IGNORE INTO `systemSettings` (`settingKey`, `settingValue`) VALUES 
('maxUploadSizeMb', '20'),
('allowedImageTypes', 'jpg,jpeg,png,webp'),
('orderAutoExpireDays', '7'),
('depositPercentage', '30'),
('maintenanceMode', 'false'),
('studioName', 'COOS Studio'),
('studioEmail', 'hello@coos.studio'),
('studioPhone', '02-xxx-xxxx'),
('studioAddress', 'กรุงเทพมหานคร ประเทศไทย'),
('studioLineId', '@coosstudio'),
('studioFacebook', 'facebook.com/coosstudio'),
('studioInstagram', '@coos.studio');
-- 11. Tags Table
CREATE TABLE IF NOT EXISTS `tags` (
  `tagId` INT AUTO_INCREMENT PRIMARY KEY,
  `tagName` VARCHAR(100) NOT NULL UNIQUE,
  `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
