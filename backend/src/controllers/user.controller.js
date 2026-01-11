const UserModel = require("../models/user.model");

// GET /users
exports.getUsers = async (req, res) => {
  try {
    const user = await UserModel.findAll();
    // เช็คว่ามี user ไหม
    if (!user || user.length === 0) {
      return res.status(404).json({
        message: "User not found!",
      }); 
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /users/:id
exports.getUserById = async (req, res) => {
  try {
    // หา user ตาม id
    const user = await UserModel.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /users
exports.createUser = async (req, res) => {
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

    // ตรวจสอบค่าที่จำเป็น ตรวจสอบว่าข้อมูลสำคัญครบหรือไม่
    if (!userFirstName || !userLastName || !userEmail || !userPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // บันทึกข้อมูล user ใหม่
    const userId = await UserModel.create({
      userFirstName,
      userLastName,
      userEmail,
      userPassword,
      userPhone,
      userAddress,
      userRole,
    });

    res.status(201).json({
      message: "User created",
      id: userId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /users/:id
exports.updateUser = async (req, res) => {
  try {
    // รับ id จาก params
    const { id } = req.params;
    // เรียก Model เพื่ออัปเดตข้อมูล
    const result = await UserModel.update(id, req.body);
    // ตรวจสอบว่ามีการอัปเดตหรือไม่
    if (!result) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    res.status(200).json({
      message: "User updated successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /users/:id
exports.deleteUser = async (req, res) => {
  try {
    // เรียก Model เพื่อลบข้อมูลผู้ใช้
    const affected = await UserModel.remove(req.params.id);

    // ตรวจสอบว่าพบผู้ใช้หรือไม่
    if (!affected) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};