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

-- tags Table
CREATE TABLE IF NOT EXISTS `tags` (
  `tagId`         INT AUTO_INCREMENT PRIMARY KEY,
  `tagName`       VARCHAR(100) NOT NULL,
  `tagCreatedAt`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE `uq_tagName` (`tagName`),
  INDEX `idx_tagName` (`tagName`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- galleryImageTags Table (Many-to-Many Relationship)
CREATE TABLE IF NOT EXISTS `galleryImageTags` (
  `id`        INT AUTO_INCREMENT PRIMARY KEY,
  `imageId`   INT NOT NULL,
  `tagId`     INT NOT NULL,

  UNIQUE `uq_image_tag` (`imageId`, `tagId`),
  INDEX `idx_imageId` (`imageId`),
  INDEX `idx_tagId` (`tagId`),

  CONSTRAINT `fk_git_image`
    FOREIGN KEY (`imageId`)
    REFERENCES `galleryImages`(`imageId`)
    ON DELETE CASCADE,

  CONSTRAINT `fk_git_tag`
    FOREIGN KEY (`tagId`)
    REFERENCES `tags`(`tagId`)
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
  wt.workTypeName,
  GROUP_CONCAT(t.tagName) AS tags
FROM galleryImages gi
JOIN workTypes wt ON gi.workTypeId = wt.workTypeId
LEFT JOIN galleryImageTags git ON gi.imageId = git.imageId
LEFT JOIN tags t ON git.tagId = t.tagId
WHERE gi.imageIsActive = 1
GROUP BY gi.imageId;

-- filter by work type + tag
SELECT DISTINCT gi.*
FROM galleryImages gi
JOIN galleryImageTags git ON gi.imageId = git.imageId
JOIN tags t ON git.tagId = t.tagId
WHERE gi.workTypeId = 1
  AND t.tagName = 'anime';