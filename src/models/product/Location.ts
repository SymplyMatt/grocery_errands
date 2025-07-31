import { Schema, model } from 'mongoose';
import { ILocation } from '../interfaces';

const locationSchema = new Schema<ILocation>({
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: true,
  collection: 'locations'
});

locationSchema.virtual('locationProducts', {
  ref: 'LocationProduct',
  localField: '_id',
  foreignField: 'locationId'
});

locationSchema.virtual('locationCategories', {
  ref: 'LocationCategory',
  localField: '_id',
  foreignField: 'locationId'
});

locationSchema.virtual('users', {
  ref: 'User',
  localField: '_id',
  foreignField: 'locationId'
});

locationSchema.set('toJSON', { virtuals: true });
locationSchema.set('toObject', { virtuals: true });

export const Location = model<ILocation>('Location', locationSchema);