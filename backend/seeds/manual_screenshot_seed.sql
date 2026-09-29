USE `coos_manual`;

START TRANSACTION;

-- =====================================================================
-- 1. Accounts
-- =====================================================================
INSERT INTO `users` (`userId`, `userFirstName`, `userLastName`, `userEmail`, `userPassword`, `userPhone`, `userAddress`, `userProfileImage`, `userRole`, `userCreatedAt`) VALUES
(-9001, 'ลูกค้า', 'หน้าเว็บ', 'manual.cus@coos.test', '$2b$10$h1tJkpkQcyD9H4JsD3ChQuWmckXw9Q/zEn0CLzivR1hXHs8mAvhgm', '0812345678', 'กรุงเทพมหานคร', '/uploads/profiles/seed-profile-02.png', 'customer', '2026-08-01 10:00:00'),
(-9002, 'นักออกแบบ', 'หลัก', 'manual.edt1@coos.test', '$2b$10$h1tJkpkQcyD9H4JsD3ChQuWmckXw9Q/zEn0CLzivR1hXHs8mAvhgm', '0812345679', 'กรุงเทพมหานคร', '/uploads/profiles/seed-profile-03.png', 'editor', '2026-08-01 10:00:00'),
(-9003, 'นักออกแบบ', 'สำรอง', 'manual.edt2@coos.test', '$2b$10$h1tJkpkQcyD9H4JsD3ChQuWmckXw9Q/zEn0CLzivR1hXHs8mAvhgm', '0812345680', 'กรุงเทพมหานคร', '/uploads/profiles/seed-profile-04.png', 'editor', '2026-08-01 10:00:00'),
(-9004, 'ผู้ดูแล', 'ระบบ', 'manual.adm@coos.test', '$2b$10$h1tJkpkQcyD9H4JsD3ChQuWmckXw9Q/zEn0CLzivR1hXHs8mAvhgm', '0812345681', 'กรุงเทพมหานคร', '/uploads/profiles/seed-profile-01.png', 'admin', '2026-08-01 10:00:00');

-- =====================================================================
-- 2. Packages
-- =====================================================================
INSERT INTO `packages` (`packageId`, `packageName`, `packageDescription`, `packageImageCount`, `packageResolution`, `packageDeliveryDays`, `packagePrice`, `packageUrgentPrice`, `packageGalleryDiscount`, `packageIsActive`) VALUES
(-9001, 'Basic Package', 'แพ็กเกจเริ่มต้น', 2, 'FullHD', 7, 1000.00, 500.00, 20.00, 1),
(-9002, 'Standard Package', 'แพ็กเกจมาตรฐาน', 5, 'FullHD', 5, 2500.00, 1000.00, 20.00, 1),
(-9003, 'Premium Package', 'แพ็กเกจพรีเมียม', 10, '4K', 3, 5000.00, 2000.00, 20.00, 1);

-- =====================================================================
-- 3. Work Types
-- =====================================================================
INSERT INTO `workTypes` (`workTypeId`, `workTypeName`, `workTypeDescription`, `workTypeIsActive`) VALUES
(-9001, 'Character Design', 'ออกแบบตัวละคร', 1),
(-9002, 'Background & Landscape', 'ออกแบบฉากหลัง', 1),
(-9003, 'Concept Art', 'ออกแบบคอนเซปต์อาร์ต', 1);

-- =====================================================================
-- 4. Settings
-- =====================================================================
INSERT INTO `systemSettings` (`settingKey`, `settingValue`) VALUES 
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

-- =====================================================================
-- 5. Policies
-- =====================================================================
INSERT INTO `policies` (`policyId`, `policyTitle`, `policyContent`, `policyType`, `policyIsActive`) VALUES
(-9001, 'Terms of Service', 'เงื่อนไขการใช้บริการ', 'terms', 1),
(-9002, 'Privacy Policy', 'นโยบายความเป็นส่วนตัว', 'privacy', 1),
(-9003, 'Refund Policy', 'นโยบายการคืนเงิน', 'refund', 1);

