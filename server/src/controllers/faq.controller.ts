import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

export const getAllFAQs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;

    const where: any = { isPublished: true };

    if (category) {
      where.category = category as string;
    }

    if (search) {
      const searchTerm = search as string;
      where.OR = [
        { question: { contains: searchTerm, mode: 'insensitive' } },
        { answer: { contains: searchTerm, mode: 'insensitive' } },
        { keywords: { has: searchTerm.toLowerCase() } },
      ];
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        category: true,
        question: true,
        answer: true,
        viewCount: true,
        helpful: true,
        notHelpful: true,
        order: true,
      },
    });

    res.json({ faqs, count: faqs.length });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({ error: 'Server error fetching FAQs' });
  }
};

export const getFAQById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const faq = await prisma.fAQ.findUnique({
      where: { id },
    });

    if (!faq) {
      res.status(404).json({ error: 'FAQ not found' });
      return;
    }

    await prisma.fAQ.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(faq);
  } catch (error) {
    console.error('Get FAQ by ID error:', error);
    res.status(500).json({ error: 'Server error fetching FAQ' });
  }
};

export const getFAQCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.fAQ.findMany({
      where: { isPublished: true },
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' },
    });

    const categoryList = categories.map(c => c.category);
    res.json({ categories: categoryList });
  } catch (error) {
    console.error('Get FAQ categories error:', error);
    res.status(500).json({ error: 'Server error fetching categories' });
  }
};

export const voteFAQ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    if (typeof helpful !== 'boolean') {
      res.status(400).json({ error: 'Helpful vote must be a boolean value' });
      return;
    }

    const faq = await prisma.fAQ.findUnique({
      where: { id },
    });

    if (!faq) {
      res.status(404).json({ error: 'FAQ not found' });
      return;
    }

    const updated = await prisma.fAQ.update({
      where: { id },
      data: helpful
        ? { helpful: { increment: 1 } }
        : { notHelpful: { increment: 1 } },
    });

    res.json({
      message: 'Thank you for your feedback!',
      helpful: updated.helpful,
      notHelpful: updated.notHelpful,
    });
  } catch (error) {
    console.error('Vote FAQ error:', error);
    res.status(500).json({ error: 'Server error recording vote' });
  }
};

export const createFAQ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, question, answer, keywords, order } = req.body;

    if (!category?.trim() || !question?.trim() || !answer?.trim()) {
      res.status(400).json({ error: 'Category, question, and answer are required' });
      return;
    }

    const maxOrder = await prisma.fAQ.aggregate({
      where: { category },
      _max: { order: true },
    });

    const faq = await prisma.fAQ.create({
      data: {
        category: category.trim(),
        question: question.trim(),
        answer: answer.trim(),
        keywords: keywords || [],
        order: order !== undefined ? order : (maxOrder._max.order || 0) + 1,
        updatedAt: new Date(),
      },
    });

    res.status(201).json(faq);
  } catch (error) {
    console.error('Create FAQ error:', error);
    res.status(500).json({ error: 'Server error creating FAQ' });
  }
};

export const updateFAQ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category, question, answer, keywords, isPublished, order } = req.body;

    const data: any = {};
    if (category !== undefined) data.category = category.trim();
    if (question !== undefined) data.question = question.trim();
    if (answer !== undefined) data.answer = answer.trim();
    if (keywords !== undefined) data.keywords = keywords;
    if (isPublished !== undefined) data.isPublished = isPublished;
    if (order !== undefined) data.order = order;

    const faq = await prisma.fAQ.update({
      where: { id },
      data,
    });

    res.json(faq);
  } catch (error) {
    console.error('Update FAQ error:', error);
    res.status(500).json({ error: 'Server error updating FAQ' });
  }
};

export const deleteFAQ = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.fAQ.delete({
      where: { id },
    });

    res.json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    res.status(500).json({ error: 'Server error deleting FAQ' });
  }
};

export const getAdminFAQs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search, published } = req.query;

    const where: any = {};

    if (category) {
      where.category = category as string;
    }

    if (published !== undefined) {
      where.isPublished = published === 'true';
    }

    if (search) {
      const searchTerm = search as string;
      where.OR = [
        { question: { contains: searchTerm, mode: 'insensitive' } },
        { answer: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const faqs = await prisma.fAQ.findMany({
      where,
      orderBy: [{ category: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({ faqs, count: faqs.length });
  } catch (error) {
    console.error('Get admin FAQs error:', error);
    res.status(500).json({ error: 'Server error fetching FAQs' });
  }
};

export const getFAQAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalFAQs = await prisma.fAQ.count();
    const publishedFAQs = await prisma.fAQ.count({ where: { isPublished: true } });
    
    const topViewed = await prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: { viewCount: 'desc' },
      take: 5,
      select: {
        id: true,
        question: true,
        viewCount: true,
        category: true,
      },
    });

    const topHelpful = await prisma.fAQ.findMany({
      where: { isPublished: true },
      orderBy: { helpful: 'desc' },
      take: 5,
      select: {
        id: true,
        question: true,
        helpful: true,
        notHelpful: true,
        category: true,
      },
    });

    const categoryCounts = await prisma.fAQ.groupBy({
      by: ['category'],
      _count: { category: true },
      where: { isPublished: true },
    });

    res.json({
      totalFAQs,
      publishedFAQs,
      unpublishedFAQs: totalFAQs - publishedFAQs,
      topViewed,
      topHelpful,
      categoryCounts: categoryCounts.map(c => ({
        category: c.category,
        count: c._count.category,
      })),
    });
  } catch (error) {
    console.error('Get FAQ analytics error:', error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
};
