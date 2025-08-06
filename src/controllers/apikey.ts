import { Request, Response } from 'express';
import ApiKey, { IApiKey } from '../models/auth/APiKey';

class KeysController {
    public static async createKey(req: Request, res: Response) {
        try {
            const { owner } = req.body;
            const key = generateApiKey();
            const limit = 100000;
            const newApiKey = new ApiKey({ key,owner,isActive: true,usageCount: 0,usageLimit: limit });
            const apiKey = await newApiKey.save();
            res.status(201).json({ apiKey });
        } catch (error) {
            console.error('Error creating API key:', error);
            res.status(500).json({ error: 'Failed to create API key' });
        }
    }

    public static async deleteKey(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const apiKey = await ApiKey.findById(id);
            if (!apiKey) return res.status(404).json({ error: 'API key not found' });
            apiKey.isActive = false;
            await apiKey.save();
            res.status(200).json({ message: 'API key deactivated successfully' });
        } catch (error) {
            console.error('Error deactivating API key:', error);
            res.status(500).json({ error: 'Failed to deactivate API key' });
        }
    }

    public static async getKey(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const apiKey = await ApiKey.findById(id);
            if (!apiKey) return res.status(404).json({ error: 'API key not found' });
            res.status(200).json({ apiKey });
        } catch (error) {
            console.error('Error retrieving API key:', error);
            res.status(500).json({ error: 'Failed to retrieve API key' });
        }
    }

    public static async getApiKeyByKey(apiKeyString: string): Promise<IApiKey | null> {
        try {
            const apiKey = await ApiKey.findOne({ key: apiKeyString });
            if (apiKey && apiKey.usageCount < apiKey.usageLimit) {
                apiKey.usageCount += 1;
                apiKey.lastUsedAt = new Date();
                await apiKey.save();
                return apiKey;
            }
            return null;
        } catch (error) {
            console.error('Error retrieving API key by string:', error);
            return null;
        }
    }

    public static async getAllKeys(req: Request, res: Response) {
        try {
            const apiKeys = await ApiKey.find();
            res.status(200).json({ apiKeys });
        } catch (error) {
            console.error('Error retrieving API keys:', error);
            res.status(500).json({ error: 'Failed to retrieve API keys' });
        }
    }

    public static async updateUsageCount(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const apiKey = await ApiKey.findById(id);
            if (!apiKey) return res.status(404).json({ error: 'API key not found' });
            if (apiKey.usageCount >= apiKey.usageLimit) {
                return res.status(403).json({ error: 'Usage limit exceeded' });
            }
            apiKey.usageCount += 1;
            await apiKey.save();
            res.status(200).json({ message: 'Usage count updated', usageCount: apiKey.usageCount });
        } catch (error) {
            console.error('Error updating usage count:', error);
            res.status(500).json({ error: 'Failed to update usage count' });
        }
    }
}

    function generateApiKey(): string {
        return `api_${Math.random().toString(36).substring(2, 15)}`;
    }

export default KeysController;
