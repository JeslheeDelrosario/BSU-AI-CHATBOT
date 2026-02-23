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

// ADMIN: Create meeting/schedule for a room
export const createMeeting = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, description, roomId, meetingType, startTime, endTime, isRecurring, recurrenceRule, organizerId } = req.body;

    if (!title || !roomId || !meetingType || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields: title, roomId, meetingType, startTime, endTime' });
    }

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) return res.status(400).json({ error: 'End time must be after start time' });

    // Check for overlapping meetings in the same room
    const overlap = await prisma.meeting.findFirst({
      where: {
        roomId,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        startTime: { lt: end },
        endTime: { gt: start }
      }
    });

    if (overlap) {
      return res.status(409).json({ error: `Time conflict with "${overlap.title}" (${new Date(overlap.startTime).toLocaleTimeString()} - ${new Date(overlap.endTime).toLocaleTimeString()})` });
    }

    const actualOrganizerId = organizerId || req.user.id;

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || null,
        organizerId: actualOrganizerId,
        roomId,
        meetingType,
        startTime: start,
        endTime: end,
        isRecurring: isRecurring || false,
        recurrenceRule: recurrenceRule || null,
        status: 'SCHEDULED',
      },
      include: {
        Room: true,
        Organizer: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    return res.status(201).json(meeting);
  } catch (error) {
    console.error('Create meeting error:', error);
    return res.status(500).json({ error: 'Failed to create meeting' });
  }
};

// ADMIN: Update meeting
export const updateMeeting = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { title, description, roomId, meetingType, startTime, endTime, isRecurring, recurrenceRule, status } = req.body;

    const existing = await prisma.meeting.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Meeting not found' });

    const start = startTime ? new Date(startTime) : existing.startTime;
    const end = endTime ? new Date(endTime) : existing.endTime;
    if (end <= start) return res.status(400).json({ error: 'End time must be after start time' });

    const targetRoomId = roomId || existing.roomId;

    // Check for overlapping meetings (excluding self)
    if (startTime || endTime || roomId) {
      const overlap = await prisma.meeting.findFirst({
        where: {
          id: { not: id },
          roomId: targetRoomId,
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          startTime: { lt: end },
          endTime: { gt: start }
        }
      });

      if (overlap) {
        return res.status(409).json({ error: `Time conflict with "${overlap.title}"` });
      }
    }

    const meeting = await prisma.meeting.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(roomId !== undefined && { roomId }),
        ...(meetingType !== undefined && { meetingType }),
        ...(startTime !== undefined && { startTime: start }),
        ...(endTime !== undefined && { endTime: end }),
        ...(isRecurring !== undefined && { isRecurring }),
        ...(recurrenceRule !== undefined && { recurrenceRule: recurrenceRule || null }),
        ...(status !== undefined && { status }),
      },
      include: {
        Room: true,
        Organizer: { select: { id: true, firstName: true, lastName: true } }
      }
    });

    return res.json(meeting);
  } catch (error) {
    console.error('Update meeting error:', error);
    return res.status(500).json({ error: 'Failed to update meeting' });
  }
};

// ADMIN: Delete meeting
export const deleteMeeting = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const existing = await prisma.meeting.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Meeting not found' });

    // Delete participants first
    await prisma.meetingParticipant.deleteMany({ where: { meetingId: id } });
    await prisma.meeting.delete({ where: { id } });

    return res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    return res.status(500).json({ error: 'Failed to delete meeting' });
  }
};

// PUBLIC: Get all active rooms with their schedules for a given date range
export const getPublicRoomSchedules = async (req: AuthRequest, res: Response) => {
  try {
    const { date, building, type } = req.query;
    
    // Default to today if no date provided
    const targetDate = date ? new Date(date as string) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const whereClause: any = { isActive: true };
    if (building) whereClause.building = building;
    if (type) whereClause.type = type;

    const rooms = await prisma.room.findMany({
      where: whereClause,
      orderBy: [{ building: 'asc' }, { floor: 'asc' }, { name: 'asc' }],
      include: {
        Meetings: {
          where: {
            status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
            startTime: { lte: endOfDay },
            endTime: { gte: startOfDay }
          },
          orderBy: { startTime: 'asc' },
          include: {
            Organizer: {
              select: { id: true, firstName: true, lastName: true }
            }
          }
        }
      }
    });

    // Calculate current status for each room
    const now = new Date();
    const roomsWithStatus = rooms.map(room => {
      const currentMeeting = room.Meetings.find(m => 
        new Date(m.startTime) <= now && new Date(m.endTime) >= now
      );
      const nextMeeting = room.Meetings.find(m => new Date(m.startTime) > now);
      
      return {
        ...room,
        currentStatus: currentMeeting ? 'OCCUPIED' : 'AVAILABLE',
        currentMeeting: currentMeeting || null,
        nextMeeting: nextMeeting || null
      };
    });

    return res.json(roomsWithStatus);
  } catch (error) {
    console.error('Get public room schedules error:', error);
    return res.status(500).json({ error: 'Failed to fetch room schedules' });
  }
};

// PUBLIC: Get buildings list (no admin required)
export const getPublicBuildingsList = async (_req: AuthRequest, res: Response) => {
  try {
    const buildings = await prisma.room.findMany({
      where: { isActive: true },
      select: { building: true },
      distinct: ['building'],
      orderBy: { building: 'asc' }
    });

    return res.json(buildings.map(b => b.building));
  } catch (error) {
    console.error('Get public buildings list error:', error);
    return res.status(500).json({ error: 'Failed to fetch buildings' });
  }
};

// PUBLIC: Get room types
export const getPublicRoomTypes = async (_req: AuthRequest, res: Response) => {
  try {
    const types = await prisma.room.findMany({
      where: { isActive: true },
      select: { type: true },
      distinct: ['type'],
      orderBy: { type: 'asc' }
    });

    return res.json(types.map(t => t.type));
  } catch (error) {
    console.error('Get public room types error:', error);
    return res.status(500).json({ error: 'Failed to fetch room types' });
  }
};
