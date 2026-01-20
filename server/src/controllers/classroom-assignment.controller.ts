// server/src/controllers/classroom-assignment.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// Submit assignment
export const submitAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user!.userId;
    const { content, attachments } = req.body;

    // Verify assignment exists and user is a member
    const assignment = await prisma.classroomPost.findUnique({
      where: { id: assignmentId, type: 'ASSIGNMENT' },
      include: {
        Classroom: {
          include: {
            ClassroomMembers: {
              where: { userId, role: 'STUDENT' }
            }
          }
        }
      }
    });

    if (!assignment || !assignment.Classroom.ClassroomMembers.length) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if late
    const now = new Date();
    const isLate = assignment.dueDate ? now > assignment.dueDate : false;

    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({ error: 'Late submissions not allowed' });
    }

    // Check if submission already exists
    const existing = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: userId
        }
      }
    });

    let submission;
    if (existing) {
      // Update existing submission
      if (existing.status === 'GRADED' || existing.status === 'RETURNED') {
        return res.status(400).json({ error: 'Cannot update graded submission' });
      }

      submission = await prisma.assignmentSubmission.update({
        where: { id: existing.id },
        data: {
          content,
          attachments: attachments || [],
          status: 'SUBMITTED',
          submittedAt: new Date(),
          isLate,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new submission
      submission = await prisma.assignmentSubmission.create({
        data: {
          assignmentId,
          studentId: userId,
          content,
          attachments: attachments || [],
          status: 'SUBMITTED',
          submittedAt: new Date(),
          isLate,
          updatedAt: new Date()
        }
      });
    }

    return res.json(submission);
  } catch (error) {
    console.error('Submit assignment error:', error);
    return res.status(500).json({ error: 'Failed to submit assignment' });
  }
};

// Get student's submission
export const getMySubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user!.userId;

    const submission = await prisma.assignmentSubmission.findUnique({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: userId
        }
      },
      include: {
        Assignment: {
          select: {
            title: true,
            dueDate: true,
            points: true
          }
        }
      }
    });

    return res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    return res.status(500).json({ error: 'Failed to fetch submission' });
  }
};

// Get all submissions for an assignment (teacher only)
export const getAssignmentSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user!.userId;
    const { status } = req.query;

    // Verify user is a teacher
    const assignment = await prisma.classroomPost.findUnique({
      where: { id: assignmentId },
      include: {
        Classroom: {
          include: {
            ClassroomMembers: {
              where: { userId, role: 'TEACHER' }
            }
          }
        }
      }
    });

    if (!assignment || !assignment.Classroom.ClassroomMembers.length) {
      return res.status(403).json({ error: 'Only teachers can view all submissions' });
    }

    const where: any = { assignmentId };
    if (status) {
      where.status = status;
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where,
      include: {
        Student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    return res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    return res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

// Grade submission (teacher only)
export const gradeSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { grade, feedback } = req.body;

    // Verify user is a teacher
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id },
      include: {
        Assignment: {
          include: {
            Classroom: {
              include: {
                ClassroomMembers: {
                  where: { userId, role: 'TEACHER' }
                }
              }
            }
          }
        }
      }
    });

    if (!submission || !submission.Assignment.Classroom.ClassroomMembers.length) {
      return res.status(403).json({ error: 'Only teachers can grade submissions' });
    }

    // Validate grade
    if (grade !== null && submission.Assignment.points) {
      if (grade < 0 || grade > submission.Assignment.points) {
        return res.status(400).json({ 
          error: `Grade must be between 0 and ${submission.Assignment.points}` 
        });
      }
    }

    const graded = await prisma.assignmentSubmission.update({
      where: { id },
      data: {
        grade,
        feedback,
        status: 'GRADED',
        updatedAt: new Date()
      },
      include: {
        Student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return res.json(graded);
  } catch (error) {
    console.error('Grade submission error:', error);
    return res.status(500).json({ error: 'Failed to grade submission' });
  }
};

// Return submission to student (teacher only)
export const returnSubmission = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Verify user is a teacher
    const submission = await prisma.assignmentSubmission.findUnique({
      where: { id },
      include: {
        Assignment: {
          include: {
            Classroom: {
              include: {
                ClassroomMembers: {
                  where: { userId, role: 'TEACHER' }
                }
              }
            }
          }
        }
      }
    });

    if (!submission || !submission.Assignment.Classroom.ClassroomMembers.length) {
      return res.status(403).json({ error: 'Only teachers can return submissions' });
    }

    if (submission.status !== 'GRADED') {
      return res.status(400).json({ error: 'Submission must be graded first' });
    }

    const returned = await prisma.assignmentSubmission.update({
      where: { id },
      data: {
        status: 'RETURNED',
        updatedAt: new Date()
      }
    });

    return res.json(returned);
  } catch (error) {
    console.error('Return submission error:', error);
    return res.status(500).json({ error: 'Failed to return submission' });
  }
};
