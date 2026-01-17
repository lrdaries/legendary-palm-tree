const { Resend } = require('resend');

// Initialize Resend with API key from environment
let resend = null;

function initializeResend() {
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Email service initialized with Resend');
  } else {
    console.warn('⚠️ RESEND_API_KEY not configured - email service disabled');
  }
}

const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@divaskloset.com';

// Generate OTP code
function generateOTP(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits.charAt(Math.floor(Math.random() * 10));
  }
  return otp;
}

// Send OTP email
async function sendOTPEmail(email, otp, firstName = 'User') {
  try {
    if (!resend) {
      console.warn('⚠️ Resend not initialized - email not sent');
      return { success: false, message: 'Email service not configured' };
    }

    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: 'Your Diva\'s Kloset Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Diva's Kloset, ${firstName}!</h2>
          <p>Your one-time verification code is:</p>
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #333; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    });

    console.log('✅ OTP email sent to', email);
    return { success: true, messageId: result.id };
  } catch (err) {
    console.error('❌ Error sending OTP email:', err.message);
    return { success: false, message: err.message };
  }
}

// Send login link email
async function sendLoginLinkEmail(email, token, firstName = 'User') {
  try {
    if (!resend) {
      console.warn('⚠️ Resend not initialized - email not sent');
      return { success: false, message: 'Email service not configured' };
    }

    const appUrl = process.env.APP_URL || 'https://divaskloset.com';
    const loginLink = `${appUrl}/auth/verify?token=${token}`;

    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: 'Your DIVA\'s Closet Login Link',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome back to DIVA's Closet, ${firstName}!</h2>
          <p>Click the button below to login to your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginLink}" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Login to DIVA's Closet
            </a>
          </div>
          <p>Or copy and paste this link: <a href="${loginLink}">${loginLink}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this link, please ignore this email.</p>
        </div>
      `
    });

    console.log('✅ Login link email sent to', email);
    return { success: true, messageId: result.id };
  } catch (err) {
    console.error('❌ Error sending login email:', err.message);
    return { success: false, message: err.message };
  }
}

// Send welcome email
async function sendWelcomeEmail(email, firstName = 'User') {
  try {
    if (!resend) {
      console.warn('⚠️ Resend not initialized - email not sent');
      return { success: false, message: 'Email service not configured' };
    }

    const appUrl = process.env.APP_URL || 'https://divaskloset.com';

    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: 'Welcome to DIVA\'s Closet!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome, ${firstName}!</h2>
          <p>Thank you for joining DIVA's Closet. We're excited to have you as part of our community.</p>
          <p>Browse our latest collections and find your perfect style!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/collections" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Browse Collections
            </a>
          </div>
          <p style="color: #666; font-size: 12px;"> 2025 DIVA's Closet. All rights reserved.</p>
        </div>
      `
    });

    console.log('✅ Welcome email sent to', email);
    return { success: true, messageId: result.id };
  } catch (err) {
    console.error('❌ Error sending welcome email:', err.message);
    return { success: false, message: err.message };
  }
}

// Send email verification link
async function sendEmailVerificationEmail(email, verificationUrl, firstName = 'User') {
  try {
    if (!resend) {
      console.warn('⚠️ Resend not initialized - email not sent');
      return { success: false, message: 'Email service not configured' };
    }

    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: "Verify your Diva's Kloset email",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Diva's Kloset, ${firstName}!</h2>
          <p>Please verify your email address to complete your registration:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p>Or copy and paste this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
          <p>This link will expire in 24 hours.</p>
          <p style="color: #666; font-size: 12px;">If you didn't create an account, please ignore this email.</p>
        </div>
      `
    });

    console.log('✅ Verification email sent to', email);
    return { success: true, messageId: result.id };
  } catch (err) {
    console.error('❌ Error sending verification email:', err.message);
    return { success: false, message: err.message };
  }
}

// Send admin password reset email
async function sendPasswordResetEmail(email, resetLink, firstName = 'Admin') {
  try {
    if (!resend) {
      console.warn('⚠️ Resend not initialized - email not sent');
      return { success: false, message: 'Email service not configured' };
    }

    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: 'DIVA\'s Closet - Password Reset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hi ${firstName},</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="display: inline-block; background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p>Or copy and paste this link: <a href="${resetLink}">${resetLink}</a></p>
          <p>This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this reset, please ignore this email.</p>
        </div>
      `
    });

    console.log('✅ Password reset email sent to', email);
    return { success: true, messageId: result.id };
  } catch (err) {
    console.error('❌ Error sending password reset email:', err.message);
    return { success: false, message: err.message };
  }
}

