// server/src/controllers/faculty-accounts.controller.ts
// Admin-only faculty account management controller
// Handles: create faculty User accounts, link to Faculty records, activate/deactivate, list
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserRole } from '@prisma/client';

// Create a faculty User account and optionally link to an existing Faculty record
export const createFacultyAccount = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user!.userId;

    const {
      email,
      password,
      firstName,
      lastName,
      facultyId,
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['email', 'password', 'firstName', 'lastName'],
      });
    }

    // Validate email format
    if (!email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    // If linking to a Faculty record, verify it exists and isn't already linked
    if (facultyId) {
      const faculty = await prisma.faculty.findUnique({ where: { id: facultyId } });
      if (!faculty) {
        return res.status(404).json({ error: 'Faculty record not found' });
      }
      if (faculty.userId) {
        return res.status(400).json({ error: 'This faculty record is already linked to a user account' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user account with TEACHER role
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: UserRole.TEACHER,
        isActive: true,
      },
    });

    // Create default accessibility settings
    await prisma.accessibilitySettings.create({
      data: { userId: user.id },
    });

    // Link to Faculty record if provided
    if (facultyId) {
      await prisma.faculty.update({
        where: { id: facultyId },
        data: { userId: user.id },
      });
    }

    // Create notification for the new faculty user
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Faculty Account Activated',
        message: `Welcome! Your faculty account has been created by the administrator. You now have access to Classroom Management and Consultation Scheduling features.`,
        type: 'ROLE_ASSIGNED',
        link: '/dashboard',
      },
    });

    // Fetch complete data for response
    const createdUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        FacultyProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            college: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: 'Faculty account created successfully',
      user: createdUser,
    });
  } catch (error) {
    console.error('Create faculty account error:', error);
    return res.status(500).json({ error: 'Failed to create faculty account' });
  }
};

// Link an existing User account to a Faculty record (promote to TEACHER)
export const linkFacultyAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, facultyId } = req.body;

    if (!userId || !facultyId) {
      return res.status(400).json({ error: 'userId and facultyId are required' });
    }

    // Verify user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify faculty record exists and isn't already linked
    const faculty = await prisma.faculty.findUnique({ where: { id: facultyId } });
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty record not found' });
    }
    if (faculty.userId) {
      return res.status(400).json({ error: 'This faculty record is already linked to a user account' });
    }

    // Check if user is already linked to another faculty record
    const existingLink = await prisma.faculty.findUnique({ where: { userId } });
    if (existingLink) {
      return res.status(400).json({ error: 'This user is already linked to a faculty record' });
    }

    // Update user role to TEACHER and link faculty record
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: UserRole.TEACHER },
      }),
      prisma.faculty.update({
        where: { id: facultyId },
        data: { userId },
      }),
    ]);

    // Notify the user
    await prisma.notification.create({
      data: {
        userId,
        title: 'Faculty Account Linked',
        message: 'Your account has been linked to a faculty profile. You now have access to Classroom Management and Consultation Scheduling features.',
        type: 'ROLE_ASSIGNED',
        link: '/dashboard',
      },
    });

    return res.json({ message: 'Faculty account linked successfully' });
  } catch (error) {
    console.error('Link faculty account error:', error);
    return res.status(500).json({ error: 'Failed to link faculty account' });
  }
};

// List all faculty accounts (Users with TEACHER role) with their Faculty profile link status
export const listFacultyAccounts = async (_req: AuthRequest, res: Response) => {
  try {
    const facultyUsers = await prisma.user.findMany({
      where: { role: UserRole.TEACHER },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        FacultyProfile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true,
            college: true,
            consultationDays: true,
            consultationStart: true,
            consultationEnd: true,
          },
        },
      },
    });

    // Also fetch unlinked faculty records (those without a userId)
    const unlinkedFaculty = await prisma.faculty.findMany({
      where: { userId: null },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
        position: true,
        college: true,
      },
      orderBy: { lastName: 'asc' },
    });

    return res.json({
      facultyAccounts: facultyUsers,
      unlinkedFacultyRecords: unlinkedFaculty,
      stats: {
        totalAccounts: facultyUsers.length,
        activeAccounts: facultyUsers.filter(u => u.isActive).length,
        inactiveAccounts: facultyUsers.filter(u => !u.isActive).length,
        linkedAccounts: facultyUsers.filter(u => u.FacultyProfile).length,
        unlinkedRecords: unlinkedFaculty.length,
      },
    });
  } catch (error) {
    console.error('List faculty accounts error:', error);
    return res.status(500).json({ error: 'Failed to fetch faculty accounts' });
  }
};

