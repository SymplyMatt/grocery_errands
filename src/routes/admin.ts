import express from 'express';
import validate from '../middleware/validate';
import authenticateToken from '../middleware/authenticateToken';
import AdminController from '../controllers/admin';
import { query } from 'express-validator';

const router = express.Router();

/**
 * @swagger
 * /admin/best-profession:
 *   get:
 *     summary: Get the profession that earned the most money within a date range
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2023-01-01
 *         description: Start date of the query range (YYYY-MM-DD)
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2023-12-31
 *         description: End date of the query range (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Successfully retrieved the best profession
 *       400:
 *         description: Invalid input or validation error
 *       500:
 *         description: Failed to retrieve the best profession
 */
router.get(
    '/best-profession',
    authenticateToken,
    [
        query('start')
            .isISO8601()
            .withMessage('Start date must be a valid ISO 8601 date (YYYY-MM-DD)'),
        query('end')
            .isISO8601()
            .withMessage('End date must be a valid ISO 8601 date (YYYY-MM-DD)'),
    ],
    validate,
    AdminController.bestProfession
);

/**
 * @swagger
 * /admin/best-clients:
 *   get:
 *     summary: Get the clients who paid the most for jobs within a date range
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2023-01-01
 *         description: Start date of the query range (YYYY-MM-DD)
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: 2023-12-31
 *         description: End date of the query range (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 2
 *         description: Limit the number of clients returned, default is 2
 *     responses:
 *       200:
 *         description: Successfully retrieved the best clients
 *       400:
 *         description: Invalid input or validation error
 *       500:
 *         description: Failed to retrieve the best clients
 */
router.get(
    '/best-clients',
    authenticateToken,
    [
        query('start')
            .isISO8601()
            .withMessage('Start date must be a valid ISO 8601 date (YYYY-MM-DD)'),
        query('end')
            .isISO8601()
            .withMessage('End date must be a valid ISO 8601 date (YYYY-MM-DD)'),
        query('limit')
            .optional()
            .isInt({ min: 1 })
            .withMessage('Limit must be an integer greater than or equal to 1'),
    ],
    validate,
    AdminController.bestClients
);

export default router;
