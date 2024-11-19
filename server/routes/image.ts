import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import express, { Response, Router, NextFunction } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import multer from 'multer';
import cloudinaryService from '../services/cloudinaryService.js';

const router: Router = express.Router();

// Configure multer for handling file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (_req, file, cb) => {
        // Check file type
        if (!file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
            cb(new Error('Only JPG, JPEG and PNG files are allowed'));
            return;
        }
        cb(null, true);
    }
}).single('image');

// Wrap multer middleware to handle errors
const handleUpload = (req: AuthRequest, res: Response, next: NextFunction) => {
    upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            // Multer error (e.g., file too large)
            res.status(400).json({ error: err.message });
            return;
        } else if (err) {
            // Other errors (e.g., wrong file type)
            res.status(400).json({ error: err.message });
            return;
        }
        next();
    });
};

// All routes require authentication
router.use(authMiddleware as unknown as express.RequestHandler);

// Image upload endpoint
router.post('/upload', 
    handleUpload,
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
            res.status(500).json({ 
                error: error instanceof Error ? error.message : 'Failed to upload image'
            });
        }
    }
);

// Image deletion endpoint
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
            res.status(500).json({ 
                error: error instanceof Error ? error.message : 'Failed to delete image'
            });
        }
    }
);

export default router;