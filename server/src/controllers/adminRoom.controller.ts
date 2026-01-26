import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { RoomType } from '@prisma/client';

export const getAllRooms = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { type, building, isActive, search } = req.query;

    const whereClause: any = {};

    if (type) {
      whereClause.type = type;
    }

    if (building) {
      whereClause.building = building;
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { building: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const rooms = await prisma.room.findMany({
      where: whereClause,
      orderBy: [
        { building: 'asc' },
        { floor: 'asc' },
        { name: 'asc' }
      ],
      include: {
        _count: {
          select: {
            Meetings: {
              where: {
                status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
              }
            }
          }
        }
      }
    });

    return res.json(rooms);
  } catch (error) {
    console.error('Get all rooms error:', error);
    return res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const getRoomById = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        Meetings: {
          where: {
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
          },
          orderBy: { startTime: 'asc' },
          take: 10,
          include: {
            Organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    return res.json(room);
  } catch (error) {
    console.error('Get room by ID error:', error);
    return res.status(500).json({ error: 'Failed to fetch room' });
  }
};

export const createRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, building, floor, capacity, type, facilities } = req.body;

    if (!name || !building || !capacity || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Object.values(RoomType).includes(type)) {
      return res.status(400).json({ error: 'Invalid room type' });
    }

    const existingRoom = await prisma.room.findFirst({
      where: {
        name,
        building,
      }
    });

    if (existingRoom) {
      return res.status(409).json({ error: 'Room with this name already exists in this building' });
    }

    const room = await prisma.room.create({
      data: {
        name,
        building,
        floor: floor || null,
        capacity: parseInt(capacity),
        type,
        facilities: facilities || [],
        isActive: true,
      }
    });

    return res.status(201).json(room);
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({ error: 'Failed to create room' });
  }
};

export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { name, building, floor, capacity, type, facilities, isActive } = req.body;

    const room = await prisma.room.findUnique({ where: { id } });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (type && !Object.values(RoomType).includes(type)) {
      return res.status(400).json({ error: 'Invalid room type' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (building !== undefined) updateData.building = building;
    if (floor !== undefined) updateData.floor = floor;
    if (capacity !== undefined) updateData.capacity = parseInt(capacity);
    if (type !== undefined) updateData.type = type;
    if (facilities !== undefined) updateData.facilities = facilities;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await prisma.room.update({
      where: { id },
      data: updateData,
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update room error:', error);
    return res.status(500).json({ error: 'Failed to update room' });
  }
};

export const deleteRoom = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            Meetings: {
              where: {
                status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
              }
            }
          }
        }
      }
    });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room._count.Meetings > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete room with scheduled or in-progress meetings. Please cancel or complete meetings first.' 
      });
    }

    await prisma.room.delete({ where: { id } });

    return res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    return res.status(500).json({ error: 'Failed to delete room' });
  }
};

export const getRoomStatistics = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const totalRooms = await prisma.room.count();
    const activeRooms = await prisma.room.count({ where: { isActive: true } });
    
    const roomsByType = await prisma.room.groupBy({
      by: ['type'],
      _count: true,
    });

    const roomsByBuilding = await prisma.room.groupBy({
      by: ['building'],
      _count: true,
      orderBy: {
        _count: {
          building: 'desc'
        }
      }
    });

    const upcomingMeetings = await prisma.meeting.count({
      where: {
        status: 'SCHEDULED',
        startTime: {
          gte: new Date()
        }
      }
    });

    return res.json({
      totalRooms,
      activeRooms,
      inactiveRooms: totalRooms - activeRooms,
      roomsByType,
      roomsByBuilding,
      upcomingMeetings,
    });
  } catch (error) {
    console.error('Get room statistics error:', error);
    return res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

export const getBuildingsList = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const buildings = await prisma.room.findMany({
      select: {
        building: true,
      },
      distinct: ['building'],
      orderBy: {
        building: 'asc'
      }
    });

    return res.json(buildings.map(b => b.building));
  } catch (error) {
    console.error('Get buildings list error:', error);
    return res.status(500).json({ error: 'Failed to fetch buildings' });
  }
};
