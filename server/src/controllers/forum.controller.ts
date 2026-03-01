// Forum Controller - Production-Ready Implementation with RBAC
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import slugify from 'slugify';
import { NotificationService, NotificationType } from '../services/notification.service';

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateSlug = (title: string): string => {
  const baseSlug = slugify(title, { lower: true, strict: true });
  const uniqueSuffix = Date.now().toString(36);
  return `${baseSlug}-${uniqueSuffix}`;
};

const checkCommunityAccess = async (
  userId: string,
  communityId: string
): Promise<{ hasAccess: boolean; membership: any; community: any }> => {
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      Members: {
        where: { userId },
      },
    },
  });

  if (!community) {
    return { hasAccess: false, membership: null, community: null };
  }

  const membership = community.Members[0] || null;

  // Public communities are viewable by all
  if (community.visibility === 'PUBLIC') {
    return { hasAccess: true, membership, community };
  }

  // Private/Hidden communities require membership
  if (!membership || membership.bannedAt) {
    return { hasAccess: false, membership: null, community };
  }

  return { hasAccess: true, membership, community };
};

const checkPostPermission = async (
  userId: string,
  communityId: string | null,
  action: 'post' | 'comment' | 'react' | 'share' | 'moderate' | 'pin'
): Promise<boolean> => {
  // Global forum posts (no community) - all authenticated users can post
  if (!communityId) {
    return true;
  }

  const membership = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: { communityId, userId },
    },
  });

  if (!membership || membership.bannedAt) {
    return false;
  }

  // Check if user is muted
  if (membership.mutedUntil && membership.mutedUntil > new Date()) {
    return false;
  }

  // Get community permissions for this role
  const permission = await prisma.communityPermission.findUnique({
    where: {
      communityId_role: { communityId, role: membership.role },
    },
  });

  // If no specific permissions set, use role-based defaults
  if (!permission) {
    const roleDefaults: Record<string, Record<string, boolean>> = {
      OWNER: { post: true, comment: true, react: true, share: true, moderate: true, pin: true },
      ADMIN: { post: true, comment: true, react: true, share: true, moderate: true, pin: true },
      MODERATOR: { post: true, comment: true, react: true, share: true, moderate: true, pin: false },
      MEMBER: { post: true, comment: true, react: true, share: true, moderate: false, pin: false },
    };
    return roleDefaults[membership.role]?.[action] ?? false;
  }

  const permissionMap: Record<string, keyof typeof permission> = {
    post: 'canPost',
    comment: 'canComment',
    react: 'canReact',
    share: 'canShare',
    moderate: 'canModerate',
    pin: 'canPinPosts',
  };

  return permission[permissionMap[action]] as boolean;
};

// ============================================
// FORUM POSTS
// ============================================

