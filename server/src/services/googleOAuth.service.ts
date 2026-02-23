import axios from 'axios';
import { prisma } from '../lib/prisma';

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture?: string;
  locale?: string;
}

export class GoogleOAuthService {
  private static readonly GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
  private static readonly GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
  private static readonly REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 
    `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/google/callback`;

  private static readonly GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  private static readonly GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private static readonly GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

  static isConfigured(): boolean {
    return !!(this.GOOGLE_CLIENT_ID && this.GOOGLE_CLIENT_SECRET && 
              this.GOOGLE_CLIENT_ID !== 'your-google-client-id.apps.googleusercontent.com');
  }

  static getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.GOOGLE_CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      ...(state && { state })
    });

    return `${this.GOOGLE_AUTH_URL}?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    try {
      const response = await axios.post<GoogleTokenResponse>(
        this.GOOGLE_TOKEN_URL,
        new URLSearchParams({
          code,
          client_id: this.GOOGLE_CLIENT_ID,
          client_secret: this.GOOGLE_CLIENT_SECRET,
          redirect_uri: this.REDIRECT_URI,
          grant_type: 'authorization_code'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Google token exchange error:', error.response?.data);
        throw new Error(`Failed to exchange authorization code: ${JSON.stringify(error.response?.data)}`);
      }
      throw error;
    }
  }

  static async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await axios.get<GoogleUserInfo>(
        this.GOOGLE_USERINFO_URL,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Google user info error:', error.response?.data);
        throw new Error('Failed to fetch user information from Google');
      }
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<GoogleTokenResponse> {
    try {
      const response = await axios.post<GoogleTokenResponse>(
        this.GOOGLE_TOKEN_URL,
        new URLSearchParams({
          client_id: this.GOOGLE_CLIENT_ID,
          client_secret: this.GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Google token refresh error:', error.response?.data);
        throw new Error('Failed to refresh Google token');
      }
      throw error;
    }
  }

  static async revokeToken(token: string): Promise<void> {
    try {
      await axios.post(`https://oauth2.googleapis.com/revoke?token=${token}`);
    } catch (error) {
      console.error('Google token revoke error:', error);
    }
  }

  private static async ensureGoogleProviderExists() {
    const existingProvider = await prisma.sSOProvider.findUnique({
      where: { name: 'GOOGLE' }
    });

    if (!existingProvider) {
      await prisma.sSOProvider.create({
        data: {
          name: 'GOOGLE',
          clientId: this.GOOGLE_CLIENT_ID,
          clientSecret: '***',
          authUrl: this.GOOGLE_AUTH_URL,
          tokenUrl: this.GOOGLE_TOKEN_URL,
          userInfoUrl: this.GOOGLE_USERINFO_URL,
          redirectUrl: this.REDIRECT_URI,
          scope: 'openid email profile',
          isActive: true
        }
      });
    }
  }

  static async findOrCreateUser(userInfo: GoogleUserInfo, tokens: GoogleTokenResponse) {
    await this.ensureGoogleProviderExists();

    const existingLink = await prisma.userSSOLink.findUnique({
      where: {
        provider_providerId: {
          provider: 'GOOGLE',
          providerId: userInfo.id
        }
      },
      include: {
        User: true
      }
    });

    if (existingLink) {
      await prisma.userSSOLink.update({
        where: { id: existingLink.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token || existingLink.refreshToken,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
        }
      });

      if (userInfo.picture && existingLink.User.avatar !== userInfo.picture) {
        await prisma.user.update({
          where: { id: existingLink.User.id },
          data: { avatar: userInfo.picture }
        });
      }

      return existingLink.User;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: userInfo.email }
    });

    if (existingUser) {
      await prisma.userSSOLink.create({
        data: {
          userId: existingUser.id,
          provider: 'GOOGLE',
          providerId: userInfo.id,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
        }
      });

      if (userInfo.picture && !existingUser.avatar) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { avatar: userInfo.picture }
        });
      }

      return existingUser;
    }

    const newUser = await prisma.user.create({
      data: {
        email: userInfo.email,
        password: '',
        firstName: userInfo.given_name || userInfo.name.split(' ')[0] || 'User',
        lastName: userInfo.family_name || userInfo.name.split(' ').slice(1).join(' ') || '',
        avatar: userInfo.picture,
        role: 'STUDENT',
        isActive: true,
        SSOLinks: {
          create: {
            provider: 'GOOGLE',
            providerId: userInfo.id,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
          }
        }
      }
    });

    return newUser;
  }
}

export default GoogleOAuthService;
