import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { HolidayType } from '@prisma/client';

export const getHolidays = async (req: AuthRequest, res: Response) => {
  try {
    const { region, year, type, month } = req.query;

    const where: any = {};

    if (region) {
      where.region = region;
    }

    if (type) {
      where.type = type;
    }

    if (year) {
      const yearNum = parseInt(year as string);
      where.date = {
        gte: new Date(yearNum, 0, 1),
        lte: new Date(yearNum, 11, 31, 23, 59, 59)
      };
    }

    if (month && year) {
      const yearNum = parseInt(year as string);
      const monthNum = parseInt(month as string) - 1;
      where.date = {
        gte: new Date(yearNum, monthNum, 1),
        lte: new Date(yearNum, monthNum + 1, 0, 23, 59, 59)
      };
    }

    const holidays = await prisma.holiday.findMany({
      where,
      orderBy: { date: 'asc' }
    });

    return res.json({
      holidays,
      count: holidays.length
    });
  } catch (error) {
    console.error('Get holidays error:', error);
    return res.status(500).json({ error: 'Failed to fetch holidays' });
  }
};

export const getHolidayById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const holiday = await prisma.holiday.findUnique({
      where: { id }
    });

    if (!holiday) {
      return res.status(404).json({ error: 'Holiday not found' });
    }

    return res.json(holiday);
  } catch (error) {
    console.error('Get holiday by ID error:', error);
    return res.status(500).json({ error: 'Failed to fetch holiday' });
  }
};

export const createHoliday = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, date, type, region, isRecurring, description } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    if (!name || !date || !type || !region) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Object.values(HolidayType).includes(type)) {
      return res.status(400).json({ error: 'Invalid holiday type' });
    }

    const holiday = await prisma.holiday.create({
      data: {
        name,
        date: new Date(date),
        type,
        region: region.toUpperCase(),
        isRecurring: isRecurring || false,
        description
      }
    });

    return res.status(201).json(holiday);
  } catch (error) {
    console.error('Create holiday error:', error);
    return res.status(500).json({ error: 'Failed to create holiday' });
  }
};

export const updateHoliday = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;
    const { name, date, type, region, isRecurring, description } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const holiday = await prisma.holiday.findUnique({
      where: { id }
    });

    if (!holiday) {
      return res.status(404).json({ error: 'Holiday not found' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (date !== undefined) updateData.date = new Date(date);
    if (type !== undefined) updateData.type = type;
    if (region !== undefined) updateData.region = region.toUpperCase();
    if (isRecurring !== undefined) updateData.isRecurring = isRecurring;
    if (description !== undefined) updateData.description = description;

    const updated = await prisma.holiday.update({
      where: { id },
      data: updateData
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update holiday error:', error);
    return res.status(500).json({ error: 'Failed to update holiday' });
  }
};

export const deleteHoliday = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const holiday = await prisma.holiday.findUnique({
      where: { id }
    });

    if (!holiday) {
      return res.status(404).json({ error: 'Holiday not found' });
    }

    await prisma.holiday.delete({
      where: { id }
    });

    return res.json({ message: 'Holiday deleted successfully' });
  } catch (error) {
    console.error('Delete holiday error:', error);
    return res.status(500).json({ error: 'Failed to delete holiday' });
  }
};

export const getUpcomingHolidays = async (req: AuthRequest, res: Response) => {
  try {
    const { region, limit = '10' } = req.query;

    const where: any = {
      date: {
        gte: new Date()
      }
    };

    if (region) {
      where.region = region;
    }

    const holidays = await prisma.holiday.findMany({
      where,
      orderBy: { date: 'asc' },
      take: parseInt(limit as string)
    });

    return res.json({
      holidays,
      count: holidays.length
    });
  } catch (error) {
    console.error('Get upcoming holidays error:', error);
    return res.status(500).json({ error: 'Failed to fetch upcoming holidays' });
  }
};
