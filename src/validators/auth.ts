import { body } from 'express-validator';

export const forgotPasswordUserValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const resetPasswordUserValidator = [
  body('token').notEmpty().withMessage('Reset token is required').trim(),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const forgotPasswordAdminValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const resetPasswordAdminValidator = [
  body('token').notEmpty().withMessage('Reset token is required').trim(),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

