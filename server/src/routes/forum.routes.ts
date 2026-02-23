// Forum Routes - Production-Ready with RBAC
import { Router, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import * as forumController from '../controllers/forum.controller';
import * as communityController from '../controllers/community.controller';

// Optional auth middleware - allows unauthenticated access but attaches user if token present
const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as {
      userId: string;
      email: string;
      role: string;
    };
    req.user = {
      id: decoded.userId,
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    // Invalid token - continue without user
  }
  next();
};

const router = Router();

// ============================================
// FORUM POSTS
// ============================================

// Public routes (optional auth for personalized content)
router.get('/trending', forumController.getTrendingTopics);
router.get('/posts', optionalAuth, forumController.getPosts);
router.get('/posts/:id', optionalAuth, forumController.getPost);
router.get('/categories', forumController.getCategories);

// Protected routes
router.post('/posts', authenticateToken, forumController.createPost);
router.put('/posts/:id', authenticateToken, forumController.updatePost);
router.delete('/posts/:id', authenticateToken, forumController.deletePost);

// Post interactions
router.post('/posts/:postId/react', authenticateToken, forumController.reactToPost);
router.post('/posts/:postId/bookmark', authenticateToken, forumController.toggleBookmark);
router.get('/bookmarks', authenticateToken, forumController.getBookmarks);

// Post moderation
router.post('/posts/:id/pin', authenticateToken, forumController.pinPost);
router.post('/posts/:id/lock', authenticateToken, forumController.lockPost);

// ============================================
// COMMENTS
// ============================================

router.get('/posts/:postId/comments', optionalAuth, forumController.getComments);
router.post('/posts/:postId/comments', authenticateToken, forumController.createComment);
router.put('/comments/:id', authenticateToken, forumController.updateComment);
router.delete('/comments/:id', authenticateToken, forumController.deleteComment);
router.post('/comments/:commentId/react', authenticateToken, forumController.reactToComment);

// ============================================
// POLLS
// ============================================

router.post('/polls/:pollId/vote', authenticateToken, forumController.votePoll);

// ============================================
// REPORTS
// ============================================

router.post('/reports', authenticateToken, forumController.reportContent);

// ============================================
// COMMUNITIES
// ============================================

// Public routes
router.get('/communities', optionalAuth, communityController.getCommunities);
router.get('/communities/:idOrSlug', optionalAuth, communityController.getCommunity);

// Protected routes
router.post('/communities', authenticateToken, communityController.createCommunity);
router.put('/communities/:id', authenticateToken, communityController.updateCommunity);
router.delete('/communities/:id', authenticateToken, communityController.deleteCommunity);

// Membership
router.post('/communities/:id/join', authenticateToken, communityController.joinCommunity);
router.post('/communities/:id/leave', authenticateToken, communityController.leaveCommunity);
router.get('/communities/:id/members', optionalAuth, communityController.getMembers);
router.put('/communities/:id/members/:memberId/role', authenticateToken, communityController.updateMemberRole);
router.delete('/communities/:id/members/:memberId', authenticateToken, communityController.removeMember);

// Join requests
router.get('/communities/:id/join-requests', authenticateToken, communityController.getJoinRequests);
router.post('/communities/:id/join-requests/:requestId/review', authenticateToken, communityController.reviewJoinRequest);

// Invitations
router.get('/invitations', authenticateToken, communityController.getUserInvitations);
router.post('/communities/:id/invitations', authenticateToken, communityController.createInvitation);
router.get('/communities/:id/invitations/search-users', authenticateToken, communityController.searchUsersToInvite);
router.post('/invitations/:token/accept', authenticateToken, communityController.acceptInvitation);
router.post('/invitations/:token/decline', authenticateToken, communityController.rejectInvitation);

// Permissions
router.get('/communities/:id/permissions', authenticateToken, communityController.getPermissions);
router.put('/communities/:id/permissions', authenticateToken, communityController.updatePermissions);

export default router;
