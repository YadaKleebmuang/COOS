-- ================================================================
-- COOS DEVELOPMENT SEED DATA
-- Target path: backend/seeds/development_seed.sql
-- Purpose: Development / Frontend UI / QA only
-- DO NOT run against production or a database containing real user data.
--
-- Verified against uploaded COOS backend source:
--   bcrypt.hash(password, 10)
--   bcrypt.compare(...)
--   default backend port = 3000
--   static root: app.use('/uploads', express.static(backend/uploads))
--
-- All seed accounts use password: CoosTest123!
-- Change @BACKEND_BASE_URL below if your backend host/port is different.
-- ================================================================

SET NAMES utf8mb4;
USE `coosdb`;
SET @BACKEND_BASE_URL := 'http://localhost:3000';
SET @SEED_PASSWORD_HASH := '$2b$10$heEknby85fVcqDXiZWQop.U/9ErSym34SC/NBmig3aE4k8u0USYZi';

START TRANSACTION;

-- ================================================================
-- 0. CLEAN PREVIOUS SEED RECORDS
-- Fixed negative IDs are reserved for this development seed only.
-- They keep normal positive AUTO_INCREMENT IDs readable.
-- ================================================================
DELETE FROM `galleryImageTags` WHERE `imageId` BETWEEN -4020 AND -4001;
DELETE FROM `workflowLogs` WHERE `logId` BETWEEN -8999 AND -8001;
DELETE FROM `payments` WHERE `paymentId` BETWEEN -7999 AND -7001;
DELETE FROM `orderImages` WHERE `orderImageId` BETWEEN -9999 AND -9001;
DELETE FROM `orders` WHERE `orderId` BETWEEN -6024 AND -6001;
DELETE FROM `galleryImages` WHERE `imageId` BETWEEN -4020 AND -4001;
DELETE FROM `policies` WHERE `policyId` BETWEEN -4505 AND -4501;
DELETE FROM `tags` WHERE `tagId` BETWEEN -5012 AND -5001;
DELETE FROM `packages` WHERE `packageId` BETWEEN -3005 AND -3001;
DELETE FROM `workTypes` WHERE `workTypeId` BETWEEN -2007 AND -2001;
DELETE FROM `users` WHERE `userId` BETWEEN -1210 AND -1001;

-- ================================================================
-- 1. USERS: 2 Admin + 4 Editor + 10 Customer
-- ================================================================
INSERT INTO `users`
(`userId`,`userFirstName`,`userLastName`,`userEmail`,`userPassword`,`userPhone`,`userAddress`,`userProfileImage`,`userContactChannels`,`userRole`,`userCreatedAt`) VALUES
(-1001,'กานต์','ผู้ดูแล','admin.main@seed.coos.test',@SEED_PASSWORD_HASH,'0810001001','COOS Studio กรุงเทพมหานคร',CONCAT(@BACKEND_BASE_URL, '/uploads/profiles/seed-profile-01.png'),'{"line":"@coos-admin","facebook":"coos.admin","instagram":"coos_admin"}','admin',DATE_SUB(NOW(), INTERVAL 180 DAY)),
(-1002,'นลิน','การเงิน','admin.payment@seed.coos.test',@SEED_PASSWORD_HASH,'0810001002','กรุงเทพมหานคร',CONCAT(@BACKEND_BASE_URL, '/uploads/profiles/seed-profile-02.png'),'{"line":"@coos-payment"}','admin',DATE_SUB(NOW(), INTERVAL 150 DAY)),
(-1101,'พีระ','นักออกแบบ','editor.busy@seed.coos.test',@SEED_PASSWORD_HASH,'0820001101','กรุงเทพมหานคร',CONCAT(@BACKEND_BASE_URL, '/uploads/profiles/seed-profile-03.png'),'{"line":"@peera.design","instagram":"peera.design"}','editor',DATE_SUB(NOW(), INTERVAL 120 DAY)),
(-1102,'มินตรา','นักออกแบบ','editor.normal@seed.coos.test',@SEED_PASSWORD_HASH,'0820001102','นนทบุรี',CONCAT(@BACKEND_BASE_URL, '/uploads/profiles/seed-profile-04.png'),'{"line":"@mintra.design","instagram":"mintra.art"}','editor',DATE_SUB(NOW(), INTERVAL 100 DAY)),
(-1103,'ธันวา','นักออกแบบ','editor.history@seed.coos.test',@SEED_PASSWORD_HASH,'0820001103','ปทุมธานี',CONCAT(@BACKEND_BASE_URL, '/uploads/profiles/seed-profile-05.png'),'{"line":"@thanwa.design"}','editor',DATE_SUB(NOW(), INTERVAL 90 DAY)),
(-1104,'อรยา','นักออกแบบ','editor.empty@seed.coos.test',@SEED_PASSWORD_HASH,'0820001104','สมุทรปราการ',CONCAT(@BACKEND_BASE_URL, '/uploads/profiles/seed-profile-01.png'),'{"instagram":"oraya.design"}','editor',DATE_SUB(NOW(), INTERVAL 30 DAY)),
(-1201,'อริสา','ลูกค้าทดสอบ','customer.full@seed.coos.test',@SEED_PASSWORD_HASH,'0830001201','บุรีรัมย์',CONCAT(@BACKEND_BASE_URL, '/uploads/profiles/seed-profile-02.png'),'{"line":"@arisa.seed","facebook":"arisa.seed","instagram":"arisa_seed"}','customer',DATE_SUB(NOW(), INTERVAL 140 DAY)),
(-1202,'ธนกฤต','ลูกค้าทดสอบ','customer.payment@seed.coos.test',@SEED_PASSWORD_HASH,'0830001202','กรุงเทพมหานคร',CONCAT(@BACKEND_BASE_URL, '/uploads/profiles/seed-profile-03.png'),'{"line":"@thanakrit.seed"}','customer',DATE_SUB(NOW(), INTERVAL 75 DAY)),
(-1203,'กัญญา','ลูกค้าทดสอบ','customer.urgent@seed.coos.test',@SEED_PASSWORD_HASH,'0830001203','ขอนแก่น',CONCAT(@BACKEND_BASE_URL, '/uploads/profiles/seed-profile-04.png'),'{"line":"@kanya.seed"}','customer',DATE_SUB(NOW(), INTERVAL 60 DAY)),
(-1204,'ภูริ','ลูกค้าทดสอบ','customer.gallery@seed.coos.test',@SEED_PASSWORD_HASH,'0830001204','เชียงใหม่',CONCAT(@BACKEND_BASE_URL, '/uploads/profiles/seed-profile-05.png'),'{"instagram":"phuri.seed"}','customer',DATE_SUB(NOW(), INTERVAL 55 DAY)),
(-1205,'นภัส','ลูกค้าเดิม','customer.returning@seed.coos.test',@SEED_PASSWORD_HASH,'0830001205','นครราชสีมา',NULL,'{"line":"@napat.seed","facebook":"napat.seed"}','customer',DATE_SUB(NOW(), INTERVAL 200 DAY)),
(-1206,'ศิริน','ลูกค้าทดสอบ','customer.cancelled@seed.coos.test',@SEED_PASSWORD_HASH,'0830001206','ชลบุรี',NULL,NULL,'customer',DATE_SUB(NOW(), INTERVAL 40 DAY)),
(-1207,'เมษา','ลูกค้าใหม่','customer.new@seed.coos.test',@SEED_PASSWORD_HASH,'0830001207','บุรีรัมย์',NULL,'{"line":"@mesa.seed"}','customer',DATE_SUB(NOW(), INTERVAL 1 DAY)),
(-1208,'วริศ','ลูกค้าทดสอบ','customer.active@seed.coos.test',@SEED_PASSWORD_HASH,'0830001208','สุรินทร์',NULL,'{"instagram":"warit.seed"}','customer',DATE_SUB(NOW(), INTERVAL 35 DAY)),
(-1209,'พิมล','ลูกค้าไม่มีออเดอร์','customer.empty@seed.coos.test',@SEED_PASSWORD_HASH,'0830001209','บุรีรัมย์',NULL,NULL,'customer',DATE_SUB(NOW(), INTERVAL 2 DAY)),
(-1210,'กร','โปรไฟล์ขั้นต่ำ','customer.minimal@seed.coos.test',@SEED_PASSWORD_HASH,NULL,NULL,NULL,NULL,'customer',DATE_SUB(NOW(), INTERVAL 10 DAY));

