import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure nodemailer transporter with SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com', 
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Gmail specific settings
  requireTLS: true,
  tls: {
    rejectUnauthorized: true
  }
});

// For debugging
transporter.verify(function(error, success) {
  if (error) {
    console.error('SMTP configuration error:', error);
  } else {
    console.log('SMTP server connection verified successfully');
  }
});

// Send verification code for registration
export async function sendVerificationCode(email, code) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"HiveMind" <noreply@hivemind.com>',
      to: email,
      subject: 'Your HiveMind Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Verify Your Email</h2>
          <p>Hello,</p>
          <p>To complete your registration, please use the following verification code:</p>
          <div style="margin: 30px 0; text-align: center;">
            <div style="font-size: 24px; letter-spacing: 5px; font-weight: bold; padding: 20px; background-color: #f3f4f6; border-radius: 5px;">${code}</div>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, you can ignore this email.</p>
          <p>Best regards,<br>The HiveMind Team</p>
        </div>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending verification code:', error);
    return false;
  }
}

// Send welcome email after successful registration
export async function sendWelcomeEmail(email, name) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"HiveMind" <noreply@hivemind.com>',
      to: email,
      subject: 'Welcome to HiveMind!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Welcome to HiveMind!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for joining HiveMind. Your account has been created successfully.</p>
          <p>You can now sign in and start exploring our platform.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/auth/login" 
               style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Sign In
            </a>
          </div>
          <p>Best regards,<br>The HiveMind Team</p>
        </div>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

// Send password reset code
export async function sendPasswordResetCode(email, code) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"HiveMind" <noreply@hivemind.com>',
      to: email,
      subject: 'Reset Your HiveMind Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Use the following code to reset your password:</p>
          <div style="margin: 30px 0; text-align: center;">
            <div style="font-size: 24px; letter-spacing: 5px; font-weight: bold; padding: 20px; background-color: #f3f4f6; border-radius: 5px;">${code}</div>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
          <p>Best regards,<br>The HiveMind Team</p>
        </div>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending password reset code:', error);
    return false;
  }
}