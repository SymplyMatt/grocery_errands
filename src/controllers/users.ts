import { Request, Response } from 'express';
import { BaseRepository } from '../models/base';
import { ILocation, IUser, Location, User } from '../models';

export class UserController {
    private locationRepository: BaseRepository<IUser>;

    constructor() {
        this.locationRepository = new BaseRepository<IUser>(User);
    }

    public getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const users = await this.locationRepository.find({});
            res.status(200).json(users);
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch users', error: err });
        }
    };

    public getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.locationRepository.findById(req.params.id);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.status(200).json(location);
        } catch (err) {
        res.status(500).json({ message: 'Error fetching user', error: err });
        }
    };

    public createUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.locationRepository.create(req.body);
            res.status(201).json(location);
        } catch (err) {
            res.status(500).json({ message: 'Error creating user', error: err });
        }
    };

    public updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.locationRepository.updateById(req.params.id, req.body);
            if (!user) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            res.status(200).json(location);
        } catch (err) {
            res.status(500).json({ message: 'Error updating user', error: err });
        }
    };
}
