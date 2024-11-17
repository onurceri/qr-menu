import { getAuth } from 'firebase-admin/auth';
import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// ESM için __dirname alternatifi
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env dosyasının yolunu belirt
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

if (!admin.apps.length) {
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    
    if (!serviceAccountString) {
      console.error('Environment Check in auth.ts:', {
        envKeys: Object.keys(process.env),
        serviceAccountExists: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
        currentDir: __dirname,
        envPath: join(__dirname, '..', '..', '.env')
      });
      throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set');
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountString);
    } catch (parseError) {
      console.error('Failed to parse service account JSON:', parseError);
      throw new Error('Invalid service account JSON format');
    }
    
    // Detaylı validasyon
    const requiredFields = ['project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      throw new Error(`Missing required fields in service account: ${missingFields.join(', ')}`);
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase admin initialization error:', error);
    console.error('Current working directory:', process.cwd());
    throw error;
  }
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