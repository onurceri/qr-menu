import express, { RequestHandler } from 'express';
import { ParsedQs } from 'qs';

interface GeocodeQuery extends ParsedQs {
    q?: string;
}

const router = express.Router();

const handleGeocode: RequestHandler<{}, any, any, GeocodeQuery> = async (req, res) => {
    console.log(req.query);
    try {
        const { q } = req.query;
        if (!q) {
            res.status(400).json({ error: 'Query parameter is required' });
            return;
        }

        const apiKey = process.env.VITE_OPENWEATHER_API_KEY;
        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(String(q))}&limit=10&appid=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`OpenWeather API responded with status ${response.status}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error in geocoding proxy:', error);
        res.status(500).json({ error: 'Failed to fetch location data' });
    }
};

router.get('/geocode', handleGeocode);

export default router;
