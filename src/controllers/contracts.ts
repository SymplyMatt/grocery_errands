import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authenticateToken';
import { Profile } from '../models/Profile';
import { Contract } from '../models/Contract';
import { Op } from 'sequelize';
import { Job } from '../models/Job';

class ContractsController {
    public static async createContract(req: AuthRequest, res: Response) {
        try {
            const { contractorId } = req.body;
            const clientId = req.user;
            const contractorProfile = await Profile.findByPk(contractorId);
            if (!contractorProfile) return res.status(404).json({ message: 'contractor not found' });
            const newContract = await Contract.create({clientId,contractorId,status: 'new'});
            return res.status(201).json({
                message: 'Contract created successfully',
                newContract
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to create contract',
                error: error.message,
            });
        }
    }

    public static async terminateContract(req: AuthRequest, res: Response) {
        try {
            const contractId = req.params.id;
            const userId = req.user;
            const contract = await Contract.findByPk(contractId);
            if (!contract) return res.status(404).json({ message: 'Contract not found' });
            if (contract.clientId !== userId && contract.contractorId !== userId) return res.status(403).json({ message: 'Unauthorized to terminate this contract' });
            contract.status = 'terminated';
            await contract.save();
            return res.status(200).json({
                message: 'Contract terminated successfully',
                contract
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to terminate contract',
                error: error.message,
            });
        }
    }

    public static async getContract(req: AuthRequest, res: Response) {
        try {
            const contractId = req.params.id;
            const userId = req.user;
    
            const contract = await Contract.findOne({
                where: { id: contractId },
                include: [
                    {
                        model: Profile,
                        as: 'client',
                        attributes: { exclude: ['password'] }, 
                    },
                    {
                        model: Profile,
                        as: 'contractor',
                        attributes: { exclude: ['password'] }, 
                    },
                    {
                        model: Job,
                        as: 'jobs',
                    },
                ],
            });
            if (!contract) return res.status(404).json({ message: 'Contract not found' });
            if (contract.clientId !== userId && contract.contractorId !== userId) {
                return res.status(403).json({ message: 'Unauthorized to view this contract' });
            }
            return res.status(200).json({
                contract,
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to retrieve contract',
                error: error.message,
            });
        }
    }
    
    public static async getUserContracts(req: AuthRequest, res: Response) {
        try {
            const userId = req.user;
            const { page = 1, limit = 10, status } = req.query;
            const whereClause: any = {
                [Op.or]: [
                    { clientId: userId, status: { [Op.ne]: 'terminated' } },
                    { contractorId: userId, status: { [Op.ne]: 'terminated' } },
                ],
            };
            if (status) {
                whereClause.status = status;
            }
            const offset = (Number(page) - 1) * Number(limit);
            const contracts = await Contract.findAndCountAll({
                where: whereClause,
                limit: Number(limit),
                offset,
                include: [
                    {
                        model: Profile,
                        as: 'client',
                        attributes: { exclude: ['password'] }, 
                    },
                    {
                        model: Profile,
                        as: 'contractor',
                        attributes: { exclude: ['password'] }, 
                    },
                    {
                        model: Job,
                        as: 'jobs',
                    },
                ],
            });
            return res.status(200).json({
                contracts: contracts.rows,
                total: contracts.count,
                page: Number(page),
                totalPages: Math.ceil(contracts.count / Number(limit)),
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to retrieve user contracts',
                error: error.message,
            });
        }
    }
    
    public static async getAllContracts(req: AuthRequest, res: Response) {
        try {
            const { page = 1, limit = 10, status } = req.query;
    
            const whereClause: any = {
                status: { [Op.ne]: 'terminated' },
            };
    
            if (status) {
                whereClause.status = status;
            }
            const offset = (Number(page) - 1) * Number(limit);
            const contracts = await Contract.findAndCountAll({
                where: whereClause,
                limit: Number(limit),
                offset,
                include: [
                    {
                        model: Profile,
                        as: 'client',
                        attributes: { exclude: ['password'] },
                    },
                    {
                        model: Profile,
                        as: 'contractor',
                        attributes: { exclude: ['password'] },
                    },
                    {
                        model: Job,
                        as: 'jobs',
                    },
                ],
            });
    
            return res.status(200).json({
                contracts: contracts.rows,
                total: contracts.count,
                page: Number(page),
                totalPages: Math.ceil(contracts.count / Number(limit)),
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to retrieve contracts',
                error: error.message,
            });
        }
    }
    
}

export default ContractsController;
