import { Request, Response } from 'express';
import { BaseRepository } from '../models/base';
import { Admin, IAdmin } from '../models';

export class AdminController {
    private adminRepository: BaseRepository<IAdmin>;

    constructor() {
        this.adminRepository = new BaseRepository<IAdmin>(Admin);
    }

    public getAllAdmins = async (req: Request, res: Response): Promise<void> => {
        try {
            const admins = await this.adminRepository.find({});
            res.status(200).json(admins);
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch admins', error: err });
        }
    };

    public getAdminById = async (req: Request, res: Response): Promise<void> => {
        try {
            const admin = await this.adminRepository.findById(req.params.id);
            if (!admin) {
                res.status(404).json({ message: 'Admin not found' });
                return;
            }
            res.status(200).json(location);
        } catch (err) {
        res.status(500).json({ message: 'Error fetching location', error: err });
        }
    };

    public createAdmin = async (req: Request, res: Response): Promise<void> => {
        try {
            const admin = await this.adminRepository.create(req.body);
            res.status(201).json(location);
        } catch (err) {
            res.status(500).json({ message: 'Error creating category', error: err });
        }
    };

    public updateAdmin = async (req: Request, res: Response): Promise<void> => {
        try {
            const admin = await this.adminRepository.updateById(req.params.id, req.body);
            if (!admin) {
                res.status(404).json({ message: 'Category not found' });
                return;
            }
            res.status(200).json(location);
        } catch (err) {
            res.status(500).json({ message: 'Error updating category', error: err });
        }
    };
}
