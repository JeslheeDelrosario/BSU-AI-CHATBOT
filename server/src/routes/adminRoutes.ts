// server/src/routes/adminRoutes.ts
import { Router, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticateToken } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
const router = Router();

// Middleware to check if user is ADMIN
const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied - Admin only' });
    return; // important: return so TS knows we don’t continue
  }
  next(); // always called if user is admin
};

// Apply authentication for all routes
router.use(authenticateToken);

// GET all COS programs
router.get('/cos-programs', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const programs = await prisma.universityProgram.findMany({
      where: { college: 'College of Science', isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json(programs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST add new program
router.post('/cos-programs', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { title, abbreviation } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ error: 'Program title is required' }); // return is required
    }

    const maxOrder = await prisma.universityProgram.aggregate({
      where: { college: 'College of Science' },
      _max: { order: true },
    });
    const newOrder = (maxOrder._max.order || 0) + 1;

    const program = await prisma.universityProgram.create({
      data: {
        title: title.trim(),
        abbreviation: abbreviation?.trim() || null,
        college: 'College of Science',
        isActive: true,
        order: newOrder,
      },
    });
    return res.status(201).json(program); // always return
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' }); // always return
  }
});


router.delete('/cos-programs/:id', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Program ID required' }); // return
    }
    await prisma.universityProgram.delete({ where: { id } });
    return res.json({ success: true }); // always return
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' }); // always return
  }
});


// PUT edit program (partial update)
router.put('/cos-programs/:id', isAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Program ID required' }); // return
    }

    const { title, abbreviation, isActive, order } = req.body;
    const data: any = {};
    if (title !== undefined) data.title = title.trim();
    if (abbreviation !== undefined) data.abbreviation = abbreviation?.trim() || null;
    if (isActive !== undefined) data.isActive = isActive;
    if (order !== undefined) data.order = order;

    const program = await prisma.universityProgram.update({
      where: { id },
      data,
    });
    return res.json(program); // always return
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' }); // always return
  }
});


export default router;
