// server/src/services/markov-suggestions.service.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SuggestionPattern {
  keywords: string[];
  suggestions: string[];
  category: string;
}

// Markov chain-based suggestion patterns
const SUGGESTION_PATTERNS: SuggestionPattern[] = [
  // Program inquiry patterns
  {
    keywords: ['programs', 'courses', 'degrees', 'offerings', 'college of science'],
    suggestions: [
      'Tell me about Computer Science program',
      'What is BS Biology about?',
      'Show me Food Technology curriculum',
      'What careers can I pursue?'
    ],
    category: 'programs'
  },
  
  // Curriculum patterns
  {
    keywords: ['curriculum', 'subjects', 'courses', '1st year', '2nd year', '3rd year', '4th year'],
    suggestions: [
      'What are the 2nd year subjects?',
      'Show me 3rd year curriculum',
      'What are the prerequisites?',
      'Tell me about lab subjects'
    ],
    category: 'curriculum'
  },
  
  // Specific program follow-ups
  {
    keywords: ['computer science', 'cs', 'bsm cs'],
    suggestions: [
      'What programming languages will I learn?',
      'Show me CS 1st year subjects',
      'What are CS career opportunities?',
      'Tell me about CS faculty'
    ],
    category: 'cs_program'
  },
  
  {
    keywords: ['biology', 'bio', 'bs biology'],
    suggestions: [
      'What are Biology lab subjects?',
      'Show me Biology 1st year curriculum',
      'What careers in Biology?',
      'Tell me about Biology research'
    ],
    category: 'biology_program'
  },
  
  {
    keywords: ['food technology', 'food tech', 'bs ft'],
    suggestions: [
      'What is Food Technology about?',
      'Show me Food Tech subjects',
      'What are Food Tech careers?',
      'Tell me about OJT requirements'
    ],
    category: 'foodtech_program'
  },
  
  {
    keywords: ['environmental science', 'envi sci', 'environmental'],
    suggestions: [
      'What specializations are available?',
      'Show me Environmental Science subjects',
      'Tell me about climate change track',
      'What are the career paths?'
    ],
    category: 'envisci_program'
  },
  
  {
    keywords: ['statistics', 'applied statistics', 'bsm as'],
    suggestions: [
      'What statistical software will I learn?',
      'Show me Statistics curriculum',
      'What are Statistics careers?',
      'Tell me about data science'
    ],
    category: 'stats_program'
  },
  
  {
    keywords: ['business applications', 'bsm ba'],
    suggestions: [
      'What business courses are included?',
      'Show me Business Applications subjects',
      'What careers in business analytics?',
      'Tell me about internship'
    ],
    category: 'ba_program'
  },
  
  // Faculty patterns
  {
    keywords: ['faculty', 'professor', 'teacher', 'instructor'],
    suggestions: [
      'Who teaches Computer Science?',
      'Show me Mathematics faculty',
      'What are consultation hours?',
      'Who is the department head?'
    ],
    category: 'faculty'
  },
  
  // Admission patterns
  {
    keywords: ['admission', 'enrollment', 'requirements', 'apply'],
    suggestions: [
      'What are the admission requirements?',
      'When is enrollment period?',
      'What documents do I need?',
      'How do I apply?'
    ],
    category: 'admission'
  },
  
  // Career patterns
  {
    keywords: ['career', 'job', 'work', 'opportunities'],
    suggestions: [
      'What jobs can I get?',
      'Tell me about internship programs',
      'What companies hire graduates?',
      'What is the job market like?'
    ],
    category: 'career'
  },
  
  // Year-specific patterns
  {
    keywords: ['1st year', 'first year', 'freshman'],
    suggestions: [
      'What about 2nd year subjects?',
      'Show me 1st semester schedule',
      'What are the general education subjects?',
      'Tell me about NSTP'
    ],
    category: 'year1'
  },
  
  {
    keywords: ['2nd year', 'second year', 'sophomore'],
    suggestions: [
      'What about 3rd year subjects?',
      'Show me major subjects',
      'What electives are available?',
      'Tell me about lab work'
    ],
    category: 'year2'
  },
  
  {
    keywords: ['3rd year', 'third year', 'junior'],
    suggestions: [
      'What about 4th year subjects?',
      'Tell me about thesis requirements',
      'When is OJT scheduled?',
      'What specialization courses?'
    ],
    category: 'year3'
  },
  
  {
    keywords: ['4th year', 'fourth year', 'senior'],
    suggestions: [
      'What are graduation requirements?',
      'Tell me about thesis defense',
      'When is internship?',
      'What about board exam preparation?'
    ],
    category: 'year4'
  }
];

/**
 * Generate smart follow-up suggestions using Markov chain-like pattern matching
 */
