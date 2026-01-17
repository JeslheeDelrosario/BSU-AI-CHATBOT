// server/src/controllers/ai-tutor.controller.ts
// STRICT RAG-BASED AI TUTOR - Only answers from database knowledge
import { Response } from 'express';
import { PrismaClient, AIInteractionType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import OpenAI from 'openai';
import { 
  generateSmartSuggestions, 
  generateGreeting, 
  getDefaultSuggestions 
} from '../services/markov-suggestions.service';
import { generateChatTitle } from '../services/title-generator.service';
import {
  retrieveRAGContext,
  formatRAGContextForPrompt,
  analyzeQueryScope,
  generateCourseRecommendation,
  RAGContext
} from '../services/rag-context.service';

const prisma = new PrismaClient();

// Initialize OpenAI client
let openai: OpenAI;
try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Failed to initialize OpenAI client:', error);
}

// STRICT RAG-BASED AI Response Generator
// CRITICAL: AI must ONLY answer based on database context provided
const generateAIResponse = async (
  userMessage: string, 
  ragContext: RAGContext,
  lastInteraction?: {userMessage: string; aiResponse: string} | null,
  language: string = 'en'
): Promise<string> => {
  try {
    // Language instruction based on user preference
    const languageInstruction = language === 'fil' 
      ? `
## CRITICAL LANGUAGE REQUIREMENT
You MUST respond ENTIRELY in Filipino (Tagalog). All your responses, explanations, questions, and information must be in Filipino.
- Use natural, conversational Filipino
- Technical terms can remain in English but explain them in Filipino
- Be warm and friendly using Filipino expressions
`
      : `
## LANGUAGE REQUIREMENT
Respond in clear, professional English.
`;

    // Format the RAG context for the prompt
    const databaseContext = formatRAGContextForPrompt(ragContext);

    // STRICT RAG-BASED TISA SYSTEM PROMPT
    const TISA_SYSTEM_PROMPT = `
# YOU ARE TISA - The Intelligent Student Assistant
# STRICT RAG-BASED SYSTEM - DATABASE KNOWLEDGE ONLY
${languageInstruction}

## CRITICAL RESTRICTION - READ CAREFULLY
**YOU CAN ONLY ANSWER QUESTIONS BASED ON THE DATABASE KNOWLEDGE PROVIDED BELOW.**

### ABSOLUTE RULES:
1. **ONLY use information from the "DATABASE KNOWLEDGE BASE" section below**
2. **If information is NOT in the database, you MUST say you don't have that information**
3. **NEVER use your general knowledge to answer questions**
4. **NEVER make up or invent information**
5. **If asked about topics outside BSU College of Science, politely decline**

### OUT OF SCOPE RESPONSES:
If a user asks about ANYTHING not related to BSU College of Science (like geography, weather, news, entertainment, sports, recipes, politics, etc.), respond with:

${language === 'fil' 
  ? '"Paumanhin, ngunit ang aking kaalaman ay limitado lamang sa **Bulacan State University – College of Science**. Hindi ako makakatulong sa mga tanong tungkol sa [topic]. Mayroon ka bang tanong tungkol sa aming mga programa, kurikulum, faculty, o admission?"'
  : '"I apologize, but my knowledge is strictly limited to **Bulacan State University – College of Science**. I cannot help with questions about [topic]. Do you have any questions about our programs, curriculum, faculty, or admission?"'
}

### WHEN DATABASE HAS NO INFORMATION:
If the database section shows "NO SPECIFIC DATA FOUND" or lacks information for a valid BSU COS question, say:
${language === 'fil'
  ? '"Paumanhin, wala akong impormasyon tungkol dito sa aking database. Maaari mong kontakin ang COS office para sa mas detalyadong impormasyon."'
  : '"I apologize, but I don\'t have information about that in my database. Please contact the COS office for more detailed information."'
}

## YOUR IDENTITY
- **Name**: TISA (The Intelligent Student Assistant)
- **Role**: Academic advisor for BSU College of Science ONLY
- **Knowledge Source**: ONLY the database provided below
- **Scope**: BSU COS programs, curriculum, faculty, admission, careers

## WHAT YOU CAN HELP WITH (from database):
✅ BSU College of Science programs and degrees
✅ Curriculum and subjects (if in database)
✅ Faculty members (if in database)
✅ Career paths for COS programs
✅ Course recommendations based on career goals
✅ Academic guidance within COS scope

## WHAT YOU CANNOT HELP WITH:
❌ General knowledge questions (geography, history, science facts)
❌ Current events, news, weather
❌ Entertainment (movies, music, games)
❌ Sports scores or information
❌ Recipes or cooking
❌ Shopping or product recommendations
❌ Travel or tourism
❌ Politics or government (unless BSU-related)
❌ Health advice (unless about Medical Technology program)
❌ ANY topic not in the database below

## RESPONSE GUIDELINES:
1. Always check if the question relates to BSU COS
2. Only provide information that exists in the DATABASE KNOWLEDGE BASE
3. If recommending a course, use ONLY programs from the database
4. For faculty questions, use ONLY names from the database
5. For curriculum, use ONLY subjects from the database
6. Be helpful but honest when you don't have information

## COURSE RECOMMENDATION FORMAT:
When recommending courses for career goals, structure your response as:
1. **Recommended Program**: [Program name from database]
2. **Why This Program**: [Based on career paths in database]
3. **Key Subjects You'll Learn**: [From curriculum in database]
4. **Career Opportunities**: [From database career paths]

${databaseContext}

${lastInteraction ? `
## LAST CONVERSATION (for context continuity):
**User's Previous Message**: ${lastInteraction.userMessage}
**Your Previous Response**: ${lastInteraction.aiResponse}
Use this to understand follow-up questions, but still only answer from database.
` : ''}

## FINAL REMINDER:
You are a RETRIEVAL-AUGMENTED GENERATION system. Your responses must be GROUNDED in the database context above.
If the information isn't in the database, say so politely. Never hallucinate or make up information.
`.trim();

    const lowerMsg = userMessage.toLowerCase();

    // Detect simple greetings and respond appropriately
    const simpleGreetings = ['hi', 'hello', 'hey', 'kumusta', 'kamusta', 'musta', 'good morning', 'good afternoon', 'good evening', 'magandang umaga', 'magandang hapon', 'magandang gabi'];
    const isSimpleGreeting = simpleGreetings.some(greeting => {
      const msg = lowerMsg.trim();
      return msg === greeting || msg === greeting + '!' || msg === greeting + '?';
    });

    if (isSimpleGreeting && !lastInteraction) {
      // First message is a simple greeting - respond warmly
      if (language === 'fil') {
        return `Kumusta! 👋 Ako si **TISA**, ang iyong AI tutor para sa Bulacan State University – College of Science.\n\n**Paano kita matutulungan ngayong araw?** Maaari akong magbigay ng impormasyon tungkol sa:\n• Mga programa at kurikulum\n• Faculty members\n• Admission requirements\n• Career opportunities\n• At marami pang iba!\n\nMagtanong lang! 😊`;
      } else {
        return `Hello! 👋 I'm **TISA**, your AI tutor for Bulacan State University – College of Science.\n\n**How can I help you today?** I can provide information about:\n• Programs and curriculum\n• Faculty members\n• Admission requirements\n• Career opportunities\n• And much more!\n\nFeel free to ask me anything! 😊`;
      }
    }

    // Build messages for OpenAI
    const messages: Array<{role: 'user' | 'assistant', content: string}> = [
      { role: 'system' as any, content: TISA_SYSTEM_PROMPT }
    ];

    // Add only the last interaction if available
    if (lastInteraction) {
      messages.push({ role: 'user', content: lastInteraction.userMessage });
      messages.push({ role: 'assistant', content: lastInteraction.aiResponse });
    }

    // Add current user message
    messages.push({ role: 'user', content: userMessage });

    // Detect faculty inquiries
    const facultyRoles = [
      'Dean', 'Associate Dean', 'Chairperson',
      'Department Head, Science Department',
      'Department Head, Mathematics Department',
      'Program Chair, BS Mathematics',
      'Program Chair, BS Biology',
      'Program Chair, BS Food Technology',
      'Program Chair, BS Environmental Science',
      'Program Chair, BS Medical Technology',
      'College Extension and Services Unit (CESU) Head',
      'College Research Development Unit (CRDU) Head',
      'Student Internship Program Coordinator',
      'College Clerk', 'Laboratory Technician',
      'Medical Laboratory Technician',
      'Computer Laboratory Technician',
      'Professor, Science', 'Professor, Mathematics',
      'Faculty (Part-Time), Science',
      'Faculty (Part-Time), Mathematics',
      'Assistant Professor', 'Instructor', 'Lecturer'
    ];

    for (const role of facultyRoles) {
      const normalizedRole = role.toLowerCase().replace(/,/g, '').replace(/\s+/g, ' ');
      if (lowerMsg.includes(normalizedRole)) {
        const facultyList = await prisma.faculty.findMany({
          where: { 
            position: role,
            college: 'College of Science'
          },
          orderBy: { lastName: 'asc' }
        });

        if (facultyList.length === 0) {
          return `I don't have information about the ${role} for the College of Science at the moment. I recommend checking with the COS office directly or visiting the official BSU website for the most current faculty information.`;
        }

        const names = facultyList.map(f => `${f.firstName} ${f.lastName}`).join(', ');
        const plural = facultyList.length > 1;
        
        return `The ${role}${plural ? 's' : ''} of the College of Science ${plural ? 'are' : 'is'} **${names}**.

Would you like to know more about their office hours or how to contact them?`;
      }
    }

    // Detect curriculum inquiries with context awareness, robust matching and disambiguation
    const programs = await prisma.universityProgram.findMany({ 
      where: { college: 'College of Science', isActive: true } 
    });

    const normalize = (s: string) => s?.toString().toLowerCase().replace(/[^a-z0-9\s]/g, '').trim() || '';

    // Extra abbreviation aliases (common variants users might type)
    const abbrAliases: Record<string, string> = {
      'bs bio': 'biology',
      'bs envi sci': 'environmental science',
      'bs envisci': 'environmental science',
      'bs ft': 'food technology',
      'bsm as': 'applied statistics',
      'bsm cs': 'computer science',
      'bsm ba': 'business applications',
      'bs med lab sci': 'medical laboratory science',
      'bs mt': 'medical technology'
    };

    // Return an array of program candidates (may be empty)
    const findProgramCandidates = (text: string) => {
      const t = normalize(text);
      const candidates: any[] = [];

      for (const p of programs) {
        const title = normalize(p.title);
        const abbr = p.abbreviation ? normalize(p.abbreviation) : '';

        if (abbr && (t === abbr || t.includes(abbr) || abbr.includes(t))) {
          candidates.push(p);
          continue;
        }

        if (t.includes(title) || title.includes(t)) {
          candidates.push(p);
          continue;
        }

        // check alias abbreviations
        for (const [alias, keyword] of Object.entries(abbrAliases)) {
          if (t.includes(alias) && title.includes(keyword)) {
            candidates.push(p);
            break;
          }
        }

        // keyword-based matches (helpful for shorter user phrasing)
        const keywords = ['computer science', 'food technology', 'environmental science', 'medical technology', 'biology', 'mathematics', 'business applications', 'applied statistics', 'medical laboratory'];
        for (const kw of keywords) {
          if (title.includes(kw) && t.includes(kw)) {
            candidates.push(p);
            break;
          }
        }

        // token overlap heuristic - require >=2 tokens to reduce false positives
        const titleTokens = title.split(/\s+/).filter(tok => tok.length > 2);
        const tokenMatches = titleTokens.filter(tok => t.includes(tok));
        if (tokenMatches.length >= 2) candidates.push(p);
      }

      // deduplicate
      return Array.from(new Set(candidates));
    };

    // Find candidates in current or last messages
    let candidates = findProgramCandidates(lowerMsg);
    if (candidates.length === 0 && lastInteraction) {
      candidates = findProgramCandidates(lastInteraction.userMessage) || findProgramCandidates(lastInteraction.aiResponse);
    }

    // If multiple candidates, ask a clarifying question listing options
    if (candidates.length > 1) {
      const options = candidates.map((c, i) => `${i+1}. ${c.title}${c.abbreviation ? ` (${c.abbreviation})` : ''}`).join('\n');
      return `I found a few programs that might match your question:\n${options}\n\nWhich one do you mean? Please reply with the number or program name (for example, "1" or "${candidates[0].title}").`;
    }

    // If exactly one candidate, select it
    let programMatch: any | null = candidates.length === 1 ? candidates[0] : null;

    // If we didn't detect a program but user asked about programs generally, don't force a program match here

    // Improved year extraction (numeric and worded years)
    const wordToNumber: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4 };

    const yearMatches: number[] = [];
    const numYearRegex = /(\d+)(st|nd|rd|th)?\s*year/gi;
    let m: RegExpExecArray | null;
    while ((m = numYearRegex.exec(lowerMsg))) {
      yearMatches.push(parseInt(m[1], 10));
    }
    const wordYearRegex = /\b(first|second|third|fourth)\s*year\b/gi;
    while ((m = wordYearRegex.exec(lowerMsg))) {
      yearMatches.push(wordToNumber[m[1].toLowerCase()]);
    }

    const targetYear = yearMatches.length > 0 ? yearMatches[yearMatches.length - 1] : null;

    // Only treat '2nd'/'second' as a semester when used with 'semester' or 'sem'
    let targetSem: number | null = null;
    const semMatchNum = lowerMsg.match(/(\d+)(st|nd|rd|th)?\s*\bsem(?:ester)?\b/);
    const semWordMatch = lowerMsg.match(/\b(first|second)\s*\bsem(?:ester)?\b/);
    if (semMatchNum) targetSem = parseInt(semMatchNum[1], 10);
    else if (semWordMatch) targetSem = wordToNumber[semWordMatch[1].toLowerCase()];

    // If we found exactly one program but no year specified, ask a clarifying question
    if (programMatch && !targetYear) {
      return `Do you want curriculum details for **${programMatch.title}**? Which year level are you asking about — 1st, 2nd, 3rd, or 4th year? You can also specify a semester (e.g., "2nd semester").`;
    }

    if (programMatch && targetYear) {
      const yearLevel = targetYear;
      const whereClause: any = { programId: programMatch.id, yearLevel };
      if (targetSem) whereClause.semester = targetSem;

      const curriculum = await prisma.curriculumEntry.findMany({
        where: whereClause,
        orderBy: [{ semester: 'asc' }, { courseCode: 'asc' }],
      });

      if (curriculum.length > 0) {
        // Group entries by semester and compute totals
        const grouped: Record<number, any[]> = {};
        for (const c of curriculum) {
          const sem = c.semester || 1;
          grouped[sem] = grouped[sem] || [];
          grouped[sem].push(c);
        }

        const responseParts: string[] = [];
        let grandTotal = 0;

        for (const sem of Object.keys(grouped).sort((a, b) => Number(a) - Number(b))) {
          const entries = grouped[Number(sem)];
          const totalUnits = entries.reduce((sum, e) => sum + (e.totalUnits || 0), 0);
          grandTotal += totalUnits;

          const formattedList = entries
            .map(e => `• **${e.courseCode}** - ${e.subjectName} (${e.totalUnits || 0} ${e.totalUnits === 1 ? 'unit' : 'units'})${e.prerequisites && e.prerequisites.length > 0 ? `\n  Prerequisites: ${e.prerequisites.join(', ')}` : ''}`)
            .join('\n\n');

          responseParts.push(`**Year ${yearLevel} — ${Number(sem) === 1 ? '1st' : '2nd'} Semester**:\n\n${formattedList}\n\n**Total Units (sem ${sem}):** ${totalUnits}`);
        }
        
        const contextNote = targetSem ? '' : '\n\n(Showing both semesters for the year you asked about)';

        return `Here are the subjects for **${programMatch.title}** - Year ${yearLevel}:${contextNote}\n\n${responseParts.join('\n\n')}\n\n**Grand Total Units for Year ${yearLevel}:** ${grandTotal}\n\nWould you like the same breakdown for another year?`;
      } else {
        return `I couldn't find curriculum information for **${programMatch.title}** Year ${yearLevel}${targetSem ? `, Semester ${targetSem}` : ''}. \n\nThis might be because the curriculum is not yet in the system or needs updating. I can contact the COS Registrar or show nearby years if you'd like.`;
      }
    }

    // Detect general COS program inquiries
    const isAskingAboutPrograms = 
      lowerMsg.includes('college of science') ||
      lowerMsg.includes('cos programs') ||
      lowerMsg.includes('course offerings') ||
      lowerMsg.includes('what programs') ||
      lowerMsg.includes('what are the courses') ||
      lowerMsg.includes('bsu cos') ||
      lowerMsg.includes('offered programs') ||
      lowerMsg.includes('what courses') ||
      lowerMsg.includes('available programs') ||
      lowerMsg.includes('list of programs') ||
      lowerMsg.includes('degrees');

    if (isAskingAboutPrograms) {
      return `**Welcome to BSU College of Science!** 🎓

Here are our official undergraduate programs as of 2025:

**Mathematics Programs:**
• BS Mathematics with Specialization in **Applied Statistics**
• BS Mathematics with Specialization in **Business Applications**
• BS Mathematics with Specialization in **Computer Science**

**Science Programs:**
• **BS Biology** - Life sciences and research
• **BS Environmental Science** - Sustainability and conservation
• **BS Food Technology** - Food processing and quality control
• **BS Medical Technology / Medical Laboratory Science** - Clinical diagnostics

Each program offers unique opportunities and career paths!

**Which program interests you?** I can tell you about:
✓ Curriculum and subjects
✓ Career opportunities
✓ Admission requirements
✓ Faculty and facilities`;
    }

    // Call OpenAI with enhanced system prompt and last conversation context
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages as any,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '800'),
      temperature: 0.7,
    });

    return completion.choices[0].message.content || 
      'I apologize, but I had trouble generating a response. Could you rephrase your question? I\'m here to help!';

  } catch (error: any) {
    console.error('OpenAI API Error:', error);

    // Comprehensive fallback responses
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('college of science') || 
        lowerMsg.includes('cos') || 
        lowerMsg.includes('programs') ||
        lowerMsg.includes('courses')) {
      return `**BSU College of Science – Official Programs (2025)**

**Mathematics:**
• BS Mathematics with Specialization in Applied Statistics
• BS Mathematics with Specialization in Business Applications
• BS Mathematics with Specialization in Computer Science

**Sciences:**
• BS Biology
• BS Environmental Science
• BS Food Technology
• BS Medical Technology / Medical Laboratory Science

For more information, please visit the COS office or contact the registrar.`;
    }

    return `I'm experiencing a temporary service interruption, but I'm still here to help! 

For urgent inquiries, please:
• Visit the COS office directly
• Email the department
• Check the official BSU website

I'll be back to full functionality soon. Thank you for your patience! 🙏`;
  }
};

