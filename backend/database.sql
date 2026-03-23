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