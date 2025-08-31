import { Schema, model } from 'mongoose';
import { IUser } from '../interfaces';

const userSchema = new Schema<IUser>({
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
  whatsapp: {
    type: String,
    default: null
  },
  locationId: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    default: null
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'users'
});


userSchema.virtual('location', {
  ref: 'Location',
  localField: 'locationId',
  foreignField: '_id',
  justOne: true
});

userSchema.virtual('userAuth', {
  ref: 'UserAuth',
  localField: '_id',
  foreignField: 'userId',
  justOne: true
});

userSchema.virtual('carts', {
  ref: 'Cart',
  localField: '_id',
  foreignField: 'userId'
});

userSchema.virtual('verificationCodes', {
  ref: 'VerificationCode',
  localField: '_id',
  foreignField: 'userId'
});

userSchema.virtual('userTopUps', {
  ref: 'UserTopUp',
  localField: '_id',
  foreignField: 'userId'
});

userSchema.virtual('orders', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'userId'
});

userSchema.virtual('orderProducts', {
  ref: 'OrderProduct',
  localField: '_id',
  foreignField: 'userId'
});

userSchema.virtual('notifications', {
  ref: 'Notification',
  localField: '_id',
  foreignField: 'userId'
});

userSchema.virtual('deliveryAddresses', {
  ref: 'DeliveryAddress',
  localField: '_id',
  foreignField: 'userId'
});

userSchema.statics.findNotDeleted = function() {
  return this.where({ deletedAt: null });
};

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export const User = model<IUser>('User', userSchema);
