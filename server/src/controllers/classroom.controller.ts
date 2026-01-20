// server/src/controllers/classroom.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// Create a new classroom
export const createClassroom = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { courseId, name, section, description } = req.body;

    // Verify user has permission (teacher/admin)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || (user.role !== 'TEACHER' && user.role !== 'ADMIN')) {
      return res.status(403).json({ error: 'Only teachers can create classrooms' });
    }

    // Verify course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const classroom = await prisma.classroom.create({
      data: {
        courseId,
        name,
        section,
        description,
        updatedAt: new Date(),
        ClassroomMembers: {
          create: {
            userId,
            role: 'TEACHER'
          }
        }
      },
      include: {
        Course: true,
        ClassroomMembers: {
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
        }
      }
    });

    return res.status(201).json(classroom);
  } catch (error) {
    console.error('Create classroom error:', error);
    return res.status(500).json({ error: 'Failed to create classroom' });
  }
};

// Get ALL classrooms (for Browse tab)
export const getAllClassrooms = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const classrooms = await prisma.classroom.findMany({
      where: {
        isArchived: false
      },
      include: {
        Course: true,
        ClassroomMembers: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            ClassroomMembers: true,
            ClassroomPosts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(classrooms);
  } catch (error) {
    console.error('Get all classrooms error:', error);
    return res.status(500).json({ error: 'Failed to fetch classrooms' });
  }
};

// Get user's classrooms (for My Room tab - joined only)
export const getUserClassrooms = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const classrooms = await prisma.classroom.findMany({
      where: {
        ClassroomMembers: {
          some: { userId }
        },
        isArchived: false
      },
      include: {
        Course: true,
        ClassroomMembers: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            ClassroomMembers: true,
            ClassroomPosts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(classrooms);
  } catch (error) {
    console.error('Get classrooms error:', error);
    return res.status(500).json({ error: 'Failed to fetch classrooms' });
  }
};

// Get classroom details
export const getClassroom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const classroom = await prisma.classroom.findUnique({
      where: { id },
      include: {
        Course: true,
        ClassroomMembers: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    // Check if user is a member
    const isMember = classroom.ClassroomMembers.some(m => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json(classroom);
  } catch (error) {
    console.error('Get classroom error:', error);
    return res.status(500).json({ error: 'Failed to fetch classroom' });
  }
};

// Join classroom with invite code
export const joinClassroom = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { inviteCode } = req.body;

    const classroom = await prisma.classroom.findUnique({
      where: { inviteCode },
      include: { ClassroomMembers: true }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Invalid invite code' });
    }

    if (classroom.isArchived) {
      return res.status(400).json({ error: 'Classroom is archived' });
    }

    // Check if already a member
    const existingMember = classroom.ClassroomMembers.find(m => m.userId === userId);
    if (existingMember) {
      return res.status(400).json({ error: 'Already a member of this classroom' });
    }

    await prisma.classroomMember.create({
      data: {
        classroomId: classroom.id,
        userId,
        role: 'STUDENT'
      }
    });

    return res.json({ message: 'Successfully joined classroom', classroomId: classroom.id });
  } catch (error) {
    console.error('Join classroom error:', error);
    return res.status(500).json({ error: 'Failed to join classroom' });
  }
};

// Update classroom
export const updateClassroom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { name, section, description, isArchived } = req.body;

    // Check if user is a teacher in this classroom
    const member = await prisma.classroomMember.findFirst({
      where: { classroomId: id, userId, role: 'TEACHER' }
    });

    if (!member) {
      return res.status(403).json({ error: 'Only teachers can update classroom' });
    }

    const classroom = await prisma.classroom.update({
      where: { id },
      data: {
        name,
        section,
        description,
        isArchived,
        updatedAt: new Date()
      }
    });

    return res.json(classroom);
  } catch (error) {
    console.error('Update classroom error:', error);
    return res.status(500).json({ error: 'Failed to update classroom' });
  }
};

// Add member to classroom
export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { email, role } = req.body;

    // Check if requester is a teacher
    const requesterMember = await prisma.classroomMember.findFirst({
      where: { classroomId: id, userId, role: 'TEACHER' }
    });

    if (!requesterMember) {
      return res.status(403).json({ error: 'Only teachers can add members' });
    }

    // Find user by email
    const userToAdd = await prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a member
    const existingMember = await prisma.classroomMember.findFirst({
      where: { classroomId: id, userId: userToAdd.id }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    const member = await prisma.classroomMember.create({
      data: {
        classroomId: id,
        userId: userToAdd.id,
        role: role || 'STUDENT'
      },
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
    });

    return res.status(201).json(member);
  } catch (error) {
    console.error('Add member error:', error);
    return res.status(500).json({ error: 'Failed to add member' });
  }
};

// Remove member from classroom
export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user!.userId;

    // Check if requester is a teacher
    const requesterMember = await prisma.classroomMember.findFirst({
      where: { classroomId: id, userId, role: 'TEACHER' }
    });

    if (!requesterMember) {
      return res.status(403).json({ error: 'Only teachers can remove members' });
    }

    await prisma.classroomMember.delete({
      where: { id: memberId }
    });

    return res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove member error:', error);
    return res.status(500).json({ error: 'Failed to remove member' });
  }
};
