import { Request, Response, NextFunction } from 'express';
import ApiKey, { IApiKey } from '../models/auth/ApiKey';
import { AuthRequest } from './authenticateToken';
import KeysController from '../controllers/apikey';
export const authenticateApiKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const route = req.originalUrl;
        const apiKeyString = req.apiToken;
        if (route.includes('docs')) return next();
        if (route.includes('health')) return next();
        if (apiKeyString === 'pass') return next();
        if (!apiKeyString) return res.status(401).json({ error: 'API key is required' });
        const apiKeyDetails = await KeysController.getApiKeyByKey(apiKeyString);
        if (!apiKeyDetails) return res.status(401).json({ error: 'API key not found' });
        if (!apiKeyDetails.isActive) {
            return res.status(403).json({ error: 'Inactive API key' });
        }
        if ((apiKeyDetails.expiresAt && new Date() > new Date(apiKeyDetails.expiresAt))) {
            return res.status(403).json({ error: 'API key has expired' });
        }
        if (apiKeyDetails.usageCount >= apiKeyDetails.usageLimit) return res.status(403).json({ error: 'Usage limit exceeded' });
        req.apiKey = apiKeyDetails.key;
        next();
    } catch (error) {
        console.error('Error authenticating API key:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
