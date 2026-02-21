// Practice Exam Controller - Production-Ready Implementation
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { generateQuiz, gradeQuiz, QuizSubmission } from '../services/quiz-generation.service';
import { evaluateAndAwardAchievements } from './gamification.controller';

/**
 * Generate a new practice exam based on topic, subject, or conversation
 */
export const createPracticeExam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      topic,
      subject,
      difficulty = 'mixed',
      questionCount = 10,
      chatSessionId
    } = req.body;

    // Fetch user's language preference
    const userSettings = await prisma.accessibilitySettings.findUnique({
      where: { userId },
      select: { language: true }
    });
    const userLanguage = userSettings?.language || 'en';

    // Get conversation context if chatSessionId provided
    let conversationContext = '';
    if (chatSessionId) {
      const chatSession = await prisma.chatSession.findUnique({
        where: { id: chatSessionId },
        select: { messages: true }
      });

      if (chatSession && Array.isArray(chatSession.messages)) {
        const messages = chatSession.messages as Array<{ role: string; content: string }>;
        conversationContext = messages
          .slice(-10) // Last 10 messages
          .map(m => `${m.role === 'user' ? 'Q' : 'A'}: ${m.content}`)
          .join('\n');
      }
    }

    // Generate quiz
    const quiz = await generateQuiz({
      topic,
      subject,
      difficulty,
      questionCount: Math.min(questionCount, 20), // Max 20 questions
      conversationContext,
      userLanguage
    });

    // Save practice exam to database
    const savedExam = await prisma.practiceExam.create({
      data: {
        userId,
        title: quiz.title,
        description: quiz.description,
        subject: quiz.subject,
        difficulty: quiz.difficulty,
        totalQuestions: quiz.totalQuestions,
        estimatedTime: quiz.estimatedTime,
        questions: quiz.questions as any, // Prisma Json type
        chatSessionId: chatSessionId || null
      }
    });

    // Log quiz generation
    await prisma.aIInteraction.create({
      data: {
        userId,
        type: 'QUESTION',
        context: `practice_exam_generated:${quiz.subject}:${quiz.difficulty}`,
        userMessage: `Generate ${questionCount} question practice exam on ${topic || subject || 'general topics'}`,
        aiResponse: `Generated practice exam: ${quiz.title} with ${quiz.totalQuestions} questions`
      }
    });

    return res.status(201).json({
      success: true,
      exam: {
        id: savedExam.id,
        title: savedExam.title,
        description: savedExam.description,
        subject: savedExam.subject,
        difficulty: savedExam.difficulty,
        totalQuestions: savedExam.totalQuestions,
        estimatedTime: savedExam.estimatedTime,
        questions: savedExam.questions,
        createdAt: savedExam.createdAt
      }
    });
  } catch (error) {
    console.error('Create practice exam error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate practice exam',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Submit practice exam answers and get results
 */
export const submitPracticeExam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { examId } = req.params;
    const { answers, timeSpent } = req.body as { answers: Record<number, string>; timeSpent?: number };

    // Fetch practice exam
    const exam = await prisma.practiceExam.findUnique({
      where: { id: examId }
    });

    if (!exam) {
      return res.status(404).json({ error: 'Practice exam not found' });
    }

    // Verify ownership
    if (exam.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Grade practice exam
    const results = gradeQuiz(
      {
        id: exam.id,
        title: exam.title,
        description: exam.description || '',
        questions: exam.questions as any,
        totalQuestions: exam.totalQuestions,
        estimatedTime: exam.estimatedTime,
        difficulty: exam.difficulty,
        subject: exam.subject,
        createdAt: exam.createdAt
      },
      { quizId: examId, answers }
    );

    // Save results
    const savedResult = await prisma.practiceExamResult.create({
      data: {
        examId,
        userId,
        score: results.score,
        correctAnswers: results.correctAnswers,
        incorrectAnswers: results.incorrectAnswers,
        passed: results.passed,
        timeSpent: timeSpent || null,
        answers: answers as any,
        detailedResults: results.results as any
      }
    });

    // Update exam completion status
    await prisma.practiceExam.update({
      where: { id: examId },
      data: { completedAt: new Date() }
    });

    // Auto-trigger achievement evaluation after quiz completion (fire-and-forget)
    evaluateAndAwardAchievements(userId).catch(err =>
      console.error('Achievement evaluation error after quiz submit:', err)
    );

    return res.json({
      success: true,
      results: {
        id: savedResult.id,
        examId: savedResult.examId,
        score: savedResult.score,
        correctAnswers: savedResult.correctAnswers,
        incorrectAnswers: savedResult.incorrectAnswers,
        totalQuestions: results.totalQuestions,
        passed: savedResult.passed,
        timeSpent: savedResult.timeSpent,
        detailedResults: savedResult.detailedResults,
        completedAt: savedResult.createdAt
      }
    });
  } catch (error) {
    console.error('Submit practice exam error:', error);
    return res.status(500).json({ 
      error: 'Failed to submit practice exam',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get user's practice exam history
 */
export const getUserPracticeExams = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { status = 'all' } = req.query;

    const whereClause: any = { userId };
    
    if (status === 'completed') {
      whereClause.completedAt = { not: null };
    } else if (status === 'pending') {
      whereClause.completedAt = null;
    }

    const exams = await prisma.practiceExam.findMany({
      where: whereClause,
      include: {
        Results: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      exams: exams.map(q => ({
        id: q.id,
        title: q.title,
        description: q.description,
        subject: q.subject,
        difficulty: q.difficulty,
        totalQuestions: q.totalQuestions,
        estimatedTime: q.estimatedTime,
        createdAt: q.createdAt,
        completedAt: q.completedAt,
        lastResult: q.Results[0] ? {
          score: q.Results[0].score,
          passed: q.Results[0].passed,
          completedAt: q.Results[0].createdAt
        } : null
      }))
    });
  } catch (error) {
    console.error('Get user practice exams error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch practice exams',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get specific practice exam details
 */
export const getPracticeExamById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { examId } = req.params;

    const exam = await prisma.practiceExam.findUnique({
      where: { id: examId },
      include: {
        Results: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ error: 'Practice exam not found' });
    }

    if (exam.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json({
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        subject: exam.subject,
        difficulty: exam.difficulty,
        totalQuestions: exam.totalQuestions,
        estimatedTime: exam.estimatedTime,
        questions: exam.questions,
        createdAt: exam.createdAt,
        completedAt: exam.completedAt,
        results: exam.Results.map((r: any) => ({
          id: r.id,
          score: r.score,
          correctAnswers: r.correctAnswers,
          incorrectAnswers: r.incorrectAnswers,
          passed: r.passed,
          timeSpent: r.timeSpent,
          completedAt: r.createdAt
        }))
      }
    });
  } catch (error) {
    console.error('Get practice exam error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch practice exam',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Delete a practice exam
 */
export const deletePracticeExam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { examId } = req.params;

    const exam = await prisma.practiceExam.findUnique({
      where: { id: examId }
    });

    if (!exam) {
      return res.status(404).json({ error: 'Practice exam not found' });
    }

    if (exam.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete exam and related results (cascade)
    await prisma.practiceExam.delete({
      where: { id: examId }
    });

    return res.json({
      success: true,
      message: 'Practice exam deleted successfully'
    });
  } catch (error) {
    console.error('Delete practice exam error:', error);
    return res.status(500).json({ 
      error: 'Failed to delete practice exam',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
