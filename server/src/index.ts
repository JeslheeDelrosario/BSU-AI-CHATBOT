import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import lessonRoutes from './routes/lesson.routes';
import aiTutorRoutes from './routes/ai-tutor.routes';
import dashboardRoutes from './routes/dashboard.routes';
import chatSessionRoutes from './routes/chat-session.routes';
import adminRoutes from './routes/adminRoutes';
import adminFacultyRoutes from './routes/adminFaculty.routes';
import curriculumRoutes from './routes/adminCurriculum.routes';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes

app.use('/api/auth', authRoutes);
app.use('/api/chat-sessions', chatSessionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', adminFacultyRoutes);

app.use('/api/admin/curriculum', curriculumRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/ai-tutor', aiTutorRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'AI Inclusive Learning Platform API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Inclusive Learning Platform - Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
});
