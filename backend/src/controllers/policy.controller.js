const PolicyModel = require("../models/policy.model");

// GET /policies — ดึง policies ทั้งหมด (รองรับ filter)
exports.getPolicies = async (req, res) => {
  try {
    const { policyType, all } = req.query;

    const filters = {
      policyType: policyType || null,
      activeOnly: all !== "true", // ถ้าส่ง ?all=true จะดึงทั้ง active/inactive
    };

    const policies = await PolicyModel.findAll(filters);
    res.status(200).json(policies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /policies/type/:type — ดึง policy ตาม type (public)
exports.getPolicyByType = async (req, res) => {
  try {
    const validTypes = ["refund", "terms", "privacy"];
    const { type } = req.params;

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid policy type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    const policy = await PolicyModel.findByType(type);

    if (!policy) {
      return res.status(404).json({ message: `No active ${type} policy found` });
    }

    res.status(200).json(policy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /policies/:id — ดึง policy ตาม id
exports.getPolicyById = async (req, res) => {
  try {
    const policy = await PolicyModel.findById(req.params.id);

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.status(200).json(policy);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /policies — สร้าง policy ใหม่ (Admin only)
exports.createPolicy = async (req, res) => {
  try {
    const { policyTitle, policyContent, policyType } = req.body;

    if (!policyTitle || !policyContent || !policyType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const validTypes = ["refund", "terms", "privacy"];
    if (!validTypes.includes(policyType)) {
      return res.status(400).json({
        message: `Invalid policy type. Must be one of: ${validTypes.join(", ")}`,
      });
    }

    const policyId = await PolicyModel.create({
      policyTitle,
      policyContent,
      policyType,
    });

    res.status(201).json({
      message: "Policy created",
      policyId,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /policies/:id — อัปเดต policy (Admin only)
exports.updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await PolicyModel.update(id, req.body);

    if (!result) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.status(200).json({ message: "Policy updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /policies/:id — ลบ policy (Admin only)
exports.deletePolicy = async (req, res) => {
  try {
    const affected = await PolicyModel.remove(req.params.id);

    if (!affected) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.json({ message: "Policy deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
