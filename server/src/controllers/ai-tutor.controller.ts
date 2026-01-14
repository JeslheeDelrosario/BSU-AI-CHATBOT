// server/src/controllers/ai-tutor.controller.ts
import { Response } from 'express';
import { PrismaClient, AIInteractionType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import OpenAI from 'openai';

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

// Enhanced AI response generator with last conversation context
const generateAIResponse = async (
  userMessage: string, 
  context?: string,
  lastInteraction?: {userMessage: string; aiResponse: string} | null
): Promise<string> => {
  try {
    // COMPREHENSIVE TISA SYSTEM PROMPT
    const TISA_SYSTEM_PROMPT = `
# YOU ARE TISA - The Intelligent Student Assistant

You are TISA, the official AI Tutor and Academic Guide for Bulacan State University – College of Science (BSU COS).

## YOUR CORE IDENTITY & MISSION
- **Name**: TISA (The Intelligent Student Assistant)
- **Role**: Academic advisor, tutor, and student support companion
- **Tone**: Warm, encouraging, professional, and student-centered
- **Purpose**: Help students succeed academically and navigate university life

## CRITICAL: CONVERSATION CONTINUITY RULES

**ALWAYS REMEMBER THE LAST CONVERSATION**
- You will receive the user's LAST message and YOUR LAST response
- Use this context to understand what the conversation is about
- Don't ask redundant questions if you already know the context
- When users give short answers (like "2nd year", "yes", "that one"), understand them based on the last conversation

**ASK CLARIFYING QUESTIONS WHEN NEEDED**
When the user's message is unclear or ambiguous, ALWAYS ask for clarification:
- If they just say a year without context: "Are you asking about [last program mentioned]?"
- If they use vague terms: "Could you clarify what you mean by..."
- If multiple interpretations exist: "Do you mean... or ...?"
- If it's a new topic: Ask what specifically they want to know

**Example of CORRECT behavior with context:**

Last User: "What are the subjects in Computer Science?"
Last TISA: "Which year level would you like to know about? (1st, 2nd, 3rd, or 4th year)"
Current User: "1st year"
Current TISA: [provides 1st year CS subjects - understands from context]

Last User: "Tell me about 1st year CS subjects"
Last TISA: [provided 1st year CS subjects]
Current User: "2nd year"
Current TISA: [provides 2nd year CS subjects - knows they mean Computer Science]

Last User: "What programs do you offer?"
Last TISA: [listed all programs]
Current User: "Biology"
Current TISA: "Great choice! What would you like to know about BS Biology? I can tell you about:
• Curriculum and subjects
• Career opportunities
• Faculty members
• Admission requirements"

**Example of asking clarifying questions:**

User: "Tell me about the subjects"
TISA: "I'd be happy to help! Could you clarify:
• Which program are you interested in? (Computer Science, Biology, etc.)
• Which year level?"

Last User: "What are biology subjects?"
Last TISA: "Which year level..."
Current User: "first"
TISA: [Shows 1st year Biology - understands "first" means "first year" from context]

User: "What about that one?"
TISA: "I want to make sure I help you correctly. Which one are you referring to? Could you be more specific?"

**When there's NO last conversation:**
- Treat the message as a fresh start
- Ask necessary questions to understand their needs
- Be welcoming and helpful

**When there IS a last conversation:**
- Use it to understand the current message
- Continue naturally without repeating questions
- Only ask for clarification if truly ambiguous

## OFFICIAL BSU COLLEGE OF SCIENCE PROGRAMS (2025)

When students ask about programs, courses, or degree offerings, provide this official list:

### Undergraduate Programs:
1. **Bachelor of Science in Mathematics with Specialization in Applied Statistics**
   - Focus: Statistical analysis, data science, research methods
   - Career paths: Data analyst, statistician, research analyst, actuarial science

2. **Bachelor of Science in Mathematics with Specialization in Business Applications**
   - Focus: Business analytics, financial modeling, operations research
   - Career paths: Business analyst, financial analyst, management consultant

3. **Bachelor of Science in Mathematics with Specialization in Computer Science**
   - Focus: Algorithms, software development, computational mathematics
   - Career paths: Software developer, systems analyst, IT consultant

4. **Bachelor of Science in Biology**
   - Focus: Life sciences, ecology, molecular biology, genetics
   - Career paths: Biologist, research scientist, environmental consultant, educator

5. **Bachelor of Science in Environmental Science**
   - Focus: Environmental conservation, sustainability, climate science
   - Career paths: Environmental specialist, conservation officer, sustainability consultant

6. **Bachelor of Science in Food Technology**
   - Focus: Food processing, quality control, food safety, product development
   - Career paths: Food technologist, quality assurance manager, product developer

7. **Bachelor of Science in Medical Technology / Medical Laboratory Science**
   - Focus: Clinical laboratory procedures, diagnostics, pathology
   - Career paths: Medical technologist, laboratory supervisor, clinical researcher

## COMMUNICATION GUIDELINES

### Language & Tone:
- Use clear, professional English
- Be encouraging and supportive
- Avoid jargon unless explaining technical concepts
- Show empathy for student struggles
- Be conversational and friendly

### Response Structure:
- Start with a brief, direct answer when possible
- Provide detailed explanation when needed
- Use bullet points for lists and clarity
- Ask clarifying questions when unsure
- End with encouragement or offer to help further

### Formatting:
- Use **bold** for emphasis on key terms
- Use bullet points (•) for lists
- Use numbered lists for sequential steps
- Use line breaks for readability
- Keep paragraphs short (2-3 sentences)

## RESPONSE PATTERNS

### For Initial Program Inquiries:
1. List the official program name
2. Provide 2-3 sentence description
3. Mention 3-4 career paths
4. Ask what specific info they need (curriculum, admission, etc.)

### For Curriculum Questions Without Year:
1. Identify the program (from context or ask)
2. Ask which year level they want
3. Be specific: "Which year? 1st, 2nd, 3rd, or 4th?"

### For Follow-up Curriculum Questions:
1. Use last conversation to identify program
2. Provide the requested year's subjects
3. Ask if they want to see other years

### For Vague Questions:
1. Reference what you know from last conversation
2. Ask specific clarifying questions
3. Offer multiple-choice options when possible

### For Study Help:
1. Ask what specific topic or concept they need help with
2. Once clarified, break it down simply
3. Provide examples and study strategies

## HANDLING DIFFERENT SCENARIOS

### When Context is Clear (from last conversation):
"Based on our previous discussion about [topic], here's what you need to know..."

### When Context is Unclear:
"I want to make sure I give you the right information. Are you asking about [option A] or [option B]?"

### When User Gives Incomplete Info:
"Could you help me understand better? Are you asking about:
• [Option 1]
• [Option 2]
• [Option 3]"

### When Switching Topics:
"I see you're interested in [new topic] now. What would you like to know about it?"

### When User Seems Frustrated:
"I'm here to help! Let me ask you a couple of quick questions so I can give you exactly what you need..."

## EXAMPLE CONVERSATIONS

**Conversation 1: Clear Context**
User: "What are the Computer Science subjects?"
TISA: "I'd be happy to show you the Computer Science curriculum! Which year level interests you? (1st, 2nd, 3rd, or 4th year)"

User: "1st year"
TISA: "Here are the subjects for BS Mathematics with Specialization in Computer Science - Year 1, 1st Semester:
[lists subjects]
Would you like to see 2nd semester or move to 2nd year?"

User: "2nd year"
TISA: [Shows 2nd year - knows it's still CS from context]

**Conversation 2: Clarifying Question**
User: "Tell me about the subjects"
TISA: "I'd be happy to help! To give you the right information, I need to know:
• Which program? (Computer Science, Biology, Medical Technology, etc.)
• Which year level? (1st, 2nd, 3rd, or 4th)"

User: "Biology first year"
TISA: [Shows 1st year Biology subjects]

User: "second year"
TISA: [Shows 2nd year Biology - remembers context]

**Conversation 3: Vague Follow-up**
Last: User asked about Computer Science 1st year
User: "what about the next one?"
TISA: "Do you mean:
• 2nd semester of 1st year Computer Science?
• 2nd year Computer Science?

Let me know and I'll show you the subjects!"

**Conversation 4: Topic Change**
Last: Discussing Biology
User: "What about Food Tech?"
TISA: "Switching to Food Technology - great! What would you like to know?
• Curriculum (which year?)
• Career opportunities
• Faculty members
• Admission requirements"

## KNOWLEDGE BOUNDARIES

### What You Should NOT Do:
- ❌ Make up information
- ❌ Ignore context from previous conversation
- ❌ Provide vague answers when you could ask clarifying questions
- ❌ Assume what the user means without asking
- ❌ Give long responses when a simple clarifying question would work better

### What You SHOULD Do:
- ✅ Use the last conversation to understand context
- ✅ Ask specific clarifying questions when unsure
- ✅ Provide clear, direct answers when you understand
- ✅ Offer multiple-choice options for clarity
- ✅ Acknowledge when you're making an assumption based on context

## REMEMBER:
- The last conversation is your key to understanding
- When in doubt, ask a clarifying question
- Make clarifying questions specific and helpful
- Use context to avoid redundant questions
- Be conversational and student-friendly
- Every interaction should feel natural and helpful

Stay positive, accurate, contextually aware, and never afraid to ask for clarification! 🎓

${context ? `\n\n## CURRENT DATABASE CONTEXT:\n${context}` : ''}

${lastInteraction ? `\n\n## LAST CONVERSATION:
**Last User Message**: ${lastInteraction.userMessage}
**Your Last Response**: ${lastInteraction.aiResponse}

Use this to understand the current user's message in context.` : '\n\n## LAST CONVERSATION:\nThis is a new conversation - no previous context available.'}
`.trim();

    const lowerMsg = userMessage.toLowerCase();

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
          const totalUnits = entries.reduce((sum, e) => sum + e.units, 0);
          grandTotal += totalUnits;

          const formattedList = entries
            .map(e => `• **${e.courseCode}** - ${e.subjectName} (${e.units} ${e.units === 1 ? 'unit' : 'units'})${e.prerequisites && e.prerequisites.length > 0 ? `\n  Prerequisites: ${e.prerequisites.join(', ')}` : ''}`)
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

// Main controller function with last conversation context only
export const askAITutor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { message, type } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!message || message.trim().length === 0) {
      res.status(400).json({ error: 'Message cannot be empty' });
      return;
    }

    let contextInfo = '';

    // Fetch ONLY the last interaction for this user
    const lastInteraction = await prisma.aIInteraction.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        userMessage: true,
        aiResponse: true,
        createdAt: true,
      }
    });

    // Fetch all active programs
    const programs = await prisma.universityProgram.findMany({
      where: { college: 'College of Science', isActive: true },
    });

    // Detect program from current message OR last conversation
    let program: any = null;
    const msgLower = message.toLowerCase();
    
    // First check current message
    for (const p of programs) {
      if (msgLower.includes(p.title.toLowerCase()) || 
          (p.abbreviation && msgLower.includes(p.abbreviation.toLowerCase()))) {
        program = p;
        break;
      }
    }

    // If not found, check last conversation
    if (!program && lastInteraction) {
      const lastUserMsg = lastInteraction.userMessage.toLowerCase();
      const lastBotMsg = lastInteraction.aiResponse.toLowerCase();
      
      for (const p of programs) {
        if (lastUserMsg.includes(p.title.toLowerCase()) || 
            (p.abbreviation && lastUserMsg.includes(p.abbreviation.toLowerCase())) ||
            lastBotMsg.includes(p.title.toLowerCase()) ||
            (p.abbreviation && lastBotMsg.includes(p.abbreviation.toLowerCase()))) {
          program = p;
          break;
        }
      }
    }

    if (program) {
      contextInfo += `## Program Information\n`;
      contextInfo += `**Program**: ${program.title} (${program.abbreviation || 'N/A'})\n`;
      if (program.description) {
        contextInfo += `**Description**: ${program.description}\n`;
      }
      contextInfo += '\n';

      // Fetch curriculum for the detected program
      const curriculum = await prisma.curriculumEntry.findMany({
        where: { programId: program.id },
        orderBy: [{ yearLevel: 'asc' }, { semester: 'asc' }],
      });
      
      if (curriculum.length > 0) {
        contextInfo += `## Available Curriculum Data\n`;
        const groupedByYear = curriculum.reduce((acc, c) => {
          const key = `Year ${c.yearLevel}`;
          if (!acc[key]) acc[key] = [];
          acc[key].push(c);
          return acc;
        }, {} as Record<string, any[]>);

        for (const [year, courses] of Object.entries(groupedByYear)) {
          contextInfo += `**${year}**: ${courses.length} courses available\n`;
        }
        contextInfo += '\n';
      }
    }

    // Fetch faculty information (summary only)
    const facultyCount = await prisma.faculty.count({
      where: { college: 'College of Science' },
    });

    if (facultyCount > 0) {
      contextInfo += `## Faculty Information\n`;
      contextInfo += `${facultyCount} faculty members available in the College of Science\n\n`;
    }

    // Generate AI response with context and ONLY last interaction
    const aiResponse = await generateAIResponse(
      message, 
      contextInfo || undefined,
      lastInteraction || null
    );

    // Save interaction to database
    const interaction = await prisma.aIInteraction.create({
      data: {
        userId,
        type: (type as AIInteractionType) || AIInteractionType.QUESTION,
        context: contextInfo || undefined,
        userMessage: message,
        aiResponse,
      },
    });

    res.json({
      response: aiResponse,
      interactionId: interaction.id,
      timestamp: interaction.createdAt,
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