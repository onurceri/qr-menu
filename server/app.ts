import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import restaurantRoutes from './routes/restaurant.js';
import userRoutes from './routes/user.js';
import menuRoutes from './routes/menu.js';
import imageRoutes from './routes/image.js';
import locationRoutes from './routes/location.js';
import reservationRoutes from './routes/reservation.js';
import adminRoutes from './routes/admin.js';
import analyticsRoutes from './routes/analytics.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Basic middleware
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'development' 
        ? ['http://localhost:5173'] 
        : [process.env.CLIENT_URL || ''],
    credentials: true
}));

// Disable all CSP and related security policies
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: false,
        crossOriginOpenerPolicy: false
    })
);

// Routes
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error handling
app.use(errorHandler);

export default app; 