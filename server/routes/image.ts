import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import express, { Response, Router } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import multer from 'multer';
import cloudinaryService from '../services/cloudinaryService.js';

const router: Router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Tüm route'lar için auth gerekli
router.use(authMiddleware as express.RequestHandler);

// Resim yükleme
router.post('/upload', 
    upload.single('image'),
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No file uploaded' });
                return;
            }

            const { restaurantId } = req.body;
            if (!restaurantId) {
                res.status(400).json({ error: 'Restaurant ID is required' });
                return;
            }

            const restaurant = await Restaurant.findOne({ restaurantId });
            if (!restaurant) {
                res.status(404).json({ error: 'Restaurant not found' });
                return;
            }

            if (restaurant.userId !== req.user?.uid) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }

            const imageUrl = await cloudinaryService.uploadImage(req.file, restaurantId);
            res.json({ url: imageUrl });
        } catch (error) {
            console.error('File upload failed:', error);
            res.status(500).json({ error: 'Failed to upload image' });
        }
    }
);

// Resim silme
router.delete('/:restaurantId', 
    async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const { restaurantId } = req.params;
            if (!restaurantId) {
                res.status(400).json({ error: 'Restaurant ID is required' });
                return;
            }

            const restaurant = await Restaurant.findOne({ restaurantId });
            if (!restaurant) {
                res.status(404).json({ error: 'Restaurant not found' });
                return;
            }

            if (restaurant.userId !== req.user?.uid) {
                res.status(403).json({ error: 'Not authorized' });
                return;
            }

            await cloudinaryService.deleteImage(restaurantId);
            res.status(200).json({ message: 'Image deleted successfully' });
        } catch (error) {
            console.error('Image deletion failed:', error);
            res.status(500).json({ error: 'Failed to delete image' });
        }
    }
);

export default router; 