export async function generateSmartSuggestions(
  userMessage: string,
  aiResponse: string,
  userId: string,
  language: string = 'en'
): Promise<string[]> {
  try {
    const combinedText = `${userMessage} ${aiResponse}`.toLowerCase();
    const suggestions: string[] = [];
    const matchedCategories = new Set<string>();

    // Find matching patterns based on keywords
    for (const pattern of SUGGESTION_PATTERNS) {
      const hasMatch = pattern.keywords.some(keyword => 
        combinedText.includes(keyword.toLowerCase())
      );

      if (hasMatch && !matchedCategories.has(pattern.category)) {
        matchedCategories.add(pattern.category);
        // Add 2 suggestions from this pattern
        suggestions.push(...pattern.suggestions.slice(0, 2));
      }

      if (suggestions.length >= 4) break;
    }

    // Get user's recent interaction history for personalized suggestions
    const recentInteractions = await prisma.aIInteraction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        userMessage: true,
        context: true
      }
    });

    // Extract program context from recent history
    const programs = await prisma.universityProgram.findMany({
      where: { college: 'College of Science', isActive: true }
    });

    let contextualProgram: string | null = null;
    for (const interaction of recentInteractions) {
      for (const program of programs) {
        if (interaction.userMessage.toLowerCase().includes(program.title.toLowerCase()) ||
            (program.abbreviation && interaction.userMessage.toLowerCase().includes(program.abbreviation.toLowerCase()))) {
          contextualProgram = program.title;
          break;
        }
      }
      if (contextualProgram) break;
    }

    // Add contextual program-specific suggestion
    if (contextualProgram && suggestions.length < 4) {
      suggestions.push(`Tell me more about ${contextualProgram}`);
    }

    // Translate suggestions if Filipino
    if (language === 'fil') {
      return translateSuggestionsToFilipino(suggestions.slice(0, 4));
    }

    // Return top 4 unique suggestions
    return [...new Set(suggestions)].slice(0, 4);

  } catch (error) {
    console.error('Error generating smart suggestions:', error);
    // Return default suggestions
    return getDefaultSuggestions(language);
  }
}

/**
 * Get default suggestions for new conversations (randomized)
 */
export function getDefaultSuggestions(language: string = 'en'): string[] {
  const conversationStartersEn = [
    'What programs does College of Science offer?',
    'Tell me about Computer Science',
    'Show me Biology curriculum',
    'What are the admission requirements?',
    'What is Food Technology about?',
    'Tell me about Environmental Science',
    'What careers can I pursue with Biology?',
    'Show me 1st year subjects',
    'Who are the faculty members?',
    'What is Medical Technology?',
    'Tell me about Mathematics programs',
    'What are the specializations available?',
    'How do I enroll in COS?',
    'What is the difference between programs?',
    'Tell me about internship opportunities',
    'What are the laboratory facilities?',
    'Show me 2nd year curriculum',
    'What jobs can I get after graduation?',
    'Tell me about research opportunities',
    'What are the prerequisites for courses?'
  ];

  const conversationStartersFil = [
    'Anong mga programa ang inaalok ng College of Science?',
    'Sabihin mo sa akin tungkol sa Computer Science',
    'Ipakita mo ang Biology curriculum',
    'Ano ang mga requirements sa admission?',
    'Ano ang Food Technology?',
    'Sabihin mo tungkol sa Environmental Science',
    'Anong mga karera ang pwede sa Biology?',
    'Ipakita ang 1st year subjects',
    'Sino ang mga faculty members?',
    'Ano ang Medical Technology?',
    'Sabihin mo tungkol sa Mathematics programs',
    'Anong mga specialization ang available?',
    'Paano mag-enroll sa COS?',
    'Ano ang pagkakaiba ng mga programa?',
    'Sabihin mo tungkol sa internship opportunities',
    'Ano ang mga laboratory facilities?',
    'Ipakita ang 2nd year curriculum',
    'Anong trabaho ang makukuha pagkatapos?',
    'Sabihin mo tungkol sa research opportunities',
    'Ano ang mga prerequisite ng courses?'
  ];

  const starters = language === 'fil' ? conversationStartersFil : conversationStartersEn;
  
  // Randomize and return 4 suggestions
  return shuffleArray(starters).slice(0, 4);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Translate suggestions to Filipino
 */
function translateSuggestionsToFilipino(suggestions: string[]): string[] {
  const translations: Record<string, string> = {
    'Tell me about': 'Sabihin mo sa akin tungkol sa',
    'Show me': 'Ipakita mo ang',
    'What are': 'Ano ang',
    'What is': 'Ano ang',
    'What about': 'Paano naman ang',
    'Who teaches': 'Sino ang nagtuturo ng',
    'Who is': 'Sino ang',
    'When is': 'Kailan ang',
    'How do I': 'Paano ako',
    'curriculum': 'kurikulum',
    'subjects': 'mga subject',
    'career': 'karera',
    'opportunities': 'mga oportunidad',
    'requirements': 'mga requirements',
    'faculty': 'mga guro',
    'program': 'programa',
    'courses': 'mga kurso'
  };

  return suggestions.map(suggestion => {
    let translated = suggestion;
    for (const [en, fil] of Object.entries(translations)) {
      translated = translated.replace(new RegExp(en, 'gi'), fil);
    }
    return translated;
  });
}

/**
 * Generate greeting message based on time and user history
 */
export async function generateGreeting(userId: string, language: string = 'en'): Promise<string> {
  try {
    const hour = new Date().getHours();
    let timeGreeting = '';

    if (language === 'fil') {
      if (hour < 12) timeGreeting = 'Magandang umaga';
      else if (hour < 18) timeGreeting = 'Magandang hapon';
      else timeGreeting = 'Magandang gabi';
    } else {
      if (hour < 12) timeGreeting = 'Good morning';
      else if (hour < 18) timeGreeting = 'Good afternoon';
      else timeGreeting = 'Good evening';
    }

    // Check if user has previous interactions
    const interactionCount = await prisma.aIInteraction.count({
      where: { userId }
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true }
    });

    const userName = user?.firstName || '';

    if (interactionCount === 0) {
      // First time user
      if (language === 'fil') {
        return `${timeGreeting}${userName ? `, ${userName}` : ''}! 👋\n\nAko si **TISA** (The Intelligent Student Assistant), ang iyong AI tutor para sa Bulacan State University – College of Science.\n\nNarito ako upang tulungan ka sa:\n• Mga programa at kurikulum\n• Impormasyon tungkol sa faculty\n• Pag-aaral at akademikong gabay\n• At marami pang iba!\n\n**Paano kita matutulungan ngayong araw?** 🎓`;
      } else {
        return `${timeGreeting}${userName ? `, ${userName}` : ''}! 👋\n\nI'm **TISA** (The Intelligent Student Assistant), your AI tutor for Bulacan State University – College of Science.\n\nI'm here to help you with:\n• Programs and curriculum information\n• Faculty details\n• Study guidance and academic support\n• And much more!\n\n**How can I help you today?** 🎓`;
      }
    } else {
      // Returning user
      if (language === 'fil') {
        return `${timeGreeting}${userName ? `, ${userName}` : ''}! Mabuti na nakita ka ulit! 😊\n\n**Paano kita matutulungan ngayong araw?**`;
      } else {
        return `${timeGreeting}${userName ? `, ${userName}` : ''}! Great to see you again! 😊\n\n**How can I help you today?**`;
      }
    }
  } catch (error) {
    console.error('Error generating greeting:', error);
    return language === 'fil' 
      ? 'Kumusta! Paano kita matutulungan?' 
      : 'Hello! How can I help you?';
  }
}

