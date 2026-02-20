// server/src/controllers/ai-tutor.controller.ts
// STRICT RAG-BASED AI TUTOR - Only answers from database knowledge
import { Response } from 'express';
import { AIInteractionType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../lib/prisma';
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
import { quizGeneratorService } from '../services/quiz-generator.service';

// Initialize Gemini AI client (FREE!)
let geminiAI: GoogleGenerativeAI | null = null;
let geminiModel: any = null;
try {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key-here') {
    geminiAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash (latest working model as of 2026)
    geminiModel = geminiAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      }
    });
    console.log('✓ Gemini AI enabled (FREE tier) - Model: gemini-2.0-flash');
  } else {
    console.warn('⚠ Gemini API key not configured');
  }
} catch (error) {
  console.error('Failed to initialize Gemini client:', error);
}

// Initialize OpenAI client (Fallback)
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
✅ **University policies, procedures, and regulations (from FAQs)**
✅ **Grading system, admission requirements, student rights (from FAQs)**
✅ **Academic rules, attendance, examinations (from FAQs)**

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
3. **PRIORITY: Check FAQs FIRST** - If the question is about university policies, procedures, grading, admission, student rights, or academic rules, use the FAQ section as your PRIMARY reference
4. If recommending a course, use ONLY programs from the database
5. For faculty questions, use ONLY names from the database
6. For curriculum, use ONLY subjects from the database
7. Be helpful but honest when you don't have information
8. **CRITICAL FOR FACULTY QUERIES**: When asked about a person (e.g., "who is [name]"), you MUST:
   - Check the FACULTY MEMBERS section in the database
   - If ONE person is found, provide their full details
   - If MULTIPLE people are found with similar names, list ALL of them with distinguishing details and ask which one they meant
   - If NO ONE is found, say you don't have information about that person in the database
   - NEVER say there's a service interruption if faculty data exists in the database
9. **When using FAQ data**: Cite the FAQ by mentioning it's from official university policies (e.g., "According to BulSU policies..." or "Based on university regulations...")

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

## RESPONSE LENGTH & CONTINUATION:
- **MAXIMIZE your response** — provide ALL relevant information from the database in each response
- **Be thorough and complete** — list ALL matching subjects, programs, faculty, etc. Do NOT summarize or skip entries
- **If the response would be extremely long** (e.g., listing subjects for ALL programs across multiple years), provide as much as you can and end with:
  ${language === 'fil' ? '"\\n\\n---\\n\\n**Gusto mo bang ipagpatuloy ko?** Marami pa akong impormasyon na maibabahagi. 📚"' : '"\\n\\n---\\n\\n**Would you like me to continue?** I have more information to share. 📚"'}
