import express from 'express';
import { AdminController } from '../controllers/admins';
import authenticateAdmin from '../middleware/authenticateAdmin';
import authenticateToken from '../middleware/authenticateToken';
import validate from '../middleware/validate';
import * as adminValidators from '../validators/admin';

const router = express.Router();
const adminController = new AdminController();

/**
 * @swagger
 * /admins:
 *   get:
 *     summary: Get all admins
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of admins
 */
router.get('/',
    authenticateToken,
    authenticateAdmin,
    adminValidators.getAllAdminsValidator,
    validate,
    adminController.getAllAdmins
);


/**
 * @swagger
 * /admins:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admins] 
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - phone
 *               - username
 *               - password
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *                 description: Phone number in international format (e.g. +234...)
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 default: admin
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       409:
 *         description: Email, username, or phone already exists
 *       500:
 *         description: Error creating admin
 */
router.post('/',
    authenticateToken,
    authenticateAdmin,
    adminValidators.createAdminValidator,
    validate,
    adminController.createAdmin
);

/**
 * @swagger
 * /admins/{id}:
 *   put:
 *     summary: Update an admin
 *     tags: [Admins] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *       404:
 *         description: Admin not found
 *       409:
 *         description: Email, username, or phone already exists
 */
router.put('/:id',
    authenticateToken,
    authenticateAdmin,
    adminValidators.updateAdminValidator,
    validate,
    adminController.updateAdmin
);

/**
 * @swagger
 * /admins/{id}/password:
 *   put:
 *     summary: Update admin password
 *     tags: [Admins] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       401:
 *         description: Current password is incorrect
 *       404:
 *         description: Admin not found
 */
router.put('/:id/password',
    authenticateToken,
    authenticateAdmin,
    adminValidators.updateAdminPasswordValidator,
    validate,
    adminController.updateAdminPassword
);


/**
 * @swagger
 * /admins/login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth] 
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email, or phone number
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       401:
 *         description: Invalid credentials or authentication record not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid credentials
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login failed
 *                 error:
 *                   type: string
 */
router.post('/login',
    adminValidators.adminLoginValidator,
    validate,
    adminController.login
);

/**
 * @swagger
 * /admins/metrics:
 *   get:
 *     summary: Get ecommerce metrics (customers, products, orders count)
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 customers:
 *                   type: number
 *                   example: 3782
 *                 products:
 *                   type: number
 *                   example: 3782
 *                 orders:
 *                   type: number
 *                   example: 5359
 *       500:
 *         description: Server error
 */
router.get('/metrics',
    authenticateToken,
    authenticateAdmin,
    adminController.getMetrics
);

/**
 * @swagger
 * /admins/{id}:
 *   delete:
 *     summary: Soft delete an admin
 *     tags: [Admins] 
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 *       404:
 *         description: Admin not found
 */
router.delete('/:id',
    authenticateToken,
    authenticateAdmin,
    adminValidators.deleteAdminValidator,
    validate,
    adminController.deleteAdmin
);

/**
 * @swagger
 * /admins/{id}:
 *   get:
 *     summary: Get admin by ID
 *     tags: [Admins]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin ID
 *     responses:
 *       200:
 *         description: Admin found
 *       404:
 *         description: Admin not found
 */
router.get('/:id',
    authenticateToken,
    authenticateAdmin,
    adminValidators.getAdminByIdValidator,
    validate,
    adminController.getAdminById
);
export default router;
