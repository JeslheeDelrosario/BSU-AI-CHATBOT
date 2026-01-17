// server/src/controllers/cos-programs.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// List all COS programs
export const listPrograms = async (req: AuthRequest, res: Response) => {
  try {
    const programs = await prisma.universityProgram.findMany({
      where: { college: 'College of Science' },
      orderBy: { order: 'asc' }, // optional, can use updatedAt instead
    });
    res.json(programs);
  } catch (err) {
    console.error('listPrograms error', err);
    res.status(500).json({ error: 'Unable to fetch programs' });
  }
};

// Add a new program
export const addProgram = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied' }); // <- return added
  }

  const { title, abbreviation } = req.body;
  if (!title?.trim()) {
    return res.status(400).json({ error: 'Program title required' }); // <- return added
  }

  try {
    const newProgram = await prisma.universityProgram.create({
      data: {
        title: title.trim(),
        abbreviation: abbreviation?.trim() || null,
        college: 'College of Science',
        isActive: true,
        order: 0,
        updatedAt: new Date(),
      },
    });
    return res.status(201).json(newProgram); // <- always return
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unable to create program' }); // <- return
  }
};


// Delete a program
export const deleteProgram = async (req: AuthRequest, res: Response) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Program ID required' });
  }

  try {
    await prisma.universityProgram.delete({ where: { id } });
    return res.json({ success: true }); // <- return added
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Unable to delete program' });
  }
};

