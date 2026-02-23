// Community Controller - Production-Ready Implementation with RBAC
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';
import slugify from 'slugify';

// ============================================
// HELPER FUNCTIONS
// ============================================

const generateSlug = (name: string): string => {
  const baseSlug = slugify(name, { lower: true, strict: true });
  const uniqueSuffix = Date.now().toString(36);
  return `${baseSlug}-${uniqueSuffix}`;
};

const getMemberRole = async (userId: string, communityId: string) => {
  const member = await prisma.communityMember.findUnique({
    where: {
      communityId_userId: { communityId, userId },
    },
  });
  return member?.role || null;
};

const hasPermission = (role: string | null, requiredRoles: string[]): boolean => {
  if (!role) return false;
  return requiredRoles.includes(role);
};

// ============================================
// COMMUNITIES CRUD
// ============================================

export const getCommunities = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      search,
      filter = 'all', // all, joined, created, discover
      sort = 'popular',
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 50);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {
      isArchived: false,
    };

    // Filter by membership
    if (filter === 'joined' && userId) {
      where.Members = {
        some: { userId, bannedAt: null },
      };
    } else if (filter === 'created' && userId) {
      where.creatorId = userId;
    } else if (filter === 'discover') {
      // Show public communities user hasn't joined
      where.visibility = 'PUBLIC';
      if (userId) {
        where.NOT = {
          Members: {
            some: { userId },
          },
        };
      }
    } else {
      // All - show public + user's private communities
      if (userId) {
        where.OR = [
          { visibility: 'PUBLIC' },
          { Members: { some: { userId, bannedAt: null } } },
        ];
      } else {
        where.visibility = 'PUBLIC';
      }
    }

    // Search
    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } },
            { tags: { hasSome: [(search as string).toLowerCase()] } },
          ],
        },
      ];
    }

    // Build orderBy
    let orderBy: any = { memberCount: 'desc' };
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'active':
        orderBy = { postCount: 'desc' };
        break;
      case 'alphabetical':
        orderBy = { name: 'asc' };
        break;
    }

    const [communities, total] = await Promise.all([
      prisma.community.findMany({
        where,
        include: {
          Creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          Members: userId
            ? {
                where: { userId },
                select: { role: true, joinedAt: true },
              }
            : false,
          _count: {
            select: {
              Members: true,
              Posts: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.community.count({ where }),
    ]);

    // Transform communities
    const transformedCommunities = communities.map((community) => ({
      ...community,
      isMember: community.Members?.length > 0,
      userRole: community.Members?.[0]?.role || null,
      joinedAt: community.Members?.[0]?.joinedAt || null,
      Members: undefined,
    }));

    return res.json({
      communities: transformedCommunities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: skip + communities.length < total,
      },
    });
  } catch (error) {
    console.error('Get communities error:', error);
    return res.status(500).json({ error: 'Failed to fetch communities' });
  }
};

export const getCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { idOrSlug } = req.params;

    const community = await prisma.community.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        Creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        Members: userId
          ? {
              where: { userId },
              select: { role: true, joinedAt: true, mutedUntil: true, bannedAt: true },
            }
          : false,
        Categories: {
          orderBy: { order: 'asc' },
        },
        Permissions: true,
        _count: {
          select: {
            Members: true,
            Posts: true,
          },
        },
      },
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check access for hidden communities
    if (community.visibility === 'HIDDEN') {
      const isMember = community.Members?.length > 0 && !community.Members[0].bannedAt;
      if (!isMember) {
        return res.status(404).json({ error: 'Community not found' });
      }
    }

    // Check access for private communities
    if (community.visibility === 'PRIVATE') {
      const isMember = community.Members?.length > 0 && !community.Members[0].bannedAt;
      if (!isMember) {
        // Return limited info for non-members
        return res.json({
          community: {
            id: community.id,
            name: community.name,
            slug: community.slug,
            description: community.description,
            avatar: community.avatar,
            coverImage: community.coverImage,
            visibility: community.visibility,
            joinPolicy: community.joinPolicy,
            memberCount: community._count.Members,
            isMember: false,
            isPrivate: true,
          },
        });
      }
    }

    const transformedCommunity = {
      ...community,
      isMember: community.Members?.length > 0,
      userRole: community.Members?.[0]?.role || null,
      joinedAt: community.Members?.[0]?.joinedAt || null,
      isMuted: community.Members?.[0]?.mutedUntil
        ? community.Members[0].mutedUntil > new Date()
        : false,
      isBanned: !!community.Members?.[0]?.bannedAt,
      Members: undefined,
    };

    return res.json({ community: transformedCommunity });
  } catch (error) {
    console.error('Get community error:', error);
    return res.status(500).json({ error: 'Failed to fetch community' });
  }
};

