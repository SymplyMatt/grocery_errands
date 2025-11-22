import { body, query, param } from 'express-validator';

export const addToCartValidator = [
  body('productId').isMongoId().withMessage('Valid product ID is required'),
  body('productOptionId').isMongoId().withMessage('Valid product option ID is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

export const updateCartItemValidator = [
  param('cartItemId').isMongoId().withMessage('Invalid cart item ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
];

export const removeFromCartValidator = [
  param('cartItemId').isMongoId().withMessage('Invalid cart item ID'),
];

export const getUserCartValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 10000 }).withMessage('Limit must be between 1 and 10000'),
];

export const getCartItemValidator = [
  param('cartItemId').isMongoId().withMessage('Invalid cart item ID'),
];

