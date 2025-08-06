import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

function generateIV(): Buffer {
    return crypto.randomBytes(16);
}

export function encrypt(text: string, secretKey: string): string {
    const iv = generateIV();
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string, secretKey: string): string | false {
    try {
        const [ivHex, encrypted] = encryptedText.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        return false;
    }
}
