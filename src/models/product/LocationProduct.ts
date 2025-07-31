import { Schema, model } from 'mongoose';
import { ILocationProduct } from '../index';

const locationProductSchema = new Schema<ILocationProduct>({
  locationId: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'location_products'
});

locationProductSchema.index({ locationId: 1, productId: 1 }, { unique: true });

locationProductSchema.virtual('location', {
  ref: 'Location',
  localField: 'locationId',
  foreignField: '_id',
  justOne: true
});

locationProductSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true
});

locationProductSchema.set('toJSON', { virtuals: true });
locationProductSchema.set('toObject', { virtuals: true });

export const LocationProduct = model<ILocationProduct>('LocationProduct', locationProductSchema);