export const createCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name,
      description,
      visibility = 'PUBLIC',
      joinPolicy = 'OPEN',
      tags = [],
      guidelines,
      avatar,
      coverImage,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({ error: 'Community name is required' });
    }

    const slug = generateSlug(name);

    // Create community with owner as first member
    const community = await prisma.community.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim(),
        visibility,
        joinPolicy,
        tags: tags.map((t: string) => t.toLowerCase().trim()),
        guidelines: guidelines?.trim(),
        avatar,
        coverImage,
        creatorId: userId,
        memberCount: 1,
        Members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
        // Create default permissions for each role
        Permissions: {
          create: [
            {
              role: 'OWNER',
              canPost: true,
              canComment: true,
              canReact: true,
              canShare: true,
              canUploadMedia: true,
              canCreatePolls: true,
              canPinPosts: true,
              canModerate: true,
              canInvite: true,
              canManageMembers: true,
              canEditSettings: true,
            },
            {
              role: 'ADMIN',
              canPost: true,
              canComment: true,
              canReact: true,
              canShare: true,
              canUploadMedia: true,
              canCreatePolls: true,
              canPinPosts: true,
              canModerate: true,
              canInvite: true,
              canManageMembers: true,
              canEditSettings: false,
            },
            {
              role: 'MODERATOR',
              canPost: true,
              canComment: true,
              canReact: true,
              canShare: true,
              canUploadMedia: true,
              canCreatePolls: false,
              canPinPosts: false,
              canModerate: true,
              canInvite: true,
              canManageMembers: false,
              canEditSettings: false,
            },
            {
              role: 'MEMBER',
              canPost: true,
              canComment: true,
              canReact: true,
              canShare: true,
              canUploadMedia: true,
              canCreatePolls: false,
              canPinPosts: false,
              canModerate: false,
              canInvite: false,
              canManageMembers: false,
              canEditSettings: false,
            },
          ],
        },
      },
      include: {
        Creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            Members: true,
          },
        },
      },
    });

    return res.status(201).json({
      community: {
        ...community,
        isMember: true,
        userRole: 'OWNER',
      },
    });
  } catch (error) {
    console.error('Create community error:', error);
    return res.status(500).json({ error: 'Failed to create community' });
  }
};

export const updateCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const {
      name,
      description,
      visibility,
      joinPolicy,
      tags,
      guidelines,
      avatar,
      coverImage,
    } = req.body;

    // Check permissions
    const role = await getMemberRole(userId, id);
    if (!hasPermission(role, ['OWNER', 'ADMIN'])) {
      return res.status(403).json({ error: 'You do not have permission to edit this community' });
    }

    // Only owner can change visibility
    if (visibility && role !== 'OWNER') {
      return res.status(403).json({ error: 'Only the owner can change visibility settings' });
    }

    const community = await prisma.community.update({
      where: { id },
      data: {
        name: name?.trim(),
        description: description?.trim(),
        visibility,
        joinPolicy,
        tags: tags?.map((t: string) => t.toLowerCase().trim()),
        guidelines: guidelines?.trim(),
        avatar,
        coverImage,
      },
      include: {
        Creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            Members: true,
            Posts: true,
          },
        },
      },
    });

    return res.json({ community });
  } catch (error) {
    console.error('Update community error:', error);
    return res.status(500).json({ error: 'Failed to update community' });
  }
};

export const deleteCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Only owner can delete
    const role = await getMemberRole(userId, id);
    if (role !== 'OWNER') {
      // Check if user is system admin
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });
      if (user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only the owner can delete this community' });
      }
    }

    await prisma.community.delete({ where: { id } });

    return res.json({ success: true });
  } catch (error) {
    console.error('Delete community error:', error);
    return res.status(500).json({ error: 'Failed to delete community' });
  }
};

// ============================================
// MEMBERSHIP
// ============================================

