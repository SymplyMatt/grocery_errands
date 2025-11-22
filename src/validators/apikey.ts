import { body, param } from 'express-validator';

export const createApiKeyValidator = [
  body('owner').notEmpty().withMessage('Owner is required').trim(),
];

export const deleteApiKeyValidator = [
  param('id').isMongoId().withMessage('Invalid API key ID'),
];

export const getApiKeyValidator = [
  param('id').isMongoId().withMessage('Invalid API key ID'),
];

export const updateUsageCountValidator = [
  param('id').isMongoId().withMessage('Invalid API key ID'),
];

