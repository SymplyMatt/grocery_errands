import { Request, Response } from 'express';
import { BaseRepository } from '../models/base';
import { IUser, User, ILocation, Location } from '../models';

export class UserController {
    private userRepository: BaseRepository<IUser>;
    private locationRepository: BaseRepository<ILocation>;

    constructor() {
        this.userRepository = new BaseRepository<IUser>(User);
        this.locationRepository = new BaseRepository<ILocation>(Location);
    }

    public getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const { locationId, page = 1, limit = 10 } = req.query;
            let filter: any = { deletedAt: null };
            if (locationId) {
                filter.locationId = locationId;
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
            const { firstname, lastname, email, phone, whatsapp, locationId, username } = req.body;
            const existingEmailUser = await this.userRepository.findOne({ email: email.toLowerCase(),deletedAt: null });
            if (existingEmailUser) {
                res.status(409).json({ message: 'Email already exists' });
                return;
            }
            const existingPhoneUser = await this.userRepository.findOne({  phone, deletedAt: null });
            if (existingPhoneUser) {
                res.status(409).json({ message: 'Phone number already exists' });
                return;
            }
            const existingUsernameUser = await this.userRepository.findOne({ username,deletedAt: null });
            if (existingUsernameUser) {
                res.status(409).json({ message: 'Username already exists' });
                return;
            }
            const location = await this.locationRepository.findById(locationId);
            if (!location) {
                res.status(400).json({ message: 'Invalid location ID' });
                return;
            }
            const userData = { firstname, lastname, email: email.toLowerCase(), phone, whatsapp: whatsapp || null, locationId, username, deletedAt: null };
            const user = await this.userRepository.create(userData);
            res.status(201).json({ message: 'User created successfully', user });
        } catch (err) {
            res.status(500).json({ message: 'Error creating user', error: err });
        }
    };

    public updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { firstname, lastname, email, phone, whatsapp, locationId, username } = req.body;

            // Check if user exists and is not deleted
            const existingUser = await this.userRepository.findById(id);
            if (!existingUser || existingUser.deletedAt) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            const updateData: any = {
                updatedAt: new Date()
            };

            // Validate and update fields
            if (firstname) updateData.firstname = firstname;
            if (lastname) updateData.lastname = lastname;
            
            if (email) {
                const existingEmailUser = await this.userRepository.findOne({ 
                    email: email.toLowerCase(),
                    _id: { $ne: id },
                    deletedAt: null 
                });
                if (existingEmailUser) {
                    res.status(409).json({ message: 'Email already exists' });
                    return;
                }
                updateData.email = email.toLowerCase();
            }

            if (phone) {
                const existingPhoneUser = await this.userRepository.findOne({ 
                    phone,
                    _id: { $ne: id },
                    deletedAt: null 
                });
                if (existingPhoneUser) {
                    res.status(409).json({ message: 'Phone number already exists' });
                    return;
                }
                updateData.phone = phone;
            }

            if (username) {
                const existingUsernameUser = await this.userRepository.findOne({ 
                    username,
                    _id: { $ne: id },
                    deletedAt: null 
                });
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
            
            // Get updated user with populated data
            const populatedUser = await this.userRepository.findById(id, {
                populate: ['location']
            });
            
            res.status(200).json({ message: 'User updated successfully', user: populatedUser }); // Fixed: was returning 'location'
        } catch (err) {
            res.status(500).json({ message: 'Error updating user', error: err });
        }
    };

    // Delete user (NEW - soft delete)
    public deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            // Check if user exists and is not already deleted
            const user = await this.userRepository.findById(id);
            if (!user || user.deletedAt) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // Soft delete the user
            const deletedUser = await this.userRepository.updateById(id, {
                deletedAt: new Date()
            });

            res.status(200).json({ message: 'User deleted successfully', user: deletedUser });
        } catch (err) {
            res.status(500).json({ message: 'Error deleting user', error: err });
        }
    };

    // Get users by location (NEW)
    public getUsersByLocation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { locationId } = req.params;
            const { page = 1, limit = 10 } = req.query;

            // Verify location exists
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
                    populate: ['location', 'userAuth']
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

    // Search users (NEW)
    public searchUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const { q, locationId, page = 1, limit = 10 } = req.query;

            if (!q) {
                res.status(400).json({ message: 'Search query is required' });
                return;
            }

            // Build search filter
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

            // Add location filter if provided
            if (locationId) {
                filter.locationId = locationId;
            }

            const users = await this.userRepository.find(filter, {
                page: Number(page),
                limit: Number(limit),
                populate: ['location']
            });

            res.status(200).json({
                searchQuery: q,
                locationId: locationId || null,
                users
            });
        } catch (err) {
            res.status(500).json({ message: 'Error searching users', error: err });
        }
    };

    // Get user profile with full details (NEW)
    public getUserProfile = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            const user = await this.userRepository.findById(id, {
                populate: [
                    'location',
                    'userAuth',
                    'carts',
                    'orders',
                    'deliveryAddresses',
                    'notifications',
                    'userTopUps',
                    'verificationCodes'
                ]
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

    // Update user location (NEW)
    public updateUserLocation = async (req: Request, res: Response): Promise<void> => {
        try {
            const { userId } = req.params;
            const { locationId } = req.body;

            // Verify user exists
            const user = await this.userRepository.findById(userId);
            if (!user || user.deletedAt) {
                res.status(404).json({ message: 'User not found' });
                return;
            }

            // Verify location exists
            const location = await this.locationRepository.findById(locationId);
            if (!location) {
                res.status(400).json({ message: 'Invalid location ID' });
                return;
            }

            const updatedUser = await this.userRepository.updateById(userId, {
                locationId,
                updatedAt: new Date()
            });

            // Get updated user with populated location
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
}