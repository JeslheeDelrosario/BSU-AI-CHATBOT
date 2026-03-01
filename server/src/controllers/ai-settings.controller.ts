import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

const DEFAULT_SETTINGS = {
  conversationHistoryLength: 10,
  pronounResolutionEnabled: true,
  entityExtractionEnabled: true,
  contextInjectionEnabled: true,
  scopeRestrictionEnabled: true,
  scopeConfidenceThreshold: 0.8,
  cacheEnabled: true,
  cacheTTLMinutes: 60,
  maxResponseTokens: 4096,
  temperature: 0.7,
};

export const getAISettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    let settings = await prisma.aISettings.findFirst();

    if (!settings) {
      settings = await prisma.aISettings.create({
        data: DEFAULT_SETTINGS,
      });
    }

    return res.json({ settings });
  } catch (error) {
    console.error('Get AI settings error:', error);
    return res.status(500).json({ error: 'Failed to fetch AI settings' });
  }
};

export const updateAISettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const {
      conversationHistoryLength,
      pronounResolutionEnabled,
      entityExtractionEnabled,
      contextInjectionEnabled,
      scopeRestrictionEnabled,
      scopeConfidenceThreshold,
      cacheEnabled,
      cacheTTLMinutes,
      maxResponseTokens,
      temperature,
    } = req.body;

    let settings = await prisma.aISettings.findFirst();

    if (!settings) {
      settings = await prisma.aISettings.create({
        data: {
          conversationHistoryLength: conversationHistoryLength ?? DEFAULT_SETTINGS.conversationHistoryLength,
          pronounResolutionEnabled: pronounResolutionEnabled ?? DEFAULT_SETTINGS.pronounResolutionEnabled,
          entityExtractionEnabled: entityExtractionEnabled ?? DEFAULT_SETTINGS.entityExtractionEnabled,
          contextInjectionEnabled: contextInjectionEnabled ?? DEFAULT_SETTINGS.contextInjectionEnabled,
          scopeRestrictionEnabled: scopeRestrictionEnabled ?? DEFAULT_SETTINGS.scopeRestrictionEnabled,
          scopeConfidenceThreshold: scopeConfidenceThreshold ?? DEFAULT_SETTINGS.scopeConfidenceThreshold,
          cacheEnabled: cacheEnabled ?? DEFAULT_SETTINGS.cacheEnabled,
          cacheTTLMinutes: cacheTTLMinutes ?? DEFAULT_SETTINGS.cacheTTLMinutes,
          maxResponseTokens: maxResponseTokens ?? DEFAULT_SETTINGS.maxResponseTokens,
          temperature: temperature ?? DEFAULT_SETTINGS.temperature,
        },
      });
    } else {
      settings = await prisma.aISettings.update({
        where: { id: settings.id },
        data: {
          ...(conversationHistoryLength !== undefined && { conversationHistoryLength }),
          ...(pronounResolutionEnabled !== undefined && { pronounResolutionEnabled }),
          ...(entityExtractionEnabled !== undefined && { entityExtractionEnabled }),
          ...(contextInjectionEnabled !== undefined && { contextInjectionEnabled }),
          ...(scopeRestrictionEnabled !== undefined && { scopeRestrictionEnabled }),
          ...(scopeConfidenceThreshold !== undefined && { scopeConfidenceThreshold }),
          ...(cacheEnabled !== undefined && { cacheEnabled }),
          ...(cacheTTLMinutes !== undefined && { cacheTTLMinutes }),
          ...(maxResponseTokens !== undefined && { maxResponseTokens }),
          ...(temperature !== undefined && { temperature }),
        },
      });
    }

    return res.json({ settings, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update AI settings error:', error);
    return res.status(500).json({ error: 'Failed to update AI settings' });
  }
};

export const getContextAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const [
      totalLogs,
      pronounResolutionCount,
      contextUsedCount,
      avgResponseTime,
      dailyStats,
      topEntities,
    ] = await Promise.all([
      prisma.aIContextLog.count({
        where: { createdAt: { gte: startDate } },
      }),
      prisma.aIContextLog.count({
        where: { createdAt: { gte: startDate }, pronounsResolved: true },
      }),
      prisma.aIContextLog.count({
        where: { createdAt: { gte: startDate }, contextUsed: true },
      }),
      prisma.aIContextLog.aggregate({
        where: { createdAt: { gte: startDate }, responseTime: { not: null } },
        _avg: { responseTime: true },
      }),
      prisma.$queryRaw`
        SELECT DATE(created_at) as date, 
               COUNT(*) as total,
               SUM(CASE WHEN pronouns_resolved THEN 1 ELSE 0 END) as pronouns_resolved,
               SUM(CASE WHEN context_used THEN 1 ELSE 0 END) as context_used
        FROM "AIContextLog"
        WHERE created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
        LIMIT 30
      `,
      prisma.aIContextLog.findMany({
        where: { 
          createdAt: { gte: startDate },
          extractedEntities: { isEmpty: false }
        },
        select: { extractedEntities: true },
        take: 100,
      }),
    ]);

    const entityCounts: Record<string, number> = {};
    topEntities.forEach((log: { extractedEntities: string[] }) => {
      log.extractedEntities.forEach((entity: string) => {
        entityCounts[entity] = (entityCounts[entity] || 0) + 1;
      });
    });

    const sortedEntities = Object.entries(entityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([entity, count]) => ({ entity, count }));

    return res.json({
      analytics: {
        totalInteractions: totalLogs,
        pronounResolutionRate: totalLogs > 0 ? (pronounResolutionCount / totalLogs * 100).toFixed(1) : 0,
        contextUsageRate: totalLogs > 0 ? (contextUsedCount / totalLogs * 100).toFixed(1) : 0,
        avgResponseTimeMs: avgResponseTime._avg.responseTime || 0,
        dailyStats,
        topExtractedEntities: sortedEntities,
      },
    });
  } catch (error) {
    console.error('Get context analytics error:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

export const clearUserContext = async (req: AuthRequest, res: Response) => {
  try {
    const adminId = req.user?.userId;
    const adminRole = req.user?.role;

    if (!adminId || adminRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId, sessionId } = req.body;

    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'userId or sessionId required' });
    }

    if (sessionId) {
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { messages: [] },
      });

      await prisma.aIContextLog.deleteMany({
        where: { sessionId },
      });

      return res.json({ message: 'Session context cleared successfully' });
    }

    if (userId) {
      await prisma.chatSession.updateMany({
        where: { userId },
        data: { messages: [] },
      });

      await prisma.aIContextLog.deleteMany({
        where: { userId },
      });

      return res.json({ message: 'User context cleared successfully' });
    }

    return res.status(400).json({ error: 'Invalid request' });
  } catch (error) {
    console.error('Clear context error:', error);
    return res.status(500).json({ error: 'Failed to clear context' });
  }
};

export const resetAISettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const existingSettings = await prisma.aISettings.findFirst();

    let settings;
    if (existingSettings) {
      settings = await prisma.aISettings.update({
        where: { id: existingSettings.id },
        data: DEFAULT_SETTINGS,
      });
    } else {
      settings = await prisma.aISettings.create({
        data: DEFAULT_SETTINGS,
      });
    }

    return res.json({ settings, message: 'Settings reset to defaults' });
  } catch (error) {
    console.error('Reset AI settings error:', error);
    return res.status(500).json({ error: 'Failed to reset settings' });
  }
};
