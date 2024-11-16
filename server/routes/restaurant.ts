import express, { Request, Response, Router } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import type { Error } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const router: Router = express.Router();

// ID'leri normalize eden fonksiyon
const normalizeId = (id: string | number, type: 'section' | 'item'): string => {
  if (typeof id === 'number') return `${type}-${uuidv4()}`;
  if (!/^section-|^item-/.test(id)) return `${type}-${id}`;
  return id;
};

// GET Route
router.get<{ restaurantId: string }>(
  '/:restaurantId',
  async (req: Request<{ restaurantId: string }>, res: Response): Promise<void> => {
    try {
      const restaurant = await Restaurant.findOne({ restaurantId: req.params.restaurantId });
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
router.put<{ restaurantId: string }>(
  '/:restaurantId',
  async (req: Request<{ restaurantId: string }>, res: Response) => {
    try {
      const { restaurantId } = req.params;
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
        { restaurantId },
        { ...updatedData, restaurantId },
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

// CREATE Route
router.post(
  '/',
  async (req: Request, res: Response) => {
    try {
      // Generate a new restaurantId
      const restaurantId = uuidv4(); // Create a unique restaurantId
      const newRestaurant = new Restaurant({ ...req.body, restaurantId }); // Include the restaurantId in the new restaurant
      const savedRestaurant = await newRestaurant.save();
      res.status(201).json(savedRestaurant);
    } catch (error) {
      const mongoError = error as Error;
      console.error('Database error:', mongoError);
      res.status(500).json({ error: mongoError.message || 'Failed to create restaurant' });
    }
  }
);

// DELETE Route
router.delete<{ restaurantId: string }>(
  '/:restaurantId',
  async (req: Request<{ restaurantId: string }>, res: Response) => {
    try {
      const { restaurantId } = req.params;
      const deletedRestaurant = await Restaurant.findOneAndDelete({ restaurantId });
      if (!deletedRestaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }
      res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
      const mongoError = error as Error;
      console.error('Database error:', mongoError);
      res.status(500).json({ error: mongoError.message || 'Failed to delete restaurant' });
    }
  }
);

export default router;