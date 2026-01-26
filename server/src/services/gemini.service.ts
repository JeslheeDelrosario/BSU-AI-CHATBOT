import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isConfigured: boolean = false;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey && apiKey !== 'your-gemini-api-key') {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      this.isConfigured = true;
      console.log('✓ Gemini AI service enabled');
    } else {
      console.warn('⚠ Gemini AI service disabled (API key not configured)');
    }
  }

  isEnabled(): boolean {
    return this.isConfigured && this.model !== null;
  }

  /**
   * Generate AI-powered meeting description based on title and context
   */
  async generateMeetingDescription(
    title: string,
    meetingType: string,
    duration: number,
    context?: string
  ): Promise<string> {
    if (!this.isEnabled()) {
      return `${meetingType} meeting: ${title}`;
    }

    try {
      const prompt = `Generate a professional, concise meeting description (2-3 sentences) for:
Title: ${title}
Type: ${meetingType}
Duration: ${duration} minutes
${context ? `Context: ${context}` : ''}

The description should be clear, informative, and suitable for a classroom/educational setting.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const description = response.text().trim();
      
      console.log(`[Gemini] Generated meeting description for: ${title}`);
      return description;
    } catch (error: any) {
      console.error('[Gemini] Failed to generate description:', error.message);
      return `${meetingType} meeting: ${title}`;
    }
  }

  /**
   * Generate meeting agenda based on title and topics
   */
  async generateMeetingAgenda(
    title: string,
    meetingType: string,
    topics?: string[]
  ): Promise<string> {
    if (!this.isEnabled()) {
      return topics ? `Topics: ${topics.join(', ')}` : '';
    }

    try {
      const prompt = `Generate a structured meeting agenda for:
Title: ${title}
Type: ${meetingType}
${topics && topics.length > 0 ? `Topics to cover: ${topics.join(', ')}` : ''}

Format as a numbered list with time allocations. Keep it concise and professional.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const agenda = response.text().trim();
      
      console.log(`[Gemini] Generated agenda for: ${title}`);
      return agenda;
    } catch (error: any) {
      console.error('[Gemini] Failed to generate agenda:', error.message);
      return topics ? `Topics: ${topics.join(', ')}` : '';
    }
  }

  /**
   * Summarize meeting notes
   */
  async summarizeMeetingNotes(notes: string): Promise<string> {
    if (!this.isEnabled()) {
      return notes;
    }

    try {
      const prompt = `Summarize these meeting notes into key points and action items:

${notes}

Format:
**Key Points:**
- [point 1]
- [point 2]

**Action Items:**
- [action 1]
- [action 2]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text().trim();
      
      console.log('[Gemini] Summarized meeting notes');
      return summary;
    } catch (error: any) {
      console.error('[Gemini] Failed to summarize notes:', error.message);
      return notes;
    }
  }

  /**
   * Generate meeting title suggestions based on course/topic
   */
  async suggestMeetingTitles(
    course: string,
    topic?: string,
    meetingType?: string
  ): Promise<string[]> {
    if (!this.isEnabled()) {
      return [`${course} ${meetingType || 'Meeting'}`];
    }

    try {
      const prompt = `Generate 5 creative, professional meeting titles for:
Course: ${course}
${topic ? `Topic: ${topic}` : ''}
${meetingType ? `Type: ${meetingType}` : ''}

Requirements:
- Clear and descriptive
- Professional tone
- Suitable for educational setting
- Each title should be unique

Return only the titles, one per line.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const titles = response.text()
        .trim()
        .split('\n')
        .map(t => t.replace(/^\d+\.\s*/, '').trim())
        .filter(t => t.length > 0)
        .slice(0, 5);
      
      console.log(`[Gemini] Generated ${titles.length} title suggestions`);
      return titles.length > 0 ? titles : [`${course} ${meetingType || 'Meeting'}`];
    } catch (error: any) {
      console.error('[Gemini] Failed to generate titles:', error.message);
      return [`${course} ${meetingType || 'Meeting'}`];
    }
  }
}

export const geminiService = new GeminiService();