-- =====================================================================
-- 6. Tags
-- =====================================================================
INSERT INTO `tags` (`tagId`, `tagName`) VALUES
(-9001, 'Minimal'),
(-9002, 'Retro'),
(-9003, 'Fantasy'),
(-9004, 'Cyberpunk'),
(-9005, 'Realistic');

-- =====================================================================
-- 7. Stable Orders
-- =====================================================================
INSERT INTO `orders` (`orderId`, `customerId`, `editorId`, `packageId`, `workTypeId`, `orderRequiredDate`, `orderBasePrice`, `orderUrgentPrice`, `orderDiscount`, `orderTotalPrice`, `orderStatus`, `orderCreatedAt`, `orderUpdatedAt`) VALUES
(-9001, -9001, NULL, -9001, -9001, '2026-08-31', 1000.00, 0.00, 0.00, 1000.00, 'waiting_deposit', '2026-08-01 10:00:00', '2026-08-01 10:00:00'),
(-9002, -9001, NULL, -9001, -9001, '2026-08-31', 1000.00, 0.00, 0.00, 1000.00, 'waiting_assignment', '2026-08-02 10:00:00', '2026-08-02 11:00:00'),
(-9003, -9001, -9002, -9001, -9001, '2026-08-31', 1000.00, 0.00, 0.00, 1000.00, 'in_progress', '2026-08-03 10:00:00', '2026-08-03 12:00:00'),
(-9004, -9001, -9002, -9001, -9001, '2026-08-31', 1000.00, 0.00, 0.00, 1000.00, 'waiting_selection', '2026-08-04 10:00:00', '2026-08-04 14:00:00'),
(-9005, -9001, -9002, -9001, -9001, '2026-08-31', 1000.00, 0.00, 0.00, 1000.00, 'waiting_final_payment', '2026-08-05 10:00:00', '2026-08-05 15:00:00'),
(-9006, -9001, -9002, -9001, -9001, '2026-08-31', 1000.00, 0.00, 0.00, 1000.00, 'completed', '2026-08-06 10:00:00', '2026-08-06 16:00:00');

-- =====================================================================
-- 8. Action Orders
-- =====================================================================
INSERT INTO `orders` (`orderId`, `customerId`, `editorId`, `packageId`, `workTypeId`, `orderRequiredDate`, `orderBasePrice`, `orderUrgentPrice`, `orderDiscount`, `orderTotalPrice`, `orderStatus`, `orderCreatedAt`, `orderUpdatedAt`) VALUES
(-9007, -9001, NULL, -9001, -9001, '2026-08-31', 1000.00, 0.00, 0.00, 1000.00, 'waiting_assignment', '2026-08-10 10:00:00', '2026-08-10 11:00:00'),
(-9008, -9001, -9002, -9001, -9001, '2026-08-31', 1000.00, 0.00, 0.00, 1000.00, 'in_progress', '2026-08-11 10:00:00', '2026-08-11 12:00:00'),
(-9009, -9001, -9002, -9001, -9001, '2026-08-31', 1000.00, 0.00, 0.00, 1000.00, 'delivered', '2026-08-12 10:00:00', '2026-08-12 16:00:00'),
(-9010, -9001, -9002, -9001, -9001, '2026-08-31', 1000.00, 0.00, 0.00, 1000.00, 'waiting_final_payment', '2026-08-13 10:00:00', '2026-08-13 15:00:00');

