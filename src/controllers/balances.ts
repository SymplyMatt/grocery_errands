import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authenticateToken';
import { Profile } from '../models/Profile';
import { Job } from '../models/Job';

class BalancesController {
    public static async deposit(req: AuthRequest, res: Response) {
        try {
            const userId = req.params.userId;
            const { amount } = req.body; 
            const userProfile = await Profile.findByPk(userId);
            if (!userProfile) return res.status(404).json({ message: 'User not found' });
            const jobs = await Job.findAll({
                where: {
                    clientId: userId,
                    paid: false,
                    completed: true,
                    approvalStatus: 'approved',
                },
            });
            const totalDue = jobs.reduce((sum, job) => sum + job.price, 0);
            const maxDeposit = totalDue * 0.25;
            if (amount > maxDeposit) {
                return res.status(400).json({
                    message: `Deposit amount exceeds 25% of total due. Maximum allowed deposit is ${maxDeposit}`,
                });
            }
            userProfile.balance += amount;
            await userProfile.save();

            return res.status(200).json({
                message: 'Deposit successful',
                newBalance: userProfile.balance,
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to deposit money',
                error: error.message,
            });
        }
    }
}

export default BalancesController;
