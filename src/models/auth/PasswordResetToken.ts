import { Schema, model, Document } from 'mongoose';
import { ITimestamps } from '../interfaces';

export interface IPasswordResetToken extends Document, ITimestamps {
  userId: Schema.Types.ObjectId;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  userType: 'user' | 'admin';
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  token: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  userType: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  }
}, {
  timestamps: true,
  collection: 'password_reset_tokens'
});

passwordResetTokenSchema.index({ token: 1 });
passwordResetTokenSchema.index({ userId: 1, userType: 1 });
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PasswordResetToken = model<IPasswordResetToken>('PasswordResetToken', passwordResetTokenSchema);
export default PasswordResetToken;