-- =====================================================================
-- 9. Payments
-- =====================================================================
INSERT INTO `payments` (`paymentId`, `orderId`, `paymentType`, `paymentAmount`, `paymentSlipUrl`, `paymentStatus`, `paymentCreatedAt`, `paymentVerifiedAt`, `verifiedByAdminId`) VALUES
(-9001, -9001, 'deposit', 300.00, '/uploads/slips/seed-slip-01.jpeg', 'pending', '2026-08-01 10:30:00', NULL, NULL),
(-9002, -9002, 'deposit', 300.00, '/uploads/slips/seed-slip-02.jpeg', 'approved', '2026-08-02 10:30:00', '2026-08-02 11:00:00', -9004),
(-9003, -9003, 'deposit', 300.00, '/uploads/slips/seed-slip-03.jpeg', 'approved', '2026-08-03 10:30:00', '2026-08-03 11:00:00', -9004),
(-9004, -9004, 'deposit', 300.00, '/uploads/slips/seed-slip-04.jpeg', 'approved', '2026-08-04 10:30:00', '2026-08-04 11:00:00', -9004),
(-9005, -9005, 'deposit', 300.00, '/uploads/slips/seed-slip-05.jpeg', 'approved', '2026-08-05 10:30:00', '2026-08-05 11:00:00', -9004),
(-9006, -9005, 'final', 700.00, '/uploads/slips/seed-slip-01.jpeg', 'pending', '2026-08-05 15:30:00', NULL, NULL),
(-9007, -9006, 'deposit', 300.00, '/uploads/slips/seed-slip-02.jpeg', 'approved', '2026-08-06 10:30:00', '2026-08-06 11:00:00', -9004),
(-9008, -9006, 'final', 700.00, '/uploads/slips/seed-slip-03.jpeg', 'approved', '2026-08-06 15:30:00', '2026-08-06 16:00:00', -9004),
(-9009, -9007, 'deposit', 300.00, '/uploads/slips/seed-slip-04.jpeg', 'approved', '2026-08-10 10:30:00', '2026-08-10 11:00:00', -9004),
(-9010, -9008, 'deposit', 300.00, '/uploads/slips/seed-slip-05.jpeg', 'approved', '2026-08-11 10:30:00', '2026-08-11 11:00:00', -9004),
(-9011, -9009, 'deposit', 300.00, '/uploads/slips/seed-slip-01.jpeg', 'approved', '2026-08-12 10:30:00', '2026-08-12 11:00:00', -9004),
(-9012, -9009, 'final', 700.00, '/uploads/slips/seed-slip-02.jpeg', 'approved', '2026-08-12 14:30:00', '2026-08-12 15:00:00', -9004),
(-9013, -9010, 'deposit', 300.00, '/uploads/slips/seed-slip-03.jpeg', 'approved', '2026-08-13 10:30:00', '2026-08-13 11:00:00', -9004),
(-9014, -9010, 'final', 700.00, '/uploads/slips/seed-slip-04.jpeg', 'pending', '2026-08-13 15:30:00', NULL, NULL);

