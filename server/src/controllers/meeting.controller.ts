import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { MeetingStatus, MeetingType, ParticipantStatus } from '@prisma/client';

export const createMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const organizerId = req.user!.id;
    const {
      title,
      description,
      roomId,
      meetingType,
      googleMeetLink,
      startTime,
      endTime,
      isRecurring,
      recurrenceRule,
      maxParticipants,
      participantIds,
    } = req.body;

    if (!title || !meetingType || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    if (roomId) {
      const room = await prisma.room.findUnique({ where: { id: roomId } });
      if (!room || !room.isActive) {
        return res.status(404).json({ error: 'Room not found or inactive' });
      }

      const conflictingMeeting = await prisma.meeting.findFirst({
        where: {
          roomId,
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          OR: [
            {
              AND: [
                { startTime: { lte: start } },
                { endTime: { gt: start } }
              ]
            },
            {
              AND: [
                { startTime: { lt: end } },
                { endTime: { gte: end } }
              ]
            },
            {
              AND: [
                { startTime: { gte: start } },
                { endTime: { lte: end } }
              ]
            }
          ]
        }
      });

      if (conflictingMeeting) {
        return res.status(409).json({ error: 'Room already booked for this time slot' });
      }
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        description,
        organizerId,
        roomId,
        meetingType,
        googleMeetLink,
        startTime: start,
        endTime: end,
        isRecurring: isRecurring || false,
        recurrenceRule,
        maxParticipants,
        status: 'SCHEDULED',
      },
      include: {
        Organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        },
        Room: true,
      }
    });

    if (participantIds && Array.isArray(participantIds)) {
      await prisma.meetingParticipant.createMany({
        data: participantIds.map((userId: string) => ({
          meetingId: meeting.id,
          userId,
          role: 'ATTENDEE',
          status: 'INVITED',
        })),
        skipDuplicates: true,
      });
    }

    const meetingWithParticipants = await prisma.meeting.findUnique({
      where: { id: meeting.id },
      include: {
        Organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        },
        Room: true,
        Participants: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              }
            }
          }
        }
      }
    });

    return res.status(201).json(meetingWithParticipants);
  } catch (error) {
    console.error('Create meeting error:', error);
    return res.status(500).json({ error: 'Failed to create meeting' });
  }
};

export const getMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, type, status } = req.query;

    const whereClause: any = {
      OR: [
        { organizerId: userId },
        {
          Participants: {
            some: {
              userId,
            }
          }
        }
      ]
    };

    if (startDate) {
      whereClause.startTime = { gte: new Date(startDate as string) };
    }

    if (endDate) {
      whereClause.endTime = { lte: new Date(endDate as string) };
    }

    if (type) {
      whereClause.meetingType = type;
    }

    if (status) {
      whereClause.status = status;
    }

    const meetings = await prisma.meeting.findMany({
      where: whereClause,
      include: {
        Organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        },
        Room: true,
        Participants: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              }
            }
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    return res.json(meetings);
  } catch (error) {
    console.error('Get meetings error:', error);
    return res.status(500).json({ error: 'Failed to fetch meetings' });
  }
};

export const getMeetingById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const meeting = await prisma.meeting.findUnique({
      where: { id },
      include: {
        Organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        },
        Room: true,
        Participants: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              }
            }
          }
        }
      }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const isParticipant = meeting.organizerId === userId || 
      meeting.Participants.some(p => p.userId === userId);

    if (!isParticipant) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    return res.json(meeting);
  } catch (error) {
    console.error('Get meeting error:', error);
    return res.status(500).json({ error: 'Failed to fetch meeting' });
  }
};

export const updateMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const {
      title,
      description,
      roomId,
      googleMeetLink,
      startTime,
      endTime,
      status,
      maxParticipants,
    } = req.body;

    const meeting = await prisma.meeting.findUnique({
      where: { id }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.organizerId !== userId) {
      return res.status(403).json({ error: 'Only organizer can update meeting' });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (roomId !== undefined) updateData.roomId = roomId;
    if (googleMeetLink !== undefined) updateData.googleMeetLink = googleMeetLink;
    if (startTime !== undefined) updateData.startTime = new Date(startTime);
    if (endTime !== undefined) updateData.endTime = new Date(endTime);
    if (status !== undefined) updateData.status = status;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;

    const updated = await prisma.meeting.update({
      where: { id },
      data: updateData,
      include: {
        Organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        },
        Room: true,
        Participants: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              }
            }
          }
        }
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update meeting error:', error);
    return res.status(500).json({ error: 'Failed to update meeting' });
  }
};

