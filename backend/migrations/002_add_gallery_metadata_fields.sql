-- Migration 002: Add Gallery Metadata fields for Editor workflow
-- Run this script if your database was created before these fields were added
-- This migration is idempotent (safe to run multiple times)

SET @dbname = DATABASE();

-- 1. Create orderImageTags table (Junction table for hashtags on orderImages)
CREATE TABLE IF NOT EXISTS `orderImageTags` (
  `orderImageId` INT NOT NULL,
  `tagId` INT NOT NULL,
  PRIMARY KEY (`orderImageId`, `tagId`),
  CONSTRAINT `fk_orderImageTag_orderImage` FOREIGN KEY (`orderImageId`) REFERENCES `orderImages`(`orderImageId`) ON DELETE CASCADE,
  CONSTRAINT `fk_orderImageTag_tag` FOREIGN KEY (`tagId`) REFERENCES `tags`(`tagId`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rollback SQL (For reference, do NOT run automatically)
/*
DROP TABLE IF EXISTS `orderImageTags`;
*/
