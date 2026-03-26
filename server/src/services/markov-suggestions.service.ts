// server/src/services/markov-suggestions.service.ts
import { prisma } from '../lib/prisma';

interface SuggestionPattern {
  keywords: string[];
  suggestions: string[];
  category: string;
}

// Markov chain-based suggestion patterns - ONLY answerable questions
const SUGGESTION_PATTERNS: SuggestionPattern[] = [
  // Program inquiry patterns
  {
    keywords: ['programs', 'courses', 'degrees', 'offerings', 'college of science'],
    suggestions: [
      'What programs does College of Science offer?',
      'What is Computer Science program about?',
      'Tell me about Biology program',
      'What is Food Technology?'
    ],
    category: 'programs'
  },
  
  // Curriculum patterns
  {
    keywords: ['curriculum', 'subjects', 'courses', '1st year', '2nd year', '3rd year', '4th year'],
    suggestions: [
      'Show me 1st year curriculum',
      'What are 2nd year subjects?',
      'Show me 3rd year curriculum',
      'What are the prerequisites?'
    ],
    category: 'curriculum'
  },
  
  // Specific program follow-ups - Computer Science
  {
    keywords: ['computer science', 'cs', 'bsm cs', 'programming', 'software'],
    suggestions: [
      'Show me Computer Science curriculum',
      'What are CS career opportunities?',
      'Who teaches Computer Science?',
      'What programming languages will I learn?'
    ],
    category: 'cs_program'
  },
  
  // Biology
  {
    keywords: ['biology', 'bio', 'bs biology', 'life science'],
    suggestions: [
      'Show me Biology curriculum',
      'What careers in Biology?',
      'What are Biology lab subjects?',
      'Tell me about Biology research'
    ],
    category: 'biology_program'
  },
  
  // Food Technology
  {
    keywords: ['food technology', 'food tech', 'bs ft'],
    suggestions: [
      'Show me Food Technology curriculum',
      'What are Food Tech careers?',
      'What subjects are in Food Technology?',
      'Tell me about Food Tech laboratory'
    ],
    category: 'foodtech_program'
  },
  
  // Environmental Science
  {
    keywords: ['environmental science', 'envi sci', 'environmental', 'bses'],
    suggestions: [
      'Show me Environmental Science curriculum',
      'What are Environmental Science careers?',
      'What specializations are available?',
      'Tell me about climate change track'
    ],
    category: 'envisci_program'
  },
  
  // Statistics/Applied Statistics
  {
    keywords: ['statistics', 'applied statistics', 'bsm as', 'data science'],
    suggestions: [
      'Show me Statistics curriculum',
      'What are Statistics careers?',
      'What statistical software will I learn?',
      'Tell me about data science track'
    ],
    category: 'stats_program'
  },
  
  // Business Applications
  {
    keywords: ['business applications', 'bsm ba', 'business analytics'],
    suggestions: [
      'Show me Business Applications curriculum',
      'What careers in business analytics?',
      'What business courses are included?',
      'Tell me about internship'
    ],
    category: 'ba_program'
  },
  
  // Medical Technology
  {
    keywords: ['medical technology', 'med tech', 'bs mt', 'medical laboratory'],
    suggestions: [
      'Show me Medical Technology curriculum',
      'What are Medical Technology careers?',
      'What subjects are in Medical Technology?',
      'Tell me about clinical internship'
    ],
    category: 'medtech_program'
  },
  
  // Faculty patterns
  {
    keywords: ['faculty', 'professor', 'teacher', 'instructor', 'dean', 'chair'],
    suggestions: [
      'Who is the Dean of College of Science?',
      'Who are the faculty members?',
      'Who teaches Computer Science?',
      'What are consultation hours?'
    ],
    category: 'faculty'
  },
  
  // Faculty Schedule
  {
    keywords: ['schedule', 'class schedule', 'teaching schedule', 'office hours'],
    suggestions: [
      'What is the schedule of the Dean?',
      'Show me faculty teaching schedules',
      'What are consultation hours?',
      'When are office hours?'
    ],
    category: 'schedule'
  },
  
  // Room Schedule
  {
    keywords: ['room schedule', 'room', 'fh', 'fs', 'laboratory room'],
    suggestions: [
      'What is the schedule for FH 107?',
      'Show me room schedules',
      'What are laboratory room schedules?',
      'Show me FH 106 schedule'
    ],
    category: 'room_schedule'
  },
  
  // Admission patterns
  {
    keywords: ['admission', 'enrollment', 'requirements', 'apply', 'how to enroll'],
    suggestions: [
      'What are the admission requirements?',
      'When is enrollment period?',
      'What documents do I need?',
      'How do I apply for BSU?'
    ],
    category: 'admission'
  },
  
  // Career patterns
  {
    keywords: ['career', 'job', 'work', 'opportunities', 'graduate', 'after graduation'],
    suggestions: [
      'What jobs can I get after Computer Science?',
      'What are career opportunities in Biology?',
      'Tell me about internship programs',
      'What companies hire COS graduates?'
    ],
    category: 'career'
  },
  
  // Prerequisite patterns
  {
    keywords: ['prerequisite', 'prerequisites', 'can i take', 'failed', 'bumagsak'],
    suggestions: [
      'What are the prerequisites for Thesis?',
      'Can I take Thesis if I failed Calculus?',
      'What subjects are prerequisites?',
      'What are the requirements for OJT?'
    ],
    category: 'prerequisite'
  },
  
  // Year-specific patterns - 1st Year
  {
    keywords: ['1st year', 'first year', 'freshman'],
    suggestions: [
      'What are 1st year subjects for Computer Science?',
      'Show me 1st year curriculum',
      'What are the general education subjects?',
      'Tell me about 1st semester schedule'
    ],
    category: 'year1'
  },
  
  // 2nd Year
  {
    keywords: ['2nd year', 'second year', 'sophomore'],
    suggestions: [
      'What are 2nd year major subjects?',
      'Show me 2nd year curriculum for Biology',
      'What electives are available in 2nd year?',
      'Tell me about laboratory subjects'
    ],
    category: 'year2'
  },
  
  // 3rd Year
  {
    keywords: ['3rd year', 'third year', 'junior'],
    suggestions: [
      'What are 3rd year specialization courses?',
      'Show me 3rd year curriculum',
      'What are thesis requirements?'
    ],
    category: 'year3'
  },
  
  // 4th Year
  {
    keywords: ['4th year', 'fourth year', 'senior'],
    suggestions: [
      'What are graduation requirements?',
      'Tell me about thesis defense',
      'When is internship?',
      'What about board exam preparation?'
    ],
    category: 'year4'
  },
  
  // Thesis/Research
  {
    keywords: ['thesis', 'research', 'capstone', 'defense'],
    suggestions: [
      'What are the thesis requirements?',
      'When is thesis proposal?',
      'Who are the thesis advisers?',
      'What is the thesis format?'
    ],
    category: 'thesis'
  },
  
  // OJT/Internship
  {
    keywords: ['ojt', 'internship', 'on the job training', 'practicum'],
    suggestions: [
      'What are Internship requirements?',
      'Where can I take OJT?',
      'Who is the OJT coordinator?'
    ],
    category: 'ojt'
  },
  
  // Scholarship/Financial
  {
    keywords: ['scholarship', 'financial aid', 'tuition', 'fee'],
    suggestions: [
      'What scholarships are available?',
      'How to apply for scholarship?',
      'What are tuition fees?',
      'What financial assistance is offered?'
    ],
    category: 'scholarship'
  },
  
  // Student Services
  {
    keywords: ['student services', 'guidance', 'counseling', 'library'],
    suggestions: [
      'Where is the guidance office?',
      'What are library hours?',
      'How to get student ID?',
      'What student services are available?'
    ],
    category: 'services'
  },
  
  // Graduation
  {
    keywords: ['graduation', 'graduate', 'commencement', 'to graduate'],
    suggestions: [
      'What are graduation requirements?',
      'When is graduation ceremony?',
      'What are the clearance requirements?',
      'How to apply for graduation?'
    ],
    category: 'graduation'
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
        // Add up to 2 suggestions from this pattern
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
 * ALL suggestions are answerable by the AI
 */
export function getDefaultSuggestions(language: string = 'en'): string[] {
  const conversationStartersEn = [
    'What programs does College of Science offer?',
    'Show me Computer Science curriculum',
    'Tell me about Biology program',
    'What are the admission requirements?',
    'What is Food Technology?',
    'Show me 1st year subjects',
    'Who are the faculty members?',
    'What careers can I pursue with Computer Science?',
    'What are the prerequisites for Thesis?',
    'When is enrollment period?',
    'What is the schedule for FH 107?',
    'Who is the Dean of College of Science?',
    'What scholarships are available?',
    'What are the graduation requirements?'
  ];

  const conversationStartersFil = [
    'Anong mga programa ang inaalok ng College of Science?',
    'Ipakita ang Computer Science curriculum',
    'Sabihin mo tungkol sa Biology program',
    'Ano ang mga requirements sa admission?',
    'Ano ang Food Technology?',
    'Ipakita ang 1st year subjects',
    'Sino ang mga faculty members?',
    'Anong mga karera ang pwede sa Computer Science?',
    'Ano ang mga prerequisites para sa Thesis?',
    'Kailan ang enrollment period?',
    'Ano ang schedule para sa FH 107?',
    'Sino ang Dean ng College of Science?',
    'Anong scholarships ang available?',
    'Kailan ang OJT schedule?',
    'Ano ang mga graduation requirements?'
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
    'Tell me more about': 'Sabihin mo pa tungkol sa',
    'Tell me about': 'Sabihin mo tungkol sa',
    'Show me': 'Ipakita mo ang',
    'What are': 'Ano ang',
    'What is': 'Ano ang',
    'What about': 'Paano naman ang',
    'Who teaches': 'Sino ang nagtuturo ng',
    'Who is': 'Sino ang',
    'When is': 'Kailan ang',
    'How do I': 'Paano ako',
    'Can I': 'Pwede ba ako',
    'curriculum': 'kurikulum',
    'subjects': 'mga subject',
    'career opportunities': 'mga oportunidad sa karera',
    'career': 'karera',
    'opportunities': 'mga oportunidad',
    'requirements': 'mga requirements',
    'faculty': 'mga guro',
    'program': 'programa',
    'courses': 'mga kurso',
    'prerequisites': 'mga prerequisite',
    'schedule': 'iskedyul',
    'enrollment': 'enrollment',
    'graduation': 'graduation',
    'scholarships': 'scholarships',
    'OJT': 'OJT',
    'internship': 'internship',
    'thesis': 'thesis'
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

  // BSU COS related keywords - ALL answerable by AI
  const scopeKeywords = [
    // Programs
    'bsu', 'bulacan state', 'college of science', 'cos',
    'program', 'curriculum', 'subject', 'course', 
    'computer science', 'biology', 'food technology',
    'environmental science', 'mathematics', 'statistics',
    'medical technology', 'business applications',
    
    // Academic
    'faculty', 'professor', 'teacher', 'dean', 'chair',
    'admission', 'enrollment', 'semester', 'year level',
    'prerequisite', 'prerequisites', 'thesis', 'ojt', 'internship',
    'graduation', 'graduate', 'scholarship',
    
    // Careers
    'career', 'job', 'work', 'opportunities', 'graduate',
    
    // Schedules
    'schedule', 'class schedule', 'room schedule', 'office hours',
    'consultation', 'fh', 'fs', 'laboratory',
    
    // Student services
    'library', 'guidance', 'student services', 'id'
  ];

  // Out of scope indicators - topics AI CANNOT answer
  const outOfScopeKeywords = [
    'weather', 'news', 'politics', 'sports',
    'recipe', 'cooking', 'movie', 'music',
    'celebrity', 'entertainment', 'shopping',
    'travel', 'hotel', 'restaurant', 'gambling',
    'stock market', 'cryptocurrency', 'bitcoin'
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
  
  // Generic greetings and short messages are in scope
  const greetings = ['hi', 'hello', 'hey', 'kumusta', 'kamusta', 'musta'];
  const isGreeting = greetings.some(g => lowerMsg === g || lowerMsg === g + '!' || lowerMsg === g + '?');
  
  if (isGreeting || lowerMsg.length < 30) {
    return { inScope: true };
  }

  return { 
    inScope: hasInScope, 
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