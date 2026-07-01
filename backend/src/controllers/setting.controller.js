const SettingModel = require("../models/setting.model");

exports.getSettings = async (req, res) => {
  try {
    const settings = await SettingModel.getAllSettings();
    res.status(200).json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSystemSettings = async (req, res) => {
  try {
    const adminId = req.session.userId;
    // req.body should be an object with key-value pairs
    // e.g. { maxUploadSizeMb: 50, maintenanceMode: true }
    await SettingModel.updateSettings(req.body, adminId);
    res.status(200).json({ message: "Settings updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