// Main controller function - STRICT RAG-BASED IMPLEMENTATION
// AI will ONLY answer based on database knowledge
export const askAITutor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { message, type, chatSessionId } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!message || message.trim().length === 0) {
      res.status(400).json({ error: 'Message cannot be empty' });
      return;
    }

    // Fetch user's language preference
    const userSettings = await prisma.accessibilitySettings.findUnique({
      where: { userId },
      select: { language: true }
    });
    const userLanguage = userSettings?.language || 'en';

    // STEP 1: Analyze query scope BEFORE processing
    const scopeAnalysis = analyzeQueryScope(message);
    
    // STEP 2: If clearly out of scope, respond immediately without calling OpenAI
    if (!scopeAnalysis.isInScope && scopeAnalysis.confidence > 0.8) {
      let outOfScopeResponse: string;
      
      // Handle unsupported language
      if (scopeAnalysis.category === 'unsupported_language') {
        outOfScopeResponse = userLanguage === 'fil'
          ? `Paumanhin, ngunit ako ay sumusuporta lamang sa **English** at **Filipino (Tagalog)** na mga wika. 🌐\n\nMangyaring magtanong sa English o Filipino.\n\n**Mayroon ka bang tanong tungkol sa BSU College of Science?**`
          : `I apologize, but I only support **English** and **Filipino (Tagalog)** languages. 🌐\n\nPlease ask your question in English or Filipino.\n\n**Do you have any questions about BSU College of Science?**`;
      } else {
        // Handle other out-of-scope topics
        outOfScopeResponse = userLanguage === 'fil'
          ? `Paumanhin, ngunit ang aking kaalaman ay limitado lamang sa **Bulacan State University – College of Science**. 🎓\n\nHindi ako makakatulong sa mga tanong tungkol sa ${scopeAnalysis.category}.\n\nMaaari akong tumulong sa:\n• Mga programa at kurikulum ng COS\n• Impormasyon tungkol sa faculty\n• Career opportunities\n• Admission at enrollment\n\n**Mayroon ka bang tanong tungkol sa BSU College of Science?**`
          : `I apologize, but my knowledge is strictly limited to **Bulacan State University – College of Science**. 🎓\n\nI cannot help with questions about ${scopeAnalysis.category}.\n\nI can help you with:\n• COS programs and curriculum\n• Faculty information\n• Career opportunities\n• Admission and enrollment\n\n**Do you have any questions about BSU College of Science?**`;
      }

      // Save the out-of-scope interaction
      const interaction = await prisma.aIInteraction.create({
        data: {
          userId,
          type: AIInteractionType.QUESTION,
          context: `out_of_scope:${scopeAnalysis.category}`,
          userMessage: message,
          aiResponse: outOfScopeResponse,
        },
      });

      res.json({
        response: outOfScopeResponse,
        suggestions: getDefaultSuggestions(userLanguage),
        interactionId: interaction.id,
        timestamp: interaction.createdAt,
        scopeAnalysis: { inScope: false, category: scopeAnalysis.category }
      });
      return;
    }

    // STEP 3: Fetch last interaction for conversation continuity
    let lastInteraction = null;
    if (chatSessionId) {
      const chatSession = await prisma.chatSession.findUnique({
        where: { id: chatSessionId },
        select: { messages: true }
      });
      
      if (chatSession && Array.isArray(chatSession.messages)) {
        const msgs = chatSession.messages as Array<{role: string; content: string}>;
        if (msgs.length >= 2) {
          const lastUserMsg = msgs.filter(m => m.role === 'user').pop();
          const lastAiMsg = msgs.filter(m => m.role === 'ai').pop();
          
          if (lastUserMsg && lastAiMsg) {
            lastInteraction = {
              userMessage: lastUserMsg.content,
              aiResponse: lastAiMsg.content
            };
          }
        }
      }
    }

    // STEP 4: Retrieve comprehensive RAG context from database
    // This is the ONLY source of truth for AI responses
    const ragContext = await retrieveRAGContext(message);

    // STEP 5: Check for course recommendation queries
    const isRecommendationQuery = /recommend|best course|what course|which program|should i take|want to become|career/i.test(message);
    
    if (isRecommendationQuery) {
      const recommendation = await generateCourseRecommendation(message);
      if (recommendation.recommendedProgram) {
        // Add recommendation to RAG context
        ragContext.programs = [recommendation.recommendedProgram, ...ragContext.programs.filter(p => p.id !== recommendation.recommendedProgram?.id)];
        ragContext.curriculum = [...recommendation.relevantSubjects, ...ragContext.curriculum];
      }
    }

    // STEP 6: Generate AI response with strict RAG context
    const aiResponse = await generateAIResponse(
      message, 
      ragContext,
      lastInteraction,
      userLanguage
    );

    // STEP 7: Generate smart follow-up suggestions
    const suggestions = await generateSmartSuggestions(
      message,
      aiResponse,
      userId,
      userLanguage
    );

    // STEP 8: Save interaction to database
    const interaction = await prisma.aIInteraction.create({
      data: {
        userId,
        type: (type as AIInteractionType) || AIInteractionType.QUESTION,
        context: JSON.stringify({
          queryType: ragContext.metadata.queryType,
          programsFound: ragContext.metadata.totalPrograms,
          facultyFound: ragContext.metadata.totalFaculty,
          curriculumFound: ragContext.metadata.totalCurriculumEntries
        }),
        userMessage: message,
        aiResponse: aiResponse,
      },
    });

    // STEP 9: Generate AI-powered title for new conversations
    let generatedTitle: string | undefined;
    if (message && aiResponse) {
      try {
        generatedTitle = await generateChatTitle(message, aiResponse, userLanguage);
      } catch (error) {
        console.error('Failed to generate chat title:', error);
      }
    }

    res.json({
      response: aiResponse,
      suggestions,
      generatedTitle,
      interactionId: interaction.id,
      timestamp: interaction.createdAt,
      scopeAnalysis: { inScope: true, queryType: ragContext.metadata.queryType }
    });

  } catch (error) {
    console.error('AI tutor error:', error);
    res.status(500).json({ 
      error: 'Server error processing AI request',
      message: 'We encountered an issue processing your question. Please try again.'
    });
  }
};

