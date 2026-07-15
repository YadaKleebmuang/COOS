const SettingModel = require("../models/setting.model");

exports.getSettings = async (req, res, next) => {
  try {
    const settings = await SettingModel.getAllSettings();
    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
};

exports.updateSystemSettings = async (req, res, next) => {
  try {
    const adminId = req.session.userId;
    // req.body should be an object with key-value pairs
    // e.g. { maxUploadSizeMb: 50, maintenanceMode: true }
    await SettingModel.updateSettings(req.body, adminId);
    res.status(200).json({ message: "Settings updated successfully" });
  } catch (err) {
    next(err);
  }
};
