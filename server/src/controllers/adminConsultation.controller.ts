// server/src/controllers/adminConsultation.controller.ts
// Admin controller for managing faculty consultation availability

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

// Get all faculty with consultation info
export const getAllFacultyForConsultation = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const faculty = await prisma.faculty.findMany({
      orderBy: [{ college: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        position: true,
        college: true,
        consultationDays: true,
        consultationStart: true,
        consultationEnd: true,
        officeHours: true,
      }
    });

    return res.json(faculty);
  } catch (error) {
    console.error('Get faculty for consultation error:', error);
    return res.status(500).json({ error: 'Failed to fetch faculty' });
  }
};

// Update faculty consultation settings
export const updateFacultyConsultation = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { consultationDays, consultationStart, consultationEnd } = req.body;

    // Validate faculty exists
    const existing = await prisma.faculty.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    // Validate time range if provided
    if (consultationStart && consultationEnd) {
      const start = consultationStart.replace(':', '');
      const end = consultationEnd.replace(':', '');
      if (parseInt(end) <= parseInt(start)) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }
    }

    // Update faculty
    const updated = await prisma.faculty.update({
      where: { id },
      data: {
        consultationDays: consultationDays || [],
        consultationStart: consultationStart || null,
        consultationEnd: consultationEnd || null,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        position: true,
        college: true,
        consultationDays: true,
        consultationStart: true,
        consultationEnd: true,
        officeHours: true,
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update faculty consultation error:', error);
    return res.status(500).json({ error: 'Failed to update consultation settings' });
  }
};

// Bulk update faculty consultation availability
export const bulkUpdateConsultation = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { facultyIds, consultationDays, consultationStart, consultationEnd, setUnavailable } = req.body;

    if (!facultyIds || !Array.isArray(facultyIds) || facultyIds.length === 0) {
      return res.status(400).json({ error: 'Faculty IDs are required' });
    }

    if (setUnavailable) {
      // Make all selected faculty unavailable
      await prisma.faculty.updateMany({
        where: { id: { in: facultyIds } },
        data: {
          consultationDays: [],
          consultationStart: null,
          consultationEnd: null,
        }
      });
    } else {
      // Set consultation schedule for all selected faculty
      await prisma.faculty.updateMany({
        where: { id: { in: facultyIds } },
        data: {
          consultationDays: consultationDays || [],
          consultationStart: consultationStart || null,
          consultationEnd: consultationEnd || null,
        }
      });
    }

    return res.json({ message: `Updated ${facultyIds.length} faculty members` });
  } catch (error) {
    console.error('Bulk update consultation error:', error);
    return res.status(500).json({ error: 'Failed to bulk update consultation settings' });
  }
};

// Get consultation statistics
export const getConsultationStats = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const allFaculty = await prisma.faculty.findMany({
      select: {
        id: true,
        college: true,
        consultationDays: true,
      }
    });

    const totalFaculty = allFaculty.length;
    const availableFaculty = allFaculty.filter(f => f.consultationDays.length > 0).length;
    const unavailableFaculty = totalFaculty - availableFaculty;

    // Group by college
    const byCollege: Record<string, { total: number; available: number }> = {};
    allFaculty.forEach(f => {
      if (!byCollege[f.college]) {
        byCollege[f.college] = { total: 0, available: 0 };
      }
      byCollege[f.college].total++;
      if (f.consultationDays.length > 0) {
        byCollege[f.college].available++;
      }
    });

    return res.json({
      totalFaculty,
      availableFaculty,
      unavailableFaculty,
      byCollege,
    });
  } catch (error) {
    console.error('Get consultation stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch consultation statistics' });
  }
};
