import express from 'express';
import validate from '../middleware/validate';
import { body, query } from 'express-validator';
import authenticateToken from '../middleware/authenticateToken';
import ProfilesController from '../controllers/profiles';
import authenticateAdmin from '../middleware/authenticateAdmin';
import AdminController from '../controllers/admin';

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
 *     tags: [Profiles,Admin]
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
 *     tags: [Admin]
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
    authenticateAdmin,
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

/**
 * @swagger
 * /profiles/get/loggedin:
 *   get:
 *     summary: Get the profile of the logged-in user
 *     tags: [Profiles]
 *     security:
 *       - bearerAuth: []  # JWT Authentication
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profile:
 *                   type: object
 *                   description: The profile of the logged-in user
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: Profile ID
 *                     firstName:
 *                       type: string
 *                       description: User's first name
 *                     lastName:
 *                       type: string
 *                       description: User's last name
 *                     email:
 *                       type: string
 *                       description: User's email address
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: When the profile was created
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: When the profile was last updated
 *       404:
 *         description: Profile not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile not found
 *       500:
 *         description: Failed to retrieve profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to retrieve profile
 *                 error:
 *                   type: string
 *                   description: Detailed error message
 */
router.get('/get/loggedin', 
    authenticateToken,  
    ProfilesController.getLoggedInProfile
);

/**
 * @swagger
 * /profiles/login:
 *   post:
 *     summary: Login user
 *     description: Authenticate user with email and password. If the user type is 'admin', checks against the Admin model; otherwise, checks against the Profile model.
 *     tags: [Profiles,Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: yourpassword
 *               type:
 *                 type: string
 *                 enum: [user,admin]
 *                 example: user
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
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 1
 *                     email:
 *                       type: string
 *                       example: johndoe@example.com
 *                     firstName:
 *                       type: string
 *                       example: John
 *                     lastName:
 *                       type: string
 *                       example: Doe
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid email or password
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
 *                   example: Some error message
 */

router.post('/login', 
    [
        body('email').isEmail().withMessage('Invalid email format'),
        body('password').isString().withMessage('Password must be a string'),
        body('type').isIn(['user','admin']).withMessage('Type must be user or admin'),
    ],
    ProfilesController.login
);

export default router;
