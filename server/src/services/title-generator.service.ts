// server/src/services/title-generator.service.ts
import OpenAI from 'openai';

let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.error('Failed to initialize OpenAI for title generation:', error);
}

/**
 * Generate a concise, meaningful chat title using AI
 * Similar to ChatGPT's title generation approach
 */
export async function generateChatTitle(
  userMessage: string,
  aiResponse?: string,
  language: string = 'en'
): Promise<string> {
  try {
    if (!openai) {
      return fallbackTitleGeneration(userMessage, language);
    }

    const titlePrompt = aiResponse
      ? `Based on this conversation, generate a concise, descriptive title (max 6 words):

User: ${userMessage}
Assistant: ${aiResponse.substring(0, 200)}

Generate ONLY the title, no quotes, no explanation. Make it specific and informative.
${language === 'fil' ? 'Generate the title in Filipino.' : 'Generate the title in English.'}`
      : `Generate a concise, descriptive title (max 6 words) for a conversation that starts with:

"${userMessage}"

Generate ONLY the title, no quotes, no explanation. Make it specific and informative.
${language === 'fil' ? 'Generate the title in Filipino.' : 'Generate the title in English.'}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a title generator. Create concise, descriptive titles (max 6 words) for conversations. Return ONLY the title, no quotes or extra text.'
        },
        {
          role: 'user',
          content: titlePrompt
        }
      ],
      max_tokens: 20,
      temperature: 0.7,
    });

    let title = completion.choices[0]?.message?.content?.trim() || '';
    
    // Remove quotes if AI added them
    title = title.replace(/^["']|["']$/g, '');
    
    // Limit to 60 characters
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }

    // Fallback if title is empty or too short
    if (!title || title.length < 3) {
      return fallbackTitleGeneration(userMessage, language);
    }

    return title;

  } catch (error) {
    console.error('Error generating AI title:', error);
    return fallbackTitleGeneration(userMessage, language);
  }
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
    const title = words.join(' ');
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
