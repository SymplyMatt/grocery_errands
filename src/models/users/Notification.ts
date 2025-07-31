import { Schema, model } from 'mongoose';
import { INotification } from '../interfaces';

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  action: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'notifications'
});

notificationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

export const Notification = model<INotification>('Notification', notificationSchema);
