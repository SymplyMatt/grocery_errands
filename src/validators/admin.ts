import { body, query, param } from 'express-validator';

export const createAdminValidator = [
  body('firstname').notEmpty().withMessage('First name is required').trim(),
  body('lastname').notEmpty().withMessage('Last name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim(),
  body('username').notEmpty().withMessage('Username is required').trim(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().trim(),
  body('permissions').optional().isArray().withMessage('Permissions must be an array'),
];

export const updateAdminValidator = [
  param('id').isMongoId().withMessage('Invalid admin ID'),
  body('firstname').optional().trim(),
  body('lastname').optional().trim(),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim(),
  body('username').optional().trim(),
  body('role').optional().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

export const updateAdminPasswordValidator = [
  param('id').isMongoId().withMessage('Invalid admin ID'),
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

export const adminLoginValidator = [
  body('identifier').notEmpty().withMessage('Identifier (email or phone) is required').trim(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const getAllAdminsValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const getAdminByIdValidator = [
  param('id').isMongoId().withMessage('Invalid admin ID'),
];

export const deleteAdminValidator = [
  param('id').isMongoId().withMessage('Invalid admin ID'),
];

