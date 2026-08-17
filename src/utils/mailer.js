import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    family: 4, // Force IPv4 to fix the ENETUNREACH IPv6 error on Render
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (email, token) => {
    try {
        const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        
        const mailOptions = {
            from: `"NexPrep Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify your email address - NexPrep",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #333; text-align: center;">Welcome to NexPrep!</h2>
                    <p style="color: #555; font-size: 16px;">Hi there,</p>
                    <p style="color: #555; font-size: 16px;">Thanks for signing up for NexPrep. Please verify your email address to complete your registration and get full access to the platform.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
                    </div>
                    <p style="color: #555; font-size: 16px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; color: #333; font-size: 14px;">${verificationUrl}</p>
                    <p style="color: #999; font-size: 14px; margin-top: 30px;">This link will expire in 15 minutes. If you didn't sign up for NexPrep, you can safely ignore this email.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Verification email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email: ", error);
        return false;
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    try {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        
        const mailOptions = {
            from: `"NexPrep Team" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Reset your password - NexPrep",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                    <p style="color: #555; font-size: 16px;">Hi there,</p>
                    <p style="color: #555; font-size: 16px;">We received a request to reset your NexPrep password. Click the button below to choose a new password.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Reset Password</a>
                    </div>
                    <p style="color: #555; font-size: 16px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all; color: #333; font-size: 14px;">${resetUrl}</p>
                    <p style="color: #999; font-size: 14px; margin-top: 30px;">This link will expire in 15 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Password reset email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending reset email: ", error);
        return false;
    }
};
