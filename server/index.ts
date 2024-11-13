import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import restaurantRoutes from './routes/restaurant.js';
import { Restaurant } from './models/Restaurant.js';

dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    credentials: true
}));

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI!)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/restaurant', restaurantRoutes);

const startServer = async (retryCount = 0) => {
  const PORT = Number(process.env.PORT || 5000) + retryCount;
  
  try {
    await new Promise((resolve, reject) => {
      const server = app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        resolve(server);
      }).on('error', reject);
    });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === 'EADDRINUSE' && retryCount < 10) {
      console.log(`⚠️ Port ${PORT} is busy, trying port ${PORT + 1}...`);
      await startServer(retryCount + 1);
    } else {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  }
};

startServer();