import { Schema, model } from 'mongoose';
import { IDeliveryAddress } from '../index';

const deliveryAddressSchema = new Schema<IDeliveryAddress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  lga: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'delivery_addresses'
});

deliveryAddressSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

deliveryAddressSchema.set('toJSON', { virtuals: true });
deliveryAddressSchema.set('toObject', { virtuals: true });

export const DeliveryAddress = model<IDeliveryAddress>('DeliveryAddress', deliveryAddressSchema);
