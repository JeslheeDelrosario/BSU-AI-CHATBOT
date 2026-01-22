import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { ClassroomMeetingType, ClassroomMeetingStatus } from '@prisma/client';
import { googleCalendarService } from '../services/googleCalendar.service';

export const getClassroomMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId } = req.params;
    const userId = req.user!.userId;
    const { startDate, endDate, status, type } = req.query;

    const member = await prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: {
          classroomId,
          userId
        }
      }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';

    if (!member && !isAdmin) {
      return res.status(403).json({ error: 'Not a member of this classroom' });
    }

    const whereClause: any = { classroomId };

    if (startDate && endDate) {
      whereClause.startTime = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    if (status) {
      whereClause.status = status;
    }

    if (type) {
      whereClause.meetingType = type;
    }

    const meetings = await prisma.classroomMeeting.findMany({
      where: whereClause,
      include: {
        CreatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        _count: {
          select: {
            Attendees: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    return res.json(meetings);
  } catch (error) {
    console.error('Get classroom meetings error:', error);
    return res.status(500).json({ error: 'Failed to fetch meetings' });
  }
};

export const getCalendarMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId } = req.params;
    const userId = req.user!.userId;
    const { start, end } = req.query;

    const member = await prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: {
          classroomId,
          userId
        }
      }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';

    if (!member && !isAdmin) {
      return res.status(403).json({ error: 'Not a member of this classroom' });
    }

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end dates required' });
    }

    const meetings = await prisma.classroomMeeting.findMany({
      where: {
        classroomId,
        startTime: {
          gte: new Date(start as string),
          lte: new Date(end as string)
        },
        status: {
          in: [ClassroomMeetingStatus.SCHEDULED, ClassroomMeetingStatus.IN_PROGRESS]
        }
      },
      include: {
        CreatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            Attendees: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    return res.json(meetings);
  } catch (error) {
    console.error('Get calendar meetings error:', error);
    return res.status(500).json({ error: 'Failed to fetch calendar meetings' });
  }
};

export const getMeetingById = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId, meetingId } = req.params;
    const userId = req.user!.userId;

    const member = await prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: {
          classroomId,
          userId
        }
      }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';

    if (!member && !isAdmin) {
      return res.status(403).json({ error: 'Not a member of this classroom' });
    }

    const meeting = await prisma.classroomMeeting.findUnique({
      where: { id: meetingId },
      include: {
        CreatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        Attendees: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        },
        Classroom: {
          select: {
            id: true,
            name: true,
            section: true
          }
        }
      }
    });

    if (!meeting || meeting.classroomId !== classroomId) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    return res.json(meeting);
  } catch (error) {
    console.error('Get meeting by ID error:', error);
    return res.status(500).json({ error: 'Failed to fetch meeting' });
  }
};

export const createMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId } = req.params;
    const userId = req.user!.userId;
    const {
      title,
      description,
      meetingType,
      googleMeetLink,
      startTime,
      endTime,
      isRecurring,
      recurrenceRule
    } = req.body;

    if (!title || !googleMeetLink || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const member = await prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: {
          classroomId,
          userId
        }
      }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';
    const isTeacher = member?.role === 'TEACHER';

    // Allow ADMIN users to create meetings without being a member
    if (!member && !isAdmin) {
      return res.status(403).json({ error: 'Not a member of this classroom' });
    }

    if (!isTeacher && !isAdmin) {
      return res.status(403).json({ error: 'Only teachers and admins can create meetings' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (start >= end) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    if (start < new Date()) {
      return res.status(400).json({ error: 'Cannot create meetings in the past' });
    }

    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    if (duration < 15 || duration > 480) {
      return res.status(400).json({ error: 'Meeting duration must be between 15 minutes and 8 hours' });
    }

    const classroomMembers = await prisma.classroomMember.findMany({
      where: { classroomId },
      include: {
        User: {
          select: {
            email: true
          }
        }
      }
    });

    // Get creator's Google tokens
    const creator = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        email: true
      }
    });

    let finalGoogleMeetLink = googleMeetLink;
    let googleCalendarEventId: string | null = null;

    // Try to create real Google Meet if user has connected Google Calendar
    if (creator?.googleAccessToken && creator?.googleRefreshToken) {
      try {
        const attendeeEmails = classroomMembers
          .map(m => m.User.email)
          .filter(email => email !== creator.email);

        const googleMeetResult = await googleCalendarService.createMeetingWithGoogleMeet(
          userId,
          {
            summary: title,
            description: description || '',
            startTime: start,
            endTime: end,
            attendees: attendeeEmails
          },
          creator.googleAccessToken,
          creator.googleRefreshToken
        );

        finalGoogleMeetLink = googleMeetResult.meetLink;
        googleCalendarEventId = googleMeetResult.eventId;
      } catch (error) {
        console.error('Failed to create Google Meet, using provided link:', error);
        // Fall back to user-provided link if Google Calendar API fails
      }
    }

    const meeting = await prisma.classroomMeeting.create({
      data: {
        classroomId,
        title,
        description,
        meetingType: meetingType || ClassroomMeetingType.LECTURE,
        googleMeetLink: finalGoogleMeetLink,
        googleCalendarEventId,
        startTime: start,
        endTime: end,
        createdById: userId,
        isRecurring: isRecurring || false,
        recurrenceRule: recurrenceRule || null,
        Attendees: {
          create: classroomMembers.map(m => ({
            userId: m.userId
          }))
        }
      },
      include: {
        CreatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            Attendees: true
          }
        }
      }
    });

    return res.status(201).json({
      ...meeting,
      googleCalendarCreated: !!googleCalendarEventId
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    return res.status(500).json({ error: 'Failed to create meeting' });
  }
};