export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      communityId,
      categoryId,
      type,
      search,
      sort = 'latest',
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 50);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      status: 'PUBLISHED',
    };

    if (communityId) {
      // Check community access
      if (userId) {
        const { hasAccess } = await checkCommunityAccess(userId, communityId as string);
        if (!hasAccess) {
          return res.status(403).json({ error: 'Access denied to this community' });
        }
      } else {
        // Anonymous users can only see public community posts
        const community = await prisma.community.findUnique({
          where: { id: communityId as string },
        });
        if (!community || community.visibility !== 'PUBLIC') {
          return res.status(403).json({ error: 'Access denied to this community' });
        }
      }
      where.communityId = communityId;
    } else {
      // Global feed - only show public posts and posts from user's communities
      if (userId) {
        const userCommunities = await prisma.communityMember.findMany({
          where: { userId, bannedAt: null },
          select: { communityId: true },
        });
        const communityIds = userCommunities.map((m) => m.communityId);

        where.OR = [
          { communityId: null, visibility: 'PUBLIC' },
          { communityId: { in: communityIds } },
          { visibility: 'PUBLIC' },
        ];
      } else {
        where.visibility = 'PUBLIC';
        where.communityId = null;
      }
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { tags: { hasSome: [(search as string).toLowerCase()] } },
      ];
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'popular':
        orderBy = { likeCount: 'desc' };
        break;
      case 'trending':
        orderBy = [{ viewCount: 'desc' }, { likeCount: 'desc' }];
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'comments':
        orderBy = { commentCount: 'desc' };
        break;
    }

    const [posts, total] = await Promise.all([
      prisma.forumPost.findMany({
        where,
        include: {
          Author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
            },
          },
          Community: {
            select: {
              id: true,
              name: true,
              slug: true,
              avatar: true,
            },
          },
          Category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              color: true,
            },
          },
          Media: {
            take: 4,
            orderBy: { order: 'asc' },
          },
          _count: {
            select: {
              Comments: true,
              Reactions: true,
            },
          },
          Reactions: userId
            ? {
                where: { userId },
                select: { type: true },
              }
            : false,
          Bookmarks: userId
            ? {
                where: { userId },
                select: { id: true },
              }
            : false,
        },
        orderBy: [{ isPinned: 'desc' }, orderBy].flat(),
        skip,
        take: limitNum,
      }),
      prisma.forumPost.count({ where }),
    ]);

    // Transform posts for response
    const transformedPosts = posts.map((post) => ({
      ...post,
      isBookmarked: post.Bookmarks?.length > 0,
      userReaction: post.Reactions?.[0]?.type || null,
      Bookmarks: undefined,
      Reactions: undefined,
    }));

    return res.json({
      posts: transformedPosts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + posts.length < total,
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

export const getPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const post = await prisma.forumPost.findUnique({
      where: { id },
      include: {
        Author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        Community: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
            visibility: true,
          },
        },
        Category: true,
        Media: {
          orderBy: { order: 'asc' },
        },
        Poll: {
          include: {
            Options: {
              include: {
                Votes: userId
                  ? {
                      where: { userId },
                      select: { id: true },
                    }
                  : false,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: {
          select: {
            Comments: true,
            Reactions: true,
          },
        },
        Reactions: userId
          ? {
              where: { userId },
              select: { type: true },
            }
          : false,
        Bookmarks: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check access for community posts
    if (post.communityId && post.Community?.visibility !== 'PUBLIC') {
      if (!userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const { hasAccess } = await checkCommunityAccess(userId, post.communityId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied to this community' });
      }
    }

    // Increment view count
    await prisma.forumPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    // Transform poll options to include user vote status
    const transformedPost = {
      ...post,
      isBookmarked: post.Bookmarks?.length > 0,
      userReaction: post.Reactions?.[0]?.type || null,
      Poll: post.Poll
        ? {
            ...post.Poll,
            Options: post.Poll.Options.map((opt) => ({
              ...opt,
              hasVoted: opt.Votes?.length > 0,
              Votes: undefined,
            })),
          }
        : null,
      Bookmarks: undefined,
      Reactions: undefined,
    };

    return res.json({ post: transformedPost });
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({ error: 'Failed to fetch post' });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      communityId,
      categoryId,
      title,
      content,
      type = 'DISCUSSION',
      visibility = 'PUBLIC',
      tags = [],
      media = [],
      poll,
    } = req.body;

    // Validate required fields
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    // Check community permissions if posting to a community
    if (communityId) {
      const { hasAccess, membership } = await checkCommunityAccess(userId, communityId);
      if (!hasAccess || !membership) {
        return res.status(403).json({ error: 'You must be a member to post in this community' });
      }

      const canPost = await checkPostPermission(userId, communityId, 'post');
      if (!canPost) {
        return res.status(403).json({ error: 'You do not have permission to post in this community' });
      }
    }

    const slug = generateSlug(title);

    // Create post with media and poll
    const post = await prisma.forumPost.create({
      data: {
        authorId: userId,
        communityId: communityId || null,
        categoryId: categoryId || null,
        title: title.trim(),
        content: content.trim(),
        slug,
        type,
        visibility,
        tags: tags.map((t: string) => t.toLowerCase().trim()),
        publishedAt: new Date(),
        Media: media.length > 0
          ? {
              create: media.map((m: any, index: number) => ({
                type: m.type,
                url: m.url,
                thumbnailUrl: m.thumbnailUrl,
                filename: m.filename,
                mimeType: m.mimeType,
                size: m.size,
                width: m.width,
                height: m.height,
                duration: m.duration,
                caption: m.caption,
                order: index,
              })),
            }
          : undefined,
        Poll: poll
          ? {
              create: {
                question: poll.question,
                allowMultiple: poll.allowMultiple || false,
                endsAt: poll.endsAt ? new Date(poll.endsAt) : null,
                Options: {
                  create: poll.options.map((opt: string, index: number) => ({
                    text: opt,
                    order: index,
                  })),
                },
              },
            }
          : undefined,
      },
      include: {
        Author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        Community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        Category: true,
        Media: true,
        Poll: {
          include: {
            Options: true,
          },
        },
      },
    });

    // Update community post count
    if (communityId) {
      await prisma.community.update({
        where: { id: communityId },
        data: { postCount: { increment: 1 } },
      });
    }

    return res.status(201).json({ post });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { title, content, tags, visibility, categoryId } = req.body;

    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { authorId: true, communityId: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is author or has moderation rights
    const isAuthor = post.authorId === userId;
    const canModerate = post.communityId
      ? await checkPostPermission(userId, post.communityId, 'moderate')
      : false;

    if (!isAuthor && !canModerate) {
      return res.status(403).json({ error: 'You do not have permission to edit this post' });
    }

    const updatedPost = await prisma.forumPost.update({
      where: { id },
      data: {
        title: title?.trim(),
        content: content?.trim(),
        tags: tags?.map((t: string) => t.toLowerCase().trim()),
        visibility,
        categoryId,
        editedAt: new Date(),
      },
      include: {
        Author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        Media: true,
      },
    });

    return res.json({ post: updatedPost });
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json({ error: 'Failed to update post' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { authorId: true, communityId: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is author or has moderation rights
    const isAuthor = post.authorId === userId;
    const canModerate = post.communityId
      ? await checkPostPermission(userId, post.communityId, 'moderate')
      : false;

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const isAdmin = user?.role === 'ADMIN';

    if (!isAuthor && !canModerate && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to delete this post' });
    }

    await prisma.forumPost.delete({ where: { id } });

    // Update community post count
    if (post.communityId) {
      await prisma.community.update({
        where: { id: post.communityId },
        data: { postCount: { decrement: 1 } },
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
};

// ============================================
// COMMENTS
// ============================================

export const getComments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { postId } = req.params;
    const { parentId, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 50);
    const skip = (pageNum - 1) * limitNum;

    // Verify post exists and user has access
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { communityId: true, visibility: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.communityId && userId) {
      const { hasAccess } = await checkCommunityAccess(userId, post.communityId);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const where: any = {
      postId,
      status: 'VISIBLE',
      parentId: parentId ? (parentId as string) : null,
    };

    const [comments, total] = await Promise.all([
      prisma.forumComment.findMany({
        where,
        include: {
          Author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
            },
          },
          Media: true,
          _count: {
            select: {
              Replies: true,
              Reactions: true,
            },
          },
          Reactions: userId
            ? {
                where: { userId },
                select: { type: true },
              }
            : false,
        },
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'asc' }],
        skip,
        take: limitNum,
      }),
      prisma.forumComment.count({ where }),
    ]);

    const transformedComments = comments.map((comment) => ({
      ...comment,
      userReaction: comment.Reactions?.[0]?.type || null,
      Reactions: undefined,
    }));

    return res.json({
      comments: transformedComments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + comments.length < total,
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { postId } = req.params;
    const { content, parentId, media = [] } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Verify post exists and check permissions
    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { id: true, communityId: true, isLocked: true, authorId: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.isLocked) {
      return res.status(403).json({ error: 'This post is locked for comments' });
    }

    if (post.communityId) {
      const canComment = await checkPostPermission(userId, post.communityId, 'comment');
      if (!canComment) {
        return res.status(403).json({ error: 'You do not have permission to comment' });
      }
    }

    // Verify parent comment exists if replying
    if (parentId) {
      const parentComment = await prisma.forumComment.findUnique({
        where: { id: parentId },
        select: { postId: true },
      });
      if (!parentComment || parentComment.postId !== postId) {
        return res.status(400).json({ error: 'Invalid parent comment' });
      }
    }

    const comment = await prisma.forumComment.create({
      data: {
        postId,
        authorId: userId,
        parentId: parentId || null,
        content: content.trim(),
        Media: media.length > 0
          ? {
              create: media.map((m: any) => ({
                type: m.type,
                url: m.url,
                thumbnailUrl: m.thumbnailUrl,
                filename: m.filename,
                mimeType: m.mimeType,
                size: m.size,
              })),
            }
          : undefined,
      },
      include: {
        Author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        Media: true,
      },
    });

    // Update post comment count
    await prisma.forumPost.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    // Update parent reply count if this is a reply
    if (parentId) {
      await prisma.forumComment.update({
        where: { id: parentId },
        data: { replyCount: { increment: 1 } },
      });
    }

    // Notify post author about new comment (fire-and-forget)
    if (post.authorId && post.authorId !== userId) {
      const commenter = comment.Author;
      const commenterName = commenter
        ? `${commenter.firstName} ${commenter.lastName}`
        : 'Someone';

      NotificationService.notifyNewComment({
        postId,
        postAuthorId: post.authorId,
        commentAuthorId: userId,
        commentAuthorName: commenterName,
        classroomId: post.communityId || postId,
      }).catch((err: unknown) => console.error('Forum comment notification error:', err));
    }

    // Notify parent comment author about reply (fire-and-forget)
    if (parentId) {
      const parentComment = await prisma.forumComment.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });
      if (parentComment && parentComment.authorId !== userId) {
        const replier = comment.Author;
        const replierName = replier ? `${replier.firstName} ${replier.lastName}` : 'Someone';
        NotificationService.createNotification({
          userId: parentComment.authorId,
          title: '↩️ Reply to your comment',
          message: `${replierName} replied to your comment`,
          type: NotificationType.NEW_COMMENT,
          link: `/forum/posts/${postId}`,
          metadata: { postId, parentCommentId: parentId, replyId: comment.id },
        }).catch((err: unknown) => console.error('Reply notification error:', err));
      }
    }

    return res.status(201).json({ comment });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({ error: 'Failed to create comment' });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { content } = req.body;

    const comment = await prisma.forumComment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.authorId !== userId) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    const updatedComment = await prisma.forumComment.update({
      where: { id },
      data: {
        content: content.trim(),
        isEdited: true,
      },
      include: {
        Author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return res.json({ comment: updatedComment });
  } catch (error) {
    console.error('Update comment error:', error);
    return res.status(500).json({ error: 'Failed to update comment' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const comment = await prisma.forumComment.findUnique({
      where: { id },
      include: {
        Post: {
          select: { id: true, communityId: true },
        },
      },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const isAuthor = comment.authorId === userId;
    const canModerate = comment.Post.communityId
      ? await checkPostPermission(userId, comment.Post.communityId, 'moderate')
      : false;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    const isAdmin = user?.role === 'ADMIN';

    if (!isAuthor && !canModerate && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to delete this comment' });
    }

    await prisma.forumComment.delete({ where: { id } });

    // Update post comment count
    await prisma.forumPost.update({
      where: { id: comment.postId },
      data: { commentCount: { decrement: 1 } },
    });

    // Update parent reply count if this was a reply
    if (comment.parentId) {
      await prisma.forumComment.update({
        where: { id: comment.parentId },
        data: { replyCount: { decrement: 1 } },
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
};

// ============================================
// REACTIONS
// ============================================

export const reactToPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { postId } = req.params;
    const { type } = req.body;

    const validTypes = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY', 'HELPFUL', 'INSIGHTFUL'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const post = await prisma.forumPost.findUnique({
      where: { id: postId },
      select: { communityId: true, authorId: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.communityId) {
      const canReact = await checkPostPermission(userId, post.communityId, 'react');
      if (!canReact) {
        return res.status(403).json({ error: 'You do not have permission to react' });
      }
    }

    // Check if user already has this reaction
    const existingReaction = await prisma.forumPostReaction.findUnique({
      where: {
        postId_userId_type: { postId, userId, type },
      },
    });

    if (existingReaction) {
      // Remove reaction
      await prisma.forumPostReaction.delete({
        where: { id: existingReaction.id },
      });
      await prisma.forumPost.update({
        where: { id: postId },
        data: { likeCount: { decrement: 1 } },
      });
      return res.json({ action: 'removed', type });
    }

    // Add reaction
    await prisma.forumPostReaction.create({
      data: { postId, userId, type },
    });
    await prisma.forumPost.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });

    // Notify post author about the reaction (fire-and-forget, skip if reacting to own post)
    if (post.authorId && post.authorId !== userId) {
      const reactor = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });
      const reactorName = reactor ? `${reactor.firstName} ${reactor.lastName}` : 'Someone';
      const reactionEmoji: Record<string, string> = {
        LIKE: '👍', LOVE: '❤️', HAHA: '😂', WOW: '😮',
        SAD: '😢', ANGRY: '😠', HELPFUL: '🙌', INSIGHTFUL: '💡',
      };
      NotificationService.createNotification({
        userId: post.authorId,
        title: `${reactionEmoji[type] || '👍'} Reaction on your post`,
        message: `${reactorName} reacted ${type.toLowerCase()} to your post`,
        type: NotificationType.NEW_POST,
        link: `/forum/posts/${postId}`,
        metadata: { postId, reactorId: userId, reactionType: type },
      }).catch((err: unknown) => console.error('Reaction notification error:', err));
    }

    return res.json({ action: 'added', type });
  } catch (error) {
    console.error('React to post error:', error);
    return res.status(500).json({ error: 'Failed to react to post' });
  }
};

export const reactToComment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { commentId } = req.params;
    const { type } = req.body;

    const validTypes = ['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY', 'HELPFUL', 'INSIGHTFUL'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }

    const comment = await prisma.forumComment.findUnique({
      where: { id: commentId },
      include: {
        Post: { select: { communityId: true } },
      },
    });

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.Post.communityId) {
      const canReact = await checkPostPermission(userId, comment.Post.communityId, 'react');
      if (!canReact) {
        return res.status(403).json({ error: 'You do not have permission to react' });
      }
    }

    const existingReaction = await prisma.forumCommentReaction.findUnique({
      where: {
        commentId_userId_type: { commentId, userId, type },
      },
    });

    if (existingReaction) {
      await prisma.forumCommentReaction.delete({
        where: { id: existingReaction.id },
      });
      await prisma.forumComment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
      });
      return res.json({ action: 'removed', type });
    }

    await prisma.forumCommentReaction.create({
      data: { commentId, userId, type },
    });
    await prisma.forumComment.update({
      where: { id: commentId },
      data: { likeCount: { increment: 1 } },
    });

    // Notify comment author about the reaction (fire-and-forget)
    if (comment.authorId && comment.authorId !== userId) {
      const reactor = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true },
      });
      const reactorName = reactor ? `${reactor.firstName} ${reactor.lastName}` : 'Someone';
      const reactionEmoji: Record<string, string> = {
        LIKE: '👍', LOVE: '❤️', HAHA: '😂', WOW: '😮',
        SAD: '😢', ANGRY: '😠', HELPFUL: '🙌', INSIGHTFUL: '💡',
      };
      NotificationService.createNotification({
        userId: comment.authorId,
        title: `${reactionEmoji[type] || '👍'} Reaction on your comment`,
        message: `${reactorName} reacted ${type.toLowerCase()} to your comment`,
        type: NotificationType.NEW_COMMENT,
        link: `/forum/posts/${comment.postId}`,
        metadata: { commentId, reactorId: userId, reactionType: type },
      }).catch((err: unknown) => console.error('Comment reaction notification error:', err));
    }

    return res.json({ action: 'added', type });
  } catch (error) {
    console.error('React to comment error:', error);
    return res.status(500).json({ error: 'Failed to react to comment' });
  }
};

// ============================================
// BOOKMARKS
// ============================================

export const toggleBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { postId } = req.params;

    const existingBookmark = await prisma.forumBookmark.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    });

    if (existingBookmark) {
      await prisma.forumBookmark.delete({
        where: { id: existingBookmark.id },
      });
      return res.json({ bookmarked: false });
    }

    await prisma.forumBookmark.create({
      data: { postId, userId },
    });

    return res.json({ bookmarked: true });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    return res.status(500).json({ error: 'Failed to toggle bookmark' });
  }
};

