import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApiKey extends Document {
  key: string;
  owner: string;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
  usageCount: number;
  usageLimit: number;
}

const apiKeySchema: Schema<IApiKey> = new Schema<IApiKey>({
    key: {
        type: String,
        required: true,
        index: true,
    },
    owner: {
        type: String,
        required: true,
        index: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: () => new Date(),
    },
    lastUsedAt: {
        type: Date,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    usageCount: {
        type: Number,
        default: 0,
    },
    usageLimit: {
        type: Number,
        default: 100000,
    },
});

apiKeySchema.index({ expiresAt: 1 });

const ApiKey: Model<IApiKey> = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
export default ApiKey;
