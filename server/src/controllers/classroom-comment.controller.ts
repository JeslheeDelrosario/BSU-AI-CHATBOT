// server/src/controllers/classroom-comment.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { NotificationService } from '../services/notification.service';

// Get comments for a post
export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.userId;

    // Verify user is a member
    const post = await prisma.classroomPost.findUnique({
      where: { id: postId },
      include: {
        Classroom: {
          include: {
            ClassroomMembers: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!post || !post.Classroom.ClassroomMembers.length) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const userRole = post.Classroom.ClassroomMembers[0].role;

    const comments = await prisma.classroomComment.findMany({
      where: {
        postId,
        parentId: null,
        // Students can only see public comments and their own private comments
        OR: userRole === 'TEACHER' ? undefined : [
          { isPrivate: false },
          { authorId: userId, isPrivate: true }
        ]
      },
      include: {
        Author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true
          }
        },
        Replies: {
          include: {
            Author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true
              }
            },
            _count: {
              select: { Reactions: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            Replies: true,
            Reactions: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Create comment
export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const { postId } = req.params;
    const userId = req.user!.userId;
    const { content, parentId, attachments, isPrivate } = req.body;

    // Verify user is a member
    const post = await prisma.classroomPost.findUnique({
      where: { id: postId },
      include: {
        Classroom: {
          include: {
            ClassroomMembers: {
              where: { userId }
            }
          }
        }
      }
    });

    if (!post || !post.Classroom.ClassroomMembers.length) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only teachers can create private comments
    const userRole = post.Classroom.ClassroomMembers[0].role;
    if (isPrivate && userRole !== 'TEACHER') {
      return res.status(403).json({ error: 'Only teachers can create private comments' });
    }

    const comment = await prisma.classroomComment.create({
      data: {
        postId,
        authorId: userId,
        content,
        parentId,
        attachments: attachments || [],
        isPrivate: isPrivate || false,
        updatedAt: new Date()
      },
      include: {
        Author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true
          }
        }
      }
    });

    // Notify post author about new comment (if not commenting on own post)
    if (!isPrivate && post.authorId !== userId) {
      const author = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true }
      });
      
      if (author) {
        NotificationService.notifyNewComment({
          postId,
          postAuthorId: post.authorId,
          commentAuthorId: userId,
          commentAuthorName: `${author.firstName} ${author.lastName}`,
          classroomId: post.Classroom.id
        }).catch(err => console.error('Failed to send notification:', err));
      }
    }

    return res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({ error: 'Failed to create comment' });
  }
};

// Update comment
export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { content, attachments } = req.body;

    const comment = await prisma.classroomComment.findUnique({
      where: { id }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Only author can update
    if (comment.authorId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedComment = await prisma.classroomComment.update({
      where: { id },
      data: {
        content,
        attachments,
        updatedAt: new Date()
      }
    });

    return res.json(updatedComment);
  } catch (error) {
    console.error('Update comment error:', error);
    return res.status(500).json({ error: 'Failed to update comment' });
  }
};

// Delete comment
export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const comment = await prisma.classroomComment.findUnique({
      where: { id },
      include: {
        Post: {
          include: {
            Classroom: {
              include: {
                ClassroomMembers: {
                  where: { userId }
                }
              }
            }
          }
        }
      }
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Author or teacher can delete
    const member = comment.Post.Classroom.ClassroomMembers[0];
    if (comment.authorId !== userId && member?.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.classroomComment.delete({ where: { id } });

    return res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// Add reaction to comment
export const addCommentReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { emoji } = req.body;

    // Verify user is a member
    const comment = await prisma.classroomComment.findUnique({
      where: { id },
      include: {
        Post: {
          include: {
            Classroom: {
              include: {
                ClassroomMembers: {
                  where: { userId }
                }
              }
            }
          }
        }
      }
    });

    if (!comment || !comment.Post.Classroom.ClassroomMembers.length) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if reaction already exists
    const existing = await prisma.commentReaction.findFirst({
      where: { commentId: id, userId, emoji }
    });

    if (existing) {
      // Remove reaction
      await prisma.commentReaction.delete({ where: { id: existing.id } });
      return res.json({ message: 'Reaction removed' });
    }

    // Add reaction
    const reaction = await prisma.commentReaction.create({
      data: {
        commentId: id,
        userId,
        emoji
      }
    });

    return res.status(201).json(reaction);
  } catch (error) {
    console.error('Add comment reaction error:', error);
    return res.status(500).json({ error: 'Failed to add reaction' });
  }
};