export const getBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 50);
    const skip = (pageNum - 1) * limitNum;

    const [bookmarks, total] = await Promise.all([
      prisma.forumBookmark.findMany({
        where: { userId },
        include: {
          Post: {
            include: {
              Author: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
              Community: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
              Media: { take: 1 },
              _count: {
                select: {
                  Comments: true,
                  Reactions: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.forumBookmark.count({ where: { userId } }),
    ]);

    return res.json({
      bookmarks: bookmarks.map((b) => ({ ...b.Post, bookmarkedAt: b.createdAt })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
};

// ============================================
// POLLS
// ============================================

export const votePoll = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { pollId } = req.params;
    const { optionIds } = req.body;

    if (!Array.isArray(optionIds) || optionIds.length === 0) {
      return res.status(400).json({ error: 'At least one option must be selected' });
    }

    const poll = await prisma.forumPoll.findUnique({
      where: { id: pollId },
      include: {
        Post: { select: { communityId: true } },
        Options: true,
      },
    });

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }

    // Check if poll has ended
    if (poll.endsAt && poll.endsAt < new Date()) {
      return res.status(400).json({ error: 'This poll has ended' });
    }

    // Validate option IDs
    const validOptionIds = poll.Options.map((o) => o.id);
    const invalidOptions = optionIds.filter((id: string) => !validOptionIds.includes(id));
    if (invalidOptions.length > 0) {
      return res.status(400).json({ error: 'Invalid option IDs' });
    }

    // Check multiple selection
    if (!poll.allowMultiple && optionIds.length > 1) {
      return res.status(400).json({ error: 'This poll only allows single selection' });
    }

    // Remove existing votes
    const existingVotes = await prisma.forumPollVote.findMany({
      where: {
        userId,
        Option: { pollId },
      },
    });

    for (const vote of existingVotes) {
      await prisma.forumPollOption.update({
        where: { id: vote.optionId },
        data: { voteCount: { decrement: 1 } },
      });
    }

    await prisma.forumPollVote.deleteMany({
      where: {
        userId,
        Option: { pollId },
      },
    });

    // Add new votes
    for (const optionId of optionIds) {
      await prisma.forumPollVote.create({
        data: { optionId, userId },
      });
      await prisma.forumPollOption.update({
        where: { id: optionId },
        data: { voteCount: { increment: 1 } },
      });
    }

    // Return updated poll
    const updatedPoll = await prisma.forumPoll.findUnique({
      where: { id: pollId },
      include: {
        Options: {
          include: {
            Votes: {
              where: { userId },
              select: { id: true },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    return res.json({
      poll: {
        ...updatedPoll,
        Options: updatedPoll?.Options.map((opt) => ({
          ...opt,
          hasVoted: opt.Votes.length > 0,
          Votes: undefined,
        })),
      },
    });
  } catch (error) {
    console.error('Vote poll error:', error);
    return res.status(500).json({ error: 'Failed to vote' });
  }
};

// ============================================
// MODERATION
// ============================================

export const pinPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { communityId: true, isPinned: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.communityId) {
      const canPin = await checkPostPermission(userId, post.communityId, 'pin');
      if (!canPin) {
        return res.status(403).json({ error: 'You do not have permission to pin posts' });
      }
    } else {
      // Only admins can pin global posts
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only admins can pin global posts' });
      }
    }

    const updatedPost = await prisma.forumPost.update({
      where: { id },
      data: { isPinned: !post.isPinned },
    });

    return res.json({ isPinned: updatedPost.isPinned });
  } catch (error) {
    console.error('Pin post error:', error);
    return res.status(500).json({ error: 'Failed to pin post' });
  }
};

export const lockPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const post = await prisma.forumPost.findUnique({
      where: { id },
      select: { communityId: true, isLocked: true },
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.communityId) {
      const canModerate = await checkPostPermission(userId, post.communityId, 'moderate');
      if (!canModerate) {
        return res.status(403).json({ error: 'You do not have permission to lock posts' });
      }
    } else {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only admins can lock global posts' });
      }
    }

    const updatedPost = await prisma.forumPost.update({
      where: { id },
      data: { isLocked: !post.isLocked },
    });

    return res.json({ isLocked: updatedPost.isLocked });
  } catch (error) {
    console.error('Lock post error:', error);
    return res.status(500).json({ error: 'Failed to lock post' });
  }
};

export const reportContent = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { postId, commentId, reason, description } = req.body;

    if (!postId && !commentId) {
      return res.status(400).json({ error: 'Post ID or Comment ID is required' });
    }

    const validReasons = [
      'SPAM',
      'HARASSMENT',
      'HATE_SPEECH',
      'MISINFORMATION',
      'INAPPROPRIATE_CONTENT',
      'COPYRIGHT_VIOLATION',
      'OTHER',
    ];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: 'Invalid report reason' });
    }

    const report = await prisma.forumReport.create({
      data: {
        reporterId: userId,
        postId: postId || null,
        commentId: commentId || null,
        reason,
        description: description?.trim(),
      },
    });

    return res.status(201).json({ report });
  } catch (error) {
    console.error('Report content error:', error);
    return res.status(500).json({ error: 'Failed to submit report' });
  }
};

// ============================================
// TRENDING TOPICS
// ============================================

export const getTrendingTopics = async (req: AuthRequest, res: Response) => {
  try {
    // Get posts from last 30 days for trending calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Aggregate keywords from recent posts (title + content + tags)
    const recentPosts = await prisma.forumPost.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        visibility: 'PUBLIC',
        status: 'PUBLISHED',
      },
      select: {
        title: true,
        content: true,
        tags: true,
        createdAt: true,
      },
    });

    // Extract and count keywords from posts
    const keywordCounts: Record<string, { count: number; recentCount: number }> = {};
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Common words to exclude (stop words)
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have', 'has',
      'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'can',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what',
      'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few',
      'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
      'so', 'than', 'too', 'very', 'just', 'about', 'into', 'through', 'during', 'before',
      'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once',
      'here', 'there', 'also', 'any', 'because', 'if', 'while', 'my', 'your', 'their', 'our',
      'na', 'ang', 'ng', 'sa', 'mga', 'ko', 'mo', 'niya', 'natin', 'nila', 'ako', 'ikaw',
      'siya', 'tayo', 'kayo', 'sila', 'ito', 'iyan', 'iyon', 'ay', 'si', 'ni', 'kay'
    ]);

    for (const post of recentPosts) {
      // Extract keywords from title, content, and tags
      const text = `${post.title} ${post.content} ${post.tags.join(' ')}`;
      
      // Split by non-word characters and filter
      const words = text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove punctuation
        .split(/\s+/)
        .filter(word => 
          word.length > 2 && // At least 3 characters
          !stopWords.has(word) && // Not a stop word
          !/^\d+$/.test(word) // Not just numbers
        );

      // Count each keyword
      for (const word of words) {
        if (!keywordCounts[word]) {
          keywordCounts[word] = { count: 0, recentCount: 0 };
        }
        keywordCounts[word].count++;
        if (post.createdAt >= sevenDaysAgo) {
          keywordCounts[word].recentCount++;
        }
      }
    }

    // Sort by count and determine trend
    const topics = Object.entries(keywordCounts)
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        trend: data.recentCount > data.count * 0.5 ? 'up' as const : 
               data.count === data.recentCount ? 'new' as const : 'stable' as const,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get popular courses being discussed
    // Search for course mentions in post content and titles
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      select: { id: true, title: true },
      take: 20,
    });

    const courseMentions: { id: string; title: string; mentionCount: number }[] = [];

    for (const course of courses) {
      // Count how many posts mention this course
      const mentionCount = await prisma.forumPost.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          visibility: 'PUBLIC',
          OR: [
            { title: { contains: course.title, mode: 'insensitive' } },
            { content: { contains: course.title, mode: 'insensitive' } },
            { tags: { hasSome: [course.title.toLowerCase()] } },
          ],
        },
      });

      if (mentionCount > 0) {
        courseMentions.push({
          id: course.id,
          title: course.title,
          mentionCount,
        });
      }
    }

    // Sort courses by mention count
    const popularCourses = courseMentions
      .sort((a, b) => b.mentionCount - a.mentionCount)
      .slice(0, 5);

    return res.json({
      topics,
      courses: popularCourses,
    });
  } catch (error) {
    console.error('Get trending topics error:', error);
    return res.status(500).json({ error: 'Failed to fetch trending topics' });
  }
};

// ============================================
// CATEGORIES
// ============================================

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const { communityId } = req.query;

    const categories = await prisma.forumCategory.findMany({
      where: {
        communityId: communityId ? (communityId as string) : null,
      },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { Posts: true },
        },
      },
    });

    return res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
