import express, { Request, Response, Router } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import type { Error } from 'mongoose';

const router: Router = express.Router();

interface RestaurantBody {
  name: string;
  sections: Array<any>;
  userId: string;
}

// Fixed GET route typing
router.get<{ userId: string }>(
  '/:userId',
  async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
    try {
      const restaurant = await Restaurant.findOne({ userId: req.params.userId });
      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }
      res.json(restaurant);
    } catch (error) {
      const mongoError = error as Error;
      console.error('Database error:', mongoError);
      res.status(500).json({ error: mongoError.message || 'Failed to fetch restaurant data' });
    }
  }
);

// Fixed PUT route typing
router.put<{ userId: string }>(
  '/:userId',
  async (req: Request<{ userId: string }, any, RestaurantBody>, res: Response) => {
    try {
      const { userId } = req.params;
      const restaurant = await Restaurant.findOneAndUpdate(
        { userId },
        { ...req.body, userId },
        { new: true, upsert: true }
      );
      res.json(restaurant);
    } catch (error) {
      const mongoError = error as Error;
      console.error('Database error:', mongoError);
      res.status(500).json({ error: mongoError.message || 'Failed to update restaurant data' });
    }
  }
);

export default router;