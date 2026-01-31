const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// POST /auth/register
exports.register = async (req, res) => {
  try {
    // รับค่าจาก body
    const {
      userFirstName,
      userLastName,
      userEmail,
      userPassword,
      userPhone,
      userAddress,
      userRole,
    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น (Validation)
    if (!userFirstName || !userLastName || !userEmail || !userPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // กำหนดค่า role เริ่มต้น
    const allowedRoles = ["editor", "admin"];
    // ถ้า role ที่ส่งมาไม่ถูกต้อง ให้ตั้งเป็น "customer"
    const role = allowedRoles.includes(userRole) ? userRole : "customer";

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
    res.status(500).json({ message: err.message });
  }
};

// POST /auth/login
exports.login = async (req, res) => {
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
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
