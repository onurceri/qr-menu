import express, { Request, Response, Router } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import type { Error } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const router: Router = express.Router();

interface RestaurantBody {
  name: string;
  sections: Array<any>;
  userId: string;
}

// ID'leri normalize eden fonksiyon
const normalizeId = (id: string | number, type: 'section' | 'item'): string => {
  if (typeof id === 'number') return `${type}-${uuidv4()}`;
  if (!/^section-|^item-/.test(id)) return `${type}-${id}`;
  return id;
};

// GET Route
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

// PUT Route
router.put<{ userId: string }>(
  '/:userId',
  async (req: Request<{ userId: string }>, res: Response) => {
    try {
      const { userId } = req.params;
      const updatedData = req.body;

      // Normalize sections and items IDs
      if (updatedData.sections) {
        updatedData.sections = updatedData.sections.map((section: any) => ({
          ...section,
          id: normalizeId(section.id, 'section'),
          items: section.items.map((item: any) => ({
            ...item,
            id: normalizeId(item.id, 'item')
          }))
        }));
      }

      const restaurant = await Restaurant.findOneAndUpdate(
        { userId },
        { ...updatedData, userId },
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