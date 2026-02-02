import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { KeycloakService } from '../services/keycloak.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { prisma } from '../lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const getAuthorizationUrl = async (req: Request, res: Response) => {
  try {
    const state = Math.random().toString(36).substring(7);
    const authUrl = KeycloakService.getAuthorizationUrl(state);
    
    return res.json({ 
      authUrl,
      state 
    });
  } catch (error) {
    console.error('Get authorization URL error:', error);
    return res.status(500).json({ error: 'Failed to generate authorization URL' });
  }
};

export const handleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const tokens = await KeycloakService.exchangeCodeForToken(code);
    const userInfo = await KeycloakService.getUserInfo(tokens.access_token);
    const user = await KeycloakService.findOrCreateUser(userInfo, tokens);

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
      ssoProvider: 'KEYCLOAK'
    });
  } catch (error) {
    console.error('SSO callback error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const refreshSSOToken = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const ssoLink = await prisma.userSSOLink.findFirst({
      where: {
        userId,
        provider: 'KEYCLOAK'
      }
    });

    if (!ssoLink || !ssoLink.refreshToken) {
      return res.status(404).json({ error: 'SSO link not found' });
    }

    const tokens = await KeycloakService.refreshToken(ssoLink.refreshToken);

    await prisma.userSSOLink.update({
      where: { id: ssoLink.id },
      data: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
      }
    });

    return res.json({
      message: 'Token refreshed successfully',
      expiresIn: tokens.expires_in
    });
  } catch (error) {
    console.error('Refresh SSO token error:', error);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
};

export const unlinkSSO = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { provider } = req.params;

    const ssoLink = await prisma.userSSOLink.findFirst({
      where: {
        userId,
        provider: provider.toUpperCase()
      }
    });

    if (!ssoLink) {
      return res.status(404).json({ error: 'SSO link not found' });
    }

    if (ssoLink.refreshToken) {
      try {
        await KeycloakService.logout(ssoLink.refreshToken);
      } catch (error) {
        console.error('Keycloak logout error:', error);
      }
    }

    await prisma.userSSOLink.delete({
      where: { id: ssoLink.id }
    });

    return res.json({ message: 'SSO unlinked successfully' });
  } catch (error) {
    console.error('Unlink SSO error:', error);
    return res.status(500).json({ error: 'Failed to unlink SSO' });
  }
};

export const getSSOProviders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    const linkedProviders = await prisma.userSSOLink.findMany({
      where: { userId },
      select: {
        provider: true,
        providerId: true,
        createdAt: true
      }
    });

    const availableProviders = [
      {
        name: 'KEYCLOAK',
        displayName: 'BSU SSO',
        isLinked: linkedProviders.some(p => p.provider === 'KEYCLOAK'),
        authUrl: KeycloakService.getAuthorizationUrl()
      }
    ];

    return res.json({
      linked: linkedProviders,
      available: availableProviders
    });
  } catch (error) {
    console.error('Get SSO providers error:', error);
    return res.status(500).json({ error: 'Failed to fetch SSO providers' });
  }
};
