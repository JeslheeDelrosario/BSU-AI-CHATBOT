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
router.post('/', async (req: AuthRequest, res: Response) => {
  const { 
    programId, courseCode, subjectName, yearLevel, semester, 
    lec, lab, totalUnits, lecHours, labHours, totalHours, prerequisites 
  } = req.body;

  try {
    const entry = await prisma.curriculumEntry.create({
      data: {
        programId,
        courseCode,
        subjectName,
        yearLevel: parseInt(yearLevel),
        semester: parseInt(semester),
        lec: parseInt(lec) || 0,
        lab: parseInt(lab) || 0,
        totalUnits: parseInt(totalUnits) || 0,
        lecHours: parseInt(lecHours) || 0,
        labHours: parseInt(labHours) || 0,
        totalHours: parseInt(totalHours) || 0,
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
  const { 
    courseCode, subjectName, yearLevel, semester,
    lec, lab, totalUnits, lecHours, labHours, totalHours, prerequisites 
  } = req.body;

  try {
    const updated = await prisma.curriculumEntry.update({
      where: { id },
      data: {
        courseCode,
        subjectName,
        yearLevel: parseInt(yearLevel),
        semester: parseInt(semester),
        lec: parseInt(lec) || 0,
        lab: parseInt(lab) || 0,
        totalUnits: parseInt(totalUnits) || 0,
        lecHours: parseInt(lecHours) || 0,
        labHours: parseInt(labHours) || 0,
        totalHours: parseInt(totalHours) || 0,
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
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.curriculumEntry.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete curriculum entry' });
  }
});

export default router;