// Get AI conversation history
export const getAIHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { limit = 50, context, type } = req.query;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const where: any = { userId };

    if (context) {
      where.context = {
        contains: context as string,
      };
    }

    if (type) {
      where.type = type as AIInteractionType;
    }

    const interactions = await prisma.aIInteraction.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: Math.min(Number(limit), 100), // Cap at 100
      select: {
        id: true,
        type: true,
        userMessage: true,
        aiResponse: true,
        helpful: true,
        createdAt: true,
      }
    });

    res.json({ 
      interactions,
      count: interactions.length 
    });
  } catch (error) {
    console.error('Get AI history error:', error);
    res.status(500).json({ error: 'Server error fetching AI history' });
  }
};

// Generate quiz based on conversation history
export const generateQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { topic, questionCount = 5 } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get recent conversation history for context
    const recentInteractions = await prisma.aIInteraction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        userMessage: true,
        aiResponse: true,
      },
    });

    const conversationContext = recentInteractions
      .map(i => `Q: ${i.userMessage}\nA: ${i.aiResponse}`)
      .join('\n\n');

    const quizPrompt = `Based on the following conversation history and topic, generate a quiz with ${questionCount} multiple choice questions.

${topic ? `Topic: ${topic}` : 'Generate questions based on the conversation topics.'}

Conversation History:
${conversationContext || 'No previous conversations.'}

Generate a JSON array of quiz questions in this exact format:
[
  {
    "question": "Question text here?",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correctAnswer": "A",
    "explanation": "Brief explanation of why this is correct"
  }
]

Make questions educational and relevant to BSU College of Science curriculum. Return ONLY the JSON array, no other text.`;

    if (!openai) {
      // Fallback quiz if OpenAI not configured
      const fallbackQuiz = [
        {
          question: "What does BSU COS stand for?",
          options: ["A) Bulacan State University - College of Science", "B) Basic Science Unit - Course of Study", "C) Bachelor of Science - Computer Operations", "D) None of the above"],
          correctAnswer: "A",
          explanation: "BSU COS stands for Bulacan State University - College of Science"
        },
        {
          question: "Which of the following is a program offered by BSU College of Science?",
          options: ["A) BS Nursing", "B) BS Computer Science", "C) BS Architecture", "D) BS Law"],
          correctAnswer: "B",
          explanation: "BS Mathematics with Specialization in Computer Science is one of the programs offered."
        }
      ];
      res.json({ quiz: fallbackQuiz, source: 'fallback' });
      return;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a quiz generator for educational purposes. Generate clear, educational multiple choice questions.' },
        { role: 'user', content: quizPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';
    
    // Parse the JSON response
    let quiz;
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      quiz = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      quiz = [];
    }

    // Log the quiz generation
    await prisma.aIInteraction.create({
      data: {
        userId,
        type: AIInteractionType.QUESTION,
        context: `quiz:${topic || 'conversation-based'}`,
        userMessage: `Generate quiz: ${topic || 'from conversation'}`,
        aiResponse: JSON.stringify(quiz),
      },
    });

    res.json({ quiz, questionCount: quiz.length });
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ error: 'Server error generating quiz' });
  }
};

