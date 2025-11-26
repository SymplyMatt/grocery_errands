import express from 'express';
import { AuthController } from '../controllers/auth';
import validate from '../middleware/validate';
import * as authValidators from '../validators/auth';

const router = express.Router();
const authController = new AuthController();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and password management
 */

/**
 * @swagger
 * /auth/users/forgot-password:
 *   post:
 *     summary: Request password reset for user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: If a user with that email exists, a password reset link has been sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: If a user with that email exists, a password reset link has been sent.
 *       500:
 *         description: Error processing password reset request
 */
router.post('/users/forgot-password',
  authValidators.forgotPasswordUserValidator,
  validate,
  authController.forgotPasswordUser
);

/**
 * @swagger
 * /auth/users/reset-password:
 *   post:
 *     summary: Reset user password using reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token received via email
 *                 example: abc123def456...
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 *       404:
 *         description: User not found
 *       500:
 *         description: Error resetting password
 */
router.post('/users/reset-password',
  authValidators.resetPasswordUserValidator,
  validate,
  authController.resetPasswordUser
);

/**
 * @swagger
 * /auth/admins/forgot-password:
 *   post:
 *     summary: Request password reset for admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *     responses:
 *       200:
 *         description: If an admin with that email exists, a password reset link has been sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: If an admin with that email exists, a password reset link has been sent.
 *       500:
 *         description: Error processing password reset request
 */
router.post('/admins/forgot-password',
  authValidators.forgotPasswordAdminValidator,
  validate,
  authController.forgotPasswordAdmin
);

/**
 * @swagger
 * /auth/admins/reset-password:
 *   post:
 *     summary: Reset admin password using reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token received via email
 *                 example: abc123def456...
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: newSecurePassword123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Error resetting password
 */
router.post('/admins/reset-password',
  authValidators.resetPasswordAdminValidator,
  validate,
  authController.resetPasswordAdmin
);

export default router;

