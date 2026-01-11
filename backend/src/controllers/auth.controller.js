const UserModel = require("../models/user.model");

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
    } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น (Validation)
    if (!userFirstName || !userLastName || !userEmail || !userPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // บันทึกข้อมูลผู้ใช้ใหม่
    const userId = await UserModel.create({
      userFirstName,
      userLastName,
      userEmail,
      userPassword,
      userPhone,
      userAddress,
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