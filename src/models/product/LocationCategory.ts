import { Schema, model } from 'mongoose';
import { ILocationCategory } from '../index';

const locationCategorySchema = new Schema<ILocationCategory>({
  locationId: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false },
  collection: 'location_categories'
});

locationCategorySchema.index({ locationId: 1, categoryId: 1 }, { unique: true });

locationCategorySchema.virtual('location', {
  ref: 'Location',
  localField: 'locationId',
  foreignField: '_id',
  justOne: true
});

locationCategorySchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

locationCategorySchema.set('toJSON', { virtuals: true });
locationCategorySchema.set('toObject', { virtuals: true });

export const LocationCategory = model<ILocationCategory>('LocationCategory', locationCategorySchema);
