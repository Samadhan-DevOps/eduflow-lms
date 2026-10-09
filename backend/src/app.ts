import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env';
import { logger } from './utils/logger';
import { errorHandler, notFound } from './middleware/errorHandler';
import { generalLimiter } from './middleware/rateLimiter';
import { checkDatabaseConnection } from './config/database';
import authRoutes       from './routes/authRoutes';
import courseRoutes     from './routes/courseRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import dashboardRoutes  from './routes/dashboardRoutes';
import userRoutes       from './routes/userRoutes';

const app = express();

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || env.CORS_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(generalLimiter);
app.use(morgan('combined', {
  stream: { write: (m) => logger.http(m.trim()) },
  skip: (req) => req.path === '/health',
}));

app.get('/health', async (_req, res) => {
  const db = await checkDatabaseConnection();
  res.status(db ? 200 : 503).json({
    status: db ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    environment: env.NODE_ENV,
    services: { database: db ? 'connected' : 'disconnected' },
  });
});

app.use('/api/auth',        authRoutes);
app.use('/api/courses',     courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/users',       userRoutes);

app.use(notFound);
app.use(errorHandler);
export default app;