-- =====================================================================
-- 10. Order Images
-- =====================================================================
INSERT INTO `orderImages` (`orderImageId`, `orderId`, `imageType`, `imageUrl`, `aiEngine`, `positivePrompt`, `negativePrompt`, `cfgScale`, `steps`, `seed`) VALUES
(-9001, -9003, 'source', '/uploads/sources/seed-source-01.png', NULL, NULL, NULL, NULL, NULL, NULL),
(-9002, -9003, 'source', '/uploads/sources/seed-source-02.png', NULL, NULL, NULL, NULL, NULL, NULL),
(-9003, -9004, 'source', '/uploads/sources/seed-source-03.png', NULL, NULL, NULL, NULL, NULL, NULL),
(-9004, -9004, 'source', '/uploads/sources/seed-source-04.png', NULL, NULL, NULL, NULL, NULL, NULL),
(-9005, -9004, 'ai_generated', '/uploads/ai-generated/seed-ai-01.png', 'Midjourney', 'A cinematic portrait of a cyberpunk character', 'ugly, blurry, bad anatomy', 7.0, 30, '123456789'),
(-9006, -9004, 'ai_generated', '/uploads/ai-generated/seed-ai-02.png', 'Midjourney', 'A cinematic portrait of a cyberpunk character', 'ugly, blurry, bad anatomy', 7.0, 30, '123456790'),
(-9007, -9004, 'ai_generated', '/uploads/ai-generated/seed-ai-03.png', 'Midjourney', 'A cinematic portrait of a cyberpunk character', 'ugly, blurry, bad anatomy', 7.0, 30, '123456791'),
(-9008, -9004, 'ai_generated', '/uploads/ai-generated/seed-ai-04.png', 'Midjourney', 'A cinematic portrait of a cyberpunk character', 'ugly, blurry, bad anatomy', 7.0, 30, '123456792'),
(-9009, -9005, 'source', '/uploads/sources/seed-source-05.png', NULL, NULL, NULL, NULL, NULL, NULL),
(-9010, -9005, 'source', '/uploads/sources/seed-source-06.png', NULL, NULL, NULL, NULL, NULL, NULL),
(-9011, -9005, 'selected_final', '/uploads/ai-generated/seed-ai-05.png', 'Stable Diffusion', 'Fantasy landscape painting', 'text, watermark', 7.5, 40, '987654321'),
(-9012, -9006, 'source', '/uploads/sources/seed-source-07.png', NULL, NULL, NULL, NULL, NULL, NULL),
(-9013, -9006, 'source', '/uploads/sources/seed-source-08.png', NULL, NULL, NULL, NULL, NULL, NULL),
(-9014, -9006, 'selected_final', '/uploads/ai-generated/seed-ai-06.png', 'Flux', 'Realistic retro portrait', 'bad proportions', 8.0, 25, '111222333'),
(-9015, -9008, 'source', '/uploads/sources/seed-source-09.png', NULL, NULL, NULL, NULL, NULL, NULL),
(-9016, -9009, 'source', '/uploads/sources/seed-source-10.png', NULL, NULL, NULL, NULL, NULL, NULL),
(-9017, -9009, 'selected_final', '/uploads/ai-generated/seed-ai-07.png', 'Midjourney', 'Minimalist logo', 'complex, messy', 5.0, 20, '444555666'),
(-9018, -9010, 'source', '/uploads/sources/seed-source-11.png', NULL, NULL, NULL, NULL, NULL, NULL),
(-9019, -9010, 'selected_final', '/uploads/ai-generated/seed-ai-08.png', 'Stable Diffusion', 'Cyberpunk city scene', 'low resolution', 7.0, 35, '777888999');