/**
 * Check if user query is within BSU COS scope
 */
export function isWithinScope(userMessage: string): { inScope: boolean; reason?: string } {
  const lowerMsg = userMessage.toLowerCase();

  // BSU COS related keywords
  const scopeKeywords = [
    'bsu', 'bulacan state', 'college of science', 'cos',
    'program', 'curriculum', 'subject', 'course', 'faculty',
    'professor', 'teacher', 'admission', 'enrollment',
    'computer science', 'biology', 'food technology',
    'environmental science', 'mathematics', 'statistics',
    'medical technology', 'business applications',
    'career', 'job', 'graduate', 'degree',
    'semester', 'year level', 'prerequisite',
    'lab', 'lecture', 'thesis', 'ojt', 'internship'
  ];

  // Out of scope indicators
  const outOfScopeKeywords = [
    'weather', 'news', 'politics', 'sports',
    'recipe', 'cooking', 'movie', 'music',
    'celebrity', 'entertainment', 'shopping',
    'travel', 'hotel', 'restaurant'
  ];

  // Check if message contains out-of-scope keywords
  const hasOutOfScope = outOfScopeKeywords.some(keyword => lowerMsg.includes(keyword));
  if (hasOutOfScope) {
    return { 
      inScope: false, 
      reason: 'out_of_scope_topic' 
    };
  }

  // Check if message contains in-scope keywords
  const hasInScope = scopeKeywords.some(keyword => lowerMsg.includes(keyword));
  
  // If message is very short and generic, consider it in scope (let AI handle)
  if (lowerMsg.length < 20 && !hasOutOfScope) {
    return { inScope: true };
  }

  return { 
    inScope: hasInScope || lowerMsg.length < 50, 
    reason: hasInScope ? undefined : 'unclear_intent' 
  };
}

/**
 * Generate out-of-scope response
 */
export function generateOutOfScopeResponse(language: string = 'en'): string {
  if (language === 'fil') {
    return `Paumanhin, pero ang aking kaalaman ay limitado lamang sa **Bulacan State University – College of Science**. 🎓\n\nMaaari akong tumulong sa:\n• Mga programa at kurikulum ng COS\n• Impormasyon tungkol sa faculty\n• Pag-aaral at akademikong gabay\n• Admission at enrollment\n• Career opportunities\n\n**Mayroon ka bang tanong tungkol sa BSU College of Science?**`;
  } else {
    return `I apologize, but my knowledge is limited to **Bulacan State University – College of Science** only. 🎓\n\nI can help you with:\n• COS programs and curriculum\n• Faculty information\n• Study and academic guidance\n• Admission and enrollment\n• Career opportunities\n\n**Do you have any questions about BSU College of Science?**`;
  }
}
