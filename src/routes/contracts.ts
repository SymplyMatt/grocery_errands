import express from 'express';
import validate from '../middleware/validate';
import authenticateToken from '../middleware/authenticateToken';
import ContractsController from '../controllers/contracts';
import authenticateclient from '../middleware/authenticateclient';
import { body, query, param } from 'express-validator';

const router = express.Router();

const createContractValidation = [
    body('contractorId')
        .exists().withMessage('Contractor ID is required')
        .isUUID().withMessage('Contractor ID must be a valid UUID'),
];

const terminateContractValidation = [
    param('id')
        .exists().withMessage('Contract ID is required')
        .isUUID().withMessage('Contract ID must be a valid UUIDxx'),
];

const getContractValidation = [
    param('id')
        .exists().withMessage('Contract ID is required')
        .isUUID().withMessage('Contract ID must be a valid UUID'),
];

const getUserContractsValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('status')
        .optional()
        .isIn(['new', 'in_progress']).withMessage('Status must be either "new" or "in_progress"'),
];

const getAllContractsValidation = [
    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit')
        .optional()
        .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
    query('status')
        .optional()
        .isIn(['new', 'in_progress']).withMessage('Status must be either "new" or "in_progress"'),
];

/**
 * @swagger
 * /contracts/getall:
 *   get:
 *     summary: Get all contracts
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [new, in_progress]
 *     responses:
 *       200:
 *         description: All contracts retrieved successfully
 *       500:
 *         description: Failed to retrieve contracts
 */
router.get('/getall', 
    authenticateToken, 
    getAllContractsValidation, 
    validate, 
    ContractsController.getAllContracts
);


/**
 * @swagger
 * /contracts/create:
 *   post:
 *     summary: Create a contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contractorId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Contract created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 newContract:
 *                   type: object
 *       404:
 *         description: Contractor not found
 *       500:
 *         description: Failed to create contract
 */
router.post('/create', 
    authenticateToken, 
    authenticateclient, 
    createContractValidation, 
    validate, 
    ContractsController.createContract
);

/**
 * @swagger
 * /contracts/{id}:
 *   get:
 *     summary: Get a contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Contract ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contract retrieved successfully
 *       404:
 *         description: Contract not found
 *       403:
 *         description: Unauthorized to view this contract
 *       500:
 *         description: Failed to retrieve contract
 */
router.get('/:id', 
    authenticateToken, 
    getContractValidation, 
    validate, 
    ContractsController.getContract
);

/**
 * @swagger
 * /contracts:
 *   get:
 *     summary: Get user contracts
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: query
 *         name: status
 *         required: false
 *         schema:
 *           type: string
 *           enum: [new, in_progress]
 *     responses:
 *       200:
 *         description: User contracts retrieved successfully
 *       500:
 *         description: Failed to retrieve user contracts
 */
router.get('/', 
    authenticateToken, 
    getUserContractsValidation, 
    validate, 
    ContractsController.getUserContracts
);

/**
 * @swagger
 * /contracts/terminate/{id}:
 *   put:
 *     summary: Terminate a contract
 *     tags: [Contracts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Contract ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Contract terminated successfully
 *       404:
 *         description: Contract not found
 *       403:
 *         description: Unauthorized to terminate this contract
 *       500:
 *         description: Failed to terminate contract
 */
router.put('/terminate/:id', 
    authenticateToken, 
    terminateContractValidation, 
    validate, 
    ContractsController.terminateContract
);


export default router;
