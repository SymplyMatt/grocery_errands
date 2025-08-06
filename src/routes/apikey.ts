import express from 'express';
import { body, validationResult } from 'express-validator';
import authenticateToken from '../middleware/authenticateToken';
import authenticateAdmin from '../middleware/authenticateAdmin';
import KeysController from '../controllers/apikey';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: API Keys
 *   description: API key management
 */

/**
 * @swagger
 * /keys/add:
 *   post:
 *     summary: Create a new API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []  # Indicate x-api-key is required in the headers
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               owner:
 *                 type: string
 *                 description: Owner of the API key
 *             required:
 *               - owner
 *               - allowedDomain
 *     responses:
 *       201:
 *         description: API key created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKey:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     owner:
 *                       type: string
 *                     allowedDomain:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     usageCount:
 *                       type: integer
 *                     usageLimit:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
router.post('/add', 
    authenticateToken,
    authenticateAdmin,
    body('owner').notEmpty().withMessage('Owner is required'),
    KeysController.createKey
);

/**
 * @swagger
 * /keys/{id}:
 *   delete:
 *     summary: Delete an API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []  # Indicate x-api-key is required in the headers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the API key to delete
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     responses:
 *       204:
 *         description: API key deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: API key not found
 *       500:
 *         description: Internal Server Error
 */
router.delete('/:id', 
    authenticateToken,
    authenticateAdmin,
    KeysController.deleteKey
);

/**
 * @swagger
 * /keys/{id}:
 *   get:
 *     summary: Retrieve an API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []  # Indicate x-api-key is required in the headers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the API key to retrieve
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     responses:
 *       200:
 *         description: API key retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKey:
 *                   type: object
 *                   properties:
 *                     key:
 *                       type: string
 *                     owner:
 *                       type: string
 *                     allowedDomain:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     usageCount:
 *                       type: integer
 *                     usageLimit:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: API key not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/:id', 
    authenticateToken,
    authenticateAdmin,
    KeysController.getKey
);

/**
 * @swagger
 * /keys:
 *   get:
 *     summary: Retrieve all API keys
 *     tags: [API Keys] 
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []  # Indicate x-api-key is required in the headers
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     responses:
 *       200:
 *         description: List of API keys retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 apiKeys:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       key:
 *                         type: string
 *                       owner:
 *                         type: string
 *                       allowedDomain:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                       usageCount:
 *                         type: integer
 *                       usageLimit:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal Server Error
 */
router.get('/', 
    authenticateToken,
    authenticateAdmin,
    KeysController.getAllKeys
);

/**
 * @swagger
 * /keys/{id}/usage:
 *   patch:
 *     summary: Update usage count for an API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *       - apiKeyAuth: []  # Indicate x-api-key is required in the headers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the API key to update
 *         schema:
 *           type: string
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: The API key for authentication
 *     responses:
 *       200:
 *         description: Usage count updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 usageCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: API key not found
 *       500:
 *         description: Internal Server Error
 */
router.patch('/:id/usage', 
    authenticateToken,
    authenticateAdmin,
    KeysController.updateUsageCount
);

export default router;
