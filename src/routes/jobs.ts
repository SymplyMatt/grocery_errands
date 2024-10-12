import express from 'express';
import { body, param, query } from 'express-validator';
import validate from '../middleware/validate';
import authenticateToken from '../middleware/authenticateToken';
import JobsController from '../controllers/jobs';
import authenticateclient from '../middleware/authenticateclient';
import authenticatecontractor from '../middleware/authenticatecontractor';

const router = express.Router();

/**
 * @swagger
 * /jobs/create:
 *   post:
 *     summary: Create a new job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Job title
 *                 example: "Fix plumbing"
 *               description:
 *                 type: string
 *                 description: Job description
 *                 example: "Fix the leaking pipe in the bathroom"
 *               price:
 *                 type: number
 *                 description: Price for the job
 *                 example: 150.00
 *               contractId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the associated contract
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Job created successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Failed to create job
 */









router.post(
    '/create',
  authenticateToken,
  authenticateclient,
  [
      body('title').notEmpty().withMessage('Title is required'),
      body('description').notEmpty().withMessage('Description is required'),
      body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
      body('contractId').isUUID(4).withMessage('Contract ID must be a valid UUID'),
    ],
    validate,
    JobsController.createJob
);

/**
 * @swagger
 * /jobs/modify:
 *   put:
 *     summary: Modify an existing job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the job to modify
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               title:
 *                 type: string
 *                 description: New job title (optional)
 *                 example: "Fix electrical wiring"
 *               description:
 *                 type: string
 *                 description: New job description (optional)
 *                 example: "Fix faulty wiring in the kitchen"
 *               price:
 *                 type: number
 *                 description: New price for the job (optional)
 *                 example: 200.00
 *     responses:
 *       200:
 *         description: Job modified successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Failed to modify job
 */
router.put(
    '/modify',
    authenticateToken,
    authenticateclient,
    [
    body('id').isUUID(4).withMessage('Job ID must be a valid UUID'),
    body('title').optional().isString().withMessage('Title must be a string'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('price').optional().isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
],
validate,
JobsController.modifyJob
);

/**
 * @swagger
 * /jobs/update/completed:
 *   put:
 *     summary: Mark job as completed
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the job to mark as completed
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Job marked as completed
 *       400:
 *         description: Invalid job ID
 *       500:
 *         description: Failed to mark job as completed
 */

router.put(
    '/update/completed',
    authenticateToken,
    authenticatecontractor,
    [
        body('id').isUUID(4).withMessage('Job ID must be a valid UUID'),
    ],
    validate,
    JobsController.markJobAsCompleted
);

/**
 * @swagger
 * /jobs/update/approval:
 *   put:
 *     summary: Update approval status of a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the job to update approval status
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               approvalStatus:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: Approval status of the job
 *                 example: "approved"
 *     responses:
 *       200:
 *         description: Job approval status updated successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Failed to update job approval status
 */

router.put(
    '/update/approval',
    authenticateToken,
    authenticateclient,
    [
        body('id').isUUID(4).withMessage('Job ID must be a valid UUID'),
    body('approvalStatus').isIn(['approved', 'rejected']).withMessage('Approval status must be either "approved" or "rejected"'),
],
validate,
JobsController.updateApprovalStatus
);

/**
 * @swagger
 * /jobs/get/user:
 *   get:
 *     summary: Get jobs associated with the authenticated user
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User jobs retrieved successfully
 *       500:
 *         description: Failed to retrieve user jobs
 */
router.get(
    '/get/user',
    authenticateToken,
  validate,
  JobsController.getUserJobs
);

/**
 * @swagger
 * /jobs/get/all:
 *   get:
 *     summary: Get all jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All jobs retrieved successfully
 *       500:
 *         description: Failed to retrieve jobs
 */
router.get(
    '/get/all',
    authenticateToken,
  validate,
  JobsController.getAllJobs
);


/**
 * @swagger
 * /jobs/unpaid:
 *   get:
 *     summary: Get all unpaid jobs
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unpaid jobs retrieved successfully
 *       500:
 *         description: Failed to retrieve unpaid jobs
 */
router.get(
    '/unpaid',
    authenticateToken,
    validate,
    JobsController.getUnpaidJobs
);

/**
 * @swagger
 * /jobs/{job_id}/pay:
 *   post:
 *     summary: Pay for a job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the job to pay for
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Job payment processed successfully
 *       400:
 *         description: Invalid job ID
 *       500:
 *         description: Failed to process payment
 */
router.post(
    '/:job_id/pay',
    authenticateToken,
    authenticateclient,
    [
        param('job_id').isUUID(4).withMessage('Job ID must be a valid UUID'),
    ],
    validate,
    JobsController.payForJob
);

/**
 * @swagger
 * /jobs/{job_id}:
 *   get:
 *     summary: Get details of a specific job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: job_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the job to retrieve
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Job details retrieved successfully
 *       400:
 *         description: Invalid job ID
 *       500:
 *         description: Failed to retrieve job details
 */
router.get(
    '/:job_id',
    authenticateToken,
  [
    param('job_id').isUUID(4).withMessage('Job ID must be a valid UUID'),
  ],
  validate,
  JobsController.getJob
);

export default router;
