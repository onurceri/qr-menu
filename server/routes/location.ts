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

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            throw new Error('OpenWeather API key is not configured');
        }

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

const handleNominatimSearch: RequestHandler<{}, any, any, GeocodeQuery> = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            res.status(400).json({ error: 'Query parameter is required' });
            return;
        }

        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            throw new Error('OpenWeather API key is not configured');
        }

        const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(String(q))}&limit=5&appid=${apiKey}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`OpenWeather API responded with status ${response.status}`);
        }

        const data = await response.json();
        // Transform OpenWeather format to match Nominatim format
        const transformedData = data.map((item: any) => ({
            lat: item.lat,
            lon: item.lon,
            display_name: `${item.name}, ${item.state || ''} ${item.country}`.trim(),
            type: 'city'
        }));
        
        res.json(transformedData);
    } catch (error) {
        console.error('Error in location search:', error);
        res.status(500).json({ error: 'Failed to fetch location data' });
    }
};

router.get('/geocode', handleGeocode);
router.get('/nominatim', handleNominatimSearch);

export default router;
