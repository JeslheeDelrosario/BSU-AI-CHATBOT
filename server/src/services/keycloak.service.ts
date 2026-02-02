import axios from 'axios';
import { prisma } from '../lib/prisma';

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
}

interface KeycloakUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
}

export class KeycloakService {
  private static readonly KEYCLOAK_URL = process.env.KEYCLOAK_URL || 'http://localhost:8080';
  private static readonly REALM = process.env.KEYCLOAK_REALM || 'bsu-chatbot';
  private static readonly CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'bsu-web-app';
  private static readonly CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || '';
  private static readonly REDIRECT_URI = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback`;

  static getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      ...(state && { state })
    });

    return `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/auth?${params.toString()}`;
  }

  static async exchangeCodeForToken(code: string): Promise<KeycloakTokenResponse> {
    try {
      const response = await axios.post<KeycloakTokenResponse>(
        `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          code,
          redirect_uri: this.REDIRECT_URI
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
        console.error('Keycloak token exchange error:', error.response?.data);
        throw new Error('Failed to exchange authorization code for token');
      }
      throw error;
    }
  }

  static async getUserInfo(accessToken: string): Promise<KeycloakUserInfo> {
    try {
      const response = await axios.get<KeycloakUserInfo>(
        `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Keycloak user info error:', error.response?.data);
        throw new Error('Failed to fetch user information');
      }
      throw error;
    }
  }

  static async refreshToken(refreshToken: string): Promise<KeycloakTokenResponse> {
    try {
      const response = await axios.post<KeycloakTokenResponse>(
        `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          refresh_token: refreshToken
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
        console.error('Keycloak token refresh error:', error.response?.data);
        throw new Error('Failed to refresh token');
      }
      throw error;
    }
  }

  static async logout(refreshToken: string): Promise<void> {
    try {
      await axios.post(
        `${this.KEYCLOAK_URL}/realms/${this.REALM}/protocol/openid-connect/logout`,
        new URLSearchParams({
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          refresh_token: refreshToken
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Keycloak logout error:', error.response?.data);
      }
      throw error;
    }
  }

  static async findOrCreateUser(userInfo: KeycloakUserInfo, tokens: KeycloakTokenResponse) {
    const existingLink = await prisma.userSSOLink.findUnique({
      where: {
        provider_providerId: {
          provider: 'KEYCLOAK',
          providerId: userInfo.sub
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
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
        }
      });

      return existingLink.User;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: userInfo.email }
    });

    if (existingUser) {
      await prisma.userSSOLink.create({
        data: {
          userId: existingUser.id,
          provider: 'KEYCLOAK',
          providerId: userInfo.sub,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000)
        }
      });

      return existingUser;
    }

    const newUser = await prisma.user.create({
      data: {
        email: userInfo.email,
        password: '',
        firstName: userInfo.given_name || userInfo.name.split(' ')[0] || 'User',
        lastName: userInfo.family_name || userInfo.name.split(' ').slice(1).join(' ') || '',
        role: 'STUDENT',
        isActive: true,
        SSOLinks: {
          create: {
            provider: 'KEYCLOAK',
            providerId: userInfo.sub,
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

export default KeycloakService;
