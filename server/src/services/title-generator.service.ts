// server/src/services/title-generator.service.ts
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

let openai: OpenAI | null = null;
let geminiTitleModel: any = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.error('Failed to initialize OpenAI for title generation:', error);
}

try {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey !== 'your-gemini-api-key-here') {
    const genAI = new GoogleGenerativeAI(geminiKey);
    geminiTitleModel = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: { maxOutputTokens: 30, temperature: 0.7 }
    });
  }
} catch (error) {
  console.error('Failed to initialize Gemini for title generation:', error);
}

/**
 * Build the title generation prompt
 */
function buildTitlePrompt(userMessage: string, aiResponse?: string, language: string = 'en'): string {
  const langNote = language === 'fil' ? 'Generate the title in Filipino.' : 'Generate the title in English.';
  if (aiResponse) {
    return `Based on this conversation, generate a concise, descriptive title (max 6 words):\n\nUser: ${userMessage}\nAssistant: ${aiResponse.substring(0, 200)}\n\nGenerate ONLY the title, no quotes, no explanation. Make it specific and informative.\n${langNote}`;
  }
  return `Generate a concise, descriptive title (max 6 words) for a conversation that starts with:\n\n"${userMessage}"\n\nGenerate ONLY the title, no quotes, no explanation. Make it specific and informative.\n${langNote}`;
}

/**
 * Convert a string to Title Case (e.g. "hello world" → "Hello World")
 * Preserves acronyms/abbreviations that are already uppercase (e.g. "BSU", "COS")
 */
function toTitleCase(str: string): string {
  const minorWords = new Set(['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'in', 'of', 'sa', 'ng', 'mga', 'na', 'ang']);
  return str.split(/\s+/).map((word, idx) => {
    if (!word) return word;
    if (word === word.toUpperCase() && word.length >= 2) return word;
    if (idx > 0 && minorWords.has(word.toLowerCase())) return word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

/**
 * Clean and validate a generated title
 */
function cleanTitle(raw: string): string | null {
  let title = raw.trim().replace(/^["']|["']$/g, '');
  title = toTitleCase(title);
  if (title.length > 60) title = title.substring(0, 57) + '...';
  return title.length >= 3 ? title : null;
}

/**
 * Generate a concise, meaningful chat title using AI
 * Priority: Gemini (free) → OpenAI → Pattern-based fallback
 */
export async function generateChatTitle(
  userMessage: string,
  aiResponse?: string,
  language: string = 'en'
): Promise<string> {
  const prompt = buildTitlePrompt(userMessage, aiResponse, language);

  // PRIORITY 1: Gemini (free tier)
  if (geminiTitleModel) {
    try {
      const result = await geminiTitleModel.generateContent(prompt);
      const text = await result.response.text();
      const title = cleanTitle(text);
      if (title) return title;
    } catch (error: any) {
      console.warn('[TitleGen] Gemini failed:', error.message);
    }
  }

  // PRIORITY 2: OpenAI
  if (openai) {
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a title generator. Create concise, descriptive titles (max 6 words) for conversations. Return ONLY the title, no quotes or extra text.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 20,
        temperature: 0.7,
      });
      const text = completion.choices[0]?.message?.content || '';
      const title = cleanTitle(text);
      if (title) return title;
    } catch (error: any) {
      console.warn('[TitleGen] OpenAI failed:', error.message);
    }
  }

  // PRIORITY 3: Pattern-based fallback
  return fallbackTitleGeneration(userMessage, language);
}

/**
 * Fallback title generation using pattern matching
 */
function fallbackTitleGeneration(userMessage: string, language: string = 'en'): string {
  const lowerMsg = userMessage.toLowerCase();

  // Pattern-based title generation
  const patterns = [
    // Program inquiries
    {
      keywords: ['computer science', 'cs', 'bsm cs'],
      title: language === 'fil' ? 'Tanong tungkol sa Computer Science' : 'Computer Science Inquiry'
    },
    {
      keywords: ['biology', 'bio'],
      title: language === 'fil' ? 'Tanong tungkol sa Biology' : 'Biology Inquiry'
    },
    {
      keywords: ['food technology', 'food tech'],
      title: language === 'fil' ? 'Tanong tungkol sa Food Technology' : 'Food Technology Inquiry'
    },
    {
      keywords: ['environmental science', 'envi sci'],
      title: language === 'fil' ? 'Tanong tungkol sa Environmental Science' : 'Environmental Science Inquiry'
    },
    {
      keywords: ['statistics', 'applied statistics'],
      title: language === 'fil' ? 'Tanong tungkol sa Statistics' : 'Statistics Inquiry'
    },
    {
      keywords: ['business applications', 'business'],
      title: language === 'fil' ? 'Tanong tungkol sa Business Applications' : 'Business Applications Inquiry'
    },
    {
      keywords: ['medical technology', 'med tech', 'medical lab'],
      title: language === 'fil' ? 'Tanong tungkol sa Medical Technology' : 'Medical Technology Inquiry'
    },
    
    // Topic-based
    {
      keywords: ['curriculum', 'subjects', 'courses'],
      title: language === 'fil' ? 'Tanong tungkol sa Kurikulum' : 'Curriculum Question'
    },
    {
      keywords: ['faculty', 'professor', 'teacher'],
      title: language === 'fil' ? 'Tanong tungkol sa Faculty' : 'Faculty Information'
    },
    {
      keywords: ['admission', 'enrollment', 'requirements'],
      title: language === 'fil' ? 'Tanong tungkol sa Admission' : 'Admission Requirements'
    },
    {
      keywords: ['career', 'job', 'work'],
      title: language === 'fil' ? 'Tanong tungkol sa Karera' : 'Career Opportunities'
    },
    {
      keywords: ['1st year', 'first year'],
      title: language === 'fil' ? 'Tanong tungkol sa 1st Year' : '1st Year Question'
    },
    {
      keywords: ['2nd year', 'second year'],
      title: language === 'fil' ? 'Tanong tungkol sa 2nd Year' : '2nd Year Question'
    },
    {
      keywords: ['3rd year', 'third year'],
      title: language === 'fil' ? 'Tanong tungkol sa 3rd Year' : '3rd Year Question'
    },
    {
      keywords: ['4th year', 'fourth year'],
      title: language === 'fil' ? 'Tanong tungkol sa 4th Year' : '4th Year Question'
    },
    {
      keywords: ['programs', 'offerings', 'degrees'],
      title: language === 'fil' ? 'Mga Programa ng COS' : 'COS Programs'
    }
  ];

  // Check patterns
  for (const pattern of patterns) {
    if (pattern.keywords.some(kw => lowerMsg.includes(kw))) {
      return pattern.title;
    }
  }

  // Extract key words for generic title
  const words = userMessage
    .replace(/[^\w\s]/gi, '')
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 3)
    .slice(0, 4);

  if (words.length > 0) {
    const title = toTitleCase(words.join(' '));
    return title.length > 40 
      ? title.substring(0, 37) + '...' 
      : title;
  }

  // Ultimate fallback
  return language === 'fil' ? 'Bagong Chat' : 'New Chat';
}

/**
 * Update chat title after first exchange (like ChatGPT does)
 */
export async function updateChatTitleAfterFirstExchange(
  userMessage: string,
  aiResponse: string,
  language: string = 'en'
): Promise<string> {
  return generateChatTitle(userMessage, aiResponse, language);
}