// Activate or deactivate a faculty account
export const toggleFacultyAccountStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== UserRole.TEACHER) {
      return res.status(400).json({ error: 'This user is not a faculty account' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    // Notify the user
    await prisma.notification.create({
      data: {
        userId: id,
        title: isActive ? 'Account Activated' : 'Account Deactivated',
        message: isActive
          ? 'Your faculty account has been activated. You can now access all faculty features.'
          : 'Your faculty account has been deactivated. Please contact the administrator for assistance.',
        type: 'ROLE_ASSIGNED',
        link: '/dashboard',
      },
    });

    return res.json({
      message: `Faculty account ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Toggle faculty account status error:', error);
    return res.status(500).json({ error: 'Failed to update faculty account status' });
  }
};

// Get faculty usage statistics (classroom + consultation activity)
export const getFacultyUsageStats = async (_req: AuthRequest, res: Response) => {
  try {
    const facultyUsers = await prisma.user.findMany({
      where: { role: UserRole.TEACHER },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        createdAt: true,
        FacultyProfile: {
          select: {
            id: true,
            position: true,
            ConsultationBookings: {
              select: { id: true, status: true },
            },
          },
        },
        ClassroomMembers: {
          where: { role: 'TEACHER' },
          select: {
            classroomId: true,
            Classroom: {
              select: {
                id: true,
                name: true,
                _count: {
                  select: { ClassroomMembers: true },
                },
              },
            },
          },
        },
      },
    });

    const stats = facultyUsers.map(user => {
      const consultations = user.FacultyProfile?.ConsultationBookings || [];
      const classrooms = user.ClassroomMembers || [];

      return {
        userId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        isActive: user.isActive,
        position: user.FacultyProfile?.position || 'N/A',
        createdAt: user.createdAt,
        classroomCount: classrooms.length,
        totalStudentsInClassrooms: classrooms.reduce(
          (sum, cm) => sum + ((cm.Classroom?._count?.ClassroomMembers || 0) - 1), 0
        ),
        consultationStats: {
          total: consultations.length,
          pending: consultations.filter(c => c.status === 'PENDING').length,
          confirmed: consultations.filter(c => c.status === 'CONFIRMED').length,
          completed: consultations.filter(c => c.status === 'COMPLETED').length,
          cancelled: consultations.filter(c => c.status === 'CANCELLED').length,
        },
      };
    });

    return res.json(stats);
  } catch (error) {
    console.error('Get faculty usage stats error:', error);
    return res.status(500).json({ error: 'Failed to fetch faculty usage statistics' });
  }
};

// Unlink a faculty record from a user account (demote back to STUDENT)
export const unlinkFacultyAccount = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { FacultyProfile: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.FacultyProfile) {
      return res.status(400).json({ error: 'This user is not linked to a faculty record' });
    }

    // Unlink and demote in a transaction
    await prisma.$transaction([
      prisma.faculty.update({
        where: { id: user.FacultyProfile.id },
        data: { userId: null },
      }),
      prisma.user.update({
        where: { id },
        data: { role: UserRole.STUDENT },
      }),
    ]);

    return res.json({ message: 'Faculty account unlinked and demoted to student' });
  } catch (error) {
    console.error('Unlink faculty account error:', error);
    return res.status(500).json({ error: 'Failed to unlink faculty account' });
  }
};
