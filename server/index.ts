import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';
import { analyticsProcessor } from './services/analyticsProcessor.js';

// Import routes
import restaurantRouter from './routes/restaurant.js';
import userRouter from './routes/user.js';
import menuRoutes from './routes/menu.js';
import imageRoutes from './routes/image.js';
import adminRouter from './routes/admin.js';
import locationRouter from './routes/location.js';
import reservationRouter from './routes/reservation.js';
import analyticsRouter from './routes/analytics.js';

// Rate limiter configurations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs for auth routes
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs for other routes
});

// ESM için __dirname alternatifi
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Environment variables configuration
if (process.env.NODE_ENV !== 'production') {
  // Only load .env file in development
  const envPath = join(__dirname, '../../.env');
  dotenv.config({ path: envPath });
} else {
  // In production (Render), use environment variables directly
  dotenv.config();
}

// Add more detailed environment checking
const checkRequiredEnvVars = () => {
  const required = [
    'MONGODB_URI',
    'FIREBASE_SERVICE_ACCOUNT_JSON',
    'NODE_ENV'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing);
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

checkRequiredEnvVars();

const app = express();
const PORT = process.env.PORT || 5001;

// Proxy ayarı - Vercel için gerekli
app.set('trust proxy', 1);

// Güvenlik middleware'leri
const cspMiddleware = helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://*.firebaseio.com",
        "https://*.firebase.com",
        "https://*.googleapis.com",
        "https://unpkg.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://unpkg.com",
        "https://*.openstreetmap.org"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://*.tile.openstreetmap.org",
        "https://*.openstreetmap.org",
        "https://*.cloudinary.com",
        "https://lh3.googleusercontent.com",
        "https://*.googleapis.com"
      ],
      connectSrc: [
        "'self'",
        "http://localhost:*",
        "https://*.cloudinary.com",
        "https://*.googleapis.com",
        "https://*.google.com",
        "https://qr-menu-dibl.onrender.com",
        "https://*.firebaseio.com",
        "https://*.firebase.com",
        "wss://*.firebaseio.com",
        "https://restcountries.com",
        "https://nominatim.openstreetmap.org",
        "https://api.openweathermap.org",
        "https://*.openweathermap.org",
        "https://*.tile.openstreetmap.org",
        "https://api.openweathermap.com"
      ],
      fontSrc: [
        "'self'",
        "data:",
        "https://unpkg.com"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: [
        "'self'",
        "https://*.firebaseapp.com",
        "https://*.firebase.com"
      ],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"]
    }
  }
});

// Apply security middleware to all routes
app.use(cspMiddleware);

// CORS ayarları için allowed origins
const getAllowedOrigins = () => {
  const origins = process.env.ALLOWED_ORIGINS;
  return origins ? origins.split(',').map(origin => origin.trim()) : ['http://localhost:5173'];
};

app.use(cors({
  origin: getAllowedOrigins(),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request body boyut limiti
app.use(express.json({ limit: '10kb' }));

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

mongoose.connect(process.env.MONGODB_URI!, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,  // Sadece IPv4 kullan
  retryWrites: true,
  w: 'majority',
  maxPoolSize: 10,
  minPoolSize: 5
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  
  // Drop the problematic index if it exists
  try {
    await mongoose.connection.collection('restaurants').dropIndex('menus.id_1');
    console.log('✅ Dropped menus.id index');
  } catch (error) {
    // Index might not exist, which is fine
    console.log('ℹ️ No menus.id index to drop');
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Connection string:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//<credentials>@'));
});

app.use('/api/restaurants', restaurantRouter);
app.use('/api/users', userRouter);
app.use('/api/menus', menuRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/admin', adminRouter);
app.use('/api/location', locationRouter);
app.use('/api/reservations', reservationRouter);
app.use('/api/analytics', analyticsRouter);

// Serve static files from the 'dist' directory with CSP headers
if (process.env.NODE_ENV === 'production') {
  const staticMiddleware = express.static(path.join(__dirname, '../../dist'));
  app.use((req, res, next) => {
    cspMiddleware(req, res, () => {
      staticMiddleware(req, res, next);
    });
  });

  // Handle client-side routing
  app.get('*', (req, res) => {
    cspMiddleware(req, res, () => {
      res.sendFile(path.join(__dirname, '../../dist/index.html'));
    });
  });
}

// Healthcheck endpoint'i - en üstte olmalı
app.get('/api/health', (_req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Start analytics processor
analyticsProcessor.startProcessing();

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export default app;