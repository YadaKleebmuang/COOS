const nodemailer = require("nodemailer");

const sendResetEmail = async (to, resetToken, frontendUrl) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"COOS Support" <${process.env.SMTP_FROM}>`,
    to: to,
    subject: "Reset your COOS password",
    html: `
      <h2>รีเซ็ตรหัสผ่าน</h2>
      <p>คุณได้ทำการขอรีเซ็ตรหัสผ่านสำหรับระบบ COOS</p>
      <p>กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
      <a href="${resetLink}" target="_blank">ตั้งรหัสผ่านใหม่</a>
      <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง</p>
      <p>หากคุณไม่ได้ทำการขอนี้ กรุณาละเว้นอีเมลนี้</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendResetEmail,
};
