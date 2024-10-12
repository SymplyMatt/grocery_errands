import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authenticateToken';
import { Profile } from '../models/Profile';
import { Job } from '../models/Job';
import { Op } from 'sequelize';
import sequelize from 'sequelize';

class AdminController {
    public static async bestProfession(req: AuthRequest, res: Response) {
        try {
            const start: string | any = req.query.start;
            const end: string | any = req.query.end;
            const result = await Job.findAll({
                attributes: [
                    'contractorId',
                    [sequelize.fn('SUM', sequelize.col('price')), 'totalEarnings'],
                ],
                where: {
                    paid: true,
                    completed: true,
                    createdAt: {
                        [Op.between]: [new Date(start), new Date(end)],
                    },
                },
                group: ['contractorId'],
                order: [[sequelize.fn('SUM', sequelize.col('price')), 'DESC']],
                limit: 1,
            });

            if (!result.length) {
                return res.status(404).json({ message: 'No jobs found in the specified date range' });
            }
            const contractor = await Profile.findByPk(result[0].contractorId);
            if (!contractor) {
                return res.status(404).json({ message: 'Contractor not found' });
            }
            return res.status(200).json({
                profession: contractor.profession,
                totalEarnings: result[0].getDataValue('totalEarnings'),
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to retrieve the best profession',
                error: error.message,
            });
        }
    }

    public static async bestClients(req: AuthRequest, res: Response) {
        try {
            const start: string | any = req.query.start;
            const end: string | any = req.query.end;
            const limit: string | any = req.query.limit;
            if (!start || !end) {
                return res.status(400).json({ message: 'Start and end dates are required' });
            }
            const result = await Job.findAll({
                attributes: [
                    'clientId',
                    [sequelize.fn('SUM', sequelize.col('price')), 'totalPaid'],
                ],
                where: {
                    paid: true,
                    completed: true,
                    createdAt: {
                        [Op.between]: [new Date(start), new Date(end)],
                    },
                },
                group: ['clientId'],
                order: [[sequelize.fn('SUM', sequelize.col('price')), 'DESC']],
                limit: Number(limit),
            });
            const clientPromises = result.map(async (job) => {
                const client = await Profile.findByPk(job.clientId);
                return {
                    client 
                };
            });
            const clients = await Promise.all(clientPromises);
            return res.status(200).json(clients);
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to retrieve the best clients',
                error: error.message,
            });
        }
    }
}

export default AdminController;
