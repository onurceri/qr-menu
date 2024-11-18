import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import express, { Response, Router, Request, NextFunction } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import type { Error } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { restaurantValidators } from '../middleware/validators.js';
import { validationResult } from 'express-validator';

const router: Router = express.Router();

// Public route - herkes menüyü görebilir
router.get<{ menuId: string }>(
  '/menu/:menuId',
  async (req: Request<{ menuId: string }>, res: Response): Promise<void> => {
    try {
      const restaurant = await Restaurant.findOne({ 'menus.id': req.params.menuId });
      if (!restaurant) {
        console.warn(`Menu not found - menuId: ${req.params.menuId}`);
        res.status(404).json({ error: 'Menu not found' });
        return;
      }

      const menu = restaurant.menus.find(m => m.id === req.params.menuId);
      if (!menu) {
        console.warn(`Menu not found in restaurant - menuId: ${req.params.menuId}`);
        res.status(404).json({ error: 'Menu not found' });
        return;
      }

      res.json(menu);
    } catch (error) {
      const mongoError = error as Error;
      console.error('Database operation failed:', {
        error: mongoError.message,
        path: req.path,
        method: req.method
      });
      res.status(500).json({ error: 'Failed to fetch menu data' });
    }
  }
);

// Public route - herkes restoranı görebilir
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
      console.error('Database operation failed:', {
        error: mongoError.message,
        path: req.path,
        method: req.method
      });
      res.status(500).json({ error: 'Failed to fetch restaurant data' });
    }
  }
);

// Protected routes - bundan sonraki route'lar için auth gerekli
router.use(authMiddleware as express.RequestHandler);

// Protected route - sadece yetkilendirilmiş kullanıcılar görebilir
router.get<{ restaurantId: string }>(
  '/:restaurantId',
  async (req: AuthRequest<{ restaurantId: string }>, res: Response): Promise<void> => {
    try {
      const restaurant = await Restaurant.findOne({ restaurantId: req.params.restaurantId });
      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      // Yetki kontrolü ekleyelim
      if (restaurant.userId !== req.user?.uid) {
        console.warn(`Auth: Unauthorized restaurant access attempt - userId: ${req.user?.uid}, restaurantId: ${req.params.restaurantId}`);
        res.status(403).json({ error: 'Not authorized to access this restaurant' });
        return;
      }

      res.json(restaurant);
    } catch (error) {
      const mongoError = error as Error;
      console.error('Database operation failed:', {
        error: mongoError.message,
        userId: req.user?.uid,
        path: req.path,
        method: req.method
      });
      res.status(500).json({ error: 'Failed to fetch restaurant data' });
    }
  }
);

// Validation middleware
const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

// PUT Route - Sadece restoran sahibi güncelleyebilir
router.put<{ restaurantId: string }>(
  '/:restaurantId',
  restaurantValidators.update,
  validate,
  async (req: AuthRequest<{ restaurantId: string }>, res: Response): Promise<void> => {
    try {
      const { name, description, address, openingHours, imageUrl } = req.body;

      const restaurant = await Restaurant.findOne({ restaurantId: req.params.restaurantId });
      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      // Yetki kontrolü
      if (restaurant.userId !== req.user?.uid) {
        res.status(403).json({ error: 'Not authorized to update this restaurant' });
        return;
      }

      // Güncelleme işlemi
      const updatedRestaurant = await Restaurant.findOneAndUpdate(
        { restaurantId: req.params.restaurantId },
        {
          $set: {
            name,
            description,
            address,
            openingHours,
            imageUrl
          }
        },
        { new: true }
      );

      if (!updatedRestaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      res.json(updatedRestaurant);
    } catch (error) {
      console.error('Update restaurant error:', error);
      res.status(500).json({ error: 'Failed to update restaurant' });
    }
  }
);

// CREATE Route - Sadece yetkilendirilmiş kullanıcılar
router.post(
  '/',
  restaurantValidators.create,
  validate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { name, description } = req.body;
      
      const newRestaurant = new Restaurant({ 
        name,
        description,
        restaurantId: uuidv4(),
        userId: req.user?.uid
      });

      const savedRestaurant = await newRestaurant.save();
      res.status(201).json(savedRestaurant);
    } catch (error) {
      const mongoError = error as Error;
      console.error('Database operation failed:', {
        error: mongoError.message,
        userId: req.user?.uid,
        path: req.path,
        method: req.method
      });
      res.status(500).json({ error: 'Failed to create restaurant' });
    }
  }
);

// DELETE Route - Sadece restoran sahibi silebilir
router.delete<{ restaurantId: string }>(
  '/:restaurantId',
  async (req: AuthRequest<{ restaurantId: string }>, res: Response) => {
    try {
      const { restaurantId } = req.params;
      
      const restaurant = await Restaurant.findOne({ restaurantId });
      if (!restaurant) {
        console.warn(`Auth: Restaurant not found for deletion - restaurantId: ${restaurantId}`);
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      if (restaurant.userId !== req.user?.uid) {
        console.warn(`Auth: Unauthorized delete attempt - userId: ${req.user?.uid}, restaurantId: ${restaurantId}`);
        res.status(403).json({ error: 'Not authorized to delete this restaurant' });
        return;
      }

      const deletedRestaurant = await Restaurant.findOneAndDelete({ restaurantId });
      res.json({ message: 'Restaurant deleted successfully' });
    } catch (error) {
      const mongoError = error as Error;
      console.error('Database operation failed:', {
        error: mongoError.message,
        userId: req.user?.uid,
        path: req.path,
        method: req.method
      });
      res.status(500).json({ error: 'Failed to delete restaurant' });
    }
  }
);

export default router;