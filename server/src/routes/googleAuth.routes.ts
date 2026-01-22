import { Router } from 'express';
import { googleCalendarService } from '../services/googleCalendar.service';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

const router = Router();

// Get Google OAuth URL
router.get('/auth/google/url', authenticateToken, (req: AuthRequest, res) => {
  try {
    const authUrl = googleCalendarService.getAuthUrl();
    return res.json({ authUrl });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Handle Google OAuth callback
router.post('/auth/google/callback', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { code } = req.body;
    const userId = req.user!.userId;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const tokens = await googleCalendarService.getTokenFromCode(code);

    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: tokens.access_token || null,
        googleRefreshToken: tokens.refresh_token || null,
        googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    });

    return res.json({ success: true, message: 'Google Calendar connected successfully' });
  } catch (error: any) {
    console.error('Google OAuth Error:', error);
    return res.status(500).json({ error: 'Failed to connect Google Calendar' });
  }
});

// Check Google Calendar connection status
router.get('/auth/google/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true,
        googleRefreshToken: true,
        googleTokenExpiry: true,
      },
    });

    const isConnected = !!(user?.googleAccessToken && user?.googleRefreshToken);
    const isExpired = user?.googleTokenExpiry ? new Date(user.googleTokenExpiry) < new Date() : true;

    return res.json({
      isConnected,
      isExpired,
      needsReauth: isConnected && isExpired,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Disconnect Google Calendar
router.post('/auth/google/disconnect', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
      },
    });

    return res.json({ success: true, message: 'Google Calendar disconnected' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