- **NEVER cut off mid-sentence or mid-list** — always finish the current section before offering to continue
- **When the user says "continue" or "yes"**, pick up exactly where you left off and provide the remaining information

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

    // Detect faculty name inquiries (e.g., "who is [name]?")
    // IMPORTANT: Exclude program-related queries to avoid false positives
    const programKeywords = ['program', 'course', 'degree', 'curriculum', 'bs ', 'bsm ', 'bachelor', 'major', 'specialization'];
    const isProgramQuery = programKeywords.some(keyword => lowerMsg.includes(keyword));
    
    const nameQueryPatterns = [
      /who\s+is\s+([a-z\s\.]+)/i,
      /sino\s+si\s+([a-z\s\.]+)/i,
      /about\s+([a-z\s\.]+)/i,
      /tungkol\s+kay\s+([a-z\s\.]+)/i
    ];

    // Only search for faculty if this is NOT a program query
    if (!isProgramQuery) {
      for (const pattern of nameQueryPatterns) {
        const match = userMessage.match(pattern);
        if (match && match[1]) {
          const searchName = match[1].trim();
        
        // Split name into parts for multi-word names (e.g., "arcel galvez" -> ["arcel", "galvez"])
        const nameParts = searchName.split(/\s+/).filter(part => part.length > 0);
        
        // Build search conditions
        let searchConditions: any[] = [];
        
        if (nameParts.length === 1) {
          // Single word - search in firstName, lastName, or middleName
          const singleName = nameParts[0];
          searchConditions = [
            { firstName: { contains: singleName, mode: 'insensitive' } },
            { lastName: { contains: singleName, mode: 'insensitive' } },
            { middleName: { contains: singleName, mode: 'insensitive' } }
          ];
        } else if (nameParts.length >= 2) {
          // Multiple words - assume first word is firstName, last word is lastName
          searchConditions.push({
            AND: [
              { firstName: { equals: nameParts[0], mode: 'insensitive' } },
              { lastName: { equals: nameParts[nameParts.length - 1], mode: 'insensitive' } }
            ]
          });
          
          // Also try with contains for partial matches
          searchConditions.push({
            AND: [
              { firstName: { contains: nameParts[0], mode: 'insensitive' } },
              { lastName: { contains: nameParts[nameParts.length - 1], mode: 'insensitive' } }
            ]
          });
          
          // Try full name in firstName or lastName (for compound names)
          searchConditions.push({
            firstName: { contains: searchName, mode: 'insensitive' }
          });
          searchConditions.push({
            lastName: { contains: searchName, mode: 'insensitive' }
          });
        }
        
        // Search faculty by name
        const facultyMatches = await prisma.faculty.findMany({
          where: {
            college: { startsWith: 'College of Science', mode: 'insensitive' },
            OR: searchConditions
          },
          orderBy: { lastName: 'asc' }
        });

        if (facultyMatches.length === 1) {
          const faculty = facultyMatches[0];
          const fullName = `${faculty.firstName}${faculty.middleName ? ' ' + faculty.middleName : ''} ${faculty.lastName}`;
          
          let response = language === 'fil'
            ? `**${fullName}** ay ${faculty.position} sa College of Science, Bulacan State University.`
            : `**${fullName}** is a ${faculty.position} at the College of Science, Bulacan State University.`;

          if (faculty.email) {
            response += language === 'fil'
              ? `\n\n📧 **Email**: ${faculty.email}`
              : `\n\n📧 **Email**: ${faculty.email}`;
          }

          if (faculty.officeHours) {
            response += language === 'fil'
              ? `\n🕐 **Office Hours**: ${faculty.officeHours}`
              : `\n🕐 **Office Hours**: ${faculty.officeHours}`;
          }

          if (faculty.consultationDays && faculty.consultationDays.length > 0) {
            response += language === 'fil'
              ? `\n📅 **Consultation Days**: ${faculty.consultationDays.join(', ')}`
              : `\n📅 **Consultation Days**: ${faculty.consultationDays.join(', ')}`;
          }

          response += language === 'fil'
            ? `\n\nMay iba ka pa bang gustong malaman tungkol kay ${faculty.firstName}?`
            : `\n\nWould you like to know more about ${faculty.firstName}?`;

          return response;
        } else if (facultyMatches.length > 1) {
          const namesList = facultyMatches.map(f => 
            `• **${f.firstName}${f.middleName ? ' ' + f.middleName : ''} ${f.lastName}** - ${f.position}`
          ).join('\n');
          
          return language === 'fil'
            ? `Nakahanap ako ng ${facultyMatches.length} faculty members na may pangalang "${searchName}":\n\n${namesList}\n\nAlin sa kanila ang iyong tinutukoy?`
            : `I found ${facultyMatches.length} faculty members with the name "${searchName}":\n\n${namesList}\n\nWhich one are you referring to?`;
        } else {
          return language === 'fil'
            ? `Paumanhin, wala akong impormasyon tungkol kay "${searchName}" sa aking database ng College of Science faculty. Maaaring:\n• Mali ang spelling ng pangalan\n• Hindi siya faculty member ng COS\n• Wala pa siya sa database\n\nMaaari mong kontakin ang COS office para sa mas tumpak na impormasyon.`
            : `I apologize, but I don't have information about "${searchName}" in my College of Science faculty database. This could mean:\n• The name spelling might be different\n• They may not be a COS faculty member\n• They haven't been added to the database yet\n\nPlease contact the COS office for more accurate information.`;
        }
      }
    }
    }

    // Detect faculty inquiries by role
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
            college: { startsWith: 'College of Science', mode: 'insensitive' }
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

    // Log FAQ context for debugging
    console.log(`[AI Context] FAQs in context: ${ragContext.faqs.length}`);
    if (ragContext.faqs.length > 0) {
      console.log(`[AI Context] First FAQ: ${ragContext.faqs[0].question.substring(0, 50)}...`);
    }

    // Try Gemini first (FREE), fallback to OpenAI if needed
    if (geminiModel) {
      try {
        // Convert messages to Gemini format (combine system + conversation)
        let geminiPrompt = TISA_SYSTEM_PROMPT + '\n\n';
        
        // Add conversation history
        if (lastInteraction) {
          geminiPrompt += `Previous conversation:\nUser: ${lastInteraction.userMessage}\nAssistant: ${lastInteraction.aiResponse}\n\n`;
        }
        
        // Add current user message
        geminiPrompt += `User: ${userMessage}\nAssistant:`;
        
        console.log('[Gemini] Generating response...');
        const result = await geminiModel.generateContent(geminiPrompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('✓ Gemini AI response generated successfully');
        return text || 'I apologize, but I had trouble generating a response. Could you rephrase your question?';
      } catch (geminiError: any) {
        console.error('❌ Gemini API Error:', geminiError.message);
        console.error('Gemini Error Details:', JSON.stringify(geminiError, null, 2));
        // Fall through to OpenAI fallback
      }
    } else {
      console.log('[AI] Gemini not configured, using OpenAI');
    }

    // Fallback to OpenAI if Gemini fails or is not configured
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: messages as any,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '4096'),
      temperature: 0.7,
    });

    return completion.choices[0].message.content || 
      'I apologize, but I had trouble generating a response. Could you rephrase your question? I\'m here to help!';

  } catch (error: any) {
    console.error('AI API Error:', error);
    
    return `I'm currently experiencing technical difficulties with my AI service. Please try again in a moment, or contact support if the issue persists.`;
  }
};

