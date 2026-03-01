// server/src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import path from 'path';

// Route imports
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import lessonRoutes from './routes/lesson.routes';
import aiTutorRoutes from './routes/ai-tutor.routes';
import dashboardRoutes from './routes/dashboard.routes';
import chatSessionRoutes from './routes/chat-session.routes';
import adminRoutes from './routes/adminRoutes';
import adminFacultyRoutes from './routes/adminFaculty.routes';
import adminProgramsRoutes from './routes/adminPrograms.routes';
import curriculumRoutes from './routes/adminCurriculum.routes';
import faqRoutes from './routes/faq.routes';
import studentsRoutes from './routes/students.routes';
import progressRoutes from './routes/progress.routes';
import consultationRoutes from './routes/consultation.routes';
import programRoutes from './routes/program.routes';
import classroomRoutes from './routes/classroom.routes';
import meetingRoutes from './routes/meeting.routes';
import adminRoomRoutes from './routes/adminRoom.routes';
import googleAuthRoutes from './routes/googleAuth.routes';
import practiceExamRoutes from './routes/practice-exam.routes';
import weatherRoutes from './routes/weather.routes';
import ssoRoutes from './routes/sso.routes';
import holidayRoutes from './routes/holiday.routes';
import taskRoutes from './routes/task.routes';
import calendarRoutes from './routes/calendar.routes';
import gamificationRoutes from './routes/gamification.routes';
import forumRoutes from './routes/forum.routes';
import roomScheduleRoutes from './routes/roomSchedule.routes';
import adminConsultationRoutes from './routes/adminConsultation.routes';
import roomLayoutRoutes from './routes/roomLayout.routes';
import googleSsoRoutes from './routes/googleSso.routes';
import aiSettingsRoutes from './routes/ai-settings.routes';

// Initialize Redis connection
import './config/redis.config';

// Validate environment variables
import { validateEnv, isGoogleCalendarConfigured } from './config/env.validation';

try {
  validateEnv();
  console.log('✓ Environment variables validated');
  
  if (isGoogleCalendarConfigured()) {
    console.log('✓ Google Calendar integration enabled');
  } else {
    console.warn('⚠ Google Calendar integration disabled (credentials not configured)');
  }
} catch (error) {
  console.error('✗ Environment validation failed:', error);
  process.exit(1);
}

const app = express();

// Environment configuration
const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

// Trust proxy for rate limiting behind reverse proxy (Render, Heroku, etc.)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Security: Helmet for HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

// Compression for response optimization
app.use(compression());

// CORS configuration

// tomas code
// const allowedOrigins = isProduction
//   ? [
//       process.env.CORS_ORIGIN || 'https://bsu-ai-chatbot.netlify.app',
//       'https://bsu-ai-tutor.netlify.app',
//     ].filter(Boolean)
//   : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'];

// app.use(cors({
//   origin: (origin, callback) => {
//     // Allow requests with no origin (mobile apps, curl, etc.)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }
//     callback(new Error('Not allowed by CORS'));
//   },
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// }));

// CORS configuration
const allowedOrigins = isProduction
  ? [
      process.env.CORS_ORIGIN || 'https://bsu-ai-chatbot.netlify.app',
      'https://bsu-ai-tutor.netlify.app',
    ].filter(Boolean)
  : true;

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || (isProduction ? '100' : '1000')), // 100 in prod, 1000 in dev
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health', // Skip health checks
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per window (increased for development/testing)
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI endpoint rate limiter (more generous but still protected)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: { error: 'AI request limit reached. Please wait a moment.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads/join-requests', express.static(path.join(__dirname, '../uploads/join-requests')));
app.use('/uploads/post-attachments', express.static(path.join(__dirname, '../uploads/post-attachments')));
app.use('/uploads/post-images', express.static(path.join(__dirname, '../uploads/post-images')));

// Logging
app.use(morgan(isProduction ? 'combined' : 'dev'));

// API Routes with specific rate limiters
// app.use('/api/auth/login', authLimiter);
// app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/chat-sessions', chatSessionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminFacultyRoutes);
app.use('/api/admin/programs', adminProgramsRoutes);
app.use('/api/admin/curriculum', curriculumRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/ai-tutor', aiLimiter, aiTutorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/admin/students', studentsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/admin/rooms', adminRoomRoutes);
app.use('/api/notifications', require('./routes/notification.routes').default);
app.use('/api', googleAuthRoutes);
app.use('/api/practice-exams', practiceExamRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/sso', ssoRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/forums', forumRoutes);
app.use('/api/rooms', roomScheduleRoutes);
app.use('/api/rooms', roomLayoutRoutes);
app.use('/api/admin/consultations', adminConsultationRoutes);
app.use('/api/auth/google', googleSsoRoutes);
app.use('/api/admin/ai', aiSettingsRoutes);

// Health check route
app.get('/api/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'AI Inclusive Learning Platform API is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Server Error:', err.message);
  
  // Don't leak error details in production
  if (isProduction) {
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message,
      stack: err.stack
    });
  }
});

// Graceful shutdown handling
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 AI Inclusive Learning Platform - Server running on port ${PORT}`);
  console.log(`📚 Environment: ${NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});
