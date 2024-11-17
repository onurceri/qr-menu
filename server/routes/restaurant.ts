import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import express, { Response, Router, Request, NextFunction } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import type { Error } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { restaurantValidators } from '../middleware/validators.js';
import { validationResult } from 'express-validator';
import multer from 'multer';
import cloudinaryService from '../services/cloudinaryService';

const router: Router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// ID'leri normalize eden fonksiyon
const normalizeId = (id: string | number, type: 'section' | 'item'): string => {
  if (typeof id === 'number') return `${type}-${uuidv4()}`;
  if (!/^section-|^item-/.test(id)) return `${type}-${id}`;
  return id;
};

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

// Protected routes - sadece yetkilendirilmiş kullanıcılar
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
      const restaurantId = uuidv4();
      const { name, description } = req.body;

      const newRestaurant = new Restaurant({ 
        name,
        description,
        restaurantId,
        userId: req.user?.uid,
        menus: [] // Başlangıçta boş menu array'i
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

// Menu güncelleme endpoint'i
router.put<{ menuId: string }>(
  '/menu/:menuId',
  authMiddleware as express.RequestHandler,
  async (req: AuthRequest<{ menuId: string }>, res: Response): Promise<void> => {
    try {
      const { menuId } = req.params;
      const menuData = req.body;

      // Önce restoranı ve menüyü bul
      const restaurant = await Restaurant.findOne({ 'menus.id': menuId });
      if (!restaurant) {
        console.warn(`Menu not found - menuId: ${menuId}`);
        res.status(404).json({ error: 'Menu not found' });
        return;
      }

      // Yetki kontrolü
      if (restaurant.userId !== req.user?.uid) {
        console.warn(`Auth: Unauthorized menu update attempt - userId: ${req.user?.uid}, menuId: ${menuId}`);
        res.status(403).json({ error: 'Not authorized to update this menu' });
        return;
      }

      // Section ve item ID'lerini normalize et
      if (menuData.sections) {
        menuData.sections = menuData.sections.map((section: any) => ({
          ...section,
          id: normalizeId(section.id, 'section'),
          items: section.items.map((item: any) => ({
            ...item,
            id: normalizeId(item.id, 'item')
          }))
        }));
      }

      // Menüyü güncelle - pozisyonal operatr yerine arrayFilters kullan
      const updatedRestaurant = await Restaurant.findOneAndUpdate(
        { 'menus.id': menuId },
        {
          $set: {
            'menus.$[menu].name': menuData.name,
            'menus.$[menu].description': menuData.description,
            'menus.$[menu].sections': menuData.sections,
            'menus.$[menu].currency': menuData.currency,
            'menus.$[menu].language': menuData.language
          }
        },
        {
          arrayFilters: [{ 'menu.id': menuId }],
          new: true
        }
      );

      if (!updatedRestaurant) {
        res.status(404).json({ error: 'Failed to update menu' });
        return;
      }

      const updatedMenu = updatedRestaurant.menus.find(m => m.id === menuId);
      if (!updatedMenu) {
        res.status(404).json({ error: 'Updated menu not found' });
        return;
      }

      res.json(updatedMenu);
    } catch (error) {
      const mongoError = error as Error;
      console.error('Database operation failed:', {
        error: mongoError.message,
        path: req.path,
        method: req.method,
        menuId: req.params.menuId,
        userId: req.user?.uid
      });
      res.status(500).json({ error: 'Failed to update menu' });
    }
  }
);

interface MulterAuthRequest extends AuthRequest {
  file?: Express.Multer.File;
}

// Image upload endpoint
router.post('/upload', authMiddleware, upload.single('image'), async (req: AuthRequest, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // restaurantId'yi request body'den al
        const { restaurantId } = req.body;
        if (!restaurantId) {
            return res.status(400).json({ error: 'Restaurant ID is required' });
        }

        // Restoranı bul ve yetki kontrolü yap
        const restaurant = await Restaurant.findOne({ restaurantId });
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        if (restaurant.userId !== req.user?.uid) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const imageUrl = await cloudinaryService.uploadImage(req.file, restaurantId);
        res.json({ url: imageUrl });
    } catch (error) {
        console.error('File upload failed:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Image delete endpoint
router.post('/delete-image', authMiddleware as express.RequestHandler, async (req: AuthRequest, res: Response) => {
    try {
        const { restaurantId } = req.body;
        if (!restaurantId) {
            return res.status(400).json({ error: 'Restaurant ID is required' });
        }

        // Restoranı bul ve yetki kontrolü yap
        const restaurant = await Restaurant.findOne({ restaurantId });
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }

        if (restaurant.userId !== req.user?.uid) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        // Cloudinary'den sil
        await cloudinaryService.deleteImage(restaurantId);
        
        return res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Image deletion failed:', error);
        return res.status(500).json({ error: 'Failed to delete image' });
    }
});

export default router;