import { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';

// Admin yetkisi için izin verilen UID'ler
const ADMIN_UIDS = [process.env.ADMIN_UID];

export interface AuthRequest<P = any> extends Request<P> {
  user?: {
    uid: string;
    email?: string;
  };
}

export const adminAuthMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await getAuth().verifyIdToken(token);

    // Admin kontrolü
    if (!ADMIN_UIDS.includes(decodedToken.uid)) {
      console.warn(`Unauthorized admin access attempt - uid: ${decodedToken.uid}`);
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email
    };

    next();
  } catch (error) {
    console.error('Admin auth failed:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
}; 