import { google, Auth } from 'googleapis';
import { isGoogleCalendarConfigured } from '../config/env.validation';
import { prisma } from '../lib/prisma';

interface GoogleMeetEvent {
  summary: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
}

interface GoogleMeetResult {
  eventId: string;
  meetLink: string;
  htmlLink: string;
}

export class GoogleCalendarService {
  private oauth2Client: Auth.OAuth2Client | null = null;
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = isGoogleCalendarConfigured();
    
    if (this.isConfigured) {
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );
    } else {
      console.warn('[GoogleCalendar] Service not configured - Google Meet integration disabled');
    }
  }

  isEnabled(): boolean {
    return this.isConfigured && this.oauth2Client !== null;
  }

  private ensureConfigured(): void {
    if (!this.isEnabled()) {
      throw new Error('Google Calendar service is not configured. Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in environment variables.');
    }
  }

  private setCredentials(accessToken: string, refreshToken?: string) {
    this.ensureConfigured();
    this.oauth2Client!.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  private async refreshAccessToken(userId: string, refreshToken: string): Promise<string> {
    try {
      this.ensureConfigured();
      this.oauth2Client!.setCredentials({ refresh_token: refreshToken });
      
      const { credentials } = await this.oauth2Client!.refreshAccessToken();
      
      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token');
      }

      // Update tokens in database
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleAccessToken: credentials.access_token,
          googleTokenExpiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
        },
      });

      console.log(`[GoogleCalendar] Refreshed access token for user ${userId}`);
      return credentials.access_token;
    } catch (error: any) {
      console.error('[GoogleCalendar] Token refresh failed:', error.message);
      throw new Error('Failed to refresh Google access token. Please reconnect your Google account.');
    }
  }

  private async ensureValidToken(userId: string, accessToken: string, refreshToken?: string): Promise<string> {
    if (!refreshToken) {
      return accessToken;
    }

    // Check if token is expired or about to expire (within 5 minutes)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { googleTokenExpiry: true },
    });

    if (user?.googleTokenExpiry) {
      const expiryTime = new Date(user.googleTokenExpiry).getTime();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      if (expiryTime - now < fiveMinutes) {
        console.log(`[GoogleCalendar] Token expiring soon for user ${userId}, refreshing...`);
        return await this.refreshAccessToken(userId, refreshToken);
      }
    }

    return accessToken;
  }

  getAuthUrl(): string {
    this.ensureConfigured();
    
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    return this.oauth2Client!.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  async getTokenFromCode(code: string) {
    this.ensureConfigured();
    
    try {
      const { tokens } = await this.oauth2Client!.getToken(code);
      
      if (!tokens.access_token) {
        throw new Error('No access token received from Google');
      }
      
      console.log('[GoogleCalendar] Successfully exchanged code for tokens');
      return tokens;
    } catch (error: any) {
      console.error('[GoogleCalendar] Token exchange failed:', error.message);
      throw new Error(`Failed to exchange authorization code: ${error.message}`);
    }
  }

  async createMeetingWithGoogleMeet(
    userId: string,
    eventData: GoogleMeetEvent,
    userAccessToken: string,
    userRefreshToken?: string
  ): Promise<GoogleMeetResult> {
    this.ensureConfigured();
    
    try {
      // Ensure token is valid and refresh if needed
      const validToken = await this.ensureValidToken(userId, userAccessToken, userRefreshToken);
      this.setCredentials(validToken, userRefreshToken);

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client! });

      console.log(`[GoogleCalendar] Creating event for user ${userId}: ${eventData.summary}`);

      const event = {
        summary: eventData.summary,
        description: eventData.description || '',
        start: {
          dateTime: eventData.startTime.toISOString(),
          timeZone: 'Asia/Manila',
        },
        end: {
          dateTime: eventData.endTime.toISOString(),
          timeZone: 'Asia/Manila',
        },
        attendees: eventData.attendees?.map(email => ({ email })) || [],
        conferenceData: {
          createRequest: {
            requestId: `meet-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 15 },
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        conferenceDataVersion: 1,
        requestBody: event,
      });

      const meetLink = response.data.conferenceData?.entryPoints?.find(
        (entry: any) => entry.entryPointType === 'video'
      )?.uri || '';

      if (!meetLink) {
        console.error('[GoogleCalendar] No meet link in response:', response.data);
        throw new Error('Failed to create Google Meet link');
      }

      console.log(`[GoogleCalendar] Successfully created event ${response.data.id} with meet link`);
      
      return {
        eventId: response.data.id || '',
        meetLink,
        htmlLink: response.data.htmlLink || '',
      };
    } catch (error: any) {
      console.error('[GoogleCalendar] Create event error:', {
        message: error.message,
        code: error.code,
        userId,
      });
      
      // Handle specific error cases
      if (error.code === 401 || error.message?.includes('invalid_grant')) {
        throw new Error('Google authentication expired. Please reconnect your Google account.');
      }
      
      if (error.code === 403) {
        throw new Error('Insufficient permissions. Please reconnect your Google account with calendar access.');
      }
      
      throw new Error(`Failed to create Google Meet: ${error.message}`);
    }
  }

  async updateMeeting(
    userId: string,
    eventId: string,
    eventData: Partial<GoogleMeetEvent>,
    userAccessToken: string,
    userRefreshToken?: string
  ): Promise<void> {
    this.ensureConfigured();
    
    try {
      const validToken = await this.ensureValidToken(userId, userAccessToken, userRefreshToken);
      this.setCredentials(validToken, userRefreshToken);

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client! });

      console.log(`[GoogleCalendar] Updating event ${eventId} for user ${userId}`);

      const updateData: any = {};

      if (eventData.summary) updateData.summary = eventData.summary;
      if (eventData.description !== undefined) updateData.description = eventData.description;
      if (eventData.startTime) {
        updateData.start = {
          dateTime: eventData.startTime.toISOString(),
          timeZone: 'Asia/Manila',
        };
      }
      if (eventData.endTime) {
        updateData.end = {
          dateTime: eventData.endTime.toISOString(),
          timeZone: 'Asia/Manila',
        };
      }
      if (eventData.attendees) {
        updateData.attendees = eventData.attendees.map(email => ({ email }));
      }

      await calendar.events.patch({
        calendarId: 'primary',
        eventId,
        requestBody: updateData,
      });
      
      console.log(`[GoogleCalendar] Successfully updated event ${eventId}`);
    } catch (error: any) {
      console.error('[GoogleCalendar] Update event error:', {
        message: error.message,
        code: error.code,
        eventId,
        userId,
      });
      
      if (error.code === 404) {
        throw new Error('Google Calendar event not found. It may have been deleted.');
      }
      
      throw new Error(`Failed to update Google Meet: ${error.message}`);
    }
  }

  async deleteMeeting(
    userId: string,
    eventId: string,
    userAccessToken: string,
    userRefreshToken?: string
  ): Promise<void> {
    this.ensureConfigured();
    
    try {
      const validToken = await this.ensureValidToken(userId, userAccessToken, userRefreshToken);
      this.setCredentials(validToken, userRefreshToken);

      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client! });

      console.log(`[GoogleCalendar] Deleting event ${eventId} for user ${userId}`);

      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });
      
      console.log(`[GoogleCalendar] Successfully deleted event ${eventId}`);
    } catch (error: any) {
      console.error('[GoogleCalendar] Delete event error:', {
        message: error.message,
        code: error.code,
        eventId,
        userId,
      });
      
      if (error.code === 404) {
        console.warn(`[GoogleCalendar] Event ${eventId} not found, may already be deleted`);
        return; // Silently succeed if already deleted
      }
      
      throw new Error(`Failed to delete Google Meet: ${error.message}`);
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();
