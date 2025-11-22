import { body, query, param } from 'express-validator';

export const createOrderValidator = [
  body('address').notEmpty().withMessage('Address is required').trim(),
  body('state').notEmpty().withMessage('State is required').trim(),
  body('products').isArray({ min: 1 }).withMessage('At least one product is required'),
  body('products.*.productId').isMongoId().withMessage('Invalid product ID in products array'),
  body('products.*.productOptionId').isMongoId().withMessage('Invalid product option ID in products array'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Product quantity must be at least 1'),
  body('email').optional().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim(),
  body('firstname').optional().trim(),
  body('lastname').optional().trim(),
];

export const getUserOrdersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).withMessage('Invalid status'),
];

export const getOrdersValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).withMessage('Invalid status'),
  query('userId').optional().isMongoId().withMessage('Invalid user ID'),
  query('email').optional().trim(),
  query('firstname').optional().trim(),
  query('lastname').optional().trim(),
  query('paymentMethod').optional().trim(),
  query('startDate').optional().isISO8601().withMessage('Invalid start date format'),
  query('endDate').optional().isISO8601().withMessage('Invalid end date format'),
];

export const getOrderByIdValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
];

export const updateOrderStatusValidator = [
  param('id').isMongoId().withMessage('Invalid order ID'),
  body('status').isIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']).withMessage('Invalid status'),
];

