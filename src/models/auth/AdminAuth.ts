import { Schema, model } from 'mongoose';
import { IAdminAuth } from '../interfaces';

const adminAuthSchema = new Schema<IAdminAuth>({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'admin_auth'
});

adminAuthSchema.virtual('admin', {
  ref: 'Admin',
  localField: 'adminId',
  foreignField: '_id',
  justOne: true
});

adminAuthSchema.set('toJSON', { virtuals: true });
adminAuthSchema.set('toObject', { virtuals: true });

export const AdminAuth = model<IAdminAuth>('AdminAuth', adminAuthSchema);