// Main controller function - STRICT RAG-BASED IMPLEMENTATION
// AI will ONLY answer based on database knowledge
export const askAITutor = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { message, type, chatSessionId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Fetch user's language preference
    const userSettings = await prisma.accessibilitySettings.findUnique({
      where: { userId },
      select: { language: true }
    });
    const userLanguage = userSettings?.language || 'en';

    // STEP 0: Check if user is requesting a quiz/practice exam
    const quizKeywords = /create|generate|make|give me|start|take|quiz|test|exam|practice|assessment|questions/i;
    const isQuizRequest = quizKeywords.test(message) && 
                         (/quiz|test|exam|practice|assessment/i.test(message));
    
    if (isQuizRequest) {
      // Extract topic from message
      let topic = message.replace(/create|generate|make|give me|start|take|quiz|test|exam|practice|assessment|on|about/gi, '').trim();
      // Remove common prefixes
      topic = topic.replace(/^(for|on|about|in)\s+/i, '').trim();
      
      // Validate that a topic was provided
      if (!topic || topic.length < 2) {
        return res.json({
          response: `I'd be happy to create a quiz for you! 📝\n\n**Please specify which subject or topic you'd like to be quizzed on.**\n\nFor example:\n• "Create quiz for Microbiology"\n• "Generate quiz for Calculus"\n• "Make a quiz on Biology"\n• "Quiz me on Computer Science"\n\nYou can also ask me:\n• "Show me available courses"\n• "What subjects can I study?"`,
          suggestions: [
            'Show me available courses',
            'Create quiz for Microbiology',
            'Generate quiz for Calculus',
            'What subjects can I study?'
          ],
          intent: 'quiz_generation_missing_topic'
        });
      }
      
      // Check if quiz generator is available
      if (!quizGeneratorService.isAvailable()) {
        return res.json({
          response: `I'd love to create a quiz for you, but the quiz generation service is currently unavailable. Please try again later or contact support.`,
          suggestions: [
            'Show me course curriculum instead',
            'Explain this topic in detail',
            'What are the key concepts?'
          ]
        });
      }

      try {
        // For quiz generation, fetch minimal lesson data instead of full RAG context
        // This reduces token usage and avoids rate limits
        let quiz = null;
        let quizGenerationMethod = 'none';
        let lessonData = null;
        let courseData = null;
        
        // Fetch lessons and course data for the topic
        if (topic) {
          // First, check if there are any courses for this topic
          courseData = await prisma.course.findMany({
            where: {
              OR: [
                { title: { contains: topic, mode: 'insensitive' } },
                { description: { contains: topic, mode: 'insensitive' } }
              ],
              status: 'PUBLISHED'
            },
            select: {
              id: true,
              title: true,
              description: true
            },
            take: 1
          });

          // Then fetch lessons for the topic
          lessonData = await prisma.lesson.findMany({
            where: {
              OR: [
                { title: { contains: topic, mode: 'insensitive' } },
                { description: { contains: topic, mode: 'insensitive' } }
              ],
              isPublished: true
            },
            select: {
              id: true,
              title: true,
              description: true,
              content: true,
              type: true,
              module: {
                select: {
                  title: true,
                  course: {
                    select: {
                      title: true
                    }
                  }
                }
              }
            },
            take: 5 // Limit to 5 lessons to reduce context
          });
        }

        // Check if lessons exist for this topic
        if (!lessonData || lessonData.length === 0) {
          console.log(`[Quiz] No lessons found for "${topic}", checking courses and curriculum...`);
          
          // Check if topic exists in courses table (more flexible search)
          if (!courseData || courseData.length === 0) {
            courseData = await prisma.course.findMany({
              where: {
                OR: [
                  { title: { contains: topic, mode: 'insensitive' } },
                  { description: { contains: topic, mode: 'insensitive' } }
                ],
                status: 'PUBLISHED'
              },
              select: {
                id: true,
                title: true,
                description: true
              },
              take: 5
            });
          }
          
          // Check if topic exists in curriculum as additional fallback
          const curriculumData = await prisma.curriculumEntry.findMany({
            where: {
              subjectName: { contains: topic, mode: 'insensitive' }
            },
            take: 1
          });

          // If neither courses nor curriculum exist, return error
          if ((!courseData || courseData.length === 0) && (!curriculumData || curriculumData.length === 0)) {
            return res.json({
              response: `I couldn't find any courses or curriculum for "${topic}" in our database.\n\n**This topic hasn't been added yet.**\n\nPlease:\n• Check if the topic name is correct\n• Try a different subject\n• Contact your instructor to add this topic\n\nYou can ask me:\n• "Show me available courses"\n• "What subjects are in the curriculum?"\n• "Create quiz for [subject from curriculum]"`,
              suggestions: [
                'Show me available courses',
                'What subjects are in the curriculum?',
                'Help me find course materials'
              ],
              intent: 'quiz_generation',
              metadata: {
                topic: topic,
                lessonsFound: 0,
                coursesFound: 0,
                curriculumFound: 0
              }
            });
          }
          
          // Topic exists in courses or curriculum but no lessons yet - generate from database
          console.log(`[Quiz] Found ${courseData?.length || 0} courses and ${curriculumData?.length || 0} curriculum entries for "${topic}", generating quiz from database`);
        }
        
        // PRIORITY 1: Generate quiz from lessons (AI-powered)
        if (quizGeneratorService.isAvailable() && lessonData && lessonData.length > 0) {
          quiz = await quizGeneratorService.generateQuizFromLessons(
            topic || 'General',
            lessonData,
            10,
            'mixed'
          );
          quizGenerationMethod = quiz ? 'ai_lessons' : 'none';
        }
        
        // PRIORITY 2: Fallback to database-based generation if AI fails
        if (!quiz || quiz.questions.length === 0) {
          // Use topic directly for database fallback
          quiz = await quizGeneratorService.generateQuizFromDatabaseCurriculum(
            topic || 'Computer Science',
            undefined,
            10
          );
          quizGenerationMethod = 'database';
        }

        if (!quiz || quiz.questions.length === 0) {
          return res.json({
            response: `I couldn't generate a quiz for "${topic}". Please specify a valid subject:\n\n• Calculus\n• Computer Science\n• Biology\n• Physics\n• Chemistry\n• Mathematics`,
            suggestions: [
              'Create a quiz on Calculus',
              'Generate a Computer Science quiz',
              'Make a Biology test'
            ]
          });
        }

        // Format response for interactive card UI
        const quizSummary = `**${quiz.title}**\n\nThis quiz covers fundamental concepts in ${topic}, including key principles and their applications.\n\n📊 **${quiz.questions.length} Questions** | ⏱️ **${quiz.estimatedTime} minutes** | 🎯 **${quiz.totalPoints} points**\n\nGreat job on starting your ${topic} practice! Mastering these concepts will open doors to many areas in science and engineering. Good luck!`;

        // Save interaction
        await prisma.aIInteraction.create({
          data: {
            userId,
            type: AIInteractionType.QUESTION,
            context: `quiz_generated:${topic}:${quizGenerationMethod}`,
            userMessage: message,
            aiResponse: quizSummary,
          },
        });

        // Return quiz in format for interactive UI
        return res.json({
          generateQuiz: true,
          response: quizSummary,
          quizParams: {
            topic: topic,
            questionCount: 10
          },
          quiz: {
            id: 'quiz_' + Date.now(),
            title: quiz.title,
            description: quiz.description,
            questions: quiz.questions,
            totalQuestions: quiz.questions.length,
            estimatedTime: quiz.estimatedTime,
            totalPoints: quiz.totalPoints,
            generatedBy: quizGenerationMethod,
            createdAt: new Date().toISOString()
          },
          quizMetadata: {
            showThinking: true,
            allowRetry: true,
            showHints: true,
            passingScore: 70
          },
          interactionId: 'quiz_' + Date.now(),
          timestamp: new Date().toISOString()
        });
      } catch (error: any) {
        console.error('Quiz generation error:', error);
        return res.json({
          response: `I encountered an error while generating the quiz: ${error.message}\n\nPlease try again or specify a different topic.`,
          suggestions: [
            'Try creating a Calculus quiz',
            'Generate a Computer Science quiz',
            'Show me available courses'
          ]
        });
      }
    }

    // STEP 0.5: Check if user is requesting a consultation/appointment with faculty
    const consultationKeywords = /consult|consultation|appointment|book|schedule|meet|meeting|talk to|speak with|available|office hours|professor|faculty|instructor|teacher|advisor|advising/i;
    const isConsultationRequest = consultationKeywords.test(message) && 
      (/book|schedule|appointment|consult|meet|available|office hours|advising/i.test(message));

    if (isConsultationRequest) {
      try {
        const lowerMessage = message.toLowerCase();
        
        // Extract potential faculty name from message
        // Common patterns: "book with [name]", "meet [name]", "consult [name]", "[name]'s schedule"
        const namePatterns = [
          /(?:book|meet|consult|schedule|appointment)\s+(?:with\s+)?(?:prof(?:essor)?\.?\s+)?([a-z]+(?:\s+[a-z]+)?)/i,
          /(?:prof(?:essor)?\.?\s+)?([a-z]+(?:\s+[a-z]+)?)\s*(?:'s)?\s*(?:schedule|availability|office hours)/i,
          /(?:talk|speak)\s+(?:to|with)\s+(?:prof(?:essor)?\.?\s+)?([a-z]+(?:\s+[a-z]+)?)/i
        ];
        
        let extractedName = '';
        for (const pattern of namePatterns) {
          const match = message.match(pattern);
          if (match && match[1]) {
            extractedName = match[1].trim().toLowerCase();
            break;
          }
        }
        
        // Also check for any capitalized words that might be names
        const words = message.split(/\s+/);
        const potentialNames = words.filter((w: string) => /^[A-Z][a-z]+$/.test(w)).map((w: string) => w.toLowerCase());
        
        // Search for specific faculty by name if mentioned
        let matchedFaculty = null;
        
        if (extractedName || potentialNames.length > 0) {
          const searchTerms = extractedName ? extractedName.split(/\s+/) : potentialNames;
          
          // Build OR conditions for each search term
          const orConditions = searchTerms.flatMap((term: string) => [
            { firstName: { contains: term, mode: 'insensitive' as const } },
            { lastName: { contains: term, mode: 'insensitive' as const } }
          ]);
          
          const searchResults = await prisma.faculty.findMany({
            where: {
              OR: orConditions,
              consultationDays: { isEmpty: false }
            },
            select: {
              id: true,
              firstName: true,
              middleName: true,
              lastName: true,
              email: true,
              position: true,
              college: true,
              consultationDays: true,
              consultationStart: true,
              consultationEnd: true,
              officeHours: true
            }
          });
          
          // Find best match - prefer full name match, then last name
          for (const faculty of searchResults) {
            const fullName = `${faculty.firstName} ${faculty.lastName}`.toLowerCase();
            const firstName = faculty.firstName.toLowerCase();
            const lastName = faculty.lastName.toLowerCase();
            
            // Check if all search terms match
            const allTermsMatch = searchTerms.every((term: string) => 
              fullName.includes(term) || firstName.includes(term) || lastName.includes(term)
            );
            
            if (allTermsMatch) {
              matchedFaculty = faculty;
              break;
            }
          }
          
          // If no exact match, take first result
          if (!matchedFaculty && searchResults.length > 0) {
            matchedFaculty = searchResults[0];
          }
        }
        
        // Fetch general available faculty list if no specific match
        const availableFaculty = await prisma.faculty.findMany({
          where: {
            consultationDays: { isEmpty: false }
          },
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            position: true,
            college: true,
            consultationDays: true,
            consultationStart: true,
            consultationEnd: true,
            officeHours: true
          },
          take: 10
        });

        // Build response with consultation booking UI
        let consultationResponse: string;
        
        if (matchedFaculty) {
          consultationResponse = userLanguage === 'fil'
            ? `Nakita ko na gusto mong mag-book ng consultation kay **${matchedFaculty.firstName} ${matchedFaculty.lastName}** (${matchedFaculty.position}). 📅\n\n**Available Schedule:**\n• Araw: ${matchedFaculty.consultationDays.join(', ')}\n• Oras: ${matchedFaculty.consultationStart || 'TBA'} - ${matchedFaculty.consultationEnd || 'TBA'}\n\nI-click ang button sa ibaba para mag-book ng appointment:`
            : `I see you'd like to book a consultation with **${matchedFaculty.firstName} ${matchedFaculty.lastName}** (${matchedFaculty.position}). 📅\n\n**Available Schedule:**\n• Days: ${matchedFaculty.consultationDays.join(', ')}\n• Time: ${matchedFaculty.consultationStart || 'TBA'} - ${matchedFaculty.consultationEnd || 'TBA'}\n\nClick the button below to book an appointment:`;
        } else {
          const facultyList = availableFaculty.slice(0, 5).map(f => 
            `• **${f.firstName} ${f.lastName}** - ${f.position} (${f.consultationDays.join(', ')})`
          ).join('\n');
          
          consultationResponse = userLanguage === 'fil'
            ? `Maaari akong tumulong sa pag-book ng consultation sa aming faculty! 📅\n\n**Available Faculty para sa Consultation:**\n${facultyList}\n\nPumili ng faculty sa ibaba para mag-book ng appointment, o sabihin mo kung sino ang gusto mong kausapin:`
            : `I can help you book a consultation with our faculty! 📅\n\n**Available Faculty for Consultation:**\n${facultyList}\n\nSelect a faculty below to book an appointment, or tell me who you'd like to meet with:`;
        }

        // Save interaction
        const interaction = await prisma.aIInteraction.create({
          data: {
            userId,
            type: AIInteractionType.QUESTION,
            context: 'consultation_booking',
            userMessage: message,
            aiResponse: consultationResponse,
          },
        });

        return res.json({
          response: consultationResponse,
          showConsultationBooking: true,
          consultationData: {
            faculty: matchedFaculty ? [matchedFaculty] : availableFaculty.slice(0, 5),
            selectedFaculty: matchedFaculty || null
          },
          suggestions: userLanguage === 'fil' 
            ? ['Tingnan lahat ng faculty', 'Kailan available si Prof?', 'Paano mag-cancel ng booking?']
            : ['View all faculty', 'When is Prof available?', 'How to cancel a booking?'],
          interactionId: interaction.id,
          timestamp: interaction.createdAt,
          intent: 'consultation_booking'
        });
      } catch (error) {
        console.error('Consultation booking error:', error);
        // Fall through to normal AI response
      }
    }

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

      return res.json({
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

    return res.json({
      response: aiResponse,
      suggestions,
      generatedTitle,
      interactionId: interaction.id,
      timestamp: interaction.createdAt,
      scopeAnalysis: { inScope: true, queryType: ragContext.metadata.queryType }
    });

  } catch (error) {
    console.error('AI tutor error:', error);
    return res.status(500).json({ 
      error: 'Server error processing AI request',
      message: 'We encountered an issue processing your question. Please try again.'
    });
  }
};

// Get AI conversation history
export const getAIHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { limit = 50, context, type } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
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

    return res.json({ 
      interactions,
      count: interactions.length 
    });
  } catch (error) {
    console.error('Get AI history error:', error);
    return res.status(500).json({ error: 'Server error fetching AI history' });
  }
};