export const deleteMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const meeting = await prisma.meeting.findUnique({
      where: { id }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.organizerId !== userId) {
      return res.status(403).json({ error: 'Only organizer can delete meeting' });
    }

    await prisma.meeting.delete({
      where: { id }
    });

    return res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    return res.status(500).json({ error: 'Failed to delete meeting' });
  }
};

export const updateParticipantStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { meetingId, participantId } = req.params;
    const userId = req.user!.id;
    const { status } = req.body;

    if (!Object.values(ParticipantStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const participant = await prisma.meetingParticipant.findUnique({
      where: { id: participantId }
    });

    if (!participant || participant.meetingId !== meetingId) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    if (participant.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updated = await prisma.meetingParticipant.update({
      where: { id: participantId },
      data: { status }
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update participant status error:', error);
    return res.status(500).json({ error: 'Failed to update participant status' });
  }
};

export const addParticipants = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { participantIds } = req.body;

    if (!participantIds || !Array.isArray(participantIds)) {
      return res.status(400).json({ error: 'participantIds must be an array' });
    }

    const meeting = await prisma.meeting.findUnique({
      where: { id }
    });

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.organizerId !== userId) {
      return res.status(403).json({ error: 'Only organizer can add participants' });
    }

    await prisma.meetingParticipant.createMany({
      data: participantIds.map((participantId: string) => ({
        meetingId: id,
        userId: participantId,
        role: 'ATTENDEE',
        status: 'INVITED',
      })),
      skipDuplicates: true,
    });

    const updated = await prisma.meeting.findUnique({
      where: { id },
      include: {
        Organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
          }
        },
        Room: true,
        Participants: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
              }
            }
          }
        }
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error('Add participants error:', error);
    return res.status(500).json({ error: 'Failed to add participants' });
  }
};

export const getRooms = async (req: AuthRequest, res: Response) => {
  try {
    const { type, building, minCapacity } = req.query;

    const whereClause: any = { isActive: true };

    if (type) {
      whereClause.type = type;
    }

    if (building) {
      whereClause.building = building;
    }

    if (minCapacity) {
      whereClause.capacity = { gte: parseInt(minCapacity as string) };
    }

    const rooms = await prisma.room.findMany({
      where: whereClause,
      orderBy: [
        { building: 'asc' },
        { name: 'asc' }
      ]
    });

    return res.json(rooms);
  } catch (error) {
    console.error('Get rooms error:', error);
    return res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

export const getRoomAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const { roomId, startTime, endTime } = req.query;

    if (!roomId || !startTime || !endTime) {
      return res.status(400).json({ error: 'roomId, startTime, and endTime are required' });
    }

    const start = new Date(startTime as string);
    const end = new Date(endTime as string);

    const bookings = await prisma.meeting.findMany({
      where: {
        roomId: roomId as string,
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        OR: [
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } }
            ]
          },
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } }
            ]
          },
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } }
            ]
          }
        ]
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
      }
    });

    return res.json({
      available: bookings.length === 0,
      conflictingBookings: bookings,
    });
  } catch (error) {
    console.error('Get room availability error:', error);
    return res.status(500).json({ error: 'Failed to check room availability' });
  }
};

export const getCalendarEvents = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const meetings = await prisma.meeting.findMany({
      where: {
        OR: [
          { organizerId: userId },
          {
            Participants: {
              some: { userId }
            }
          }
        ],
        startTime: { gte: new Date(startDate as string) },
        endTime: { lte: new Date(endDate as string) },
      },
      include: {
        Organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          }
        },
        Room: {
          select: {
            id: true,
            name: true,
            building: true,
          }
        },
        Participants: {
          where: { userId },
          select: {
            status: true,
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    const events = meetings.map(meeting => ({
      id: meeting.id,
      title: meeting.title,
      description: meeting.description,
      start: meeting.startTime,
      end: meeting.endTime,
      type: meeting.meetingType,
      status: meeting.status,
      googleMeetLink: meeting.googleMeetLink,
      room: meeting.Room,
      organizer: meeting.Organizer,
      isOrganizer: meeting.organizerId === userId,
      participantStatus: meeting.Participants[0]?.status || null,
    }));

    return res.json(events);
  } catch (error) {
    console.error('Get calendar events error:', error);
    return res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};
