import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authenticateToken';
import { Profile } from '../models/Profile';
import generateToken from '../config/generateToken';

class ProfilesController {
    public static async createProfile(req: AuthRequest, res: Response) {
        try {
            const { type, firstName, lastName, email } = req.body;
            let { profession } = req.body;
            const existingProfile = await Profile.findOne({ where: { email } });
            if (existingProfile) return res.status(400).json({message: 'Email already in use'});    
            if (type === 'contractor') {
                profession = profession || null;
            } else {
                profession = null;
            }
            const newProfile = await Profile.create({type,profession,firstName,lastName,email,balance: 100,createdAt: new Date(),updatedAt: new Date()});
            const token = generateToken({ user: newProfile.id, role: type });
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });
            return res.status(201).json({
                message: 'Profile created successfully',
                profile: newProfile,
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to create profile',
                error: error.message,
            });
        }
    }
    
    public static async getProfile(req: Request, res: Response) {
        try {
            const profileId = req.params.id;
            const profile = await Profile.findByPk(profileId);
            if (!profile) {
                return res.status(404).json({ message: 'Profile not found' });
            }
            return res.status(200).json({data: profile});
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to retrieve profile',
                error: error.message,
            });
        }
    }

    public static async getProfiles(req: Request, res: Response) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const offset = (Number(page) - 1) * Number(limit);
            const where: any = {};
            const filters = ['type', 'lastName', 'firstName', 'profession'];
            filters.forEach((filter) => {
                if (req.query[filter]) {
                    where[filter] = req.query[filter];
                }
            });
            const { count, rows } = await Profile.findAndCountAll({where,limit: Number(limit),offset});
            return res.status(200).json({
                data: {
                    totalProfiles: count,
                    totalPages: Math.ceil(count / Number(limit)),
                    currentPage: Number(page),
                    profiles: rows,
                },
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to retrieve profiles',
                error: error.message,
            });
        }
    }

    public static async modifyProfile(req: AuthRequest, res: Response) {
        try {
            const profileId = req.body.id;
            const userId = req.user; 
            const profile = await Profile.findByPk(profileId);
            if (!profile) return res.status(404).json({ message: 'Profile not found' });
            if (profile.id !== userId) return res.status(403).json({ message: 'Unauthorized to modify this profile' });
            const { type, profession, email, ...updateData } = req.body;
            if (type !== undefined) return res.status(400).json({ message: 'Modification of type is not allowed' });
            if (profile.type === 'contractor' && profession !== undefined) {
                updateData.profession = profession;
            } else if (profile.type !== 'contractor' && profession !== undefined) {
                return res.status(400).json({ message: 'Profession can only be updated for contractors' });
            }
            const updatedProfile = await profile.update(updateData);
            return res.status(200).json({
                message: 'Profile updated successfully',
                profile: updatedProfile,
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to modify profile',
                error: error.message,
            });
        }
    }  

    public static async getLoggedInProfile(req: AuthRequest, res: Response) {
        try {
            const userId = req.user; 
            const profile = await Profile.findByPk(userId);
            if (!profile) return res.status(404).json({ message: 'Profile not found' });
            return res.status(200).json({
                profile
            });
        } catch (error: any) {
            console.error(error);
            return res.status(500).json({
                message: 'Failed to retrieve profile',
                error: error.message,
            });
        }
    }    
}

export default ProfilesController;