-- ================================================================
-- 2. WORK TYPES: 6 Active + 1 Inactive
-- ================================================================
INSERT INTO `workTypes` (`workTypeId`,`workTypeName`,`workTypeDescription`,`workTypeIsActive`) VALUES
(-2001,'ภาพบุคคล','งานสร้างและปรับแต่งภาพบุคคลสำหรับโปรไฟล์ โซเชียล และงานส่วนตัว',1),
(-2002,'ภาพคู่','งานภาพคู่สำหรับคู่รัก เพื่อน หรือบุคคลสองคน',1),
(-2003,'ภาพครอบครัว','งานรวมบุคคลหลายคนในบรรยากาศครอบครัว',1),
(-2004,'ภาพสัตว์เลี้ยง','งานภาพสัตว์เลี้ยงและภาพร่วมกับเจ้าของ',1),
(-2005,'ภาพสินค้า','งานสร้างภาพสินค้าเพื่อใช้ประชาสัมพันธ์หรือร้านค้าออนไลน์',1),
(-2006,'คาแรกเตอร์และแฟนตาซี','งานออกแบบคาแรกเตอร์ ภาพแฟนตาซี และงานสไตล์สร้างสรรค์',1),
(-2007,'ประเภทงานที่ปิดใช้งาน','รายการสำหรับทดสอบ Active และ Inactive ในหน้า Admin',0);

-- ================================================================
-- 3. PACKAGES: 4 Active + 1 Inactive
-- ================================================================
INSERT INTO `packages` (`packageId`,`packageName`,`packageDescription`,`packageImageCount`,`packageResolution`,`packageDeliveryDays`,`packagePrice`,`packageUrgentPrice`,`packageGalleryDiscount`,`packageIsActive`) VALUES
(-3001,'Mini','แพ็กเกจเริ่มต้นสำหรับงานขนาดเล็กและต้องการจำนวนภาพไม่มาก',2,'FullHD',7,790.00,NULL,10.00,1),
(-3002,'Standard','แพ็กเกจมาตรฐาน เหมาะสำหรับงานทั่วไปและมีตัวเลือกบริการเร่งด่วน',5,'FullHD',7,1490.00,400.00,15.00,1),
(-3003,'Premium','แพ็กเกจความละเอียดสูงสำหรับงานที่ต้องการรายละเอียดและจำนวนภาพมากขึ้น',8,'4K',10,2490.00,700.00,20.00,1),
(-3004,'Professional','แพ็กเกจสำหรับงานชุดใหญ่ ความละเอียด 4K และจำนวนภาพสูง',12,'4K',14,3990.00,1000.00,25.00,1),
(-3005,'Legacy Package','แพ็กเกจเก่าสำหรับทดสอบรายการที่ปิดใช้งาน',3,'FullHD',10,990.00,250.00,20.00,0);

-- ================================================================
-- 4. POLICIES: active and archived examples
-- ================================================================
INSERT INTO `policies` (`policyId`,`policyTitle`,`policyContent`,`policyType`,`policyIsActive`,`policyCreatedAt`) VALUES
(-4501,'ข้อกำหนดและเงื่อนไขการใช้บริการ','ลูกค้าต้องตรวจสอบรายละเอียดคำสั่งซื้อ ราคา วันส่งมอบ และเงื่อนไขของแพ็กเกจก่อนยืนยันคำสั่งซื้อ การส่งข้อมูลและรูปภาพถือว่าอนุญาตให้ COOS ใช้ข้อมูลดังกล่าวเพื่อดำเนินงานตามคำสั่งซื้อเท่านั้น','terms',1,DATE_SUB(NOW(), INTERVAL 20 DAY)),
(-4502,'นโยบายความเป็นส่วนตัว','COOS ใช้ข้อมูลผู้ใช้งานเพื่อให้บริการ ติดต่อเกี่ยวกับคำสั่งซื้อ และดำเนินการตามสิทธิ์ของผู้ใช้งาน โดยข้อมูลทดสอบใน Development Seed นี้เป็นข้อมูลสมมติทั้งหมด','privacy',1,DATE_SUB(NOW(), INTERVAL 25 DAY)),
(-4503,'นโยบายการคืนเงิน','การคืนเงินขึ้นอยู่กับสถานะของคำสั่งซื้อ งานที่ได้เริ่มดำเนินการแล้ว และเงื่อนไขที่กำหนดในแพ็กเกจ โปรดติดต่อผู้ดูแลระบบเพื่อพิจารณาเป็นกรณี','refund',1,DATE_SUB(NOW(), INTERVAL 30 DAY)),
(-4504,'ข้อกำหนดเวอร์ชันเก่า','ข้อมูลเวอร์ชันเก่าสำหรับทดสอบสถานะ Inactive ในหน้าจัดการนโยบาย','terms',0,DATE_SUB(NOW(), INTERVAL 120 DAY)),
(-4505,'นโยบายคืนเงินเวอร์ชันเก่า','ข้อมูลเวอร์ชันเก่าสำหรับทดสอบรายการที่ถูกปิดใช้งาน','refund',0,DATE_SUB(NOW(), INTERVAL 150 DAY));

-- ================================================================
-- 5. TAGS
-- ================================================================
INSERT INTO `tags` (`tagId`,`tagName`) VALUES
(-5001,'Minimal'),
(-5002,'Anime'),
(-5003,'Realistic'),
(-5004,'Retro'),
(-5005,'Pastel'),
(-5006,'Warm'),
(-5007,'Cool'),
(-5008,'Dark'),
(-5009,'Portrait'),
(-5010,'Couple'),
(-5011,'Fantasy'),
(-5012,'Product');

-- ================================================================
-- 6. GALLERY IMAGES: 4 Active + 1 Inactive
-- Uses only real files under backend/uploads/gallery/.
-- ================================================================
INSERT INTO `galleryImages` (`imageId`,`imageUrl`,`workTypeId`,`imageTitle`,`imageDescription`,`imageIsActive`,`imageCreatedAt`) VALUES
(-4001,CONCAT(@BACKEND_BASE_URL, '/uploads/gallery/seed-gallery-01.png'),-2001,'ผลงานตัวอย่าง 01','ผลงานตัวอย่างสำหรับ Development Seed ลำดับที่ 01',1,DATE_SUB(NOW(), INTERVAL 68 DAY)),
(-4002,CONCAT(@BACKEND_BASE_URL, '/uploads/gallery/seed-gallery-02.png'),-2002,'ผลงานตัวอย่าง 02','ผลงานตัวอย่างสำหรับ Development Seed ลำดับที่ 02',1,DATE_SUB(NOW(), INTERVAL 66 DAY)),
(-4003,CONCAT(@BACKEND_BASE_URL, '/uploads/gallery/seed-gallery-03.png'),-2003,NULL,'ผลงานตัวอย่างสำหรับ Development Seed ลำดับที่ 03',1,DATE_SUB(NOW(), INTERVAL 64 DAY)),
(-4004,CONCAT(@BACKEND_BASE_URL, '/uploads/gallery/seed-gallery-04.png'),-2004,'ผลงานตัวอย่าง 04','ตัวอย่างคำอธิบายแบบยาวสำหรับทดสอบการตัดข้อความ การขยายรายละเอียด และ responsive layout บนหน้าสาธารณะและหน้าจัดการแกลเลอรีของผู้ดูแลระบบ',1,DATE_SUB(NOW(), INTERVAL 62 DAY)),
(-4005,CONCAT(@BACKEND_BASE_URL, '/uploads/gallery/seed-gallery-05.png'),-2005,'ผลงานตัวอย่าง 05','ผลงานตัวอย่างสำหรับ Development Seed ลำดับที่ 05',0,DATE_SUB(NOW(), INTERVAL 60 DAY));

