// server/src/controllers/consultation.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { ConsultationStatus } from '@prisma/client';

// Book a consultation
export const bookConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;
    const { facultyId, date, startTime, endTime, topic, notes } = req.body;

    if (!facultyId || !date || !startTime || !endTime || !topic) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if faculty exists
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId }
    });

    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    // Check if the date is in the faculty's consultation days
    const bookingDate = new Date(date);
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bookingDate.getDay()];
    
    if (!faculty.consultationDays.includes(dayName)) {
      return res.status(400).json({ error: 'Faculty not available on this day' });
    }

    // Check for conflicting bookings
    const conflictingBooking = await prisma.consultationBooking.findFirst({
      where: {
        facultyId,
        date: bookingDate,
        status: { in: ['PENDING', 'CONFIRMED'] },
        OR: [
          {
            AND: [
              { startTime: { lte: startTime } },
              { endTime: { gt: startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: endTime } },
              { endTime: { gte: endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: startTime } },
              { endTime: { lte: endTime } }
            ]
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(409).json({ error: 'Time slot already booked' });
    }

    // Create the booking
    const booking = await prisma.consultationBooking.create({
      data: {
        facultyId,
        studentId,
        date: bookingDate,
        startTime,
        endTime,
        topic,
        notes,
        status: 'PENDING',
        updatedAt: new Date()
      },
      include: {
        Faculty: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        Student: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // TODO: Send email notification to faculty

    return res.status(201).json(booking);
  } catch (error) {
    console.error('Book consultation error:', error);
    return res.status(500).json({ error: 'Failed to book consultation' });
  }
};

// Get student's bookings
export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user!.id;

    const bookings = await prisma.consultationBooking.findMany({
      where: { studentId },
      include: {
        Faculty: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    return res.json(bookings);
  } catch (error) {
    console.error('Get my bookings error:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Get faculty's bookings (for faculty dashboard)
export const getFacultyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { facultyId } = req.params;
    const requestingUserRole = req.user!.role;

    // Only ADMIN or TEACHER roles can view faculty bookings
    if (requestingUserRole !== 'ADMIN' && requestingUserRole !== 'TEACHER') {
      return res.status(403).json({ error: 'Access denied. Only faculty or admins can view faculty bookings.' });
    }

    const bookings = await prisma.consultationBooking.findMany({
      where: { facultyId },
      include: {
        Student: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    return res.json(bookings);
  } catch (error) {
    console.error('Get faculty bookings error:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Update booking status (for faculty)
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, meetingLink, location, notes } = req.body;

    if (!status || !Object.values(ConsultationStatus).includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await prisma.consultationBooking.findUnique({
      where: { id },
      include: { Faculty: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const requestingUserRole = req.user!.role;
    if (requestingUserRole !== 'ADMIN' && requestingUserRole !== 'TEACHER') {
      return res.status(403).json({ error: 'Access denied. Only faculty or admins can update booking status.' });
    }

    const updated = await prisma.consultationBooking.update({
      where: { id },
      data: {
        status,
        meetingLink: meetingLink || booking.meetingLink,
        location: location || booking.location,
        notes: notes || booking.notes,
        updatedAt: new Date()
      },
      include: {
        Faculty: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        Student: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    // TODO: Send email notification to student

    return res.json(updated);
  } catch (error) {
    console.error('Update booking status error:', error);
    return res.status(500).json({ error: 'Failed to update booking' });
  }
};

// Cancel booking (for student)
export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const studentId = req.user!.id;

    const booking = await prisma.consultationBooking.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.studentId !== studentId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (booking.status === 'COMPLETED' || booking.status === 'CANCELLED') {
      return res.status(400).json({ error: 'Cannot cancel this booking' });
    }

    const updated = await prisma.consultationBooking.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    // TODO: Send email notification to faculty

    return res.json(updated);
  } catch (error) {
    console.error('Cancel booking error:', error);
    return res.status(500).json({ error: 'Failed to cancel booking' });
  }
};

// ─── Faculty: update own consultation schedule ────────────────────────────────
export const updateMySchedule = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    if (role !== 'TEACHER' && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only faculty can update their schedule' });
    }

    const { consultationDays, consultationStart, consultationEnd, officeHours } = req.body;

    if (!consultationDays || !Array.isArray(consultationDays)) {
      return res.status(400).json({ error: 'consultationDays must be an array' });
    }

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const invalidDays = consultationDays.filter((d: string) => !validDays.includes(d));
    if (invalidDays.length > 0) {
      return res.status(400).json({ error: `Invalid days: ${invalidDays.join(', ')}` });
    }

    // Find faculty record linked to this user's email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    // Match faculty by email or name
    let faculty = await prisma.faculty.findFirst({
      where: { email: { equals: user.email, mode: 'insensitive' } }
    });

    if (!faculty) {
      faculty = await prisma.faculty.findFirst({
        where: {
          firstName: { equals: user.firstName, mode: 'insensitive' },
          lastName: { equals: user.lastName, mode: 'insensitive' }
        }
      });
    }

    if (!faculty) {
      return res.status(404).json({ error: 'Faculty record not found for this account' });
    }

    const updated = await prisma.faculty.update({
      where: { id: faculty.id },
      data: {
        consultationDays,
        consultationStart: consultationStart || null,
        consultationEnd: consultationEnd || null,
        officeHours: officeHours || null
      }
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update schedule error:', error);
    return res.status(500).json({ error: 'Failed to update schedule' });
  }
};

// ─── Faculty: get own faculty profile + upcoming bookings ─────────────────────
export const getMyFacultyProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    if (role !== 'TEACHER' && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Only faculty can access this endpoint' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    let faculty = await prisma.faculty.findFirst({
      where: { email: { equals: user.email, mode: 'insensitive' } }
    });

    if (!faculty) {
      faculty = await prisma.faculty.findFirst({
        where: {
          firstName: { equals: user.firstName, mode: 'insensitive' },
          lastName: { equals: user.lastName, mode: 'insensitive' }
        }
      });
    }

    if (!faculty) {
      return res.status(404).json({ error: 'Faculty record not found for this account' });
    }

    // Get upcoming bookings for this faculty
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingBookings = await prisma.consultationBooking.findMany({
      where: {
        facultyId: faculty.id,
        date: { gte: today },
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      include: {
        Student: {
          select: { firstName: true, lastName: true, email: true, avatar: true }
        }
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });

    return res.json({ faculty, upcomingBookings });
  } catch (error) {
    console.error('Get faculty profile error:', error);
    return res.status(500).json({ error: 'Failed to fetch faculty profile' });
  }
};

// ─── Faculty: get weekly calendar view (bookings for a date range) ────────────
export const getFacultyCalendar = async (req: AuthRequest, res: Response) => {
  try {
    const { facultyId, weekStart } = req.query;
    const requestingRole = req.user!.role;

    if (!facultyId || !weekStart) {
      return res.status(400).json({ error: 'facultyId and weekStart are required' });
    }

    if (requestingRole !== 'ADMIN' && requestingRole !== 'TEACHER' && requestingRole !== 'STUDENT') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId as string }
    });

    if (!faculty) return res.status(404).json({ error: 'Faculty not found' });

    const start = new Date(weekStart as string);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const bookings = await prisma.consultationBooking.findMany({
      where: {
        facultyId: facultyId as string,
        date: { gte: start, lte: end }
      },
      include: {
        Student: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
    });

    return res.json({ faculty, bookings, weekStart: start, weekEnd: end });
  } catch (error) {
    console.error('Get faculty calendar error:', error);
    return res.status(500).json({ error: 'Failed to fetch calendar' });
  }
};

// ─── Admin: get/update consultation configuration ─────────────────────────────
// Config is stored as a special FAQ entry with key "CONSULTATION_CONFIG"
// (avoids a new migration — uses existing flexible storage)
const CONSULTATION_CONFIG_KEY = 'CONSULTATION_CONFIG';

export const getConsultationConfig = async (req: AuthRequest, res: Response) => {
  try {
    const config = await prisma.fAQ.findFirst({
      where: { question: CONSULTATION_CONFIG_KEY }
    });

    const defaults = {
      maxDurationMinutes: 30,
      minDurationMinutes: 15,
      maxStudentsPerSlot: 1,
      allowCancellation: true,
      cancellationWindowHours: 24,
      reminderHoursBefore: 24,
      allowRescheduling: true
    };

    if (!config) return res.json(defaults);

    try {
      return res.json({ ...defaults, ...JSON.parse(config.answer) });
    } catch {
      return res.json(defaults);
    }
  } catch (error) {
    console.error('Get config error:', error);
    return res.status(500).json({ error: 'Failed to fetch config' });
  }
};

export const updateConsultationConfig = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin only' });
    }

    const {
      maxDurationMinutes,
      minDurationMinutes,
      maxStudentsPerSlot,
      allowCancellation,
      cancellationWindowHours,
      reminderHoursBefore,
      allowRescheduling
    } = req.body;

    const configData = JSON.stringify({
      maxDurationMinutes: Number(maxDurationMinutes) || 30,
      minDurationMinutes: Number(minDurationMinutes) || 15,
      maxStudentsPerSlot: Number(maxStudentsPerSlot) || 1,
      allowCancellation: Boolean(allowCancellation),
      cancellationWindowHours: Number(cancellationWindowHours) || 24,
      reminderHoursBefore: Number(reminderHoursBefore) || 24,
      allowRescheduling: Boolean(allowRescheduling)
    });

    const existing = await prisma.fAQ.findFirst({
      where: { question: CONSULTATION_CONFIG_KEY }
    });

    if (existing) {
      await prisma.fAQ.update({
        where: { id: existing.id },
        data: { answer: configData }
      });
    } else {
      await prisma.fAQ.create({
        data: {
          question: CONSULTATION_CONFIG_KEY,
          answer: configData,
          category: 'SYSTEM',
          isPublished: false
        }
      });
    }

    return res.json({ success: true, config: JSON.parse(configData) });
  } catch (error) {
    console.error('Update config error:', error);
    return res.status(500).json({ error: 'Failed to update config' });
  }
};

// Get all faculty members with consultation schedules (public endpoint for calendar)
export const getFacultyWithConsultation = async (req: AuthRequest, res: Response) => {
  try {
    const faculty = await prisma.faculty.findMany({
      where: {
        consultationDays: { isEmpty: false }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        position: true,
        college: true,
        officeHours: true,
        consultationDays: true,
        consultationStart: true,
        consultationEnd: true
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }]
    });

    return res.json(faculty);
  } catch (error) {
    console.error('Get faculty with consultation error:', error);
    return res.status(500).json({ error: 'Failed to fetch faculty' });
  }
};

// Get available time slots for a faculty on a specific date
export const getAvailableSlots = async (req: AuthRequest, res: Response) => {
  try {
    const { facultyId, date } = req.query;

    if (!facultyId || !date) {
      return res.status(400).json({ error: 'Faculty ID and date required' });
    }

    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId as string }
    });

    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }

    const bookingDate = new Date(date as string);
    const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][bookingDate.getDay()];

    if (!faculty.consultationDays.includes(dayName)) {
      return res.json({ available: false, slots: [] });
    }

    // Get existing bookings for this date
    const existingBookings = await prisma.consultationBooking.findMany({
      where: {
        facultyId: facultyId as string,
        date: bookingDate,
        status: { in: ['PENDING', 'CONFIRMED'] }
      },
      select: {
        startTime: true,
        endTime: true
      }
    });

    return res.json({
      available: true,
      consultationStart: faculty.consultationStart,
      consultationEnd: faculty.consultationEnd,
      bookedSlots: existingBookings
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    return res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};
