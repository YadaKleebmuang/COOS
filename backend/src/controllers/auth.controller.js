const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// POST /auth/register
exports.register = async (req, res, next) => {
  try {
    // รับค่าจาก body (ไม่รับ userRole — ป้องกัน Role Hijack)
    const {
      userFirstName,
      userLastName,
      userEmail,
      userPassword,
      userPhone,
      userAddress,
    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น (Validation)
    if (!userFirstName || !userLastName || !userEmail || !userPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (userPassword.length < 8) {
      return res.status(400).json({ message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" });
    }

    // [Security] role ถูก hardcode เป็น "customer" เสมอ
    // การสร้าง editor/admin ทำได้ผ่าน Admin Panel เท่านั้น
    const role = "customer";

    // Hash Password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // บันทึกข้อมูลผู้ใช้ใหม่
    const userId = await UserModel.create({
      userFirstName,
      userLastName,
      userEmail,
      userPassword: hashedPassword,
      userPhone,
      userAddress,
      userRole: role,
    });

    // ส่งผลลัพธ์กลับไปยังไคลเอนต์
    res.status(201).json({
      message: "User created",
      id: userId,
    });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    // รับค่าจาก body
    const { userEmail, userPassword } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น (Validation)
    if (!userEmail || !userPassword) {
      return res.status(400).json({
        message: "Missing email or password",
      });
    }

    // ค้นหาผู้ใช้จาก email
    const user = await UserModel.findByEmail(userEmail);

    // ตรวจสอบว่าพบผู้ใช้หรือไม่
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // เปรียบเทียบ password (สำคัญมาก)
    const isPasswordMatch = await bcrypt.compare(
      userPassword, // password ที่ user กรอก
      user.userPassword, // password ที่ hash แล้วใน DB
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // สร้าง JWT
    const token = jwt.sign(
      {
        userId: user.userId,
        userFirstName: user.userFirstName,
        userLastName: user.userLastName,
        userRole: user.userRole,
        userEmail: user.userEmail,
        userProfileImage: user.userProfileImage,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      },
    );

    // Login สำเร็จ
    res.status(200).json({
      message: "Login success",
      token: token,
      user: {
        userId: user.userId,
        userFirstName: user.userFirstName,
        userLastName: user.userLastName,
        userEmail: user.userEmail,
        userRole: user.userRole,
        userProfileImage: user.userProfileImage,
      },
    });
  } catch (err) {
    next(err);
  }
};

// POST /auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ message: "กรุณากรอก email" });
    }

    // ตรวจสอบว่ามี user นี้ในระบบหรือไม่
    const user = await UserModel.findByEmail(userEmail);
    if (!user) {
      // Return the exact same message to prevent enumeration
      return res.status(200).json({ message: "ถ้า email นี้มีในระบบ เราจะส่งลิงก์ให้" });
    }

    // สร้าง random token (32 bytes → 64 hex chars)
    const resetToken = crypto.randomBytes(32).toString("hex");

    // ตั้งวันหมดอายุ 1 ชั่วโมง
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    // บันทึกลง DB
    await UserModel.saveResetToken(userEmail, resetToken, expiry);

    // ส่ง email
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8888";
    try {
      const { sendResetEmail } = require("../utils/email");
      await sendResetEmail(userEmail, resetToken, frontendUrl);
    } catch (emailErr) {
      console.error("Email Error:", emailErr);
      // We still return success to the user so they don't know the email exists or failed
    }

    res.status(200).json({
      message: "ถ้า email นี้มีในระบบ เราจะส่งลิงก์ให้",
    });
  } catch (err) {
    next(err);
  }
};

// POST /auth/reset-password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "กรุณากรอก token และรหัสผ่านใหม่" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" });
    }

    // ค้นหา user จาก token ที่ยังไม่หมดอายุ
    const user = await UserModel.findByResetToken(token);
    if (!user) {
      return res.status(400).json({ message: "Token ไม่ถูกต้องหรือหมดอายุแล้ว" });
    }

    // Hash password ใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // อัปเดต password + ลบ token
    await UserModel.resetPassword(user.userId, hashedPassword);

    res.status(200).json({ message: "เปลี่ยนรหัสผ่านสำเร็จ" });
  } catch (err) {
    next(err);
  }
};