-- ================================================================
-- 7. GALLERY IMAGE TAGS
-- ================================================================
INSERT INTO `galleryImageTags` (`imageId`,`tagId`) VALUES
(-4001,-5009),
(-4001,-5001),
(-4001,-5006),
(-4002,-5010),
(-4002,-5005),
(-4002,-5006),
(-4003,-5003),
(-4004,-5004),
(-4004,-5006),
(-4004,-5009),
(-4005,-5005),
(-4005,-5009);

-- ================================================================
-- 8. ORDERS: 24 records covering all 9 schema statuses
-- ================================================================
INSERT INTO `orders` (`orderId`,`customerId`,`editorId`,`packageId`,`workTypeId`,`orderStyle`,`orderColorTone`,`orderComposition`,`orderNote`,`orderRequiredDate`,`orderIsUrgent`,`orderIsGalleryAllowed`,`orderBasePrice`,`orderUrgentPrice`,`orderDiscount`,`orderTotalPrice`,`orderStatus`,`orderCreatedAt`,`orderUpdatedAt`) VALUES
(-6001,-1201,NULL,-3001,-2001,'Minimal','Warm','ฉากเรียบ โฟกัสใบหน้า','ต้องการภาพโปรไฟล์สำหรับใช้งานทั่วไป',DATE_ADD(CURDATE(), INTERVAL 5 DAY),0,0,790.00,0.00,0.00,790.00,'waiting_deposit',DATE_SUB(NOW(), INTERVAL 2 DAY),DATE_SUB(NOW(), INTERVAL 2 DAY)),
(-6002,-1201,NULL,-3002,-2002,'Realistic','Pastel','ฉากสตูดิโอสว่าง','ขอภาพคู่บรรยากาศเป็นธรรมชาติ',DATE_ADD(CURDATE(), INTERVAL 7 DAY),0,0,1490.00,0.00,0.00,1490.00,'waiting_assignment',DATE_SUB(NOW(), INTERVAL 5 DAY),DATE_SUB(NOW(), INTERVAL 4 DAY)),
(-6003,-1201,-1101,-3003,-2003,'Realistic','Warm','ห้องนั่งเล่น โทนอบอุ่น','จัดองค์ประกอบให้สมาชิกทุกคนเด่นใกล้เคียงกัน',DATE_ADD(CURDATE(), INTERVAL 8 DAY),0,0,2490.00,0.00,0.00,2490.00,'waiting_to_start',DATE_SUB(NOW(), INTERVAL 7 DAY),DATE_SUB(NOW(), INTERVAL 5 DAY)),
(-6004,-1201,-1101,-3002,-2001,'Retro','Cool','ฉากเมืองตอนเย็น','งานด่วนและต้องการ mood cinematic',DATE_SUB(CURDATE(), INTERVAL 1 DAY),1,0,1490.00,400.00,0.00,1890.00,'in_progress',DATE_SUB(NOW(), INTERVAL 10 DAY),DATE_SUB(NOW(), INTERVAL 7 DAY)),
(-6005,-1201,-1101,-3003,-2004,'Anime','Pastel','สวนดอกไม้และท้องฟ้าใส','ต้องการตัวเลือกหลายแบบก่อนเลือกรูปสุดท้าย',CURDATE(),0,1,2490.00,0.00,498.00,1992.00,'waiting_selection',DATE_SUB(NOW(), INTERVAL 14 DAY),DATE_SUB(NOW(), INTERVAL 8 DAY)),
(-6006,-1201,-1101,-3004,-2006,'Fantasy','Dark','ปราสาทแฟนตาซี แสงกลางคืน','รายละเอียดสูงสำหรับภาพหลักและอนุญาตให้นำผลงานไปใช้ใน Gallery',DATE_ADD(CURDATE(), INTERVAL 2 DAY),0,1,3990.00,0.00,997.50,2992.50,'waiting_final_payment',DATE_SUB(NOW(), INTERVAL 20 DAY),DATE_SUB(NOW(), INTERVAL 10 DAY)),
(-6007,-1201,-1102,-3002,-2005,'Minimal','Cool','พื้นหลังสะอาดสำหรับสินค้า','สถานะ delivered นี้ใช้ทดสอบ UI และเกิดจาก Admin override ที่ Backend อนุญาต',DATE_SUB(CURDATE(), INTERVAL 10 DAY),0,0,1490.00,0.00,0.00,1490.00,'delivered',DATE_SUB(NOW(), INTERVAL 30 DAY),DATE_SUB(NOW(), INTERVAL 18 DAY)),
(-6008,-1201,-1102,-3003,-2001,'Realistic','Warm','ฉากกลางแจ้งแสงธรรมชาติ','ออเดอร์ตัวอย่างที่ดำเนินการครบ Flow',DATE_SUB(CURDATE(), INTERVAL 55 DAY),0,0,2490.00,0.00,0.00,2490.00,'completed',DATE_SUB(NOW(), INTERVAL 70 DAY),DATE_SUB(NOW(), INTERVAL 58 DAY)),
(-6009,-1201,NULL,-3001,-2004,NULL,NULL,NULL,'ลูกค้ายกเลิกก่อนชำระมัดจำ',DATE_ADD(CURDATE(), INTERVAL 4 DAY),0,0,790.00,0.00,0.00,790.00,'cancelled',DATE_SUB(NOW(), INTERVAL 3 DAY),DATE_SUB(NOW(), INTERVAL 2 DAY)),
(-6010,-1202,NULL,-3002,-2002,'Minimal','Pastel','ฉากเรียบ','มีสลิปมัดจำกำลังรอตรวจสอบ',DATE_ADD(CURDATE(), INTERVAL 6 DAY),0,0,1490.00,0.00,0.00,1490.00,'waiting_deposit',DATE_SUB(NOW(), INTERVAL 1 DAY),DATE_SUB(NOW(), INTERVAL 1 DAY)),
(-6011,-1202,NULL,-3003,-2001,'Realistic','Warm','ฉากคาเฟ่','มีสลิปมัดจำที่ถูกปฏิเสธเพื่อทดสอบการส่งใหม่',DATE_ADD(CURDATE(), INTERVAL 9 DAY),0,0,2490.00,0.00,0.00,2490.00,'waiting_deposit',DATE_SUB(NOW(), INTERVAL 4 DAY),DATE_SUB(NOW(), INTERVAL 3 DAY)),
(-6012,-1202,-1102,-3002,-2002,'Pastel','Warm','ฉากสวน','มัดจำผ่านแล้ว แต่การชำระงวดสุดท้ายถูกปฏิเสธ',DATE_ADD(CURDATE(), INTERVAL 3 DAY),0,1,1490.00,0.00,223.50,1266.50,'waiting_final_payment',DATE_SUB(NOW(), INTERVAL 18 DAY),DATE_SUB(NOW(), INTERVAL 9 DAY)),
(-6013,-1202,-1103,-3004,-2003,'Realistic','Warm','บ้านและสวน','ตัวอย่าง Completed Order พร้อมการชำระครบสองงวด',DATE_SUB(CURDATE(), INTERVAL 70 DAY),0,0,3990.00,0.00,0.00,3990.00,'completed',DATE_SUB(NOW(), INTERVAL 90 DAY),DATE_SUB(NOW(), INTERVAL 76 DAY)),
(-6014,-1203,NULL,-3002,-2005,'Minimal','Cool','พื้นหลังสินค้าเรียบ','ออเดอร์เร่งด่วนที่ชำระมัดจำแล้วและรอ Admin มอบหมาย',DATE_ADD(CURDATE(), INTERVAL 3 DAY),1,0,1490.00,400.00,0.00,1890.00,'waiting_assignment',DATE_SUB(NOW(), INTERVAL 6 DAY),DATE_SUB(NOW(), INTERVAL 5 DAY)),
(-6015,-1203,-1101,-3003,-2001,'Realistic','Cool','ฉากเมือง','ออเดอร์เร่งด่วนที่ได้รับ Editor แล้ว',DATE_ADD(CURDATE(), INTERVAL 4 DAY),1,0,2490.00,700.00,0.00,3190.00,'waiting_to_start',DATE_SUB(NOW(), INTERVAL 8 DAY),DATE_SUB(NOW(), INTERVAL 6 DAY)),
(-6016,-1203,-1101,-3004,-2006,'Fantasy','Dark','เมืองอนาคตและแสงนีออน','งานด่วนขนาดใหญ่ กำลังอยู่ระหว่างการสร้างภาพ',DATE_ADD(CURDATE(), INTERVAL 1 DAY),1,0,3990.00,1000.00,0.00,4990.00,'in_progress',DATE_SUB(NOW(), INTERVAL 12 DAY),DATE_SUB(NOW(), INTERVAL 8 DAY)),
(-6017,-1203,-1101,-3003,-2006,'Anime','Warm','ฉากแฟนตาซีโทนอุ่น','ออเดอร์ด่วนที่อนุญาต Gallery และเสร็จสมบูรณ์',DATE_SUB(CURDATE(), INTERVAL 30 DAY),1,1,2490.00,700.00,498.00,2692.00,'completed',DATE_SUB(NOW(), INTERVAL 45 DAY),DATE_SUB(NOW(), INTERVAL 34 DAY)),
(-6018,-1204,-1101,-3002,-2001,'Minimal','Pastel','ฉากสตูดิโอ','อนุญาต Gallery เพื่อทดสอบการแสดงส่วนลด',DATE_ADD(CURDATE(), INTERVAL 5 DAY),0,1,1490.00,0.00,223.50,1266.50,'in_progress',DATE_SUB(NOW(), INTERVAL 9 DAY),DATE_SUB(NOW(), INTERVAL 5 DAY)),
(-6019,-1204,-1101,-3004,-2006,'Fantasy','Cool','ป่าเวทมนตร์','มีภาพ AI หลายตัวเลือกและกำลังรอลูกค้าเลือก',DATE_ADD(CURDATE(), INTERVAL 2 DAY),0,1,3990.00,0.00,997.50,2992.50,'waiting_selection',DATE_SUB(NOW(), INTERVAL 16 DAY),DATE_SUB(NOW(), INTERVAL 9 DAY)),
(-6020,-1205,-1103,-3001,-2004,'Realistic','Warm','สนามหญ้า','ลูกค้าเดิม สถานะ Delivered สำหรับหน้า History',DATE_SUB(CURDATE(), INTERVAL 40 DAY),0,0,790.00,0.00,0.00,790.00,'delivered',DATE_SUB(NOW(), INTERVAL 60 DAY),DATE_SUB(NOW(), INTERVAL 48 DAY)),
(-6021,-1205,-1103,-3002,-2003,'Realistic','Pastel','บ้านโทนอ่อน','ลูกค้าเดิม มีประวัติ Completed Order',DATE_SUB(CURDATE(), INTERVAL 68 DAY),0,0,1490.00,0.00,0.00,1490.00,'completed',DATE_SUB(NOW(), INTERVAL 85 DAY),DATE_SUB(NOW(), INTERVAL 73 DAY)),
(-6022,-1206,NULL,-3002,-2005,NULL,'Cool',NULL,'ยกเลิกออเดอร์ก่อนเริ่มงาน',DATE_SUB(CURDATE(), INTERVAL 20 DAY),0,0,1490.00,0.00,0.00,1490.00,'cancelled',DATE_SUB(NOW(), INTERVAL 25 DAY),DATE_SUB(NOW(), INTERVAL 24 DAY)),
(-6023,-1207,-1102,-3001,-2001,'Minimal',NULL,'ฉากเรียบ',NULL,DATE_ADD(CURDATE(), INTERVAL 6 DAY),0,0,790.00,0.00,0.00,790.00,'waiting_to_start',DATE_SUB(NOW(), INTERVAL 2 DAY),DATE_SUB(NOW(), INTERVAL 1 DAY)),
(-6024,-1208,-1102,-3003,-2002,'Realistic','Earth Tone','ธรรมชาติและภูเขา','ตัวอย่าง Active Order สำหรับลูกค้าที่มีงานกำลังดำเนินการ',DATE_ADD(CURDATE(), INTERVAL 4 DAY),0,0,2490.00,0.00,0.00,2490.00,'in_progress',DATE_SUB(NOW(), INTERVAL 11 DAY),DATE_SUB(NOW(), INTERVAL 6 DAY));

