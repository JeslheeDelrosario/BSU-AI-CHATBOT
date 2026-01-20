// server/src/controllers/program.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Get all active university programs
export const getPrograms = async (req: Request, res: Response) => {
  try {
    const programs = await prisma.universityProgram.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        abbreviation: true,
        college: true
      },
      orderBy: { order: 'asc' }
    });

    return res.json(programs);
  } catch (error) {
    console.error('Get programs error:', error);
    return res.status(500).json({ error: 'Failed to fetch programs' });
  }
};
