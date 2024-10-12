import express from 'express';
import validate from '../middleware/validate';
import authenticateToken from '../middleware/authenticateToken';
import AdminController from '../controllers/admin';
import { body, param, query } from 'express-validator';
import authenticateAdmin from '../middleware/authenticateAdmin';

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
    authenticateAdmin,
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
    authenticateAdmin,
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

/**
 * @swagger
 * /admin/create:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Email already in use or validation error
 *       500:
 *         description: Failed to create admin
 */
router.post(
    '/create',
    [
        body('firstName').isString().notEmpty(),
        body('lastName').isString().notEmpty(),
        body('email').isEmail(),
        body('password').isString().isLength({ min: 6 }),
    ],
    validate,
    AdminController.createAdmin
);

/**
 * @swagger
 * /admin/all:
 *   get:
 *     summary: Get all admins
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: A list of admins
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     example: a5f0b365-4667-487e-bd2f-1dbdb49d93b4
 *                   firstName:
 *                     type: string
 *                     example: John
 *                   lastName:
 *                     type: string
 *                     example: Doe
 *                   email:
 *                     type: string
 *                     format: email
 *                     example: john.doe@example.com
 *       500:
 *         description: Failed to retrieve admins
 */
router.get(
    '/all',
    authenticateToken,
    authenticateAdmin,
    AdminController.getAllAdmins
);

/**
 * @swagger
 * /admin/{adminId}:
 *   get:
 *     summary: Get an admin by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: a5f0b365-4667-487e-bd2f-1dbdb49d93b4
 *     responses:
 *       200:
 *         description: Admin found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                   example: a5f0b365-4667-487e-bd2f-1dbdb49d93b4
 *                 firstName:
 *                   type: string
 *                   example: John
 *                 lastName:
 *                   type: string
 *                   example: Doe
 *                 email:
 *                   type: string
 *                   format: email
 *                   example: john.doe@example.com
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Failed to retrieve admin
 */
router.get(
    '/admin/:adminId',
    authenticateToken,
    authenticateAdmin,
    [
        param('adminId').isUUID(),
    ],
    validate,
    AdminController.getAdminById
);

/**
 * @swagger
 * /admin/{adminId}:
 *   put:
 *     summary: Update an admin by ID
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *           example: a5f0b365-4667-487e-bd2f-1dbdb49d93b4
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *             required:
 *               - firstName
 *               - lastName
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Failed to update admin
 */
router.put(
    '/admin/:adminId',
    authenticateToken,
    authenticateAdmin,
    [
        param('adminId').isUUID(),
        body('firstName').optional().isString(),
        body('lastName').optional().isString(),
    ],
    validate,
    AdminController.updateAdmin
);

export default router;
