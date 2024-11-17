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
import restaurantRoutes from './routes/restaurant';
import userRoutes from './routes/user';

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

// .env dosyasının yolunu belirt - TÜM IMPORTLARDAN ÖNCE OLMALI
dotenv.config({ path: join(__dirname, '..', '.env') });

// Environment variables'ları kontrol et
console.log('Environment Check:', {
  serviceAccount: {
    exists: !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON,
    length: process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.length,
    firstChars: process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.substring(0, 50)
  },
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT
});

const app = express();
const PORT = process.env.PORT || 5001;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, '../../dist')));

// Proxy ayarı - Vercel için gerekli
app.set('trust proxy', 1);

// Güvenlik middleware'leri
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
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
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  console.error('Connection string:', process.env.MONGODB_URI?.replace(/\/\/.*@/, '//<credentials>@'));
});

app.use('/api/restaurant', restaurantRoutes);
app.use('/api/user', userRoutes);

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
  res.sendFile(path.join(__dirname, '../../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;