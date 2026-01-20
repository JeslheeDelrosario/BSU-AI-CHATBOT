import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const getAllStudents = async (req: AuthRequest, res: Response) => {
  try {
    const { search, status, learningStyle, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { role: 'STUDENT' };

    if (search) {
      const searchTerm = search as string;
      where.OR = [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (learningStyle) {
      where.learningStyle = learningStyle;
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
          isActive: true,
          learningStyle: true,
          gradeLevel: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              Enrollment: true,
              Progress: true,
              AIInteraction: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      students,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get all students error:', error);
    return res.status(500).json({ error: 'Server error fetching students' });
  }
};

export const getStudentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        isActive: true,
        learningStyle: true,
        gradeLevel: true,
        dateOfBirth: true,
        createdAt: true,
        updatedAt: true,
        AccessibilitySettings: true,
        Enrollment: {
          include: {
            Course: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
                level: true,
              },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        },
        Progress: {
          include: {
            Lesson: {
              select: {
                id: true,
                title: true,
                courseId: true,
              },
            },
          },
          orderBy: { updatedAt: 'desc' },
          take: 20,
        },
        AIInteraction: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            userMessage: true,
            aiResponse: true,
            helpful: true,
            createdAt: true,
          },
        },
        Achievement: {
          orderBy: { earnedAt: 'desc' },
        },
        _count: {
          select: {
            Enrollment: true,
            Progress: true,
            AIInteraction: true,
            Achievement: true,
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.role !== 'STUDENT') {
      return res.status(400).json({ error: 'User is not a student' });
    }

    return res.json(student);
  } catch (error) {
    console.error('Get student by ID error:', error);
    return res.status(500).json({ error: 'Server error fetching student' });
  }
};

export const updateStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, learningStyle, gradeLevel, isActive, dateOfBirth } = req.body;

    const existingStudent = await prisma.user.findUnique({ where: { id } });

    if (!existingStudent) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (existingStudent.role !== 'STUDENT') {
      return res.status(400).json({ error: 'User is not a student' });
    }

    if (email && email !== existingStudent.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }

    const data: any = {};
    if (firstName !== undefined) data.firstName = firstName.trim();
    if (lastName !== undefined) data.lastName = lastName.trim();
    if (email !== undefined) data.email = email.trim().toLowerCase();
    if (learningStyle !== undefined) data.learningStyle = learningStyle;
    if (gradeLevel !== undefined) data.gradeLevel = gradeLevel;
    if (isActive !== undefined) data.isActive = isActive;
    if (dateOfBirth !== undefined) data.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    data.updatedAt = new Date();

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        learningStyle: true,
        gradeLevel: true,
        dateOfBirth: true,
        updatedAt: true,
      },
    });

    return res.json(updated);
  } catch (error) {
    console.error('Update student error:', error);
    return res.status(500).json({ error: 'Server error updating student' });
  }
};

export const toggleStudentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findUnique({ where: { id } });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.role !== 'STUDENT') {
      return res.status(400).json({ error: 'User is not a student' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { 
        isActive: !student.isActive,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    });

    return res.json({
      ...updated,
      message: updated.isActive ? 'Student activated' : 'Student deactivated',
    });
  } catch (error) {
    console.error('Toggle student status error:', error);
    return res.status(500).json({ error: 'Server error toggling student status' });
  }
};

export const resetStudentPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const student = await prisma.user.findUnique({ where: { id } });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.role !== 'STUDENT') {
      return res.status(400).json({ error: 'User is not a student' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { 
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset student password error:', error);
    return res.status(500).json({ error: 'Server error resetting password' });
  }
};

export const deleteStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const student = await prisma.user.findUnique({ where: { id } });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    if (student.role !== 'STUDENT') {
      return res.status(400).json({ error: 'User is not a student' });
    }

    await prisma.user.delete({ where: { id } });

    return res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    return res.status(500).json({ error: 'Server error deleting student' });
  }
};

export const getStudentStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalStudents,
      activeStudents,
      inactiveStudents,
      learningStyleCounts,
      recentEnrollments,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      prisma.user.count({ where: { role: 'STUDENT', isActive: false } }),
      prisma.user.groupBy({
        by: ['learningStyle'],
        where: { role: 'STUDENT' },
        _count: { learningStyle: true },
      }),
      prisma.enrollment.findMany({
        take: 10,
        orderBy: { enrolledAt: 'desc' },
        include: {
          User: {
            select: { firstName: true, lastName: true, email: true },
          },
          Course: {
            select: { title: true },
          },
        },
      }),
    ]);

    return res.json({
      totalStudents,
      activeStudents,
      inactiveStudents,
      learningStyleDistribution: learningStyleCounts.map(ls => ({
        style: ls.learningStyle || 'Not Set',
        count: ls._count.learningStyle,
      })),
      recentEnrollments: recentEnrollments.map(e => ({
        studentName: `${e.User.firstName} ${e.User.lastName}`,
        studentEmail: e.User.email,
        courseName: e.Course.title,
        enrolledAt: e.enrolledAt,
      })),
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    return res.status(500).json({ error: 'Server error fetching student stats' });
  }
};

export const createStudent = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, learningStyle, gradeLevel } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, first name, and last name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role: 'STUDENT',
        learningStyle: learningStyle || null,
        gradeLevel: gradeLevel || null,
        isActive: true,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        learningStyle: true,
        gradeLevel: true,
        isActive: true,
        createdAt: true,
      },
    });

    await prisma.accessibilitySettings.create({
      data: { 
        userId: student.id,
        updatedAt: new Date(),
      },
    });

    return res.status(201).json(student);
  } catch (error) {
    console.error('Create student error:', error);
    return res.status(500).json({ error: 'Server error creating student' });
  }
};
