import { getAuth } from 'firebase-admin/auth';
import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// ESM için __dirname alternatifi
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env dosyasının yolunu düzelt
const envPath = join(__dirname, '../../.env');
dotenv.config({ path: envPath });

interface ServiceAccount {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_x509_cert_url: string;
    universe_domain: string;
}

// Firebase admin initialization
try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    
    if (!serviceAccountJson) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set');
    }

    let serviceAccount: ServiceAccount;
    try {
        serviceAccount = JSON.parse(serviceAccountJson);
        
        // Gerekli alanların kontrolü
        const requiredFields: (keyof ServiceAccount)[] = [
            'project_id', 
            'private_key', 
            'client_email'
        ];
        
        const missingFields = requiredFields.filter(field => !serviceAccount[field]);
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields in service account: ${missingFields.join(', ')}`);
        }

    } catch (parseError) {
        console.error('Failed to parse service account JSON:', parseError);
        throw new Error('Invalid service account JSON format');
    }
    
    // Firebase'i başlat
    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
        });
        console.log('✅ Firebase Admin initialized successfully');
    }
} catch (error) {
    console.error('❌ Firebase admin initialization error:', error);
    throw error;
}

export interface AuthRequest<P = any> extends Request<P> {
    user?: admin.auth.DecodedIdToken;
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await getAuth().verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Authentication failed:', error);
        res.status(401).json({ error: 'Unauthorized' });
    }
} 