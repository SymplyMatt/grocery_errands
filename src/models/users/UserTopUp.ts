import mongoose, { Schema, model } from 'mongoose';
import { IUserTopUp, TopUpStatus } from '../index';

const topUpStatusEnum: TopUpStatus[] = ['PENDING', 'SUCCESS', 'FAILED'];

const userTopUpSchema = new Schema<IUserTopUp>({
  referenceNumber: {
    type: String,
    required: true,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    get: (v: number) => parseFloat(v.toFixed(2)),
    set: (v: number) => parseFloat(v.toString())
  },
  status: {
    type: String,
    enum: topUpStatusEnum,
    default: 'PENDING'
  },
  meta: {
    type: Schema.Types.Mixed,
    default: {}
  },
  deletedAt: {
    type: Date,
    default: null
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'user_top_ups',
  toJSON: { getters: true },
  toObject: { getters: true }
});

userTopUpSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

userTopUpSchema.statics.findNotDeleted = function() {
  return this.where({ deletedAt: null });
};

export const UserTopUp = model<IUserTopUp>('UserTopUp', userTopUpSchema);
