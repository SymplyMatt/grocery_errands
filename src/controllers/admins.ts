import { Request, Response } from 'express';
import { BaseRepository } from '../models/base';
import { IAdmin, Admin, AdminAuth } from '../models';
import bcrypt from 'bcrypt';

export class AdminController {
    private adminRepository: BaseRepository<IAdmin>;

    constructor() {
        this.adminRepository = new BaseRepository<IAdmin>(Admin);
    }

    public getAllAdmins = async (req: Request, res: Response): Promise<void> => {
        try {
            const { page = 1, limit = 10 } = req.query;
            let filter: any = { deletedAt: null };
            const admins = await this.adminRepository.find(filter, { page: Number(page), limit: Number(limit) });
            res.status(200).json(admins);
        } catch (err) {
            res.status(500).json({ message: 'Failed to fetch admins', error: err });
        }
    };

    public getAdminById = async (req: Request, res: Response): Promise<void> => {
        try {
            const admin = await this.adminRepository.findById(req.params.id);
            if (!admin || admin.deletedAt) {
                res.status(404).json({ message: 'Admin not found' });
                return;
            }
            res.status(200).json(admin);
        } catch (err) {
            res.status(500).json({ message: 'Error fetching admin', error: err });
        }
    };

    public createAdmin = async (req: Request, res: Response): Promise<void> => {
        try {
            const { firstname, lastname, email, phone, username, password, role, permissions } = req.body;
            const existingEmailAdmin = await this.adminRepository.findOne({ 
                email: email.toLowerCase(),
                deletedAt: null 
            });
            if (existingEmailAdmin) {
                res.status(409).json({ message: 'Email already exists' });
                return;
            }
            const existingUsernameAdmin = await this.adminRepository.findOne({ 
                username,
                deletedAt: null 
            });
            if (existingUsernameAdmin) {
                res.status(409).json({ message: 'Username already exists' });
                return;
            }
            if (phone) {
                const existingPhoneAdmin = await this.adminRepository.findOne({ 
                    phone,
                    deletedAt: null 
                });
                if (existingPhoneAdmin) {
                    res.status(409).json({ message: 'Phone number already exists' });
                    return;
                }
            }
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const adminData = { firstname, lastname, email: email.toLowerCase(), phone: phone || null, username, role: role || 'admin', permissions: permissions || [], isActive: true, deletedAt: null, createdBy: "", updatedBy: "" };
            const admin = await this.adminRepository.create(adminData);
            const adminAuthData = {
                adminId: admin._id,
                password: hashedPassword
            };
            const adminAuth = await AdminAuth.create(adminAuthData);
            res.status(201).json({
                message: 'Admin created successfully',
                admin: { admin, adminAuth }
            });
        } catch (err) {
            res.status(500).json({ message: 'Error creating admin', error: err });
        }
    };

    public updateAdmin = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { firstname, lastname, email, phone, username, role, permissions, isActive } = req.body;
            const existingAdmin = await this.adminRepository.findById(id);
            if (!existingAdmin || existingAdmin.deletedAt) {
                res.status(404).json({ message: 'Admin not found' });
                return;
            }
            const updateData: any = { updatedBy: "", updatedAt: new Date() };
            if (firstname) updateData.firstname = firstname;
            if (lastname) updateData.lastname = lastname;
            if (email) {
                const existingEmailAdmin = await this.adminRepository.findOne({  email: email.toLowerCase(), _id: { $ne: id }, deletedAt: null });
                if (existingEmailAdmin) {
                    res.status(409).json({ message: 'Email already exists' });
                    return;
                }
                updateData.email = email.toLowerCase();
            }
            if (phone) {
                const existingPhoneAdmin = await this.adminRepository.findOne({ phone, _id: { $ne: id },deletedAt: null });
                if (existingPhoneAdmin) {
                    res.status(409).json({ message: 'Phone number already exists' });
                    return;
                }
                updateData.phone = phone;
            }
            if (username) {
                const existingUsernameAdmin = await this.adminRepository.findOne({ username,_id: { $ne: id },deletedAt: null 
                });
                if (existingUsernameAdmin) {
                    res.status(409).json({ message: 'Username already exists' });
                    return;
                }
                updateData.username = username;
            }
            if (role) updateData.role = role;
            if (permissions) updateData.permissions = permissions;
            if (isActive !== undefined) updateData.isActive = isActive;
            const admin = await this.adminRepository.updateById(id, updateData);
            const populatedAdmin = await this.adminRepository.findById(id, {
                populate: ['adminAuth']
            });
            const responseAdmin = populatedAdmin?.toObject();
            if (responseAdmin?.adminAuth?.password) {
                delete responseAdmin.adminAuth.password;
            }
            res.status(200).json({ 
                message: 'Admin updated successfully', 
                admin: responseAdmin 
            });
        } catch (err) {
            res.status(500).json({ message: 'Error updating admin', error: err });
        }
    };

    public deleteAdmin = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const admin = await this.adminRepository.findById(id);
            if (!admin || admin.deletedAt) {
                res.status(404).json({ message: 'Admin not found' });
                return;
            }
            const deletedAdmin = await this.adminRepository.updateById(id, {
                deletedAt: new Date(),
                isActive: false,
                updatedBy: ""
            });
            res.status(200).json({ 
                message: 'Admin deleted successfully', 
                admin: deletedAdmin 
            });
        } catch (err) {
            res.status(500).json({ message: 'Error deleting admin', error: err });
        }
    };

    public updateAdminPassword = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { currentPassword, newPassword } = req.body;
            const admin = await this.adminRepository.findById(id);
            if (!admin || admin.deletedAt) {
                res.status(404).json({ message: 'Admin not found' });
                return;
            }
            const adminAuth = await AdminAuth.findOne({ adminId: id });
            if (!adminAuth) {
                res.status(404).json({ message: 'Admin authentication record not found' });
                return;
            }
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, adminAuth.password);
            if (!isCurrentPasswordValid) {
                res.status(401).json({ message: 'Current password is incorrect' });
                return;
            }
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
            await AdminAuth.findOneAndUpdate(
                { adminId: id },
                {
                    password: hashedNewPassword
                }
            );
            res.status(200).json({ message: 'Admin password updated successfully' });
        } catch (err) {
            res.status(500).json({ message: 'Error updating admin password', error: err });
        }
    };
}