export const joinCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { message } = req.body;

    const community = await prisma.community.findUnique({
      where: { id },
      select: { joinPolicy: true, visibility: true },
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId: id, userId },
      },
    });

    if (existingMember) {
      if (existingMember.bannedAt) {
        return res.status(403).json({ error: 'You are banned from this community' });
      }
      return res.status(400).json({ error: 'You are already a member of this community' });
    }

    // Handle based on join policy
    if (community.joinPolicy === 'INVITE_ONLY') {
      return res.status(403).json({ error: 'This community is invite-only' });
    }

    if (community.joinPolicy === 'APPROVAL') {
      // Check for existing pending request
      const existingRequest = await prisma.communityJoinRequest.findUnique({
        where: {
          communityId_userId: { communityId: id, userId },
        },
      });

      if (existingRequest) {
        if (existingRequest.status === 'PENDING') {
          return res.status(400).json({ error: 'You already have a pending join request' });
        }
        if (existingRequest.status === 'REJECTED') {
          // Allow re-request after rejection
          await prisma.communityJoinRequest.update({
            where: { id: existingRequest.id },
            data: {
              status: 'PENDING',
              message: message?.trim(),
              reviewedBy: null,
              reviewedAt: null,
              reviewNote: null,
            },
          });
          return res.json({ status: 'pending', message: 'Join request submitted' });
        }
      }

      // Create join request
      await prisma.communityJoinRequest.create({
        data: {
          communityId: id,
          userId,
          message: message?.trim(),
        },
      });

      return res.json({ status: 'pending', message: 'Join request submitted for approval' });
    }

    // Open join policy - add member directly
    await prisma.communityMember.create({
      data: {
        communityId: id,
        userId,
        role: 'MEMBER',
      },
    });

    // Update member count
    await prisma.community.update({
      where: { id },
      data: { memberCount: { increment: 1 } },
    });

    return res.json({ status: 'joined', message: 'Successfully joined the community' });
  } catch (error) {
    console.error('Join community error:', error);
    return res.status(500).json({ error: 'Failed to join community' });
  }
};

export const leaveCommunity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const member = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId: id, userId },
      },
    });

    if (!member) {
      return res.status(400).json({ error: 'You are not a member of this community' });
    }

    // Owner cannot leave - must transfer ownership first
    if (member.role === 'OWNER') {
      return res.status(400).json({
        error: 'Owners cannot leave. Transfer ownership first or delete the community.',
      });
    }

    await prisma.communityMember.delete({
      where: { id: member.id },
    });

    // Update member count
    await prisma.community.update({
      where: { id },
      data: { memberCount: { decrement: 1 } },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Leave community error:', error);
    return res.status(500).json({ error: 'Failed to leave community' });
  }
};

export const getMembers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { role, search, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 50);
    const skip = (pageNum - 1) * limitNum;

    // Check if user has access to view members
    const community = await prisma.community.findUnique({
      where: { id },
      select: { visibility: true },
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    if (community.visibility !== 'PUBLIC' && userId) {
      const isMember = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: { communityId: id, userId },
        },
      });
      if (!isMember || isMember.bannedAt) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const where: any = {
      communityId: id,
      bannedAt: null,
    };

    if (role) {
      where.role = role;
    }

    if (search) {
      where.User = {
        OR: [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ],
      };
    }

    const [members, total] = await Promise.all([
      prisma.communityMember.findMany({
        where,
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              role: true,
            },
          },
        },
        orderBy: [
          { role: 'asc' }, // OWNER first, then ADMIN, etc.
          { joinedAt: 'asc' },
        ],
        skip,
        take: limitNum,
      }),
      prisma.communityMember.count({ where }),
    ]);

    return res.json({
      members,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get members error:', error);
    return res.status(500).json({ error: 'Failed to fetch members' });
  }
};

