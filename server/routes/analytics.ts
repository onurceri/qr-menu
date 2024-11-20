import express, { Request, Response, NextFunction } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.js';
import { redisClient } from '../../shared/lib/redis.js';
import { v4 as uuidv4 } from 'uuid';
import { Restaurant } from '../models/Restaurant.js';

interface AnalyticsEvent {
    id: string;
    restaurantId: string;
    eventType: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

interface RestaurantStats {
    views: number;
    qrScans: number;
    menuViews: number;
    socialClicks: number;
    hourlyDistribution: Record<string, number>;
    [key: string]: any;
}

interface AnalyticsStats {
    [key: string]: RestaurantStats;
}

const router = express.Router();

// Event tracking endpoint
router.post('/track', async (req: Request, res: Response): Promise<void> => {
    try {
        const { restaurantId, eventType, metadata, timestamp } = req.body;

        if (!restaurantId || !eventType) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        const event: AnalyticsEvent = {
            id: uuidv4(),
            restaurantId,
            eventType,
            timestamp: timestamp || new Date().toISOString(),
            metadata
        };

        // Event'i Redis queue'suna ekle
        await redisClient.lPush('analytics:queue', JSON.stringify(event));
        
        res.status(200).json({ message: 'Event tracked successfully' });
    } catch (error) {
        console.error('Error tracking analytics event:', error);
        res.status(500).json({ error: 'Failed to track event' });
    }
});

// Debug endpoint - sadece development ortamında kullanılabilir
router.get('/debug/events', async (_req: Request, res: Response): Promise<void> => {
    if (process.env.NODE_ENV === 'production') {
        res.status(403).json({ error: 'Not available in production' });
        return;
    }

    try {
        // Queue'daki tüm event'leri al
        const events = await redisClient.lRange('analytics:queue', 0, -1);
        const parsedEvents = events.map(e => JSON.parse(e)) as AnalyticsEvent[];
        
        // Tüm restaurant stats'larını al
        const keys = await redisClient.keys('analytics:stats:*');
        const stats: AnalyticsStats = {};
        
        for (const key of keys) {
            const restaurantStats = await redisClient.get(key);
            if (restaurantStats) {
                stats[key] = JSON.parse(restaurantStats);
            }
        }
        
        res.status(200).json({ events: parsedEvents, stats });
    } catch (error) {
        console.error('Error fetching debug data:', error);
        res.status(500).json({ error: 'Failed to fetch debug data' });
    }
});

// Owner verification middleware
const verifyOwner = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { restaurantId } = req.params;
        const userId = req.user?.uid;

        if (!userId || !restaurantId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const restaurant = await Restaurant.findOne({ restaurantId });
        
        if (!restaurant) {
            res.status(404).json({ error: 'Restaurant not found' });
            return;
        }

        if (restaurant.userId !== userId) {
            res.status(403).json({ error: 'Not authorized to access this restaurant\'s analytics' });
            return;
        }

        next();
    } catch (error) {
        console.error('Error verifying restaurant owner:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Stats endpoint - owner only
router.get('/stats/:restaurantId', authMiddleware, verifyOwner, async ({ params }: AuthRequest, res: Response): Promise<void> => {
    try {
        const { restaurantId } = params;
        const stats = await redisClient.get(`analytics:stats:${restaurantId}`);
        
        if (!stats) {
            res.status(200).json({ views: 0, qrScans: 0, menuViews: 0, socialClicks: 0, hourlyDistribution: {} });
            return;
        }

        res.status(200).json(JSON.parse(stats) as RestaurantStats);
    } catch (error) {
        console.error('Error fetching analytics stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

export default router;
