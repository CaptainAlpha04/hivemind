import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Send verification code for registration
export async function sendVerificationCode(email, code) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'HiveMind <onboarding@resend.dev>',
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

    if (error) {
      console.error('Error sending verification code:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending verification code:', error);
    return false;
  }
}

// Send welcome email after successful registration
export async function sendWelcomeEmail(email, name) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'HiveMind <onboarding@resend.dev>',
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

    if (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

// Send verification email with token link
export async function sendVerificationEmail(email, name, token) {
  try {
    const verificationLink = `${process.env.CLIENT_URL}/auth/verify?token=${token}`;
    
    const { data, error } = await resend.emails.send({
      from: 'HiveMind <onboarding@resend.dev>',
      to: email,
      subject: 'Verify Your HiveMind Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10B981;">Verify Your Email Address</h2>
          <p>Hello ${name},</p>
          <p>Please click the button below to verify your email address:</p>
          <div style="margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify My Email
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #4B5563;">${verificationLink}</p>
          <p>This link will expire in one hour.</p>
          <p>Best regards,<br>The HiveMind Team</p>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending verification email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

// Send password reset code
export async function sendPasswordResetCode(email, code) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'HiveMind <onboarding@resend.dev>',
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

    if (error) {
      console.error('Error sending password reset code:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending password reset code:', error);
    return false;
  }
}