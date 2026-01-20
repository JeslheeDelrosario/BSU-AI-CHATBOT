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

    // TODO: Verify user has permission to view this faculty's bookings

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

    // TODO: Verify user has permission to update this booking

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
