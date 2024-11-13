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