// Get chat suggestions based on conversation context
export const getChatSuggestions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get last interaction for context
    const lastInteraction = await prisma.aIInteraction.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        userMessage: true,
        aiResponse: true,
        context: true,
      },
    });

    // Default suggestions for new users or no context
    const defaultSuggestions = [
      "What programs does the College of Science offer?",
      "Tell me about the Computer Science curriculum",
      "Who are the faculty members?",
      "What are the admission requirements?",
      "Help me with my studies",
    ];

    if (!lastInteraction) {
      res.json({ suggestions: defaultSuggestions });
      return;
    }

    // Generate contextual suggestions using simple Markov-like logic
    const contextualSuggestions: string[] = [];
    const lastResponse = lastInteraction.aiResponse.toLowerCase();
    const lastQuestion = lastInteraction.userMessage.toLowerCase();

    // Add follow-up suggestions based on context
    if (lastResponse.includes('program') || lastQuestion.includes('program')) {
      contextualSuggestions.push("What are the subjects in this program?");
      contextualSuggestions.push("What careers can I pursue with this degree?");
    }
    if (lastResponse.includes('curriculum') || lastResponse.includes('subject')) {
      contextualSuggestions.push("Tell me about 2nd year subjects");
      contextualSuggestions.push("What are the prerequisites?");
    }
    if (lastResponse.includes('faculty') || lastResponse.includes('professor')) {
      contextualSuggestions.push("What are their consultation hours?");
      contextualSuggestions.push("What subjects do they teach?");
    }
    if (lastResponse.includes('enrollment') || lastResponse.includes('admission')) {
      contextualSuggestions.push("What documents do I need?");
      contextualSuggestions.push("When is the enrollment period?");
    }

    // Add general follow-ups
    contextualSuggestions.push("Can you explain more about that?");
    contextualSuggestions.push("Generate a quiz on this topic");

    // Combine and limit suggestions
    const suggestions = [...new Set([...contextualSuggestions, ...defaultSuggestions])].slice(0, 5);

    res.json({ suggestions, hasContext: true });
  } catch (error) {
    console.error('Get chat suggestions error:', error);
    res.status(500).json({ error: 'Server error getting suggestions' });
  }
};