export const updateMemberRole = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id, memberId } = req.params;
    const { role: newRole } = req.body;

    const validRoles = ['ADMIN', 'MODERATOR', 'MEMBER'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check permissions
    const requesterRole = await getMemberRole(userId, id);
    if (!hasPermission(requesterRole, ['OWNER', 'ADMIN'])) {
      return res.status(403).json({ error: 'You do not have permission to manage members' });
    }

    // Get target member
    const targetMember = await prisma.communityMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.communityId !== id) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Cannot change owner's role
    if (targetMember.role === 'OWNER') {
      return res.status(403).json({ error: 'Cannot change owner role' });
    }

    // Admins cannot promote to admin
    if (requesterRole === 'ADMIN' && newRole === 'ADMIN') {
      return res.status(403).json({ error: 'Only owners can promote to admin' });
    }

    const updatedMember = await prisma.communityMember.update({
      where: { id: memberId },
      data: { role: newRole },
      include: {
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return res.json({ member: updatedMember });
  } catch (error) {
    console.error('Update member role error:', error);
    return res.status(500).json({ error: 'Failed to update member role' });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id, memberId } = req.params;
    const { ban = false, reason } = req.body;

    // Check permissions
    const requesterRole = await getMemberRole(userId, id);
    if (!hasPermission(requesterRole, ['OWNER', 'ADMIN', 'MODERATOR'])) {
      return res.status(403).json({ error: 'You do not have permission to remove members' });
    }

    const targetMember = await prisma.communityMember.findUnique({
      where: { id: memberId },
    });

    if (!targetMember || targetMember.communityId !== id) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Cannot remove owner - HIGHEST AUTHORITY
    if (targetMember.role === 'OWNER') {
      return res.status(403).json({ error: 'Cannot remove the community creator/owner' });
    }

    // RBAC Hierarchy: OWNER > ADMIN > MODERATOR > MEMBER
    // Admins cannot remove other admins - only owner can
    if (requesterRole === 'ADMIN' && targetMember.role === 'ADMIN') {
      return res.status(403).json({ error: 'Admins cannot remove other admins. Only the owner can do this.' });
    }

    // Moderators can only remove regular members
    if (requesterRole === 'MODERATOR' && targetMember.role !== 'MEMBER') {
      return res.status(403).json({ error: 'Moderators can only remove regular members' });
    }

    if (ban) {
      // Ban the member
      await prisma.communityMember.update({
        where: { id: memberId },
        data: {
          bannedAt: new Date(),
          banReason: reason?.trim(),
        },
      });
    } else {
      // Remove the member
      await prisma.communityMember.delete({
        where: { id: memberId },
      });
    }

    // Update member count
    await prisma.community.update({
      where: { id },
      data: { memberCount: { decrement: 1 } },
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    return res.status(500).json({ error: 'Failed to remove member' });
  }
};

// ============================================
// JOIN REQUESTS
// ============================================

export const getJoinRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { status = 'PENDING', page = '1', limit = '20' } = req.query;

    // Check permissions
    const role = await getMemberRole(userId, id);
    if (!hasPermission(role, ['OWNER', 'ADMIN', 'MODERATOR'])) {
      return res.status(403).json({ error: 'You do not have permission to view join requests' });
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = Math.min(parseInt(limit as string, 10), 50);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      communityId: id,
    };

    if (status !== 'all') {
      where.status = status;
    }

    const [requests, total] = await Promise.all([
      prisma.communityJoinRequest.findMany({
        where,
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              email: true,
            },
          },
          Reviewer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.communityJoinRequest.count({ where }),
    ]);

    return res.json({
      requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get join requests error:', error);
    return res.status(500).json({ error: 'Failed to fetch join requests' });
  }
};

export const reviewJoinRequest = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id, requestId } = req.params;
    const { action, note } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    // Check permissions
    const role = await getMemberRole(userId, id);
    if (!hasPermission(role, ['OWNER', 'ADMIN', 'MODERATOR'])) {
      return res.status(403).json({ error: 'You do not have permission to review join requests' });
    }

    const request = await prisma.communityJoinRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.communityId !== id) {
      return res.status(404).json({ error: 'Join request not found' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'This request has already been reviewed' });
    }

    if (action === 'approve') {
      // Create membership
      await prisma.communityMember.create({
        data: {
          communityId: id,
          userId: request.userId,
          role: 'MEMBER',
        },
      });

      // Update member count
      await prisma.community.update({
        where: { id },
        data: { memberCount: { increment: 1 } },
      });
    }

    // Update request status
    await prisma.communityJoinRequest.update({
      where: { id: requestId },
      data: {
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        reviewedBy: userId,
        reviewedAt: new Date(),
        reviewNote: note?.trim(),
      },
    });

    return res.json({
      success: true,
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
    });
  } catch (error) {
    console.error('Review join request error:', error);
    return res.status(500).json({ error: 'Failed to review join request' });
  }
};

// ============================================
// INVITATIONS
// ============================================

