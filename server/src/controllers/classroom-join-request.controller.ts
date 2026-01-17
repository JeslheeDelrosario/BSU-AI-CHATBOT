import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createJoinRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { classroomId, message } = req.body;

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId }
    });

    if (!classroom) {
      return res.status(404).json({ error: 'Classroom not found' });
    }

    if (classroom.isArchived) {
      return res.status(400).json({ error: 'Classroom is archived' });
    }

    const existingMember = await prisma.classroomMember.findFirst({
      where: { classroomId, userId }
    });

    if (existingMember) {
      return res.status(400).json({ error: 'Already a member of this classroom' });
    }

    const existingRequest = await prisma.classroomJoinRequest.findUnique({
      where: { classroomId_userId: { classroomId, userId } }
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return res.status(400).json({ error: 'Join request already pending' });
      }
      if (existingRequest.status === 'REJECTED') {
        await prisma.classroomJoinRequest.update({
          where: { id: existingRequest.id },
          data: {
            status: 'PENDING',
            message,
            updatedAt: new Date(),
            reviewedBy: null,
            reviewedAt: null
          }
        });
        return res.json({ message: 'Join request resubmitted' });
      }
    }

    const joinRequest = await prisma.classroomJoinRequest.create({
      data: {
        classroomId,
        userId,
        message,
        updatedAt: new Date()
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

    return res.status(201).json(joinRequest);
  } catch (error) {
    console.error('Create join request error:', error);
    return res.status(500).json({ error: 'Failed to create join request' });
  }
};

export const getClassroomJoinRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId } = req.params;
    const userId = req.user!.userId;

    const member = await prisma.classroomMember.findFirst({
      where: { classroomId, userId, role: 'TEACHER' }
    });

    if (!member) {
      return res.status(403).json({ error: 'Only teachers can view join requests' });
    }

    const requests = await prisma.classroomJoinRequest.findMany({
      where: { classroomId },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        Reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(requests);
  } catch (error) {
    console.error('Get join requests error:', error);
    return res.status(500).json({ error: 'Failed to fetch join requests' });
  }
};

export const reviewJoinRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = req.user!.userId;
    const { status, role } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const joinRequest = await prisma.classroomJoinRequest.findUnique({
      where: { id: requestId },
      include: { Classroom: true }
    });

    if (!joinRequest) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    const member = await prisma.classroomMember.findFirst({
      where: { 
        classroomId: joinRequest.classroomId, 
        userId, 
        role: 'TEACHER' 
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'Only teachers can review join requests' });
    }

    if (joinRequest.status !== 'PENDING') {
      return res.status(400).json({ error: 'Join request already reviewed' });
    }

    await prisma.classroomJoinRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewedBy: userId,
        reviewedAt: new Date(),
        updatedAt: new Date()
      }
    });

    if (status === 'APPROVED') {
      await prisma.classroomMember.create({
        data: {
          classroomId: joinRequest.classroomId,
          userId: joinRequest.userId,
          role: role || 'STUDENT'
        }
      });
    }

    return res.json({ message: `Join request ${status.toLowerCase()}` });
  } catch (error) {
    console.error('Review join request error:', error);
    return res.status(500).json({ error: 'Failed to review join request' });
  }
};

export const updateMemberRole = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId, memberId } = req.params;
    const userId = req.user!.userId;
    const { role } = req.body;

    if (!['STUDENT', 'PRESIDENT', 'MODERATOR', 'TA'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const teacherMember = await prisma.classroomMember.findFirst({
      where: { classroomId, userId, role: 'TEACHER' }
    });

    if (!teacherMember) {
      return res.status(403).json({ error: 'Only teachers can update member roles' });
    }

    const member = await prisma.classroomMember.findUnique({
      where: { id: memberId }
    });

    if (!member || member.classroomId !== classroomId) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (member.role === 'TEACHER') {
      return res.status(400).json({ error: 'Cannot change teacher role' });
    }

    const updatedMember = await prisma.classroomMember.update({
      where: { id: memberId },
      data: { role },
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

    return res.json(updatedMember);
  } catch (error) {
    console.error('Update member role error:', error);
    return res.status(500).json({ error: 'Failed to update member role' });
  }
};

export const updateClassroomInfo = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId } = req.params;
    const userId = req.user!.userId;
    const { name, section, sections, description } = req.body;

    const member = await prisma.classroomMember.findFirst({
      where: { classroomId, userId, role: 'TEACHER' }
    });

    if (!member) {
      return res.status(403).json({ error: 'Only teachers can update classroom info' });
    }

    const classroom = await prisma.classroom.update({
      where: { id: classroomId },
      data: {
        name,
        section: sections,
        description,
        updatedAt: new Date()
      }
    });

    return res.json(classroom);
  } catch (error) {
    console.error('Update classroom info error:', error);
    return res.status(500).json({ error: 'Failed to update classroom info' });
  }
};
