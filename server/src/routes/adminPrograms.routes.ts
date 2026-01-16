import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
const router = Router();

// Require auth
router.use(authenticateToken);

// GET all programs
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const programs = await prisma.universityProgram.findMany({
      orderBy: { order: 'asc' }
    });
    res.json(programs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to fetch programs' });
  }
});

// POST add new program
router.post('/', async (req: AuthRequest, res: Response) => {
  const { title, abbreviation, college, isActive, order } = req.body;

  try {
    const program = await prisma.universityProgram.create({
      data: {
        title,
        abbreviation: abbreviation || null,
        college: college || 'College of Science',
        isActive: isActive !== undefined ? isActive : true,
        order: order !== undefined ? parseInt(order) : 0
      }
    });

    res.json(program);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to add program' });
  }
});

// PUT edit program
router.put('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { title, abbreviation, college, isActive, order } = req.body;

  try {
    const updated = await prisma.universityProgram.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(abbreviation !== undefined && { abbreviation }),
        ...(college !== undefined && { college }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order: parseInt(order) })
      }
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to update program' });
  }
});

// DELETE program
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    // Check if program has curriculum entries
    const entriesCount = await prisma.curriculumEntry.count({
      where: { programId: id }
    });

    if (entriesCount > 0) {
      res.status(400).json({ 
        error: 'Cannot delete program with existing curriculum entries. Delete curriculum entries first.' 
      });
      return;
    }

    await prisma.universityProgram.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Unable to delete program' });
  }
});

export default router;
