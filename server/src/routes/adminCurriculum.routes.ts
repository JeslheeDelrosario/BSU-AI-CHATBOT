// server/src/routes/adminCurriculum.routes.ts
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
const router = Router();

// Require auth
router.use(authenticateToken);

// GET curriculum by program
router.get('/:programId', async (req: AuthRequest, res: Response) => {
  const { programId } = req.params;
  try {
    const entries = await prisma.curriculumEntry.findMany({
      where: { programId },
      orderBy: [{ yearLevel: 'asc' }, { semester: 'asc' }]
    });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch curriculum' });
  }
});

// POST add new curriculum entry
// POST add new curriculum entry
router.post('/', async (req: AuthRequest, res: Response) => {
  const { programId, courseCode, subjectName, yearLevel, semester, units, prerequisites } = req.body;

  try {
    const entry = await prisma.curriculumEntry.create({
      data: {
        programId,
        courseCode,
        subjectName,
        yearLevel,
        semester,
        units,
        // pass an array directly
        prerequisites: Array.isArray(prerequisites) ? prerequisites : []
      }
    });

    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to add curriculum entry' });
  }
});

// PUT edit entry
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { courseCode, subjectName, yearLevel, semester, units, prerequisites } = req.body;

  try {
    const updated = await prisma.curriculumEntry.update({
      where: { id },
      data: {
        courseCode,
        subjectName,
        yearLevel,
        semester,
        units,
        prerequisites: Array.isArray(prerequisites) ? prerequisites : []
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update curriculum entry' });
  }
});


// DELETE an entry
// DELETE single entry - safe version
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ error: 'Entry ID is required' });
  }

  try {
    // Optional: Check existence first (prevents unnecessary error)
    const entry = await prisma.curriculumEntry.findUnique({
      where: { id },
      select: { id: true } // minimal select
    });

    if (!entry) {
      // Idempotent: treat as already deleted (best UX)
      return res.json({ 
        success: true, 
        message: 'Entry already deleted or does not exist' 
      });
      // Alternative strict version:
      // return res.status(404).json({ error: 'Curriculum entry not found' });
    }

    // If it exists, delete it
    await prisma.curriculumEntry.delete({ where: { id } });

    return res.json({ success: true, message: 'Entry deleted successfully' });
  } catch (err: any) {
    console.error('DELETE single entry error:', {
      id,
      code: err.code,
      message: err.message,
      meta: err.meta
    });

    if (err.code === 'P2025') {
      return res.json({
        success: true,
        message: 'Entry not found (already deleted)'
      });
    }

    return res.status(500).json({
      error: 'Failed to delete entry',
      message: err.message || 'Unknown error'
    });
  }
});



export default router;