// Send newsletter subscription confirmation email
async function sendNewsletterConfirmation(email, firstName = 'Subscriber') {
  try {
    if (!resend) {
      console.warn('⚠️ Resend not initialized - email not sent');
      return { success: false, message: 'Email service not configured' };
    }

    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: 'Welcome to Diva\'s Kloset Newsletter!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to the Diva's Kloset Family, ${firstName}!</h2>
          <p>Thank you for subscribing to our newsletter. You're now part of our exclusive community!</p>
          <p>Get ready to receive:</p>
          <ul>
            <li>🎉 Exclusive offers and early access to sales</li>
            <li>✨ New collection announcements</li>
            <li>👗 Style tips and fashion inspiration</li>
            <li>🎁 Special subscriber-only discounts</li>
          </ul>
          <p>Stay tuned for your first newsletter!</p>
          <p style="color: #666; font-size: 12px;">You can unsubscribe at any time by clicking the unsubscribe link in our emails.</p>
        </div>
      `
    });

    console.log('✅ Newsletter confirmation sent to', email);
    return { success: true, messageId: result.id };
  } catch (err) {
    console.error('❌ Error sending newsletter confirmation:', err.message);
    return { success: false, message: err.message };
  }
}

// Send contact form notification to store
async function sendContactNotification(contactData) {
  try {
    if (!resend) {
      console.warn('⚠️ Resend not initialized - email not sent');
      return { success: false, message: 'Email service not configured' };
    }

    const { name, email, subject, message } = contactData;
    
    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: 'support@divaskloset.com', // Store email
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p><strong>Received:</strong> ${new Date().toLocaleString()}</p>
          <p>Please respond to this inquiry within 24 hours.</p>
        </div>
      `
    });

    console.log('✅ Contact notification sent to store');
    return { success: true, messageId: result.id };
  } catch (err) {
    console.error('❌ Error sending contact notification:', err.message);
    return { success: false, message: err.message };
  }
}

// Send contact form confirmation to customer
async function sendContactConfirmation(email, name, subject) {
  try {
    if (!resend) {
      console.warn('⚠️ Resend not initialized - email not sent');
      return { success: false, message: 'Email service not configured' };
    }

    const result = await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to: email,
      subject: 'We received your message - Diva\'s Kloset',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank you for contacting us, ${name}!</h2>
          <p>We've received your message regarding: <strong>${subject}</strong></p>
          <p>Our team will review your inquiry and get back to you within 24 hours.</p>
          <p>In the meantime, feel free to explore our latest collections:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://divaskloset.com" style="display: inline-block; background-color: #722F37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Shop Now
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">If you didn't contact us, please ignore this email.</p>
        </div>
      `
    });

    console.log('✅ Contact confirmation sent to', email);
    return { success: true, messageId: result.id };
  } catch (err) {
    console.error('❌ Error sending contact confirmation:', err.message);
    return { success: false, message: err.message };
  }
}

module.exports = {
  initializeResend,
  generateOTP,
  sendOTPEmail,
  sendLoginLinkEmail,
  sendWelcomeEmail,
  sendEmailVerificationEmail,
  sendPasswordResetEmail,
  sendNewsletterConfirmation,
  sendContactNotification,
  sendContactConfirmation,
  resend
};