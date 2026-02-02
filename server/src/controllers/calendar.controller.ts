import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import { CalendarViewType } from '@prisma/client';

export const getCalendarPreference = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    let preference = await prisma.calendarPreference.findUnique({
      where: { userId }
    });

    if (!preference) {
      preference = await prisma.calendarPreference.create({
        data: {
          userId,
          viewType: 'MONTH'
        }
      });
    }

    return res.json(preference);
  } catch (error) {
    console.error('Get calendar preference error:', error);
    return res.status(500).json({ error: 'Failed to fetch calendar preference' });
  }
};

export const updateCalendarPreference = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { viewType } = req.body;

    if (!viewType || !Object.values(CalendarViewType).includes(viewType)) {
      return res.status(400).json({ error: 'Invalid view type' });
    }

    const preference = await prisma.calendarPreference.upsert({
      where: { userId },
      update: { viewType },
      create: {
        userId,
        viewType
      }
    });

    return res.json(preference);
  } catch (error) {
    console.error('Update calendar preference error:', error);
    return res.status(500).json({ error: 'Failed to update calendar preference' });
  }
};

export const getCalendarVisibilities = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const visibilities = await prisma.calendarVisibility.findMany({
      where: { userId }
    });

    return res.json({
      visibilities,
      count: visibilities.length
    });
  } catch (error) {
    console.error('Get calendar visibilities error:', error);
    return res.status(500).json({ error: 'Failed to fetch calendar visibilities' });
  }
};

export const toggleCalendarVisibility = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { calendarType, calendarId, isVisible } = req.body;

    if (!calendarType) {
      return res.status(400).json({ error: 'Calendar type is required' });
    }

    const visibility = await prisma.calendarVisibility.upsert({
      where: {
        userId_calendarType_calendarId: {
          userId,
          calendarType,
          calendarId: calendarId || ''
        }
      },
      update: { isVisible },
      create: {
        userId,
        calendarType,
        calendarId: calendarId || null,
        isVisible: isVisible !== undefined ? isVisible : true
      }
    });

    return res.json(visibility);
  } catch (error) {
    console.error('Toggle calendar visibility error:', error);
    return res.status(500).json({ error: 'Failed to toggle calendar visibility' });
  }
};

export const bulkUpdateVisibilities = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { visibilities } = req.body;

    if (!Array.isArray(visibilities)) {
      return res.status(400).json({ error: 'Visibilities array is required' });
    }

    const updated = await Promise.all(
      visibilities.map(v =>
        prisma.calendarVisibility.upsert({
          where: {
            userId_calendarType_calendarId: {
              userId,
              calendarType: v.calendarType,
              calendarId: v.calendarId || ''
            }
          },
          update: { isVisible: v.isVisible },
          create: {
            userId,
            calendarType: v.calendarType,
            calendarId: v.calendarId || null,
            isVisible: v.isVisible
          }
        })
      )
    );

    return res.json({
      visibilities: updated,
      count: updated.length
    });
  } catch (error) {
    console.error('Bulk update visibilities error:', error);
    return res.status(500).json({ error: 'Failed to update visibilities' });
  }
};
