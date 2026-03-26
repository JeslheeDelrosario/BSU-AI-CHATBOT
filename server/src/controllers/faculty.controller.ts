// server/src/controllers/faculty.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Link a faculty record to a user account
 * This is needed for notifications to work properly
 */
export const linkFacultyToUser = async (req: AuthRequest, res: Response) => {
  try {
    const { facultyId, userId } = req.body;
    const requestingUserRole = req.user!.role;

    // Only ADMIN can link faculty to users
    if (requestingUserRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can link faculty to users' });
    }

    if (!facultyId || !userId) {
      return res.status(400).json({ error: 'facultyId and userId are required' });
    }

    // Verify faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId }
    });

    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Link faculty to user
    const updated = await prisma.faculty.update({
      where: { id: facultyId },
      data: { userId }
    });

    return res.json({
      success: true,
      message: `Faculty ${faculty.firstName} ${faculty.lastName} linked to user ${user.email}`,
      faculty: updated
    });
  } catch (error: any) {
    console.error('Link faculty to user error:', error);
    return res.status(500).json({ error: 'Failed to link faculty to user' });
  }
};

/**
 * Auto-link faculty to users by matching email
 * This is a bulk operation for admins
 */
export const autoLinkFacultyByEmail = async (req: AuthRequest, res: Response) => {
  try {
    const requestingUserRole = req.user!.role;

    // Only ADMIN can perform bulk operations
    if (requestingUserRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can perform bulk operations' });
    }

    // Get all faculty without userId
    const facultyWithoutUser = await prisma.faculty.findMany({
      where: { userId: null },
      select: { id: true, email: true, firstName: true, lastName: true }
    });

    if (facultyWithoutUser.length === 0) {
      return res.json({
        success: true,
        message: 'All faculty are already linked to users',
        linked: 0,
        failed: 0
      });
    }

    let linked = 0;
    let failed = 0;
    const results: any[] = [];

    // Try to link each faculty by email
    for (const faculty of facultyWithoutUser) {
      if (!faculty.email) {
        failed++;
        results.push({
          facultyId: faculty.id,
          name: `${faculty.firstName} ${faculty.lastName}`,
          status: 'FAILED',
          reason: 'No email on faculty record'
        });
        continue;
      }

      const user = await prisma.user.findUnique({
        where: { email: faculty.email }
      });

      if (!user) {
        failed++;
        results.push({
          facultyId: faculty.id,
          name: `${faculty.firstName} ${faculty.lastName}`,
          email: faculty.email,
          status: 'FAILED',
          reason: 'No matching user with this email'
        });
        continue;
      }

      // Link faculty to user
      await prisma.faculty.update({
        where: { id: faculty.id },
        data: { userId: user.id }
      });

      linked++;
      results.push({
        facultyId: faculty.id,
        name: `${faculty.firstName} ${faculty.lastName}`,
        email: faculty.email,
        userId: user.id,
        status: 'SUCCESS'
      });
    }

    return res.json({
      success: true,
      message: `Linked ${linked} faculty to users`,
      linked,
      failed,
      results
    });
  } catch (error: any) {
    console.error('Auto-link faculty error:', error);
    return res.status(500).json({ error: 'Failed to auto-link faculty' });
  }
};

/**
 * Get all faculty and their user link status
 */
export const getFacultyLinkStatus = async (req: AuthRequest, res: Response) => {
  try {
    const requestingUserRole = req.user!.role;

    // Only ADMIN can view this
    if (requestingUserRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can view faculty link status' });
    }

    const faculty = await prisma.faculty.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        userId: true,
        position: true,
        college: true
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
    });

    const linked = faculty.filter(f => f.userId !== null);
    const unlinked = faculty.filter(f => f.userId === null);

    return res.json({
      total: faculty.length,
      linked: linked.length,
      unlinked: unlinked.length,
      linkedFaculty: linked,
      unlinkedFaculty: unlinked
    });
  } catch (error: any) {
    console.error('Get faculty link status error:', error);
    return res.status(500).json({ error: 'Failed to fetch faculty link status' });
  }
};

/**
 * Unlink a faculty from a user
 */
export const unlinkFacultyFromUser = async (req: AuthRequest, res: Response) => {
  try {
    const { facultyId } = req.body;
    const requestingUserRole = req.user!.role;

    // Only ADMIN can unlink
    if (requestingUserRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Only admins can unlink faculty' });
    }

    if (!facultyId) {
      return res.status(400).json({ error: 'facultyId is required' });
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId }
    });

    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    const updated = await prisma.faculty.update({
      where: { id: facultyId },
      data: { userId: null }
    });

    return res.json({
      success: true,
      message: `Faculty ${faculty.firstName} ${faculty.lastName} unlinked from user`,
      faculty: updated
    });
  } catch (error: any) {
    console.error('Unlink faculty error:', error);
    return res.status(500).json({ error: 'Failed to unlink faculty' });
  }
};
