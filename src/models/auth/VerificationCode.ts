import { Schema, model } from 'mongoose';
import { IVerificationCode } from '../interfaces';

const verificationCodeSchema = new Schema<IVerificationCode>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  expiresIn: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  collection: 'verification_codes'
});

verificationCodeSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

verificationCodeSchema.set('toJSON', { virtuals: true });
verificationCodeSchema.set('toObject', { virtuals: true });

export const VerificationCode = model<IVerificationCode>('VerificationCode', verificationCodeSchema);
