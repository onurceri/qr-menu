import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import express, { Response, Router, Request } from 'express';
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

// Public route - herkes menüyü görebilir
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

// Protected routes - sadece yetkilendirilmiş kullanıcılar
router.use(authMiddleware as express.RequestHandler); // Bundan sonraki tüm route'lar korunacak

// PUT Route - Sadece restoran sahibi güncelleyebilir
router.put<{ restaurantId: string }>(
  '/:restaurantId',
  async (req: AuthRequest<{ restaurantId: string }>, res: Response) => {
    try {
      const { restaurantId } = req.params;
      const updatedData = req.body;

      // Restoran sahibi kontrolü
      const restaurant = await Restaurant.findOne({ restaurantId });
      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      if (restaurant.userId !== req.user?.uid) {
        res.status(403).json({ error: 'Not authorized to update this restaurant' });
        return;
      }

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

      const updatedRestaurant = await Restaurant.findOneAndUpdate(
        { restaurantId },
        { ...updatedData, restaurantId },
        { new: true, upsert: true }
      );
      res.json(updatedRestaurant);
    } catch (error) {
      const mongoError = error as Error;
      console.error('Database error:', mongoError);
      res.status(500).json({ error: mongoError.message || 'Failed to update restaurant data' });
    }
  }
);

// CREATE Route - Sadece yetkilendirilmiş kullanıcılar
router.post(
  '/',
  async (req: AuthRequest, res: Response) => {
    try {
      const restaurantId = uuidv4();
      const newRestaurant = new Restaurant({ 
        ...req.body, 
        restaurantId,
        userId: req.user?.uid // Kullanıcı ID'sini ekle
      });
      const savedRestaurant = await newRestaurant.save();
      res.status(201).json(savedRestaurant);
    } catch (error) {
      const mongoError = error as Error;
      console.error('Database error:', mongoError);
      res.status(500).json({ error: mongoError.message || 'Failed to create restaurant' });
    }
  }
);

// DELETE Route - Sadece restoran sahibi silebilir
router.delete<{ restaurantId: string }>(
  '/:restaurantId',
  async (req: AuthRequest<{ restaurantId: string }>, res: Response) => {
    try {
      const { restaurantId } = req.params;
      
      // Restoran sahibi kontrolü
      const restaurant = await Restaurant.findOne({ restaurantId });
      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      if (restaurant.userId !== req.user?.uid) {
        res.status(403).json({ error: 'Not authorized to delete this restaurant' });
        return;
      }

      const deletedRestaurant = await Restaurant.findOneAndDelete({ restaurantId });
      res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
      const mongoError = error as Error;
      console.error('Database error:', mongoError);
      res.status(500).json({ error: mongoError.message || 'Failed to delete restaurant' });
    }
  }
);

export default router;