// server/src/controllers/googleAuth.controller.ts
// Google OAuth 2.0 SSO Controller - Production Ready

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma';
import { UserRole } from '@prisma/client';
import crypto from 'crypto';

// Initialize Google OAuth client
const getGoogleClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }

  return new OAuth2Client(clientId, clientSecret, redirectUri);
};

// Generate JWT token for authenticated user
const generateToken = (user: { id: string; email: string; role: UserRole }) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

// Generate a random password for SSO users (they won't use it)
const generateRandomPassword = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * GET /api/auth/google
 * Initiates Google OAuth flow - returns the authorization URL
 */
export const getGoogleAuthUrl = async (_req: Request, res: Response) => {
  try {
    const client = getGoogleClient();
    
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid',
    ];

    // Generate state for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');

    const authUrl = client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state,
    });

    return res.json({ 
      url: authUrl,
      state,
    });
  } catch (error) {
    console.error('Google auth URL generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate Google authentication URL',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
};

/**
 * POST /api/auth/google/callback
 * Handles the OAuth callback with authorization code
 */
export const handleGoogleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }

    const client = getGoogleClient();

    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Failed to get user info from Google' });
    }

    const { sub: googleId, email, given_name, family_name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Check if user exists with this email
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        AccessibilitySettings: true,
        SSOLinks: {
          where: { provider: 'google' }
        }
      }
    });

    if (user) {
      // User exists - check if they have a Google SSO link
      const existingLink = user.SSOLinks.find(link => link.provider === 'google');
      
      if (!existingLink) {
        // Link Google account to existing user
        await prisma.userSSOLink.create({
          data: {
            userId: user.id,
            provider: 'google',
            providerId: googleId!,
            accessToken: tokens.access_token || null,
            refreshToken: tokens.refresh_token || null,
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          }
        });
      } else {
        // Update existing SSO link with new tokens
        await prisma.userSSOLink.update({
          where: { id: existingLink.id },
          data: {
            accessToken: tokens.access_token || null,
            refreshToken: tokens.refresh_token || existingLink.refreshToken,
            expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          }
        });
      }

      // Update user's Google tokens for calendar integration
      await prisma.user.update({
        where: { id: user.id },
        data: {
          googleAccessToken: tokens.access_token || null,
          googleRefreshToken: tokens.refresh_token || user.googleRefreshToken,
          googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          avatar: user.avatar || picture || null,
        }
      });
    } else {
      // Create new user with Google SSO
      const randomPassword = generateRandomPassword();
      
      user = await prisma.user.create({
        data: {
          email,
          password: randomPassword, // Random password - user will use Google to login
          firstName: given_name || 'User',
          lastName: family_name || '',
          role: UserRole.STUDENT,
          avatar: picture || null,
          googleAccessToken: tokens.access_token || null,
          googleRefreshToken: tokens.refresh_token || null,
          googleTokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          SSOLinks: {
            create: {
              provider: 'google',
              providerId: googleId!,
              accessToken: tokens.access_token || null,
              refreshToken: tokens.refresh_token || null,
              expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
            }
          },
          AccessibilitySettings: {
            create: {}
          }
        },
        include: {
          AccessibilitySettings: true,
          SSOLinks: {
            where: { provider: 'google' }
          }
        }
      });
    }

    // Check if user is active
    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'Account is inactive or not found' });
    }

    // Generate JWT token
    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        learningStyle: user.learningStyle,
        gradeLevel: user.gradeLevel,
        accessibilitySettings: user.AccessibilitySettings,
      },
      isNewUser: user.SSOLinks.length === 1, // Just created the SSO link
    });
  } catch (error) {
    console.error('Google callback error:', error);
    return res.status(500).json({ 
      error: 'Failed to authenticate with Google',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
};

/**
 * POST /api/auth/google/token
 * Authenticate using Google ID token directly (for mobile/SPA apps using Google Sign-In button)
 */
export const authenticateWithGoogleToken = async (req: Request, res: Response) => {
  try {
    const { idToken, accessToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    const client = getGoogleClient();

    // Verify the ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { sub: googleId, email, given_name, family_name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        AccessibilitySettings: true,
        SSOLinks: {
          where: { provider: 'google' }
        }
      }
    });

    if (user) {
      // Update or create SSO link
      const existingLink = user.SSOLinks.find(link => link.provider === 'google');
      
      if (!existingLink) {
        await prisma.userSSOLink.create({
          data: {
            userId: user.id,
            provider: 'google',
            providerId: googleId!,
            accessToken: accessToken || null,
          }
        });
      } else if (accessToken) {
        await prisma.userSSOLink.update({
          where: { id: existingLink.id },
          data: { accessToken }
        });
      }

      // Update avatar if not set
      if (!user.avatar && picture) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatar: picture }
        });
        user.avatar = picture;
      }
    } else {
      // Create new user
      const randomPassword = generateRandomPassword();
      
      user = await prisma.user.create({
        data: {
          email,
          password: randomPassword,
          firstName: given_name || 'User',
          lastName: family_name || '',
          role: UserRole.STUDENT,
          avatar: picture || null,
          SSOLinks: {
            create: {
              provider: 'google',
              providerId: googleId!,
              accessToken: accessToken || null,
            }
          },
          AccessibilitySettings: {
            create: {}
          }
        },
        include: {
          AccessibilitySettings: true,
        }
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is inactive' });
    }

    const token = generateToken(user);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        learningStyle: user.learningStyle,
        gradeLevel: user.gradeLevel,
        accessibilitySettings: user.AccessibilitySettings,
      },
      isNewUser: !user.SSOLinks || user.SSOLinks.length === 0,
    });
  } catch (error) {
    console.error('Google token auth error:', error);
    return res.status(500).json({ 
      error: 'Failed to authenticate with Google',
      details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
    });
  }
};

/**
 * GET /api/auth/google/status
 * Check if Google SSO is configured and available
 */
export const getGoogleSSOStatus = async (_req: Request, res: Response) => {
  try {
    const isConfigured = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
    
    return res.json({
      enabled: isConfigured,
      clientId: isConfigured ? process.env.GOOGLE_CLIENT_ID : null,
    });
  } catch (error) {
    console.error('Google SSO status error:', error);
    return res.status(500).json({ error: 'Failed to check Google SSO status' });
  }
};
