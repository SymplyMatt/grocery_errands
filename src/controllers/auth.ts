import { Request, Response } from 'express';
import { BaseRepository } from '../models/base';
import { IUser, User, IAdmin, Admin, UserAuth, AdminAuth } from '../models';
import PasswordResetToken from '../models/auth/PasswordResetToken';
import bcrypt from 'bcrypt';
import { sendEmail } from '../config/sendEmail';
import crypto from 'crypto';

export class AuthController {
    private userRepository: BaseRepository<IUser>;
    private adminRepository: BaseRepository<IAdmin>;

    constructor() {
        this.userRepository = new BaseRepository<IUser>(User);
        this.adminRepository = new BaseRepository<IAdmin>(Admin);
    }

    public forgotPasswordUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;
            const user = await this.userRepository.findOne({ email: email.toLowerCase(), deletedAt: null });
            
            if (!user) {
                // Don't reveal if user exists or not for security
                res.status(200).json({ 
                    message: 'If a user with that email exists, a password reset link has been sent.' 
                });
                return;
            }

            // Invalidate any existing reset tokens for this user
            await PasswordResetToken.updateMany(
                { userId: user._id, userType: 'user', isUsed: false },
                { isUsed: true }
            );

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = await bcrypt.hash(resetToken, 12);
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await PasswordResetToken.create({
                userId: user._id,
                token: hashedToken,
                expiresAt,
                isUsed: false,
                userType: 'user'
            });

            // Send reset email
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&type=user`;
            const emailHtml = `
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `;

            await sendEmail({
                to: [user.email],
                subject: 'Password Reset Request',
                html: emailHtml
            });

            res.status(200).json({ 
                message: 'If a user with that email exists, a password reset link has been sent.' 
            });
        } catch (err) {
            console.error('Error in forgotPasswordUser:', err);
            res.status(500).json({ message: 'Error processing password reset request', error: err });
        }
    };

    public resetPasswordUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { token, newPassword } = req.body;

            // Find valid reset token
            const resetTokens = await PasswordResetToken.find({ 
                userType: 'user',
                isUsed: false,
                expiresAt: { $gt: new Date() }
            });

            let validToken = null;
            for (const resetToken of resetTokens) {
                const isTokenValid = await bcrypt.compare(token, resetToken.token);
                if (isTokenValid) {
                    validToken = resetToken;
                    break;
                }
            }

            if (!validToken) {
                res.status(400).json({ message: 'Invalid or expired reset token' });
                return;
            }

            const user = await this.userRepository.findById(validToken.userId.toString());
            if (!user || user.deletedAt) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // Update password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            await UserAuth.findOneAndUpdate(
                { userId: user._id },
                { password: hashedPassword }
            );

            // Mark token as used
            await PasswordResetToken.findByIdAndUpdate(validToken._id, { isUsed: true });

            res.status(200).json({ message: 'Password reset successfully' });
        } catch (err) {
            console.error('Error in resetPasswordUser:', err);
            res.status(500).json({ message: 'Error resetting password', error: err });
        }
    };

    public forgotPasswordAdmin = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;
            const admin = await this.adminRepository.findOne({ 
                email: email.toLowerCase(), 
                deletedAt: null 
            });
            
            if (!admin) {
                // Don't reveal if admin exists or not for security
                res.status(200).json({ 
                    message: 'If an admin with that email exists, a password reset link has been sent.' 
                });
                return;
            }

            // Invalidate any existing reset tokens for this admin
            await PasswordResetToken.updateMany(
                { userId: admin._id, userType: 'admin', isUsed: false },
                { isUsed: true }
            );

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = await bcrypt.hash(resetToken, 12);
            const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

            await PasswordResetToken.create({
                userId: admin._id,
                token: hashedToken,
                expiresAt,
                isUsed: false,
                userType: 'admin'
            });

            // Send reset email
            const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&type=admin`;
            const emailHtml = `
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click the link below to reset it:</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `;

            await sendEmail({
                to: [admin.email],
                subject: 'Password Reset Request',
                html: emailHtml
            });

            res.status(200).json({ 
                message: 'If an admin with that email exists, a password reset link has been sent.' 
            });
        } catch (err) {
            console.error('Error in forgotPasswordAdmin:', err);
            res.status(500).json({ message: 'Error processing password reset request', error: err });
        }
    };

    public resetPasswordAdmin = async (req: Request, res: Response): Promise<void> => {
        try {
            const { token, newPassword } = req.body;

            // Find valid reset token
            const resetTokens = await PasswordResetToken.find({ 
                userType: 'admin',
                isUsed: false,
                expiresAt: { $gt: new Date() }
            });

            let validToken = null;
            for (const resetToken of resetTokens) {
                const isTokenValid = await bcrypt.compare(token, resetToken.token);
                if (isTokenValid) {
                    validToken = resetToken;
                    break;
                }
            }

            if (!validToken) {
                res.status(400).json({ message: 'Invalid or expired reset token' });
                return;
            }

            const admin = await this.adminRepository.findById(validToken.userId.toString());
            if (!admin || admin.deletedAt) {
                res.status(404).json({ message: 'Admin not found' });
                return;
            }

            // Update password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            await AdminAuth.findOneAndUpdate(
                { adminId: admin._id },
                { password: hashedPassword }
            );

            // Mark token as used
            await PasswordResetToken.findByIdAndUpdate(validToken._id, { isUsed: true });

            res.status(200).json({ message: 'Password reset successfully' });
        } catch (err) {
            console.error('Error in resetPasswordAdmin:', err);
            res.status(500).json({ message: 'Error resetting password', error: err });
        }
    };
}