export const createInvitation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { inviteeId, email, expiresInDays = 7 } = req.body;

    if (!inviteeId && !email) {
      return res.status(400).json({ error: 'Invitee ID or email is required' });
    }

    // Get community details
    const community = await prisma.community.findUnique({
      where: { id },
      select: { visibility: true, name: true, slug: true },
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Get requester's role
    const requesterRole = await getMemberRole(userId, id);

    // PRIVATE COMMUNITY RESTRICTION: Only admins/owners can invite in private communities
    if (community.visibility === 'PRIVATE' || community.visibility === 'HIDDEN') {
      if (!hasPermission(requesterRole, ['OWNER', 'ADMIN'])) {
        return res.status(403).json({ 
          error: 'Only admins and owners can invite members to private communities' 
        });
      }
    }

    // Check permissions for public communities
    const permission = await prisma.communityPermission.findUnique({
      where: {
        communityId_role: {
          communityId: id,
          role: requesterRole || 'MEMBER',
        },
      },
    });

    if (!permission?.canInvite) {
      return res.status(403).json({ error: 'You do not have permission to invite members' });
    }

    // Check if invitee is already a member
    if (inviteeId) {
      const existingMember = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: { communityId: id, userId: inviteeId },
        },
      });
      if (existingMember) {
        return res.status(400).json({ error: 'User is already a member' });
      }

      // Check for existing pending invitation
      const existingInvitation = await prisma.communityInvitation.findFirst({
        where: {
          communityId: id,
          inviteeId,
          status: 'PENDING',
        },
      });
      if (existingInvitation) {
        return res.status(400).json({ error: 'User already has a pending invitation' });
      }
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Get inviter details for notification
    const inviter = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true },
    });

    const invitation = await prisma.communityInvitation.create({
      data: {
        communityId: id,
        inviterId: userId,
        inviteeId: inviteeId || null,
        email: email || null,
        expiresAt,
      },
      include: {
        Community: {
          select: {
            name: true,
            slug: true,
          },
        },
        Inviter: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Create notification for the invitee if they have an account
    if (inviteeId) {
      await prisma.notification.create({
        data: {
          userId: inviteeId,
          type: 'COMMUNITY_INVITE',
          title: 'Community Invitation',
          message: `${inviter?.firstName} ${inviter?.lastName} invited you to join "${community.name}"`,
          link: `/forums/c/${community.slug}`,
          metadata: {
            communityId: id,
            communityName: community.name,
            communitySlug: community.slug,
            invitationToken: invitation.token,
            inviterId: userId,
            inviterName: `${inviter?.firstName} ${inviter?.lastName}`,
          },
        },
      });
    }

    return res.status(201).json({ invitation });
  } catch (error) {
    console.error('Create invitation error:', error);
    return res.status(500).json({ error: 'Failed to create invitation' });
  }
};

export const acceptInvitation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { token } = req.params;

    const invitation = await prisma.communityInvitation.findUnique({
      where: { token },
      include: {
        Community: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({ error: 'This invitation has already been used' });
    }

    if (invitation.expiresAt < new Date()) {
      await prisma.communityInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' },
      });
      return res.status(400).json({ error: 'This invitation has expired' });
    }

    // Check if invitation is for specific user
    if (invitation.inviteeId && invitation.inviteeId !== userId) {
      return res.status(403).json({ error: 'This invitation is for a different user' });
    }

    // Check if already a member
    const existingMember = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId: invitation.communityId, userId },
      },
    });

    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this community' });
    }

    // Add member
    await prisma.communityMember.create({
      data: {
        communityId: invitation.communityId,
        userId,
        role: 'MEMBER',
      },
    });

    // Update invitation status
    await prisma.communityInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        inviteeId: userId,
      },
    });

    // Update member count
    await prisma.community.update({
      where: { id: invitation.communityId },
      data: { memberCount: { increment: 1 } },
    });

    return res.json({
      success: true,
      community: invitation.Community,
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    return res.status(500).json({ error: 'Failed to accept invitation' });
  }
};

export const rejectInvitation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { token } = req.params;

    const invitation = await prisma.communityInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found' });
    }

    if (invitation.status !== 'PENDING') {
      return res.status(400).json({ error: 'This invitation has already been processed' });
    }

    // Check if invitation is for this user
    if (invitation.inviteeId && invitation.inviteeId !== userId) {
      return res.status(403).json({ error: 'This invitation is for a different user' });
    }

    // Update invitation status to declined
    await prisma.communityInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'DECLINED',
        inviteeId: userId,
      },
    });

    return res.json({ success: true, message: 'Invitation declined' });
  } catch (error) {
    console.error('Reject invitation error:', error);
    return res.status(500).json({ error: 'Failed to reject invitation' });
  }
};

