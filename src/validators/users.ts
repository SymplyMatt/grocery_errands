import { body, query, param } from 'express-validator';

export const createUserValidator = [
  body('firstname').notEmpty().withMessage('First name is required').trim(),
  body('lastname').notEmpty().withMessage('Last name is required').trim(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').notEmpty().withMessage('Phone number is required').trim(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('locationId').optional().isMongoId().withMessage('Invalid location ID'),
  body('whatsapp').optional().trim(),
];

export const updateUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
  body('firstname').optional().trim(),
  body('lastname').optional().trim(),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim(),
  body('whatsapp').optional().trim(),
  body('locationId').optional().isMongoId().withMessage('Invalid location ID'),
  body('username').optional().trim(),
];

export const loginValidator = [
  body('identifier').notEmpty().withMessage('Identifier (email, username, or phone) is required').trim(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const verifyUserValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('code').notEmpty().withMessage('Verification code is required').trim(),
];

export const resendVerificationCodeValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const updateUserLocationValidator = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
  body('locationId').isMongoId().withMessage('Invalid location ID'),
];

export const getAllUsersValidator = [
  query('locationId').optional().isMongoId().withMessage('Invalid location ID'),
  query('firstname').optional().isString().withMessage('Firstname must be a string'),
  query('lastname').optional().isString().withMessage('Lastname must be a string'),
  query('email').optional().isString().withMessage('Email must be a string'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const getUserByIdValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

export const getUsersByLocationValidator = [
  param('locationId').isMongoId().withMessage('Invalid location ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const searchUsersValidator = [
  query('q').notEmpty().withMessage('Search query is required').trim(),
  query('locationId').optional().isMongoId().withMessage('Invalid location ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
];

export const getUserProfileValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

export const deleteUserValidator = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

