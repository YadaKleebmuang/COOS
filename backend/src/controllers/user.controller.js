const UserModel = require("../models/user.model");
const bcrypt = require("bcrypt");

// GET /users
exports.getUsers = async (req, res) => {
  // console.log('GET USERS controller start');
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
      userProfileImage,
      userContactChannels,
      userRole,
    } = req.body;

    // ตรวจสอบค่าที่จำเป็น ตรวจสอบว่าข้อมูลสำคัญครบหรือไม่
    if (!userFirstName || !userLastName || !userEmail || !userPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Hash Password before saving
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // บันทึกข้อมูล user ใหม่
    const userId = await UserModel.create({
      userFirstName,
      userLastName,
      userEmail,
      userPassword: hashedPassword,
      userPhone,
      userAddress,
      userProfileImage,
      userContactChannels,
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

    // ถ้ามีการส่ง password มาให้ทำการ hash ก่อนบันทึก
    const updateData = { ...req.body };
    if (updateData.userPassword) {
      updateData.userPassword = await bcrypt.hash(updateData.userPassword, 10);
    }

    // เรียก Model เพื่ออัปเดตข้อมูล
    const result = await UserModel.update(id, updateData);
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

// PATCH /users/me  — อัปเดตโปรไฟล์ตัวเอง (ไม่รวม role และ email)
exports.updateMyProfile = async (req, res) => {
  try {
    const userId = req.session.userId; // จาก JWT middleware
    const {
      userFirstName,
      userLastName,
      userPhone,
      userAddress,
      userContactChannels,
    } = req.body;

    if (!userFirstName || !userLastName) {
      return res.status(400).json({ message: "Missing required fields (firstName, lastName)" });
    }

    // จัดการรูปโปรไฟล์ — ถ้ามีการอัปโหลดไฟล์ใหม่ ใช้ path จาก multer
    let profileImageUrl = req.body.userProfileImage || null;
    if (req.file) {
      profileImageUrl = `/uploads/profiles/${req.file.filename}`;
    }

    // จัดการ contactChannels — multipart form ส่งมาเป็น string
    let parsedContactChannels = null;
    if (userContactChannels) {
      try {
        parsedContactChannels =
          typeof userContactChannels === "string"
            ? JSON.parse(userContactChannels)
            : userContactChannels;
      } catch {
        return res.status(400).json({ message: "userContactChannels must be valid JSON" });
      }
    }

    const result = await UserModel.updateProfile(userId, {
      userFirstName,
      userLastName,
      userPhone,
      userAddress,
      userProfileImage: profileImageUrl,
      userContactChannels: parsedContactChannels,
    });

    if (!result) {
      return res.status(404).json({ message: "User not found" });
    }

    // ดึงข้อมูล user ที่อัปเดตแล้วส่งกลับ
    const updatedUser = await UserModel.findById(userId);

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        userId: updatedUser.userId,
        userFirstName: updatedUser.userFirstName,
        userLastName: updatedUser.userLastName,
        userEmail: updatedUser.userEmail,
        userPhone: updatedUser.userPhone,
        userAddress: updatedUser.userAddress,
        userProfileImage: updatedUser.userProfileImage,
        userContactChannels: updatedUser.userContactChannels,
        userRole: updatedUser.userRole,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /users/me  — ดึงข้อมูลโปรไฟล์ตัวเอง
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.session.userId; // จาก JWT middleware
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ส่งข้อมูลกลับโดยไม่รวม password
    res.status(200).json({
      userId: user.userId,
      userFirstName: user.userFirstName,
      userLastName: user.userLastName,
      userEmail: user.userEmail,
      userPhone: user.userPhone,
      userAddress: user.userAddress,
      userProfileImage: user.userProfileImage,
      userContactChannels: user.userContactChannels,
      userRole: user.userRole,
      userCreatedAt: user.userCreatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
