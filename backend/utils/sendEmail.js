const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  // Remove spaces from app password (Gmail formats them as "xxxx xxxx xxxx xxxx")
  const smtpPass = (process.env.SMTP_PASS || '').replace(/\s/g, '');

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: smtpPass,
    },
  });

  // Build "from" safely — avoid dotenv quote-parsing issues with SMTP_FROM
  const from = process.env.SMTP_FROM || `Torts & Twirls <${process.env.SMTP_USER}>`;

  console.log(`📧 Sending email to ${to} via ${process.env.SMTP_HOST || 'smtp.gmail.com'}:${process.env.SMTP_PORT || 587}`);

  try {
    const info = await transporter.sendMail({ from, to, subject, html });
    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`❌ SMTP error: ${err.message}`);
    console.error(`   SMTP_HOST: ${process.env.SMTP_HOST || '(not set)'}`);
    console.error(`   SMTP_USER: ${process.env.SMTP_USER || '(not set)'}`);
    console.error(`   SMTP_PASS: ${smtpPass ? '***set***' : '(not set)'}`);
    throw err;
  }
};

module.exports = sendEmail;
