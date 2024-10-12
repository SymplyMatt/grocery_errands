import express from 'express';
import validate from '../middleware/validate';
import authenticateToken from '../middleware/authenticateToken';
import ContractsController from '../controllers/contracts';
import authenticateclient from '../middleware/authenticateclient';
import { body, query, param } from 'express-validator';
import BalancesController from '../controllers/balances';

const router = express.Router();

/**
 * @swagger
 * /balances/deposit/{userId}:
 *   post:
 *     summary: Deposit money into a client's balance
 *     tags: [Balances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: b1b14a5c-dc5e-4e15-9d65-d19dfd9ea87e
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 format: float
 *                 example: 100
 *     responses:
 *       200:
 *         description: Deposit successful
 *       400:
 *         description: Deposit amount exceeds 25% of total due or validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to deposit money
 */
router.post(
    '/deposit/:userId',
    authenticateToken,
    authenticateclient,
    param('userId').isUUID().withMessage('Invalid user ID format'),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),
    validate,
    BalancesController.deposit
);

export default router;
