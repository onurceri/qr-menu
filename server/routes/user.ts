import express, { Response, Router } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import type { Error } from 'mongoose';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';

const router: Router = express.Router();

router.use(authMiddleware as express.RequestHandler);

router.get<{ userId: string }>(
  '/:userId/restaurants', 
  async (req: AuthRequest<{ userId: string }>, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;

      if (userId !== req.user?.uid) {
        console.warn(`Auth: Unauthorized restaurants access attempt - requestedUserId: ${userId}, authenticatedUserId: ${req.user?.uid}`);
        res.status(403).json({ error: 'Not authorized to view these restaurants' });
        return;
      }

      const restaurants = await Restaurant.find({ userId });
      if (!restaurants.length) {
        console.info(`No restaurants found for user: ${userId}`);
        res.status(404).json({ error: 'No restaurants found for this user' });
        return;
      }
      res.json(restaurants);
    } catch (error) {
      const mongoError = error as Error;
      console.error('Database operation failed:', {
        error: mongoError.message,
        userId: req.user?.uid,
        path: req.path,
        method: req.method
      });
      res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
  }
);

export default router;