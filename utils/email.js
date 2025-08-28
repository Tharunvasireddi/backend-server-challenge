import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message
 * @param {string} [options.html] - HTML content (optional)
 * @returns {Promise<Object>} - Result of the email sending operation
 */
const sendEmail = async (options) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP configuration is incomplete. Please check your environment variables.');
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'App'}" <${process.env.SMTP_FROM || 'noreply@yourdomain.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message // Use HTML if provided, otherwise fallback to text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

export default sendEmail;