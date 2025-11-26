import { Request, Response } from 'express';
import { BaseRepository } from '../models/base';
import { IUser, User, ILocation, Location, UserAuth, VerificationCode } from '../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
export class UserController {
    private userRepository: BaseRepository<IUser>;
    private locationRepository: BaseRepository<ILocation>;

    constructor() {
        this.userRepository = new BaseRepository<IUser>(User);
        this.locationRepository = new BaseRepository<ILocation>(Location);
    }

    public getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const { locationId, page = 1, limit = 10, firstname, lastname, email } = req.query;
            let filter: any = { deletedAt: null };
            if (locationId) {
                filter.locationId = locationId;
            }
            if (firstname) {
                filter.firstname = { $regex: firstname as string, $options: 'i' };
            }
            if (lastname) {
                filter.lastname = { $regex: lastname as string, $options: 'i' };
            }
            if (email) {
                filter.email = { $regex: email as string, $options: 'i' };
            }
            const users = await this.userRepository.find(filter, {
                page: Number(page),
                limit: Number(limit),
                populate: ['location','deliveryAddresses']
            });
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch users', error: err });
        }
    };

    public getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.userRepository.findById(req.params.id, {
                populate: ['location','deliveryAddresses','notifications']
            });
            if (!user || user.deletedAt) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.status(200).json(user);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching user', error: err });
        }
    };

    public createUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { firstname, lastname, email, phone, whatsapp, locationId, password } = req.body;
            let username = email.split('@')[0];
            const existingEmailUser = await this.userRepository.findOne({  email: email.toLowerCase(), deletedAt: null });
            if (existingEmailUser) {
                res.status(409).json({ message: 'Email already exists' });
                return;
            }
            const existingPhoneUser = await this.userRepository.findOne({ phone, deletedAt: null });
            if (existingPhoneUser) {
                res.status(409).json({ message: 'Phone number already exists' });
                return;
            }
            const existingUsernameUser = await this.userRepository.findOne({ 
                username,
                deletedAt: null
            });
            if (existingUsernameUser) {
                username = `${username}${Math.floor(1000 + Math.random() * 9000)}`;
            }
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const userData = { firstname, lastname, email: email.toLowerCase(), phone, whatsapp: whatsapp || null, locationId, username, deletedAt: null };
            const user = await this.userRepository.create(userData);
            const userAuthData = { userId: user._id,password: hashedPassword };
            await UserAuth.create(userAuthData);
            await VerificationCode.updateMany(
                { userId: user.id, isUsed: false },
                { isUsed: true }
            );
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresIn = new Date(Date.now() + 15 * 60 * 1000);
            const hashedCode = await bcrypt.hash(verificationCode, saltRounds);
            await VerificationCode.create({
                userId: user._id,
                code: hashedCode,
                expiresIn,
                isUsed: false
            });
            res.status(201).json({ 
                message: 'User created successfully',
                verificationCode 
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error creating user', error: err });
        }
    };

    public updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { firstname, lastname, email, phone, whatsapp, locationId, username } = req.body;
            const existingUser = await this.userRepository.findById(id);
            if (!existingUser || existingUser.deletedAt) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            const updateData: any = { updatedAt: new Date() };
            if (firstname) updateData.firstname = firstname;
            if (lastname) updateData.lastname = lastname;
            if (email) {
                const existingEmailUser = await this.userRepository.findOne({ email: email.toLowerCase(),_id: { $ne: id },deletedAt: null });
                if (existingEmailUser) {
                    res.status(409).json({ message: 'Email already exists' });
                    return;
                }
                updateData.email = email.toLowerCase();
            }
            if (phone) {
                const existingPhoneUser = await this.userRepository.findOne({ phone,_id: { $ne: id },deletedAt: null });
                if (existingPhoneUser) {
                    res.status(409).json({ message: 'Phone number already exists' });
                    return;
                }
                updateData.phone = phone;
            }
            if (username) {
                const existingUsernameUser = await this.userRepository.findOne({ username,_id: { $ne: id },deletedAt: null });
                if (existingUsernameUser) {
                    res.status(409).json({ message: 'Username already exists' });
                    return;
                }
                updateData.username = username;
            }
            if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
            if (locationId) {
                const location = await this.locationRepository.findById(locationId);
                if (!location) {
                    res.status(400).json({ message: 'Invalid location ID' });
                    return;
                }
                updateData.locationId = locationId;
            }
            const user = await this.userRepository.updateById(id, updateData);
            const populatedUser = await this.userRepository.findById(id, {
                populate: ['location']
            });
            res.status(200).json({ message: 'User updated successfully', user: populatedUser }); // Fixed: was returning 'location'
        } catch (err) {
            res.status(500).json({ message: 'Error updating user', error: err });
        }
    };

    public deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const user = await this.userRepository.findById(id);
            if (!user || user.deletedAt) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            const deletedUser = await this.userRepository.updateById(id, { deletedAt: new Date() });
            res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
        } catch (err) {
            res.status(500).json({ message: 'Error deleting user', error: err });
        }
    };

    public getUsersByLocation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { locationId } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const location = await this.locationRepository.findById(locationId);
            if (!location) {
                res.status(404).json({ message: 'Location not found' });
                return;
            }
            const users = await this.userRepository.find(
                { 
                    locationId,
                    deletedAt: null 
                },
                {
                    page: Number(page),
                    limit: Number(limit),
                    populate: ['location']
                }
            );
            res.status(200).json({
                location,
                users
            });
        } catch (err) {
            res.status(500).json({ message: 'Error fetching users by location', error: err });
        }
    };

    public searchUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const { q, locationId, page = 1, limit = 10 } = req.query;
            let filter: any = {
                deletedAt: null,
                $or: [
                    { firstname: { $regex: q, $options: 'i' } },
                    { lastname: { $regex: q, $options: 'i' } },
                    { email: { $regex: q, $options: 'i' } },
                    { username: { $regex: q, $options: 'i' } },
                    { phone: { $regex: q, $options: 'i' } }
                ]
            };
            if (locationId) {
                filter.locationId = locationId;
            }
            const users = await this.userRepository.find(filter, {
                page: Number(page),
                limit: Number(limit),
                populate: ['location']
            });
            res.status(200).json({ searchQuery: q, locationId: locationId || null, users });
        } catch (err) {
            res.status(500).json({ message: 'Error searching users', error: err });
        }
    };

    public getUserProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const user = await this.userRepository.findById(id, {
                populate: ['location','deliveryAddresses','notifications']
            });
            if (!user || user.deletedAt) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.status(200).json({
                message: 'User profile retrieved successfully',
                user
            });
        } catch (err) {
            res.status(500).json({ message: 'Error fetching user profile', error: err });
        }
    };

    public updateUserLocation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params;
            const { locationId } = req.body;
            const user = await this.userRepository.findById(userId);
            if (!user || user.deletedAt) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            const location = await this.locationRepository.findById(locationId);
            if (!location) {
                res.status(400).json({ message: 'Invalid location ID' });
                return;
            }
            const updatedUser = await this.userRepository.updateById(userId, {
                locationId,
                updatedAt: new Date()
            });
            const populatedUser = await this.userRepository.findById(userId, {
                populate: ['location']
            });
            res.status(200).json({
                message: 'User location updated successfully',
                user: populatedUser
            });
        } catch (err) {
            res.status(500).json({ message: 'Error updating user location', error: err });
        }
    };

    public login = async (req: Request, res: Response) => {
        try {
            const { identifier, password } = req.body;
            const user = await this.userRepository.findOne({
                $or: [
                    { email: identifier.toLowerCase() },
                    { username: identifier },
                    { phone: identifier }
                ],
                deletedAt: null
            }, {
                populate: ['location','deliveryAddresses','notifications']
            });
            if (!user) {
                res.status(401).json({ message: 'Invalid credentials' });
                return;
            }
            const userAuth = await UserAuth.findOne({ userId: user._id });
            if (!userAuth) {
                res.status(401).json({ message: 'Authentication record not found' });
                return;
            }
            const isPasswordValid = await bcrypt.compare(password, userAuth.password);
            if (!isPasswordValid) {
                res.status(401).json({ 
                    message: 'Invalid credentials',
                });
                return;
            }
            if(!user.verified){
                const saltRounds = 12;
                await VerificationCode.updateMany(
                    { userId: user.id, isUsed: false },
                    { isUsed: true }
                );
                const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
                const expiresIn = new Date(Date.now() + 15 * 60 * 1000);
                const hashedCode = await bcrypt.hash(verificationCode, saltRounds);
                await VerificationCode.create({
                    userId: user._id,
                    code: hashedCode,
                    expiresIn,
                    isUsed: false
                });
                return res.status(409).json({
                    message: 'Verification required',
                    verificationCode,
                    email: user.email 
                });
            }
            const jwtSecret = process.env.JWT_SECRET as string;
            const accessToken = jwt.sign(
                { user: user._id, email: user.email, username: user.username,role: 'user', phone: user.phone },
                jwtSecret,
                { expiresIn: '7d' }
            );
            res.cookie('token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.status(200).json({
                message: 'Login successful',
                user,
                accessToken
            });
        } catch (err) {
            res.status(500).json({ message: 'Login failed', error: err });
        }
    };

    public verifyUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, code } = req.body;
            const user = await this.userRepository.findOne({ email: email.toLowerCase() });
            if (!user || user.deletedAt) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            if (user.verified) {
                res.status(400).json({ message: 'User is already verified' });
                return;
            }
            const verificationRecord = await VerificationCode.findOne({
                userId: user._id,
                isUsed: false
            });
            if (!verificationRecord) {
                res.status(400).json({ message: 'Invalid verification code' });
                return;
            }
            const isCodeValid = await bcrypt.compare(code, verificationRecord?.code || '');
            if (!isCodeValid || (new Date() > verificationRecord.expiresIn) || verificationRecord.isUsed) {
                res.status(400).json({ message: 'Invalid verification code' });
                return;
            }
            await VerificationCode.findByIdAndUpdate(verificationRecord._id, {
                isUsed: true
            });
            await this.userRepository.updateById(user.id, {
                verified: true,
                updatedAt: new Date()
            });
            const populatedUser = await this.userRepository.findById(user.id, {
                populate: ['location','deliveryAddresses','notifications']
            });
            const jwtSecret = process.env.JWT_SECRET as string;
            const accessToken = jwt.sign(
                { user: user._id, email: user.email, username: user.username,role: 'user', phone: user.phone },
                jwtSecret,
                { expiresIn: '7d' }
            );
            res.cookie('token', accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });
            res.status(200).json({
                message: 'User verified successfully',
                user: populatedUser,
                accessToken
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error verifying user', error: err });
        }
    };

    public resendVerificationCode = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;
            const user = await this.userRepository.findOne({ email: email.toLowerCase() });
            if (!user || user.deletedAt) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            if (user.verified) {
                res.status(400).json({ message: 'User is already verified' });
                return;
            }
            await VerificationCode.updateMany(
                { userId: user.id, isUsed: false },
                { isUsed: true }
            );
            const saltRounds = 12;
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresIn = new Date(Date.now() + 15 * 60 * 1000);
            const hashedCode = await bcrypt.hash(verificationCode, saltRounds);
            await VerificationCode.create({
                userId: user._id,
                code: hashedCode,
                expiresIn,
                isUsed: false
            });
            res.status(200).json({
                message: 'Verification code resent successfully',
                verificationCode
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Error resending verification code', error: err });
        }
    };
}