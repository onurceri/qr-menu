import { createClient } from 'redis';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Ensure required environment variables are present
const requiredEnvVars = ['REDIS_HOST', 'REDIS_PORT', 'REDIS_PASSWORD'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

// Redis client configuration
const redisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT, 10)
    }
});

// Handle connection errors
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Log successful connections
redisClient.on('connect', () => {
    console.log('✅ Connected to Redis');
});

// Initialize connection
redisClient.connect().catch(console.error);

export { redisClient };
