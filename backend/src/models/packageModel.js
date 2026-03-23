const { pool } = require("../config/db");

exports.findAll = (includeInactive = false) => {
  const sql = includeInactive
    ? 'SELECT * FROM packages ORDER BY packagePrice ASC'
    : 'SELECT * FROM packages WHERE packageIsActive = 1 ORDER BY packagePrice ASC'
  return pool.query(sql)
}

exports.findById = (id) => {
  return pool.query(
    'SELECT * FROM packages WHERE packageId = ? AND packageIsActive = 1',
    [id]
  )
}

exports.create = (data) => {
  const {
    packageName, packageDescription, packageImageCount,
    packageResolution, packageDeliveryDays, packagePrice,
    packageUrgentPrice, packageGalleryDiscount
  } = data
  return pool.query(
    `INSERT INTO packages
      (packageName, packageDescription, packageImageCount, packageResolution,
       packageDeliveryDays, packagePrice, packageUrgentPrice, packageGalleryDiscount)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      packageName, packageDescription || null,
      packageImageCount, packageResolution,
      packageDeliveryDays, packagePrice,
      packageUrgentPrice || null,
      packageGalleryDiscount ?? 20.00
    ]
  )
}

exports.update = (id, fields) => {
  const {
    packageName, packageDescription, packageImageCount,
    packageResolution, packageDeliveryDays, packagePrice,
    packageUrgentPrice, packageGalleryDiscount, packageIsActive
  } = fields
  return pool.query(
    `UPDATE packages SET
      packageName            = COALESCE(?, packageName),
      packageDescription     = COALESCE(?, packageDescription),
      packageImageCount      = COALESCE(?, packageImageCount),
      packageResolution      = COALESCE(?, packageResolution),
      packageDeliveryDays    = COALESCE(?, packageDeliveryDays),
      packagePrice           = COALESCE(?, packagePrice),
      packageUrgentPrice     = COALESCE(?, packageUrgentPrice),
      packageGalleryDiscount = COALESCE(?, packageGalleryDiscount),
      packageIsActive        = COALESCE(?, packageIsActive)
     WHERE packageId = ?`,
    [
      packageName || null, packageDescription || null,
      packageImageCount || null, packageResolution || null,
      packageDeliveryDays || null, packagePrice ?? null,
      packageUrgentPrice ?? null, packageGalleryDiscount ?? null,
      packageIsActive ?? null, id
    ]
  )
}

exports.delete = (id) => {
  return pool.query(
    'DELETE FROM packages WHERE packageId = ?',
    [id]
  )
}