export const getUserInvitations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { status = 'PENDING' } = req.query;

    const invitations = await prisma.communityInvitation.findMany({
      where: {
        inviteeId: userId,
        status: status as 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED',
        expiresAt: { gt: new Date() },
      },
      include: {
        Community: {
          select: {
            id: true,
            name: true,
            slug: true,
            avatar: true,
            description: true,
            memberCount: true,
          },
        },
        Inviter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ invitations });
  } catch (error) {
    console.error('Get user invitations error:', error);
    return res.status(500).json({ error: 'Failed to fetch invitations' });
  }
};

export const searchUsersToInvite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { search, limit = '10' } = req.query;

    if (!search || (search as string).length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    // Check if user has permission to invite
    const community = await prisma.community.findUnique({
      where: { id },
      select: { visibility: true },
    });

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const requesterRole = await getMemberRole(userId, id);

    // For private communities, only admins/owners can search users to invite
    if (community.visibility === 'PRIVATE' || community.visibility === 'HIDDEN') {
      if (!hasPermission(requesterRole, ['OWNER', 'ADMIN'])) {
        return res.status(403).json({ error: 'Only admins can invite members to private communities' });
      }
    }

    // Get existing members and pending invitations
    const existingMembers = await prisma.communityMember.findMany({
      where: { communityId: id },
      select: { userId: true },
    });

    const pendingInvitations = await prisma.communityInvitation.findMany({
      where: { communityId: id, status: 'PENDING' },
      select: { inviteeId: true },
    });

    const excludeUserIds = [
      ...existingMembers.map(m => m.userId),
      ...pendingInvitations.filter(i => i.inviteeId).map(i => i.inviteeId!),
    ];

    // Search users
    const users = await prisma.user.findMany({
      where: {
        id: { notIn: excludeUserIds },
        OR: [
          { firstName: { contains: search as string, mode: 'insensitive' } },
          { lastName: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
      },
      take: parseInt(limit as string, 10),
    });

    return res.json({ users });
  } catch (error) {
    console.error('Search users to invite error:', error);
    return res.status(500).json({ error: 'Failed to search users' });
  }
};

// ============================================
// PERMISSIONS
// ============================================

export const updatePermissions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const { permissions } = req.body;

    // Only owner can update permissions
    const role = await getMemberRole(userId, id);
    if (role !== 'OWNER') {
      return res.status(403).json({ error: 'Only the owner can update permissions' });
    }

    // Update permissions for each role
    for (const perm of permissions) {
      await prisma.communityPermission.upsert({
        where: {
          communityId_role: { communityId: id, role: perm.role },
        },
        update: {
          canPost: perm.canPost,
          canComment: perm.canComment,
          canReact: perm.canReact,
          canShare: perm.canShare,
          canUploadMedia: perm.canUploadMedia,
          canCreatePolls: perm.canCreatePolls,
          canPinPosts: perm.canPinPosts,
          canModerate: perm.canModerate,
          canInvite: perm.canInvite,
          canManageMembers: perm.canManageMembers,
          canEditSettings: perm.canEditSettings,
        },
        create: {
          communityId: id,
          role: perm.role,
          canPost: perm.canPost ?? true,
          canComment: perm.canComment ?? true,
          canReact: perm.canReact ?? true,
          canShare: perm.canShare ?? true,
          canUploadMedia: perm.canUploadMedia ?? true,
          canCreatePolls: perm.canCreatePolls ?? false,
          canPinPosts: perm.canPinPosts ?? false,
          canModerate: perm.canModerate ?? false,
          canInvite: perm.canInvite ?? false,
          canManageMembers: perm.canManageMembers ?? false,
          canEditSettings: perm.canEditSettings ?? false,
        },
      });
    }

    // Fetch updated permissions
    const updatedPermissions = await prisma.communityPermission.findMany({
      where: { communityId: id },
    });

    return res.json({ permissions: updatedPermissions });
  } catch (error) {
    console.error('Update permissions error:', error);
    return res.status(500).json({ error: 'Failed to update permissions' });
  }
};

export const getPermissions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Check if user is admin/owner
    const role = await getMemberRole(userId, id);
    if (!hasPermission(role, ['OWNER', 'ADMIN'])) {
      return res.status(403).json({ error: 'You do not have permission to view settings' });
    }

    const permissions = await prisma.communityPermission.findMany({
      where: { communityId: id },
    });

    return res.json({ permissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    return res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};