// Generate quiz based on conversation history
export const generateQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { topic, questionCount = 5 } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
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
      return res.json({ quiz: fallbackQuiz, source: 'fallback' });
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

    return res.json({ quiz, questionCount: quiz.length });
  } catch (error) {
    console.error('Generate quiz error:', error);
    return res.status(500).json({ error: 'Server error generating quiz' });
  }
};

// Get chat suggestions based on conversation context
export const getChatSuggestions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
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
      return res.json({ suggestions: defaultSuggestions });
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

    return res.json({ suggestions, hasContext: true });
  } catch (error) {
    console.error('Get chat suggestions error:', error);
    return res.status(500).json({ error: 'Server error getting suggestions' });
  }
};

// Rate AI response (feedback mechanism)
export const rateAIResponse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { helpful, feedback } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (typeof helpful !== 'boolean') {
      return res.status(400).json({ error: 'Helpful rating must be a boolean value' });
    }

    const interaction = await prisma.aIInteraction.findUnique({
      where: { id },
    });

    if (!interaction || interaction.userId !== userId) {
      return res.status(404).json({ error: 'Interaction not found' });
    }

    const updated = await prisma.aIInteraction.update({
      where: { id },
      data: { 
        helpful,
        // Store optional feedback if your schema supports it
        // feedback: feedback || undefined 
      },
    });

    return res.json({ 
      interaction: updated,
      message: 'Thank you for your feedback!' 
    });
  } catch (error) {
    console.error('Rate AI response error:', error);
    return res.status(500).json({ error: 'Server error rating response' });
  }
};

// Get greeting message for new conversation
export const getGreeting = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
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

    return res.json({
      greeting,
      suggestions,
      language: userLanguage
    });
  } catch (error) {
    console.error('Get greeting error:', error);
    return res.status(500).json({ error: 'Server error getting greeting' });
  }
};