const { Resend } = require('resend');

if (!process.env.RESEND_API_KEY) {
    console.error('ERROR: RESEND_API_KEY is not set in environment variables');
    process.exit(1);
}

const resend = new Resend(process.env.RESEND_API_KEY);
console.log('Email service initialized with Resend');

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP Email
async function sendOTP(email, otp) {
    console.log(`[DEBUG] Attempting to send OTP to ${email}`);
    try {
        const { data, error } = await resend.emails.send({
            from: 'Divas Kloset <noreply@divaskloset.com>',
            to: [email],
            subject: 'Your Login Code',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Your One-Time Password</h2>
                    <p>Your verification code is:</p>
                    <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #666; margin-top: 20px;">This code will expire in 10 minutes.</p>
                    <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
                </div>
            `
        });

        if (error) {
            console.error('❌ Error sending email:', JSON.stringify(error, null, 2));
            return false;
        }
        console.log(`✅ Email sent successfully to ${email}`, data);
        return true;
    } catch (error) {
        console.error('Error sending OTP:', error);
        return false;
    }
}

// Send Verification Email (for sign-up)
async function sendVerificationEmail(email, verificationToken) {
    console.log(`[DEBUG] Attempting to send verification email to ${email}`);
    
    if (!process.env.RESEND_API_KEY) {
        console.log(`[Email Simulated] Verification email would be sent to: ${email}`);
        return { id: 'simulated-email-id' };
    }

    const verificationLink = `${process.env.BASE_URL || 'http://localhost:3000'}/verify?token=${verificationToken}`;
    
    try {
        const { data, error } = await resend.emails.send({
            from: 'Divas Kloset <noreply@divaskloset.com>',
            to: [email],
            subject: 'Verify Your Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>Welcome to Our Store!</h2>
                    <p>Please verify your email address by clicking the button below:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" 
                           style="background: #000; color: #fff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                            Verify Email
                        </a>
                    </div>
                    <p style="color: #666;">Or copy and paste this link:</p>
                    <p style="color: #0066cc; word-break: break-all;">${verificationLink}</p>
                    <p style="color: #666; margin-top: 20px;">This link will expire in 24 hours.</p>
                </div>
            `
        });

        if (error) {
            console.error('❌ Error sending verification email:', JSON.stringify(error, null, 2));
            return false;
        }

        console.log(`✅ Verification email sent successfully to ${email}`, data);
        return true;
    } catch (error) {
        console.error('Error sending verification email:', error);
        return false;
    }
}

module.exports = {
    generateOTP,
    sendOTP,
    sendVerificationEmail
};