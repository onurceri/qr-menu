import express, { Request, Response, Router } from 'express';
import { Restaurant } from '../models/Restaurant.js';
import type { Error } from 'mongoose';

const router: Router = express.Router();

router.get<{ userId: string }>('/:userId/restaurants', async (req: Request<{ userId: string }>, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const restaurants = await Restaurant.find({ userId });
        if (!restaurants.length) {
            res.status(404).json({ error: 'No restaurants found for this user' });
            return;
        }
        res.json(restaurants);
    } catch (error) {
        const mongoError = error as Error;
        console.error('Database error:', mongoError);
        res.status(500).json({ error: mongoError.message || 'Failed to fetch restaurants' });
    }
});



export default router;