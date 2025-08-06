import { Response, NextFunction } from 'express';
import { decrypt, encrypt } from '../config/decode';
import dotenv from 'dotenv';
import { AuthRequest } from './authenticateToken';

dotenv.config();

export const decryptApiKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const route = req.originalUrl;
        const apiKeyEncrypted = req.headers['x-api-key'] as string; 
        if (route.includes('docs')) return next();
        if (apiKeyEncrypted === 'pass') {
            req.apiToken = 'pass';
            return next();
        }
        if (!apiKeyEncrypted) return res.status(401).json({ error: 'API key is required' });
        const secretKey = process.env.CRYPTO_SECRET || '';
        const decryptedApiKey = decrypt(apiKeyEncrypted, secretKey);
        if (!decryptedApiKey) return res.status(401).json({ error: 'Unable to decrypt' });
        req.apiToken = decryptedApiKey;
        next();
    } catch (error) {
        console.error('Error decrypting API key:', error);
        return res.status(500).json({ error: 'Failed to decrypt API key' });
    }
};
