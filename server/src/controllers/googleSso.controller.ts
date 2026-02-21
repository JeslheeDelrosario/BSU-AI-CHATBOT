import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { GoogleOAuthService } from '../services/googleOAuth.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const getGoogleAuthUrl = async (_req: Request, res: Response) => {
  try {
    if (!GoogleOAuthService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Google SSO is not configured',
        message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in environment variables'
      });
    }

    const state = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    const authUrl = GoogleOAuthService.getAuthorizationUrl(state);
    
    return res.json({ 
      authUrl,
      state,
      provider: 'GOOGLE'
    });
  } catch (error) {
    console.error('Get Google authorization URL error:', error);
    return res.status(500).json({ error: 'Failed to generate Google authorization URL' });
  }
};

export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.status(400).json({ 
        error: 'OAuth error',
        message: oauthError 
      });
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    if (!GoogleOAuthService.isConfigured()) {
      return res.status(503).json({ error: 'Google SSO is not configured' });
    }

    const tokens = await GoogleOAuthService.exchangeCodeForToken(code);
    const userInfo = await GoogleOAuthService.getUserInfo(tokens.access_token);
    const user = await GoogleOAuthService.findOrCreateUser(userInfo, tokens);

    const appToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token: appToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      },
      ssoProvider: 'GOOGLE'
    });
  } catch (error) {
    console.error('Google SSO callback error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const refreshGoogleToken = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const ssoLink = await prisma.userSSOLink.findFirst({
      where: {
        userId,
        provider: 'GOOGLE'
      }
    });

    if (!ssoLink || !ssoLink.refreshToken) {
      return res.status(404).json({ error: 'Google SSO link not found' });
    }

    const tokens = await GoogleOAuthService.refreshToken(ssoLink.refreshToken);

    await prisma.userSSOLink.update({
      where: { id: ssoLink.id },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || ssoLink.refreshToken,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
      }
    });

    return res.json({
      message: 'Google token refreshed successfully',
      expiresIn: tokens.expires_in
    });
  } catch (error) {
    console.error('Refresh Google token error:', error);
    return res.status(500).json({ error: 'Failed to refresh Google token' });
  }
};

export const unlinkGoogle = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const ssoLink = await prisma.userSSOLink.findFirst({
      where: {
        userId,
        provider: 'GOOGLE'
      }
    });

    if (!ssoLink) {
      return res.status(404).json({ error: 'Google SSO link not found' });
    }

    if (ssoLink.accessToken) {
      await GoogleOAuthService.revokeToken(ssoLink.accessToken);
    }

    await prisma.userSSOLink.delete({
      where: { id: ssoLink.id }
    });

    return res.json({ message: 'Google account unlinked successfully' });
  } catch (error) {
    console.error('Unlink Google error:', error);
    return res.status(500).json({ error: 'Failed to unlink Google account' });
  }
};

export const getGoogleSSOStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const ssoLink = await prisma.userSSOLink.findFirst({
      where: {
        userId,
        provider: 'GOOGLE'
      },
      select: {
        id: true,
        providerId: true,
        createdAt: true,
        expiresAt: true
      }
    });

    return res.json({
      isLinked: !!ssoLink,
      isConfigured: GoogleOAuthService.isConfigured(),
      linkDetails: ssoLink ? {
        linkedAt: ssoLink.createdAt,
        expiresAt: ssoLink.expiresAt
      } : null
    });
  } catch (error) {
    console.error('Get Google SSO status error:', error);
    return res.status(500).json({ error: 'Failed to get Google SSO status' });
  }
};

export const checkGoogleSSOAvailability = async (_req: Request, res: Response) => {
  return res.json({
    available: GoogleOAuthService.isConfigured(),
    provider: 'GOOGLE',
    displayName: 'Google'
  });
};