export const updateMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId, meetingId } = req.params;
    const userId = req.user!.userId;
    const {
      title,
      description,
      meetingType,
      googleMeetLink,
      startTime,
      endTime,
      status
    } = req.body;

    const member = await prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: {
          classroomId,
          userId
        }
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this classroom' });
    }

    const meeting = await prisma.classroomMeeting.findUnique({
      where: { id: meetingId }
    });

    if (!meeting || meeting.classroomId !== classroomId) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isTeacher = member.role === 'TEACHER' || user?.role === 'ADMIN';
    const isCreator = meeting.createdById === userId;

    if (!isTeacher && !isCreator) {
      return res.status(403).json({ error: 'Only teachers, admins, or meeting creator can update meetings' });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (meetingType !== undefined) updateData.meetingType = meetingType;
    if (googleMeetLink !== undefined) updateData.googleMeetLink = googleMeetLink;
    if (status !== undefined) updateData.status = status;

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (start >= end) {
        return res.status(400).json({ error: 'End time must be after start time' });
      }

      updateData.startTime = start;
      updateData.endTime = end;
    }

    const updated = await prisma.classroomMeeting.update({
      where: { id: meetingId },
      data: updateData,
      include: {
        CreatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            Attendees: true
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
    const { classroomId, meetingId } = req.params;
    const userId = req.user!.userId;

    const member = await prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: {
          classroomId,
          userId
        }
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this classroom' });
    }

    const meeting = await prisma.classroomMeeting.findUnique({
      where: { id: meetingId }
    });

    if (!meeting || meeting.classroomId !== classroomId) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isTeacher = member.role === 'TEACHER' || user?.role === 'ADMIN';
    const isCreator = meeting.createdById === userId;

    if (!isTeacher && !isCreator) {
      return res.status(403).json({ error: 'Only teachers, admins, or meeting creator can delete meetings' });
    }

    await prisma.classroomMeeting.delete({
      where: { id: meetingId }
    });

    return res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    return res.status(500).json({ error: 'Failed to delete meeting' });
  }
};

export const joinMeeting = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId, meetingId } = req.params;
    const userId = req.user!.userId;

    const member = await prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: {
          classroomId,
          userId
        }
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Not a member of this classroom' });
    }

    const meeting = await prisma.classroomMeeting.findUnique({
      where: { id: meetingId }
    });

    if (!meeting || meeting.classroomId !== classroomId) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const now = new Date();
    const fifteenMinBefore = new Date(meeting.startTime.getTime() - 15 * 60000);

    if (now < fifteenMinBefore) {
      return res.status(400).json({ error: 'Meeting not yet available. You can join 15 minutes before start time.' });
    }

    const attendee = await prisma.classroomMeetingAttendee.findUnique({
      where: {
        meetingId_userId: {
          meetingId,
          userId
        }
      }
    });

    if (attendee) {
      await prisma.classroomMeetingAttendee.update({
        where: { id: attendee.id },
        data: {
          status: 'ATTENDED',
          joinedAt: attendee.joinedAt || now
        }
      });
    }

    if (meeting.status === ClassroomMeetingStatus.SCHEDULED && now >= fifteenMinBefore) {
      await prisma.classroomMeeting.update({
        where: { id: meetingId },
        data: { status: ClassroomMeetingStatus.IN_PROGRESS }
      });
    }

    return res.json({
      message: 'Joined meeting successfully',
      googleMeetLink: meeting.googleMeetLink
    });
  } catch (error) {
    console.error('Join meeting error:', error);
    return res.status(500).json({ error: 'Failed to join meeting' });
  }
};

export const getUpcomingMeetings = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId } = req.params;
    const userId = req.user!.userId;

    const member = await prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: {
          classroomId,
          userId
        }
      }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';

    if (!member && !isAdmin) {
      return res.status(403).json({ error: 'Not a member of this classroom' });
    }

    const now = new Date();
    const meetings = await prisma.classroomMeeting.findMany({
      where: {
        classroomId,
        startTime: { gte: now },
        status: ClassroomMeetingStatus.SCHEDULED
      },
      include: {
        CreatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            Attendees: true
          }
        }
      },
      orderBy: { startTime: 'asc' },
      take: 5
    });

    return res.json(meetings);
  } catch (error) {
    console.error('Get upcoming meetings error:', error);
    return res.status(500).json({ error: 'Failed to fetch upcoming meetings' });
  }
};

export const updateMeetingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId, meetingId } = req.params;
    const userId = req.user!.userId;
    const { status } = req.body;

    if (!status || !Object.values(ClassroomMeetingStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const member = await prisma.classroomMember.findUnique({
      where: {
        classroomId_userId: {
          classroomId,
          userId
        }
      }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';

    if (!member && !isAdmin) {
      return res.status(403).json({ error: 'Not a member of this classroom' });
    }

    const isTeacher = member?.role === 'TEACHER' || isAdmin;

    if (!isTeacher) {
      return res.status(403).json({ error: 'Only teachers and admins can update meeting status' });
    }

    const meeting = await prisma.classroomMeeting.findUnique({
      where: { id: meetingId }
    });

    if (!meeting || meeting.classroomId !== classroomId) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const updated = await prisma.classroomMeeting.update({
      where: { id: meetingId },
      data: { status },
      include: {
        CreatedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update meeting status error:', error);
    return res.status(500).json({ error: 'Failed to update meeting status' });
  }
};
