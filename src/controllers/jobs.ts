import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authenticateToken';
import { Job } from '../models/Job';
import { Contract } from '../models/Contract';
import { Op } from 'sequelize';
import { Profile } from '../models/Profile';

class JobsController {
    public static async createJob(req: AuthRequest, res: Response) {
        try {
            const { title, description, price, contractId } = req.body;
            const clientId = req.user;
            const contract = await Contract.findByPk(contractId);
            if (!contract) return res.status(404).json({ message: 'Contract not found' });
            if (contract.clientId !== clientId) return res.status(403).json({ message: 'You are not authorized to create a job for this contract' });
            if (contract.status === 'terminated') return res.status(400).json({ message: 'Cannot create a job for a terminated contract' });
            const newJob = await Job.create({title,description,price,contractId,clientId: contract.clientId,contractorId: contract.contractorId,approvalStatus: 'pending',completed: false,paid: false});
            await contract.update({ status: 'in_progress' });
            return res.status(201).json({
                message: 'Job created successfully',
                job: newJob
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to create job',
                error: error.message,
            });
        }
    }
    
    public static async modifyJob(req: AuthRequest, res: Response) {
        try {
            const { id, title, price, description } = req.body;
            const job = await Job.findByPk(id);
            if (!job) return res.status(404).json({ message: 'Job not found' });
            if(req.user !== job.clientId) return res.status(404).json({ message: 'Unauthorized to modify this job' });
            job.title = title || job.title;
            job.price = price || job.price;
            job.description = description || job.description;
            await job.save();
            return res.status(200).json({
                message: 'Job updated successfully',
                job
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to update job',
                error: error.message,
            });
        }
    }

    public static async markJobAsCompleted(req: AuthRequest, res: Response) {
        try {
            const { id } = req.body;
            const job = await Job.findByPk(id);
            if (!job) return res.status(404).json({ message: 'Job not found' });
            if(req.user !== job.contractorId) return res.status(404).json({ message: 'Unauthorized to modify this job' });
            job.completed = true;
            await job.save();
            return res.status(200).json({
                message: 'Job marked as completed',
                job
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to mark job as completed',
                error: error.message,
            });
        }
    }

    public static async updateApprovalStatus(req: AuthRequest, res: Response) {
        try {
            const { id, approvalStatus } = req.body;
            const job = await Job.findByPk(id);
            if (!job) return res.status(404).json({ message: 'Job not found' });
            if(req.user !== job.clientId) return res.status(404).json({ message: 'Unauthorized to modify this job' });
            if (!['approved', 'rejected'].includes(approvalStatus)) res.status(400).json({ message: 'Invalid approval status' });
            job.approvalStatus = approvalStatus;
            await job.save();
            return res.status(200).json({
                message: `Job approval status updated to ${approvalStatus}`,
                job
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to update job approval status',
                error: error.message,
            });
        }
    }

    public static async getUserJobs(req: AuthRequest, res: Response) {
        try {
            const userId = req.user;
    
            const jobs = await Job.findAll({
                where: {
                    [Op.or]: [
                        { clientId: userId },
                        { contractorId: userId }
                    ]
                },
                include: [{
                    model: Contract,
                    as: 'contract',
                    include: [
                        { model: Profile, as: 'client' },
                        { model: Profile, as: 'contractor' }
                    ]
                }]
            });
    
            return res.status(200).json({
                message: 'User jobs retrieved successfully',
                jobs
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to retrieve user jobs',
                error: error.message,
            });
        }
    }

    public static async getAllJobs(req: AuthRequest, res: Response) {
    try {
        const jobs = await Job.findAll({
            include: [{
                model: Contract,
                as: 'contract',
                include: [
                { model: Profile, as: 'client' },
                { model: Profile, as: 'contractor' }
                ]
            }]
        });
        return res.status(200).json({
            message: 'All jobs retrieved successfully',
            jobs
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
        message: 'Failed to retrieve all jobs',
        error: error.message,
        });
    }
    }

    public static async getUnpaidJobs(req: AuthRequest, res: Response) {
    try {
        const userId = req.user;

        const jobs = await Job.findAll({
            where: {
                paid: false,
                completed: true,
                [Op.or]: [
                { clientId: userId },
                { contractorId: userId }
                ]
            },
            include: [{
                model: Contract,
                as: 'contract',
                where: {
                status: 'in_progress'
                },
                include: [
                { model: Profile, as: 'client' },
                { model: Profile, as: 'contractor' }
                ]
            }]
        });
        return res.status(200).json({
            message: 'Unpaid jobs retrieved successfully',
            jobs
        });
    } catch (error: any) {
        console.error(error);
        return res.status(500).json({
        message: 'Failed to retrieve unpaid jobs',
        error: error.message,
        });
    }
    }    

    public static async payForJob(req: AuthRequest, res: Response) {
        try {
            const { job_id } = req.params;
            const userId = req.user;
            const job = await Job.findByPk(job_id, { include: [{
                model: Contract,
                as: 'contract',
                include: [
                { model: Profile, as: 'client' },
                { model: Profile, as: 'contractor' }
                ]
            }] });
            if (!job) return res.status(404).json({ message: 'Job not found' });
            if (job.paid) return res.status(401).json({ message: 'Job already paid for' });
            if(job?.clientId !== userId) return res.status(401).json({ message: 'Unauthorized to pay for this job' });
            if (!job.completed || job.approvalStatus !== 'approved') return res.status(400).json({ message: 'Job must be completed and approved before payment' });
            const client = await Profile.findByPk(job.clientId);
            const contractor = await Profile.findByPk(job.contractorId);
            if(!client) return res.status(400).json({ message: 'Client not found' });
            if(!contractor) return res.status(400).json({ message: 'Contractor not found' });
            if (client.balance < job.price) return res.status(400).json({ message: 'Insufficient balance' });
            client.balance -= job.price;
            contractor.balance += job.price;
            job.paid = true;
            await client.save();
            await contractor.save();
            await job.save();
            return res.status(200).json({
                message: 'Payment successful',
                job
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to process payment',
                error: error.message,
            });
        }
    }

    public static async getJob(req: AuthRequest, res: Response) {
        try {
            const { job_id } = req.params;
            const job = await Job.findByPk(job_id, { include: [{
                model: Contract,
                as: 'contract',
                include: [
                { model: Profile, as: 'client' },
                { model: Profile, as: 'contractor' }
                ]
            }] });
            if (!job) return res.status(404).json({ message: 'Job not found' });
            return res.status(200).json({
                message: 'Job retrieved successfully',
                job
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to retrieve job',
                error: error.message,
            });
        }
    }
}

export default JobsController;
