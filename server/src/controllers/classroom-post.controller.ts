// server/src/controllers/classroom-post.controller.ts
import { Response } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// Get classroom stream (posts)
export const getClassroomPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId } = req.params;
    const userId = req.user!.userId;
    const { type, page = '1', limit = '20' } = req.query;

    // Verify user is a member or admin
    const member = await prisma.classroomMember.findFirst({
      where: { classroomId, userId }
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isAdmin = user?.role === 'ADMIN';

    if (!member && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = { classroomId };
    if (type && type !== 'all') {
      where.type = type;
    }

    const [posts, total] = await Promise.all([
      prisma.classroomPost.findMany({
        where,
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
          Comments: {
            include: {
              Author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true
                }
              }
            },
            orderBy: { createdAt: 'asc' },
            take: 5
          },
          _count: {
            select: {
              Comments: true,
              Reactions: true,
              Submissions: true
            }
          },
          Reactions: {
            where: { userId },
            select: { emoji: true }
          }
        },
        orderBy: [
          { isPinned: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip,
        take
      }),
      prisma.classroomPost.count({ where })
    ]);

    return res.json({
      posts,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        totalPages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Create post
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { classroomId } = req.params;
    const userId = req.user!.userId;
    const { type, title, content, attachments, dueDate, points, allowLateSubmission, visibility } = req.body;

    // Verify user has permission to post (teacher, president, vice-president, moderator)
    const member = await prisma.classroomMember.findFirst({
      where: { 
        classroomId, 
        userId,
        role: { in: ['TEACHER', 'PRESIDENT', 'VICE_PRESIDENT', 'MODERATOR'] }
      }
    });

    if (!member) {
      return res.status(403).json({ error: 'You do not have permission to create posts' });
    }

    const post = await prisma.classroomPost.create({
      data: {
        classroomId,
        authorId: userId,
        type,
        title: title || null,
        content,
        attachments: attachments || [],
        visibility: visibility || 'ALL_STUDENTS',
        dueDate: dueDate ? new Date(dueDate) : null,
        points: points ? parseInt(points) : null,
        allowLateSubmission: allowLateSubmission !== undefined ? allowLateSubmission : true,
        updatedAt: new Date()
      },
      include: {
        Author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    return res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
};

// Get single post
export const getPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const post = await prisma.classroomPost.findUnique({
      where: { id },
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
        Classroom: {
          include: {
            ClassroomMembers: {
              where: { userId },
              select: { role: true }
            }
          }
        },
        Comments: {
          include: {
            Author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            _count: {
              select: { Replies: true, Reactions: true }
            }
          },
          where: { parentId: null },
          orderBy: { createdAt: 'asc' }
        },
        Reactions: {
          include: {
            User: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        _count: {
          select: {
            Comments: true,
            Reactions: true,
            Submissions: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Verify user is a member
    if (!post.Classroom.ClassroomMembers.length) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// Update post
export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { title, content, attachments, isPinned, dueDate, points } = req.body;

    const post = await prisma.classroomPost.findUnique({
      where: { id },
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

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only author or teacher can update
    const member = post.Classroom.ClassroomMembers[0];
    if (post.authorId !== userId && member?.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedPost = await prisma.classroomPost.update({
      where: { id },
      data: {
        title,
        content,
        attachments,
        isPinned,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        points,
        updatedAt: new Date()
      }
    });

    return res.json(updatedPost);
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json({ error: 'Failed to update post' });
  }
};

// Delete post
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const post = await prisma.classroomPost.findUnique({
      where: { id },
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

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only author or teacher can delete
    const member = post.Classroom.ClassroomMembers[0];
    if (post.authorId !== userId && member?.role !== 'TEACHER') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.classroomPost.delete({ where: { id } });

    return res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
};

// Add reaction to post
export const addReaction = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { emoji } = req.body;

    // Verify user is a member
    const post = await prisma.classroomPost.findUnique({
      where: { id },
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

    // Check if reaction already exists
    const existing = await prisma.postReaction.findFirst({
      where: { postId: id, userId, emoji }
    });

    if (existing) {
      // Remove reaction
      await prisma.postReaction.delete({ where: { id: existing.id } });
      return res.json({ message: 'Reaction removed' });
    }

    // Add reaction
    const reaction = await prisma.postReaction.create({
      data: {
        postId: id,
        userId,
        emoji
      }
    });

    return res.status(201).json(reaction);
  } catch (error) {
    console.error('Add reaction error:', error);
    return res.status(500).json({ error: 'Failed to add reaction' });
  }
};