-- =====================================================================
-- 11. Workflow Logs
-- =====================================================================
INSERT INTO `workflowLogs` (`logId`, `orderId`, `fromStatus`, `toStatus`, `changedById`, `changedAt`, `logNote`) VALUES
(-9001, -9002, 'waiting_deposit', 'waiting_assignment', -9004, '2026-08-02 11:00:00', 'อนุมัติมัดจำ'),
(-9002, -9003, 'waiting_deposit', 'waiting_assignment', -9004, '2026-08-03 11:00:00', 'อนุมัติมัดจำ'),
(-9003, -9003, 'waiting_assignment', 'in_progress', -9004, '2026-08-03 12:00:00', 'มอบหมายงาน'),
(-9004, -9004, 'waiting_deposit', 'waiting_assignment', -9004, '2026-08-04 11:00:00', 'อนุมัติมัดจำ'),
(-9005, -9004, 'waiting_assignment', 'in_progress', -9004, '2026-08-04 12:00:00', 'มอบหมายงาน'),
(-9006, -9004, 'in_progress', 'waiting_selection', -9002, '2026-08-04 14:00:00', 'อัปโหลดผลงานให้เลือก'),
(-9007, -9005, 'waiting_deposit', 'waiting_assignment', -9004, '2026-08-05 11:00:00', 'อนุมัติมัดจำ'),
(-9008, -9005, 'waiting_assignment', 'in_progress', -9004, '2026-08-05 12:00:00', 'มอบหมายงาน'),
(-9009, -9005, 'in_progress', 'waiting_selection', -9002, '2026-08-05 14:00:00', 'อัปโหลดผลงานให้เลือก'),
(-9010, -9005, 'waiting_selection', 'waiting_final_payment', -9001, '2026-08-05 15:00:00', 'ลูกค้าเลือกภาพแล้ว'),
(-9011, -9006, 'waiting_deposit', 'waiting_assignment', -9004, '2026-08-06 11:00:00', 'อนุมัติมัดจำ'),
(-9012, -9006, 'waiting_assignment', 'in_progress', -9004, '2026-08-06 12:00:00', 'มอบหมายงาน'),
(-9013, -9006, 'in_progress', 'waiting_selection', -9002, '2026-08-06 14:00:00', 'อัปโหลดผลงานให้เลือก'),
(-9014, -9006, 'waiting_selection', 'waiting_final_payment', -9001, '2026-08-06 15:00:00', 'ลูกค้าเลือกภาพแล้ว'),
(-9015, -9006, 'waiting_final_payment', 'delivered', -9004, '2026-08-06 15:30:00', 'อนุมัติยอดคงเหลือ'),
(-9016, -9006, 'delivered', 'completed', -9001, '2026-08-06 16:00:00', 'ลูกค้ายืนยันผลงาน'),
(-9017, -9007, 'waiting_deposit', 'waiting_assignment', -9004, '2026-08-10 11:00:00', 'อนุมัติมัดจำ'),
(-9018, -9008, 'waiting_deposit', 'waiting_assignment', -9004, '2026-08-11 11:00:00', 'อนุมัติมัดจำ'),
(-9019, -9008, 'waiting_assignment', 'in_progress', -9004, '2026-08-11 12:00:00', 'มอบหมายงาน'),
(-9020, -9009, 'waiting_deposit', 'waiting_assignment', -9004, '2026-08-12 11:00:00', 'อนุมัติมัดจำ'),
(-9021, -9009, 'waiting_assignment', 'in_progress', -9004, '2026-08-12 12:00:00', 'มอบหมายงาน'),
(-9022, -9009, 'in_progress', 'waiting_selection', -9002, '2026-08-12 14:00:00', 'อัปโหลดผลงานให้เลือก'),
(-9023, -9009, 'waiting_selection', 'waiting_final_payment', -9001, '2026-08-12 15:00:00', 'ลูกค้าเลือกภาพแล้ว'),
(-9024, -9009, 'waiting_final_payment', 'delivered', -9004, '2026-08-12 16:00:00', 'อนุมัติยอดคงเหลือ'),
(-9025, -9010, 'waiting_deposit', 'waiting_assignment', -9004, '2026-08-13 11:00:00', 'อนุมัติมัดจำ'),
(-9026, -9010, 'waiting_assignment', 'in_progress', -9004, '2026-08-13 12:00:00', 'มอบหมายงาน'),
(-9027, -9010, 'in_progress', 'waiting_selection', -9002, '2026-08-13 14:00:00', 'อัปโหลดผลงานให้เลือก'),
(-9028, -9010, 'waiting_selection', 'waiting_final_payment', -9001, '2026-08-13 15:00:00', 'ลูกค้าเลือกภาพแล้ว');

-- =====================================================================
-- 12. Gallery
-- =====================================================================
INSERT INTO `galleryImages` (`imageId`, `imageUrl`, `workTypeId`, `imageTitle`, `imageDescription`, `imageIsActive`) VALUES
(-9001, '/uploads/gallery/seed-gallery-01.png', -9001, 'Gallery Image 1', 'Description 1', 1),
(-9002, '/uploads/gallery/seed-gallery-02.png', -9002, 'Gallery Image 2', 'Description 2', 1),
(-9003, '/uploads/gallery/seed-gallery-03.png', -9003, 'Gallery Image 3', 'Description 3', 1),
(-9004, '/uploads/gallery/seed-gallery-04.png', -9001, 'Gallery Image 4', 'Description 4', 1),
(-9005, '/uploads/gallery/seed-gallery-05.png', -9002, 'Gallery Image 5', 'Description 5', 1),
(-9006, '/uploads/gallery/seed-gallery-01.png', -9003, 'Gallery Image 6', 'Description 6', 1),
(-9007, '/uploads/gallery/seed-gallery-02.png', -9001, 'Gallery Action Target', 'Description 7', 0);

-- =====================================================================
-- 13. Gallery Tags
-- =====================================================================
INSERT INTO `galleryImageTags` (`imageId`, `tagId`) VALUES
(-9001, -9001),
(-9002, -9002),
(-9003, -9003),
(-9004, -9004),
(-9005, -9005),
(-9006, -9001);

COMMIT;
