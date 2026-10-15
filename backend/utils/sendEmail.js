import nodemailer from 'nodemailer';

/**
 * Send an email via Nodemailer
 * Supports custom SMTP (Gmail, SendGrid, Outlook, Amazon SES) or falls back to an Ethereal test inbox in development
 * 
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} options.text - Plain text body
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  let transporter;

  const hasSmtpConfig = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    // Configured with real SMTP server (e.g. Gmail App Password, Sendgrid, Mailgun)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development fallback: automatically provision an Ethereal SMTP test account
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`[Email Service] Generated Ethereal test inbox account: ${testAccount.user}`);
    } catch (err) {
      console.warn('[Email Service] Failed to create Ethereal account, using direct transport:', err.message);
      transporter = nodemailer.createTransport({
        streamTransport: true,
        newline: 'windows',
      });
    }
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"PropMate 360 Security" <security@propmate360.com>',
    to,
    subject,
    text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  const previewUrl = nodemailer.getTestMessageUrl(info);

  if (previewUrl) {
    console.log(`📨 [Email Service] Preview URL: ${previewUrl}`);
  }
  console.log(`✉️ [Email Service] Message sent to ${to}: ${info.messageId}`);

  return {
    success: true,
    messageId: info.messageId,
    previewUrl,
  };
};
