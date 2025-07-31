import { Schema, model } from 'mongoose';
import { IUserAuth } from '../interfaces';

const userAuthSchema = new Schema<IUserAuth>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'user_auth'
});

userAuthSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

userAuthSchema.set('toJSON', { virtuals: true });
userAuthSchema.set('toObject', { virtuals: true });

export const UserAuth = model<IUserAuth>('UserAuth', userAuthSchema);