import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  }
});

// Email templates
const templates = {
  welcome: (name) => ({
    subject: 'Welcome to HiveMind!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Welcome to HiveMind, ${name}!</h2>
        <p>Thank you for joining our community. We're excited to have you on board!</p>
        <p>You can now sign in to your account and start exploring.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/auth/login" 
             style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Sign In
          </a>
        </div>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The HiveMind Team</p>
      </div>
    `
  }),
  
  verifyEmail: (name, verificationLink) => ({
    subject: 'Verify Your HiveMind Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">Verify Your Email Address</h2>
        <p>Hello ${name},</p>
        <p>Please verify your email address to complete your HiveMind registration.</p>
        <div style="margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
        </div>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>The HiveMind Team</p>
      </div>
    `
  }),
};

// Service functions
export async function sendWelcomeEmail(email, name) {
  const template = templates.welcome(name);
  
  return transporter.sendMail({
    from: `"HiveMind" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

export async function sendVerificationEmail(email, name, token) {
  const verificationLink = `${process.env.CLIENT_URL}/auth/verify?token=${token}`;
  const template = templates.verifyEmail(name, verificationLink);
  
  return transporter.sendMail({
    from: `"HiveMind" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: template.subject,
    html: template.html,
  });
}