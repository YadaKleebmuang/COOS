const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "coosdb",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "+07:00",
});

async function testConnection(retries = 10, delay = 3000) {
  for (let i = 1; i <= retries; i++) {
    try {
      const conn = await pool.getConnection();
      await conn.ping();
      conn.release();
      console.log("✅ MySQL connected");
      return;
    } catch (err) {
      console.error(`❌ MySQL connection failed (attempt ${i}/${retries}):`, err.message);
      if (i === retries) {
        console.error("💀 ไม่สามารถเชื่อมต่อ MySQL ได้ — ปิดโปรแกรม");
        process.exit(1);
      }
      console.log(`⏳ รอ ${delay / 1000} วินาทีแล้วลองใหม่...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

module.exports = {pool, testConnection};