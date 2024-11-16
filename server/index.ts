import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { authLimiter, apiLimiter } from './middleware/rateLimiter.js';
import restaurantRoutes from './routes/restaurant.js';
import userRoutes from './routes/user.js';
import { Restaurant } from './models/Restaurant.js';

dotenv.config();

const app = express();

// Güvenlik middleware'leri
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'PUT', 'POST', 'DELETE'],
  credentials: true
}));

// Request body boyut limiti
app.use(express.json({ limit: '10kb' }));

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

mongoose.connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/restaurant', restaurantRoutes);
app.use('/api/user', userRoutes);

const startServer = async () => {
  const PORT = Number(process.env.PORT || 5001);

  try {
    await new Promise((resolve, reject) => {
      const server = app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        resolve(server);
      }).on('error', reject);
    });
  } catch (error: unknown) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();