import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import express, { Response, Router } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import { v4 as uuidv4 } from 'uuid';

const router: Router = express.Router();

// Public route - menü görüntüleme
router.get<{ menuId: string }>(
  '/:menuId',
  async (req: express.Request<{ menuId: string }>, res: Response): Promise<void> => {
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
      console.error('Failed to fetch menu:', error);
      res.status(500).json({ error: 'Failed to fetch menu data' });
    }
  }
);

// Protected routes başlangıcı
router.use(authMiddleware as express.RequestHandler);

// Menu güncelleme
router.put<{ menuId: string }>(
  '/:menuId',
  async (req: AuthRequest<{ menuId: string }>, res: Response): Promise<void> => {
    try {
      const { menuId } = req.params;
      const menuData = req.body;

      if (!menuId || typeof menuId !== 'string' || menuId.length === 0) {
        res.status(400).json({ error: 'Invalid menu ID' });
        return;
      }

      const restaurant = await Restaurant.findOne({ 'menus.id': menuId });
      if (!restaurant) {
        console.warn(`Menu not found - menuId: ${menuId}`);
        res.status(404).json({ error: 'Menu not found' });
        return;
      }

      if (restaurant.userId !== req.user?.uid) {
        console.warn(`Auth: Unauthorized menu update attempt - userId: ${req.user?.uid}, menuId: ${menuId}`);
        res.status(403).json({ error: 'Not authorized to update this menu' });
        return;
      }

      const updatedMenus = restaurant.menus.map(menu => 
        menu.id === menuId ? { ...menuData, id: menuId } : menu
      );

      const updatedRestaurant = await Restaurant.findOneAndUpdate(
        { 'menus.id': menuId },
        { $set: { menus: updatedMenus } },
        { new: true, runValidators: true }
      );

      if (!updatedRestaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      const updatedMenu = updatedRestaurant.menus.find(m => m.id === menuId);
      res.json(updatedMenu);
    } catch (error) {
      console.error('Menu update failed:', error);
      res.status(500).json({ error: 'Failed to update menu' });
    }
  }
);

// Yeni menü oluşturma
router.post<{ restaurantId: string }>(
  '/:restaurantId',
  async (req: AuthRequest<{ restaurantId: string }>, res: Response): Promise<void> => {
    try {
      const { restaurantId } = req.params;
      const menuData = req.body;

      if (!menuData.language || !menuData.name) {
        res.status(400).json({ error: 'Language and name are required' });
        return;
      }

      const restaurant = await Restaurant.findOne({ restaurantId });
      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      if (restaurant.userId !== req.user?.uid) {
        console.warn(`Auth: Unauthorized menu creation attempt - userId: ${req.user?.uid}, restaurantId: ${restaurantId}`);
        res.status(403).json({ error: 'Not authorized to create menu for this restaurant' });
        return;
      }

      if (restaurant.menus.some(menu => menu.language === menuData.language)) {
        res.status(400).json({ error: 'Menu in this language already exists' });
        return;
      }

      const newMenu = {
        id: uuidv4(),
        language: menuData.language,
        name: menuData.name,
        description: menuData.description || '',
        sections: [],
        currency: menuData.currency || 'TRY'
      };

      const updatedRestaurant = await Restaurant.findOneAndUpdate(
        { restaurantId },
        { $push: { menus: newMenu } },
        { new: true, runValidators: true }
      );

      if (!updatedRestaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      const createdMenu = updatedRestaurant.menus.find(menu => menu.id === newMenu.id);
      res.status(201).json(createdMenu);
    } catch (error) {
      console.error('Menu creation failed:', error);
      res.status(500).json({ error: 'Failed to create menu' });
    }
  }
);

// Menü silme
router.delete<{ restaurantId: string; menuId: string }>(
  '/:menuId/restaurant/:restaurantId',
  async (req: AuthRequest<{ restaurantId: string; menuId: string }>, res: Response): Promise<void> => {
    try {
      const { restaurantId, menuId } = req.params;

      const restaurant = await Restaurant.findOne({ restaurantId });
      if (!restaurant) {
        res.status(404).json({ error: 'Restaurant not found' });
        return;
      }

      if (restaurant.userId !== req.user?.uid) {
        console.warn(`Auth: Unauthorized menu deletion attempt - userId: ${req.user?.uid}, restaurantId: ${restaurantId}`);
        res.status(403).json({ error: 'Not authorized to delete menu from this restaurant' });
        return;
      }

      const menuExists = restaurant.menus.some(menu => menu.id === menuId);
      if (!menuExists) {
        res.status(404).json({ error: 'Menu not found' });
        return;
      }

      restaurant.menus = restaurant.menus.filter(menu => menu.id !== menuId);
      await restaurant.save();

      res.status(200).json({ message: 'Menu deleted successfully' });
    } catch (error) {
      console.error('Menu deletion failed:', error);
      res.status(500).json({ error: 'Failed to delete menu' });
    }
  }
);

export default router; 