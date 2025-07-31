import { Schema, model } from 'mongoose';
import { IAdmin } from '../index';

const adminSchema = new Schema<IAdmin>({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  deletedAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: String,
    default: null
  },
  updatedBy: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  collection: 'admins'
});
adminSchema.index({ email: 1 });
adminSchema.index({ phone: 1 });

adminSchema.virtual('adminAuth', {
  ref: 'AdminAuth',
  localField: '_id',
  foreignField: 'adminId',
  justOne: true
});

adminSchema.statics.findNotDeleted = function() {
  return this.find({ deletedAt: null });
};

adminSchema.set('toJSON', { virtuals: true });
adminSchema.set('toObject', { virtuals: true });

export const Admin = model<IAdmin>('Admin', adminSchema);
