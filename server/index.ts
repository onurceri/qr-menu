import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import mongoose from 'mongoose';
import { rateLimit } from 'express-rate-limit';

// Import routes
import restaurantRouter from './routes/restaurant.js';
import userRouter from './routes/user.js';
import menuRoutes from './routes/menu.js';
import imageRoutes from './routes/image.js';
import adminRouter from './routes/admin.js';

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

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../../../dist')));

// Proxy ayarı - Vercel için gerekli
app.set('trust proxy', 1);

// Güvenlik middleware'leri
app.use(helmet({
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
        "https://*.googleapis.com"
      ],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: [
        "'self'",
        "https:",
        "http:",
        "https://*.firebaseio.com",
        "https://*.firebase.com",
        "https://*.googleapis.com",
        "https://identitytoolkit.googleapis.com",
        "wss://*.firebaseio.com"
      ],
      fontSrc: ["'self'", "data:", "https:", "http:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: [
        "'self'",
        "https://*.firebaseapp.com",
        "https://*.firebase.com"
      ],
    },
  },
}));

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

app.use('/api/restaurant', restaurantRouter);
app.use('/api/user', userRouter);
app.use('/api/menu', menuRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/admin', adminRouter);

// Healthcheck endpoint'i - en üstte olmalı
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Serve index.html for all routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;