// Rate AI response (feedback mechanism)
export const rateAIResponse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { helpful, feedback } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (typeof helpful !== 'boolean') {
      res.status(400).json({ error: 'Helpful rating must be a boolean value' });
      return;
    }

    const interaction = await prisma.aIInteraction.findUnique({
      where: { id },
    });

    if (!interaction || interaction.userId !== userId) {
      res.status(404).json({ error: 'Interaction not found' });
      return;
    }

    const updated = await prisma.aIInteraction.update({
      where: { id },
      data: { 
        helpful,
        // Store optional feedback if your schema supports it
        // feedback: feedback || undefined 
      },
    });

    res.json({ 
      interaction: updated,
      message: 'Thank you for your feedback!' 
    });
  } catch (error) {
    console.error('Rate AI response error:', error);
    res.status(500).json({ error: 'Server error rating response' });
  }
};

// Get greeting message for new conversation
export const getGreeting = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch user's language preference
    const userSettings = await prisma.accessibilitySettings.findUnique({
      where: { userId },
      select: { language: true }
    });
    const userLanguage = userSettings?.language || 'en';

    // Generate personalized greeting
    const greeting = await generateGreeting(userId, userLanguage);
    
    // Get default suggestions for new conversation
    const suggestions = getDefaultSuggestions(userLanguage);

    res.json({
      greeting,
      suggestions,
      language: userLanguage
    });
  } catch (error) {
    console.error('Get greeting error:', error);
    res.status(500).json({ error: 'Server error getting greeting' });
  }
};