// server/src/routes/gamification.routes.ts
import { Router, Response, NextFunction } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import {
  getAchievementDefinitions,
  createAchievementDefinition,
  updateAchievementDefinition,
  deleteAchievementDefinition,
  getUserAchievements,
  triggerAchievementCheck,
  getUserRankProgress,
  getLeaderboardConfigs,
  createLeaderboardConfig,
  updateLeaderboardConfig,
  deleteLeaderboardConfig,
  getLeaderboard,
  getAllLeaderboards,
  getCourseSequentialProgress,
  markLessonComplete,
  seedDefaultAchievements,
} from '../controllers/gamification.controller';

const router = Router();

const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'ADMIN') {
    res.status(403).json({ error: 'Access denied - Admin only' });
    return;
  }
  next();
};

router.use(authenticateToken);

// ─── Achievement Definitions (Admin) ─────────────────────────────────────────
router.get('/achievement-definitions', getAchievementDefinitions);
router.post('/achievement-definitions', isAdmin, createAchievementDefinition);
router.put('/achievement-definitions/:id', isAdmin, updateAchievementDefinition);
router.delete('/achievement-definitions/:id', isAdmin, deleteAchievementDefinition);
router.post('/achievement-definitions/seed', isAdmin, seedDefaultAchievements);

// ─── User Achievements ────────────────────────────────────────────────────────
router.get('/achievements/me', getUserAchievements);
router.post('/achievements/check', triggerAchievementCheck);
router.get('/achievements/user/:userId', isAdmin, getUserAchievements);

// ─── Rank Progression ─────────────────────────────────────────────────────────
router.get('/rank/me', getUserRankProgress);
router.get('/rank/user/:userId', isAdmin, getUserRankProgress);

// ─── Leaderboard Configs (Admin) ──────────────────────────────────────────────
router.get('/leaderboard-configs', getLeaderboardConfigs);
router.post('/leaderboard-configs', isAdmin, createLeaderboardConfig);
router.put('/leaderboard-configs/:id', isAdmin, updateLeaderboardConfig);
router.delete('/leaderboard-configs/:id', isAdmin, deleteLeaderboardConfig);

// ─── Leaderboard Data ─────────────────────────────────────────────────────────
router.get('/leaderboards', getAllLeaderboards);
router.get('/leaderboard', getLeaderboard);

// ─── Sequential Learning ──────────────────────────────────────────────────────
router.get('/sequential/:courseId', getCourseSequentialProgress);
router.post('/sequential/lessons/:lessonId/complete', markLessonComplete);

export default router;
