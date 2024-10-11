import express from 'express';
import validate from '../middleware/validate';
import { body, query } from 'express-validator';
import authenticateToken from '../middleware/authenticateToken';
import ProfilesController from '../controllers/profiles';

const router = express.Router();

const createProfileValidation = [
    body('type')
        .isString()
        .isIn(['client', 'contractor'])
        .withMessage('Type must be either client or contractor'),
    body('firstName')
        .isString()
        .withMessage('First name is required'),
    body('lastName')
        .isString()
        .withMessage('Last name is required'),
    body('email')
        .isEmail()
        .withMessage('Last name is required'),
    body('profession')
        .optional()
        .isString()
        .withMessage('Profession must be a string'),
];

const modifyProfileValidation = [
    body('id')
        .isString()
        .withMessage('Profile ID is required'),
    body('firstName')
        .optional()
        .isString()
        .withMessage('First name must be a string'),
    body('lastName')
        .optional()
        .isString()
        .withMessage('Last name must be a string'),
    body('profession')
        .optional()
        .isString()
        .withMessage('Profession must be a string'),
];

 /**
 * @swagger
 * /profiles/create:
 *   post:
 *     summary: Create a new profile
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [client, contractor]
 *                 description: Type of profile
 *               firstName:
 *                 type: string
 *                 example: John
 *                 description: First name of the profile
 *               lastName:
 *                 type: string
 *                 example: Doe
 *                 description: Last name of the profile
 *               email:
 *                 type: string
 *                 example: example@example.com
 *                 description: Email address
 *               profession:
 *                 type: string
 *                 example: Developer
 *                 description: Profession of the profile, required if type is contractor
 *     responses:
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/create', 
    createProfileValidation, 
    validate, 
    ProfilesController.createProfile
);

/**
 * @swagger
 * /profiles/{id}:
 *   get:
 *     summary: Get a profile by ID
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the profile
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.get('/:id', 
    authenticateToken,
    ProfilesController.getProfile
);

/**
 * @swagger
 * /profiles:
 *   get:
 *     summary: Get all profiles with pagination and filtering
 *     tags: [Profiles]
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of profiles per page
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: type
 *         required: false
 *         description: Filter by type
 *         schema:
 *           type: string
 *           enum: [client, contractor]  # Dropdown options
 *           example: client
 *       - in: query
 *         name: firstName
 *         required: false
 *         description: Filter by first name
 *         schema:
 *           type: string
 *       - in: query
 *         name: email
 *         required: false
 *         description: Filter by email
 *         schema:
 *           type: string
 *       - in: query
 *         name: lastName
 *         required: false
 *         description: Filter by last name
 *         schema:
 *           type: string
 *       - in: query
 *         name: profession
 *         required: false
 *         description: Filter by profession
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Profiles retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', 
    authenticateToken,
    ProfilesController.getProfiles
);


/**
 * @swagger
 * /profiles/modify:
 *   put:
 *     summary: Modify an existing profile
 *     tags: [Profiles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the profile to modify
 *               firstName:
 *                 type: string
 *                 example: John
 *                 description: Updated first name of the profile
 *               lastName:
 *                 type: string
 *                 example: Doe
 *                 description: Updated last name of the profile
 *               profession:
 *                 type: string
 *                 example: Senior Developer
 *                 description: Updated profession of the profile
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: Profile not found
 *       403:
 *         description: Unauthorized to modify this profile
 *       500:
 *         description: Server error
 */
router.put('/modify', 
    authenticateToken, 
    modifyProfileValidation, 
    validate, 
    ProfilesController.modifyProfile
);

export default router;
