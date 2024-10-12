import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authenticateToken';
import { Profile } from '../models/Profile';
import { Admin } from '../models/Admin';
import { Job } from '../models/Job';
import { Op } from 'sequelize';
import sequelize from 'sequelize';
import generateToken from '../config/generateToken';

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

    public static async createAdmin(req: Request, res: Response) {
        try {
            const { firstName, lastName, email, password } = req.body;
            const existingAdmin = await Admin.findOne({ where: { email } });
            if (existingAdmin) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            const admin = await Admin.create({
                firstName,
                lastName,
                email,
                password, 
            });
            const token = generateToken({ user: admin.id, role: 'admin' });
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            }); 
            return res.status(201).json({
                message: 'Admin created successfully',
                admin: {
                    id: admin.id,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    email: admin.email,
                },
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to create admin', error: error.message });
        }
    }

    public static async getAllAdmins(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (Number(page) - 1) * Number(limit);

            const admins = await Admin.findAndCountAll({
                limit: Number(limit),
                offset,
                attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
            });

            return res.status(200).json({
                admins: admins.rows,
                total: admins.count,
                page: Number(page),
                totalPages: Math.ceil(admins.count / Number(limit)),
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to retrieve admins', error: error.message });
        }
    }

    public static async getAdminById(req: Request, res: Response) {
        try {
            const { adminId } = req.params;

            const admin = await Admin.findOne({
                where: { id: adminId },
                attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
            });

            if (!admin) {
                return res.status(404).json({ message: 'Admin not found' });
            }

            return res.status(200).json({ admin });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to retrieve admin', error: error.message });
        }
    }

    public static async updateAdmin(req: AuthRequest, res: Response) {
        try {
            const { adminId } = req.params;
            const { firstName, lastName, email } = req.body;
            const admin = await Admin.findByPk(adminId);
            if (!admin) {
                return res.status(404).json({ message: 'Admin not found' });
            }
            if(admin.id !== req.user) return res.status(401).json({ message: 'Unauthorized to modify' });
            admin.firstName = firstName || admin.firstName;
            admin.lastName = lastName || admin.lastName;

            await admin.save();

            return res.status(200).json({
                message: 'Admin updated successfully',
                admin: {
                    id: admin.id,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    email: admin.email,
                },
            });
        } catch (error: any) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return res.status(400).json({ message: 'Email is already in use' });
            }

            console.error(error);
            return res.status(500).json({ message: 'Failed to update admin', error: error.message });
        }
    }

}

export default AdminController;