-- ================================================================
-- 9. ORDER IMAGES
-- selected_final retains AI metadata to match selectFinalImages(),
-- which changes imageType but does not erase AI prompt fields.
-- ================================================================
INSERT INTO `orderImages` (`orderImageId`,`orderId`,`imageType`,`imageUrl`,`imageThumbnailUrl`,`aiEngine`,`positivePrompt`,`negativePrompt`,`cfgScale`,`steps`,`seed`,`imageCreatedAt`) VALUES
(-9001,-6001,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-01.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 2 DAY)),
(-9002,-6002,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-02.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 5 DAY)),
(-9003,-6003,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-03.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 7 DAY)),
(-9004,-6004,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-04.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 10 DAY)),
(-9005,-6005,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-05.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 14 DAY)),
(-9006,-6006,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-06.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 20 DAY)),
(-9007,-6007,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-07.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 30 DAY)),
(-9008,-6008,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-08.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 70 DAY)),
(-9009,-6009,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-09.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 3 DAY)),
(-9010,-6010,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-10.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 1 DAY)),
(-9011,-6011,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-11.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 4 DAY)),
(-9012,-6012,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-12.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 18 DAY)),
(-9013,-6013,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-13.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 90 DAY)),
(-9014,-6014,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-14.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 6 DAY)),
(-9015,-6015,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-15.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 8 DAY)),
(-9016,-6016,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-16.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 12 DAY)),
(-9017,-6017,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-17.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 45 DAY)),
(-9018,-6018,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-18.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 9 DAY)),
(-9019,-6019,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-19.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 16 DAY)),
(-9020,-6020,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-20.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 60 DAY)),
(-9021,-6021,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-21.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 85 DAY)),
(-9022,-6022,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-22.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 25 DAY)),
(-9023,-6023,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-23.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 2 DAY)),
(-9024,-6024,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-24.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 11 DAY)),
(-9025,-6003,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-25.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 7 DAY)),
(-9026,-6005,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-26.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 14 DAY)),
(-9027,-6006,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-27.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 20 DAY)),
(-9028,-6008,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-28.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 70 DAY)),
(-9029,-6013,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-29.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 90 DAY)),
(-9030,-6019,'source',CONCAT(@BACKEND_BASE_URL, '/uploads/sources/seed-source-30.png'),NULL,NULL,NULL,NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 16 DAY)),
(-9031,-6004,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-01.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-01.png'),'Flux','high quality Flux concept for COOS seed order 6004, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100001',DATE_SUB(NOW(), INTERVAL 7 DAY)),
(-9032,-6004,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-02.png'),NULL,'Stable Diffusion','high quality Stable Diffusion concept for COOS seed order 6004, balanced composition, detailed lighting',NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 7 DAY)),
(-9033,-6005,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-03.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-03.png'),'Midjourney','high quality Midjourney concept for COOS seed order 6005, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100003',DATE_SUB(NOW(), INTERVAL 11 DAY)),
(-9034,-6005,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-04.png'),NULL,'Flux','high quality Flux concept for COOS seed order 6005, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.5,32,'100004',DATE_SUB(NOW(), INTERVAL 11 DAY)),
(-9035,-6005,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-05.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-05.png'),'Stable Diffusion','high quality Stable Diffusion concept for COOS seed order 6005, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',8.0,36,'100005',DATE_SUB(NOW(), INTERVAL 11 DAY)),
(-9036,-6005,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-06.png'),NULL,'Midjourney','high quality Midjourney concept for COOS seed order 6005, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,40,'100006',DATE_SUB(NOW(), INTERVAL 11 DAY)),
(-9037,-6006,'selected_final',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-07.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-07.png'),'Flux','high quality Flux concept for COOS seed order 6006, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100007',DATE_SUB(NOW(), INTERVAL 17 DAY)),
(-9038,-6006,'selected_final',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-08.png'),NULL,'Stable Diffusion','high quality Stable Diffusion concept for COOS seed order 6006, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.5,32,'100008',DATE_SUB(NOW(), INTERVAL 17 DAY)),
(-9039,-6006,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-09.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-09.png'),'Midjourney','high quality Midjourney concept for COOS seed order 6006, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',8.0,36,'100009',DATE_SUB(NOW(), INTERVAL 17 DAY)),
(-9040,-6006,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-10.png'),NULL,'Flux','high quality Flux concept for COOS seed order 6006, balanced composition, detailed lighting',NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 17 DAY)),
(-9041,-6007,'selected_final',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-01.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-01.png'),'Stable Diffusion','high quality Stable Diffusion concept for COOS seed order 6007, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100011',DATE_SUB(NOW(), INTERVAL 27 DAY)),
(-9042,-6008,'selected_final',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-02.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-02.png'),'Midjourney','high quality Midjourney concept for COOS seed order 6008, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100012',DATE_SUB(NOW(), INTERVAL 67 DAY)),
(-9043,-6008,'selected_final',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-03.png'),NULL,'Flux','high quality Flux concept for COOS seed order 6008, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.5,32,'100013',DATE_SUB(NOW(), INTERVAL 67 DAY)),
(-9044,-6012,'selected_final',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-04.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-04.png'),'Stable Diffusion','high quality Stable Diffusion concept for COOS seed order 6012, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100014',DATE_SUB(NOW(), INTERVAL 15 DAY)),
(-9045,-6012,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-05.png'),NULL,'Midjourney','high quality Midjourney concept for COOS seed order 6012, balanced composition, detailed lighting',NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 15 DAY)),
(-9046,-6013,'selected_final',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-06.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-06.png'),'Flux','high quality Flux concept for COOS seed order 6013, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100016',DATE_SUB(NOW(), INTERVAL 87 DAY)),
(-9047,-6013,'selected_final',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-07.png'),NULL,'Stable Diffusion','high quality Stable Diffusion concept for COOS seed order 6013, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.5,32,'100017',DATE_SUB(NOW(), INTERVAL 87 DAY)),
(-9048,-6016,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-08.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-08.png'),'Midjourney','high quality Midjourney concept for COOS seed order 6016, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100018',DATE_SUB(NOW(), INTERVAL 9 DAY)),
(-9049,-6016,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-09.png'),NULL,'Flux','high quality Flux concept for COOS seed order 6016, balanced composition, detailed lighting',NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 9 DAY)),
(-9050,-6017,'selected_final',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-10.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-10.png'),'Stable Diffusion','high quality Stable Diffusion concept for COOS seed order 6017, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100020',DATE_SUB(NOW(), INTERVAL 42 DAY)),
(-9051,-6017,'selected_final',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-01.png'),NULL,'Midjourney','high quality Midjourney concept for COOS seed order 6017, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.5,32,'100021',DATE_SUB(NOW(), INTERVAL 42 DAY)),
(-9052,-6018,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-02.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-02.png'),'Flux','high quality Flux concept for COOS seed order 6018, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100022',DATE_SUB(NOW(), INTERVAL 6 DAY)),
(-9053,-6018,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-03.png'),NULL,'Stable Diffusion','high quality Stable Diffusion concept for COOS seed order 6018, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.5,32,'100023',DATE_SUB(NOW(), INTERVAL 6 DAY)),
(-9054,-6019,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-04.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-04.png'),'Midjourney','high quality Midjourney concept for COOS seed order 6019, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100024',DATE_SUB(NOW(), INTERVAL 13 DAY)),
(-9055,-6019,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-05.png'),NULL,'Flux','high quality Flux concept for COOS seed order 6019, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.5,32,'100025',DATE_SUB(NOW(), INTERVAL 13 DAY)),
(-9056,-6019,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-06.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-06.png'),'Stable Diffusion','high quality Stable Diffusion concept for COOS seed order 6019, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',8.0,36,'100026',DATE_SUB(NOW(), INTERVAL 13 DAY)),
(-9057,-6019,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-07.png'),NULL,'Midjourney','high quality Midjourney concept for COOS seed order 6019, balanced composition, detailed lighting',NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 13 DAY)),
(-9058,-6020,'selected_final',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-08.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-08.png'),'Flux','high quality Flux concept for COOS seed order 6020, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100028',DATE_SUB(NOW(), INTERVAL 57 DAY)),
(-9059,-6021,'selected_final',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-09.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-09.png'),'Stable Diffusion','high quality Stable Diffusion concept for COOS seed order 6021, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100029',DATE_SUB(NOW(), INTERVAL 82 DAY)),
(-9060,-6024,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-10.png'),CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-10.png'),'Midjourney','high quality Midjourney concept for COOS seed order 6024, balanced composition, detailed lighting','blurry, low quality, distorted anatomy, text watermark',7.0,28,'100030',DATE_SUB(NOW(), INTERVAL 8 DAY)),
(-9061,-6024,'ai_generated',CONCAT(@BACKEND_BASE_URL, '/uploads/ai-generated/seed-ai-01.png'),NULL,'Flux','high quality Flux concept for COOS seed order 6024, balanced composition, detailed lighting',NULL,NULL,NULL,NULL,DATE_SUB(NOW(), INTERVAL 8 DAY));

-- ================================================================
-- 10. PAYMENTS: deposit/final + pending/approved/rejected
-- Amounts follow the current backend contract: 30% deposit / 70% final.
-- ================================================================
INSERT INTO `payments` (`paymentId`,`orderId`,`paymentType`,`paymentAmount`,`paymentSlipUrl`,`paymentStatus`,`paymentCreatedAt`,`paymentVerifiedAt`,`verifiedByAdminId`) VALUES
(-7001,-6002,'deposit',447.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-01.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 4 DAY),DATE_SUB(NOW(), INTERVAL 3 DAY),-1001),
(-7002,-6003,'deposit',747.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-02.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 6 DAY),DATE_SUB(NOW(), INTERVAL 5 DAY),-1002),
(-7003,-6004,'deposit',567.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-03.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 9 DAY),DATE_SUB(NOW(), INTERVAL 8 DAY),-1001),
(-7004,-6005,'deposit',597.60,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-04.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 13 DAY),DATE_SUB(NOW(), INTERVAL 12 DAY),-1002),
(-7005,-6006,'deposit',897.75,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-05.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 19 DAY),DATE_SUB(NOW(), INTERVAL 18 DAY),-1001),
(-7006,-6007,'deposit',447.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-01.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 29 DAY),DATE_SUB(NOW(), INTERVAL 28 DAY),-1002),
(-7007,-6008,'deposit',747.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-02.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 69 DAY),DATE_SUB(NOW(), INTERVAL 68 DAY),-1001),
(-7008,-6012,'deposit',379.95,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-03.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 17 DAY),DATE_SUB(NOW(), INTERVAL 16 DAY),-1001),
(-7009,-6013,'deposit',1197.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-04.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 89 DAY),DATE_SUB(NOW(), INTERVAL 88 DAY),-1002),
(-7010,-6014,'deposit',567.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-05.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 5 DAY),DATE_SUB(NOW(), INTERVAL 4 DAY),-1001),
(-7011,-6015,'deposit',957.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-01.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 7 DAY),DATE_SUB(NOW(), INTERVAL 6 DAY),-1002),
(-7012,-6016,'deposit',1497.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-02.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 11 DAY),DATE_SUB(NOW(), INTERVAL 10 DAY),-1001),
(-7013,-6017,'deposit',807.60,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-03.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 44 DAY),DATE_SUB(NOW(), INTERVAL 43 DAY),-1002),
(-7014,-6018,'deposit',379.95,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-04.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 8 DAY),DATE_SUB(NOW(), INTERVAL 7 DAY),-1001),
(-7015,-6019,'deposit',897.75,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-05.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 15 DAY),DATE_SUB(NOW(), INTERVAL 14 DAY),-1002),
(-7016,-6020,'deposit',237.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-01.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 59 DAY),DATE_SUB(NOW(), INTERVAL 58 DAY),-1001),
(-7017,-6021,'deposit',447.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-02.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 84 DAY),DATE_SUB(NOW(), INTERVAL 83 DAY),-1002),
(-7018,-6023,'deposit',237.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-03.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 1 DAY),DATE_SUB(NOW(), INTERVAL 0 DAY),-1002),
(-7019,-6024,'deposit',747.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-04.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 10 DAY),DATE_SUB(NOW(), INTERVAL 9 DAY),-1001),
(-7020,-6010,'deposit',447.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-05.jpeg'),'pending',DATE_SUB(NOW(), INTERVAL 0 DAY),NULL,NULL),
(-7021,-6011,'deposit',747.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-01.jpeg'),'rejected',DATE_SUB(NOW(), INTERVAL 3 DAY),DATE_SUB(NOW(), INTERVAL 2 DAY),-1002),
(-7022,-6006,'final',2094.75,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-02.jpeg'),'pending',DATE_SUB(NOW(), INTERVAL 1 DAY),NULL,NULL),
(-7023,-6008,'final',1743.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-03.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 59 DAY),DATE_SUB(NOW(), INTERVAL 58 DAY),-1002),
(-7024,-6012,'final',886.55,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-04.jpeg'),'rejected',DATE_SUB(NOW(), INTERVAL 10 DAY),DATE_SUB(NOW(), INTERVAL 9 DAY),-1001),
(-7025,-6013,'final',2793.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-05.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 77 DAY),DATE_SUB(NOW(), INTERVAL 76 DAY),-1002),
(-7026,-6017,'final',1884.40,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-01.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 35 DAY),DATE_SUB(NOW(), INTERVAL 34 DAY),-1001),
(-7027,-6021,'final',1043.00,CONCAT(@BACKEND_BASE_URL, '/uploads/slips/seed-slip-02.jpeg'),'approved',DATE_SUB(NOW(), INTERVAL 74 DAY),DATE_SUB(NOW(), INTERVAL 73 DAY),-1002);

-- ================================================================
-- 11. WORKFLOW LOGS
-- Includes real state transitions and same-state reject verification logs.
-- delivered records intentionally use Admin override because the current
-- normal final-payment approval path jumps waiting_final_payment -> completed.
-- ================================================================
INSERT INTO `workflowLogs` (`logId`,`orderId`,`fromStatus`,`toStatus`,`changedById`,`changedAt`,`logNote`) VALUES
(-8001,-6001,'none','waiting_deposit',-1201,DATE_SUB(NOW(), INTERVAL 2 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8002,-6002,'none','waiting_deposit',-1201,DATE_SUB(NOW(), INTERVAL 5 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8003,-6002,'waiting_deposit','waiting_assignment',-1001,DATE_SUB(NOW(), INTERVAL 4 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8004,-6003,'none','waiting_deposit',-1201,DATE_SUB(NOW(), INTERVAL 7 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8005,-6003,'waiting_deposit','waiting_assignment',-1002,DATE_SUB(NOW(), INTERVAL 6 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8006,-6003,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 5 DAY),'มอบหมายงานให้ Editor ID: -1101'),
(-8007,-6004,'none','waiting_deposit',-1201,DATE_SUB(NOW(), INTERVAL 10 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8008,-6004,'waiting_deposit','waiting_assignment',-1001,DATE_SUB(NOW(), INTERVAL 9 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8009,-6004,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 8 DAY),'มอบหมายงานให้ Editor ID: -1101'),
(-8010,-6004,'waiting_to_start','in_progress',-1101,DATE_SUB(NOW(), INTERVAL 7 DAY),'Editor เริ่มดำเนินการสร้างผลงาน'),
(-8011,-6005,'none','waiting_deposit',-1201,DATE_SUB(NOW(), INTERVAL 14 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8012,-6005,'waiting_deposit','waiting_assignment',-1002,DATE_SUB(NOW(), INTERVAL 12 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8013,-6005,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 11 DAY),'มอบหมายงานให้ Editor ID: -1101'),
(-8014,-6005,'waiting_to_start','in_progress',-1101,DATE_SUB(NOW(), INTERVAL 10 DAY),'Editor เริ่มดำเนินการสร้างผลงาน'),
(-8015,-6005,'in_progress','waiting_selection',-1101,DATE_SUB(NOW(), INTERVAL 8 DAY),'Editor อัปโหลดผลงานสำหรับให้ลูกค้าคัดเลือก'),
(-8016,-6006,'none','waiting_deposit',-1201,DATE_SUB(NOW(), INTERVAL 20 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8017,-6006,'waiting_deposit','waiting_assignment',-1001,DATE_SUB(NOW(), INTERVAL 18 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8018,-6006,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 16 DAY),'มอบหมายงานให้ Editor ID: -1101'),
(-8019,-6006,'waiting_to_start','in_progress',-1101,DATE_SUB(NOW(), INTERVAL 14 DAY),'Editor เริ่มดำเนินการสร้างผลงาน'),
(-8020,-6006,'in_progress','waiting_selection',-1101,DATE_SUB(NOW(), INTERVAL 12 DAY),'Editor อัปโหลดผลงานสำหรับให้ลูกค้าคัดเลือก'),
(-8021,-6006,'waiting_selection','waiting_final_payment',-1201,DATE_SUB(NOW(), INTERVAL 10 DAY),'ลูกค้ายืนยันการเลือกรูปภาพผลงานเรียบร้อยแล้ว'),
(-8022,-6007,'none','waiting_deposit',-1201,DATE_SUB(NOW(), INTERVAL 30 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8023,-6007,'waiting_deposit','waiting_assignment',-1002,DATE_SUB(NOW(), INTERVAL 28 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8024,-6007,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 26 DAY),'มอบหมายงานให้ Editor ID: -1102'),
(-8025,-6007,'waiting_to_start','in_progress',-1102,DATE_SUB(NOW(), INTERVAL 24 DAY),'Editor เริ่มดำเนินการสร้างผลงาน'),
(-8026,-6007,'in_progress','waiting_selection',-1102,DATE_SUB(NOW(), INTERVAL 22 DAY),'Editor อัปโหลดผลงานสำหรับให้ลูกค้าคัดเลือก'),
(-8027,-6007,'waiting_selection','waiting_final_payment',-1201,DATE_SUB(NOW(), INTERVAL 20 DAY),'ลูกค้ายืนยันการเลือกรูปภาพผลงานเรียบร้อยแล้ว'),
(-8028,-6007,'waiting_final_payment','delivered',-1001,DATE_SUB(NOW(), INTERVAL 18 DAY),'Admin เปลี่ยนเป็น delivered เพื่อทดสอบสถานะที่ Schema รองรับ'),
(-8029,-6008,'none','waiting_deposit',-1201,DATE_SUB(NOW(), INTERVAL 70 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8030,-6008,'waiting_deposit','waiting_assignment',-1001,DATE_SUB(NOW(), INTERVAL 68 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8031,-6008,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 66 DAY),'มอบหมายงานให้ Editor ID: -1102'),
(-8032,-6008,'waiting_to_start','in_progress',-1102,DATE_SUB(NOW(), INTERVAL 64 DAY),'Editor เริ่มดำเนินการสร้างผลงาน'),
(-8033,-6008,'in_progress','waiting_selection',-1102,DATE_SUB(NOW(), INTERVAL 62 DAY),'Editor อัปโหลดผลงานสำหรับให้ลูกค้าคัดเลือก'),
(-8034,-6008,'waiting_selection','waiting_final_payment',-1201,DATE_SUB(NOW(), INTERVAL 60 DAY),'ลูกค้ายืนยันการเลือกรูปภาพผลงานเรียบร้อยแล้ว'),
(-8035,-6008,'waiting_final_payment','completed',-1001,DATE_SUB(NOW(), INTERVAL 58 DAY),'ยืนยันการชำระเงิน (เงินส่วนที่เหลือ): อนุมัติสำเร็จ'),
(-8036,-6009,'none','waiting_deposit',-1201,DATE_SUB(NOW(), INTERVAL 3 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8037,-6009,'waiting_deposit','cancelled',-1201,DATE_SUB(NOW(), INTERVAL 2 DAY),'ลูกค้ายกเลิกออเดอร์ก่อนเริ่มดำเนินการ'),
(-8038,-6010,'none','waiting_deposit',-1202,DATE_SUB(NOW(), INTERVAL 1 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8039,-6011,'none','waiting_deposit',-1202,DATE_SUB(NOW(), INTERVAL 4 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8040,-6011,'waiting_deposit','waiting_deposit',-1002,DATE_SUB(NOW(), INTERVAL 3 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): ปฏิเสธ/ไม่ผ่าน - สลิปไม่ชัดเจน กรุณาส่งใหม่'),
(-8041,-6012,'none','waiting_deposit',-1202,DATE_SUB(NOW(), INTERVAL 18 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8042,-6012,'waiting_deposit','waiting_assignment',-1001,DATE_SUB(NOW(), INTERVAL 16 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8043,-6012,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 15 DAY),'มอบหมายงานให้ Editor ID: -1102'),
(-8044,-6012,'waiting_to_start','in_progress',-1102,DATE_SUB(NOW(), INTERVAL 14 DAY),'Editor เริ่มดำเนินการสร้างผลงาน'),
(-8045,-6012,'in_progress','waiting_selection',-1102,DATE_SUB(NOW(), INTERVAL 12 DAY),'Editor อัปโหลดผลงานสำหรับให้ลูกค้าคัดเลือก'),
(-8046,-6012,'waiting_selection','waiting_final_payment',-1202,DATE_SUB(NOW(), INTERVAL 10 DAY),'ลูกค้ายืนยันการเลือกรูปภาพผลงานเรียบร้อยแล้ว'),
(-8047,-6012,'waiting_final_payment','waiting_final_payment',-1001,DATE_SUB(NOW(), INTERVAL 9 DAY),'ยืนยันการชำระเงิน (เงินส่วนที่เหลือ): ปฏิเสธ/ไม่ผ่าน - ยอดหรือหลักฐานไม่ชัดเจน'),
(-8048,-6013,'none','waiting_deposit',-1202,DATE_SUB(NOW(), INTERVAL 90 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8049,-6013,'waiting_deposit','waiting_assignment',-1002,DATE_SUB(NOW(), INTERVAL 88 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8050,-6013,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 85 DAY),'มอบหมายงานให้ Editor ID: -1103'),
(-8051,-6013,'waiting_to_start','in_progress',-1103,DATE_SUB(NOW(), INTERVAL 83 DAY),'Editor เริ่มดำเนินการสร้างผลงาน'),
(-8052,-6013,'in_progress','waiting_selection',-1103,DATE_SUB(NOW(), INTERVAL 81 DAY),'Editor อัปโหลดผลงานสำหรับให้ลูกค้าคัดเลือก'),
(-8053,-6013,'waiting_selection','waiting_final_payment',-1202,DATE_SUB(NOW(), INTERVAL 78 DAY),'ลูกค้ายืนยันการเลือกรูปภาพผลงานเรียบร้อยแล้ว'),
(-8054,-6013,'waiting_final_payment','completed',-1002,DATE_SUB(NOW(), INTERVAL 76 DAY),'ยืนยันการชำระเงิน (เงินส่วนที่เหลือ): อนุมัติสำเร็จ'),
(-8055,-6014,'none','waiting_deposit',-1203,DATE_SUB(NOW(), INTERVAL 6 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8056,-6014,'waiting_deposit','waiting_assignment',-1001,DATE_SUB(NOW(), INTERVAL 5 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8057,-6015,'none','waiting_deposit',-1203,DATE_SUB(NOW(), INTERVAL 8 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8058,-6015,'waiting_deposit','waiting_assignment',-1002,DATE_SUB(NOW(), INTERVAL 7 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8059,-6015,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 6 DAY),'มอบหมายงานให้ Editor ID: -1101'),
(-8060,-6016,'none','waiting_deposit',-1203,DATE_SUB(NOW(), INTERVAL 12 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8061,-6016,'waiting_deposit','waiting_assignment',-1001,DATE_SUB(NOW(), INTERVAL 11 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8062,-6016,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 9 DAY),'มอบหมายงานให้ Editor ID: -1101'),
(-8063,-6016,'waiting_to_start','in_progress',-1101,DATE_SUB(NOW(), INTERVAL 8 DAY),'Editor เริ่มดำเนินการสร้างผลงาน'),
(-8064,-6017,'none','waiting_deposit',-1203,DATE_SUB(NOW(), INTERVAL 45 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8065,-6017,'waiting_deposit','waiting_assignment',-1002,DATE_SUB(NOW(), INTERVAL 43 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8066,-6017,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 41 DAY),'มอบหมายงานให้ Editor ID: -1101'),
(-8067,-6017,'waiting_to_start','in_progress',-1101,DATE_SUB(NOW(), INTERVAL 40 DAY),'Editor เริ่มดำเนินการสร้างผลงาน'),
(-8068,-6017,'in_progress','waiting_selection',-1101,DATE_SUB(NOW(), INTERVAL 38 DAY),'Editor อัปโหลดผลงานสำหรับให้ลูกค้าคัดเลือก'),
(-8069,-6017,'waiting_selection','waiting_final_payment',-1203,DATE_SUB(NOW(), INTERVAL 36 DAY),'ลูกค้ายืนยันการเลือกรูปภาพผลงานเรียบร้อยแล้ว'),
(-8070,-6017,'waiting_final_payment','completed',-1002,DATE_SUB(NOW(), INTERVAL 34 DAY),'ยืนยันการชำระเงิน (เงินส่วนที่เหลือ): อนุมัติสำเร็จ'),
(-8071,-6018,'none','waiting_deposit',-1204,DATE_SUB(NOW(), INTERVAL 9 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8072,-6018,'waiting_deposit','waiting_assignment',-1001,DATE_SUB(NOW(), INTERVAL 8 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8073,-6018,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 6 DAY),'มอบหมายงานให้ Editor ID: -1101'),
(-8074,-6018,'waiting_to_start','in_progress',-1101,DATE_SUB(NOW(), INTERVAL 5 DAY),'Editor เริ่มดำเนินการสร้างผลงาน'),
(-8075,-6019,'none','waiting_deposit',-1204,DATE_SUB(NOW(), INTERVAL 16 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8076,-6019,'waiting_deposit','waiting_assignment',-1002,DATE_SUB(NOW(), INTERVAL 14 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8077,-6019,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 12 DAY),'มอบหมายงานให้ Editor ID: -1101'),
(-8078,-6019,'waiting_to_start','in_progress',-1101,DATE_SUB(NOW(), INTERVAL 11 DAY),'Editor เริ่มดำเนินการสร้างผลงาน'),
(-8079,-6019,'in_progress','waiting_selection',-1101,DATE_SUB(NOW(), INTERVAL 9 DAY),'Editor อัปโหลดผลงานสำหรับให้ลูกค้าคัดเลือก'),
(-8080,-6020,'none','waiting_deposit',-1205,DATE_SUB(NOW(), INTERVAL 60 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8081,-6020,'waiting_deposit','waiting_assignment',-1001,DATE_SUB(NOW(), INTERVAL 58 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8082,-6020,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 56 DAY),'มอบหมายงานให้ Editor ID: -1103'),
(-8083,-6020,'waiting_to_start','in_progress',-1103,DATE_SUB(NOW(), INTERVAL 54 DAY),'Editor เริ่มดำเนินการสร้างผลงาน'),
(-8084,-6020,'in_progress','waiting_selection',-1103,DATE_SUB(NOW(), INTERVAL 52 DAY),'Editor อัปโหลดผลงานสำหรับให้ลูกค้าคัดเลือก'),
(-8085,-6020,'waiting_selection','waiting_final_payment',-1205,DATE_SUB(NOW(), INTERVAL 50 DAY),'ลูกค้ายืนยันการเลือกรูปภาพผลงานเรียบร้อยแล้ว'),
(-8086,-6020,'waiting_final_payment','delivered',-1001,DATE_SUB(NOW(), INTERVAL 48 DAY),'Admin เปลี่ยนเป็น delivered เพื่อทดสอบสถานะที่ Schema รองรับ'),
(-8087,-6021,'none','waiting_deposit',-1205,DATE_SUB(NOW(), INTERVAL 85 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8088,-6021,'waiting_deposit','waiting_assignment',-1002,DATE_SUB(NOW(), INTERVAL 83 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8089,-6021,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 81 DAY),'มอบหมายงานให้ Editor ID: -1103'),
(-8090,-6021,'waiting_to_start','in_progress',-1103,DATE_SUB(NOW(), INTERVAL 79 DAY),'Editor เริ่มดำเนินการสร้างผลงาน'),
(-8091,-6021,'in_progress','waiting_selection',-1103,DATE_SUB(NOW(), INTERVAL 77 DAY),'Editor อัปโหลดผลงานสำหรับให้ลูกค้าคัดเลือก'),
(-8092,-6021,'waiting_selection','waiting_final_payment',-1205,DATE_SUB(NOW(), INTERVAL 75 DAY),'ลูกค้ายืนยันการเลือกรูปภาพผลงานเรียบร้อยแล้ว'),
(-8093,-6021,'waiting_final_payment','completed',-1002,DATE_SUB(NOW(), INTERVAL 73 DAY),'ยืนยันการชำระเงิน (เงินส่วนที่เหลือ): อนุมัติสำเร็จ'),
(-8094,-6022,'none','waiting_deposit',-1206,DATE_SUB(NOW(), INTERVAL 25 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8095,-6022,'waiting_deposit','cancelled',-1206,DATE_SUB(NOW(), INTERVAL 24 DAY),'ลูกค้ายกเลิกออเดอร์ก่อนเริ่มดำเนินการ'),
(-8096,-6023,'none','waiting_deposit',-1207,DATE_SUB(NOW(), INTERVAL 2 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8097,-6023,'waiting_deposit','waiting_assignment',-1002,DATE_SUB(NOW(), INTERVAL 2 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8098,-6023,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 1 DAY),'มอบหมายงานให้ Editor ID: -1102'),
(-8099,-6024,'none','waiting_deposit',-1208,DATE_SUB(NOW(), INTERVAL 11 DAY),'ออเดอร์ถูกสร้างขึ้นเริ่มต้นรอมัดจำ'),
(-8100,-6024,'waiting_deposit','waiting_assignment',-1001,DATE_SUB(NOW(), INTERVAL 9 DAY),'ยืนยันการชำระเงิน (เงินมัดจำ): อนุมัติสำเร็จ'),
(-8101,-6024,'waiting_assignment','waiting_to_start',-1001,DATE_SUB(NOW(), INTERVAL 8 DAY),'มอบหมายงานให้ Editor ID: -1102'),
(-8102,-6024,'waiting_to_start','in_progress',-1102,DATE_SUB(NOW(), INTERVAL 6 DAY),'Editor เริ่มดำเนินการสร้างผลงาน');

COMMIT;

-- ================================================================
-- 12. OPTIONAL QA CHECKS
-- Run these SELECTs after seeding.
-- ================================================================
SELECT `userRole`, COUNT(*) AS `count` FROM `users` WHERE `userId` BETWEEN -1210 AND -1001 GROUP BY `userRole`;
SELECT `orderStatus`, COUNT(*) AS `count` FROM `orders` WHERE `orderId` BETWEEN -6024 AND -6001 GROUP BY `orderStatus` ORDER BY `orderStatus`;
SELECT `paymentStatus`, COUNT(*) AS `count` FROM `payments` WHERE `paymentId` BETWEEN -7999 AND -7001 GROUP BY `paymentStatus`;
SELECT `paymentType`, COUNT(*) AS `count` FROM `payments` WHERE `paymentId` BETWEEN -7999 AND -7001 GROUP BY `paymentType`;
SELECT COUNT(*) AS `activeGalleryImages` FROM `galleryImages` WHERE `imageId` BETWEEN -4005 AND -4001 AND `imageIsActive` = 1;
SELECT COUNT(*) AS `inactiveGalleryImages` FROM `galleryImages` WHERE `imageId` BETWEEN -4005 AND -4001 AND `imageIsActive` = 0;

-- Primary QA accounts:
-- admin.main@seed.coos.test      / CoosTest123!
-- editor.busy@seed.coos.test     / CoosTest123!
-- editor.empty@seed.coos.test    / CoosTest123!
-- customer.full@seed.coos.test   / CoosTest123!
-- customer.empty@seed.coos.test  / CoosTest123!
