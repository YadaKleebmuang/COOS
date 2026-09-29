-- 1. Add imageApprovalStatus column with default 'approved' to protect legacy data
ALTER TABLE `galleryImages`
ADD COLUMN `imageApprovalStatus` ENUM('pending', 'approved') NOT NULL DEFAULT 'approved' AFTER `imageDescription`;
