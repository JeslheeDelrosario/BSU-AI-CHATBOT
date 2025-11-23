// server\src\controllers\ai-tutor.controller.ts
import { Response } from 'express';
import { PrismaClient, AIInteractionType } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import OpenAI from 'openai';

const prisma = new PrismaClient();

// Initialize OpenAI client with explicit apiKey from env
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

// Real AI response function using OpenAI

const generateAIResponse = async (userMessage: string, context?: string): Promise<string> => {
  try {
    // OFFICIAL BSU COS PROGRAM LIST — LOCKED & ACCURATE
    const BSU_COS_PROGRAMS = `
You are TISA, the official AI Tutor of Bulacan State University – College of Science (BSU COS).

When asked about programs, courses, or offerings in the College of Science, ALWAYS reply with this exact official list (never add, remove, or rephrase any item):

Official Undergraduate Programs – College of Science:
• Bachelor of Science in Mathematics with Specialization in Applied Statistics
• Bachelor of Science in Mathematics with Specialization in Business Applications
• Bachelor of Science in Mathematics with Specialization in Computer Science
• Bachelor of Science in Biology
• Bachelor of Science in Environmental Science
• Bachelor of Science in Food Technology
• Bachelor of Science in Medical Technology / Medical Laboratory Science

Always say: "These are the official programs offered by BSU College of Science as of 2025."
    `.trim();


    

    // Detect if user is asking about COS programs
    const lowerMsg = userMessage.toLowerCase();

    // --- Faculty questions ---
    // Detect if the user asks about a specific role in COS
    const facultyRoles = [
      'Associate Dean',
      'Dean',
      'Chairperson',
      'Department Head, Science Department',
      'Department Head, Mathematics Department',
      'Program Chair, BS Mathematics',
      'Program Chair, BS Biology',
      'Program Chair, BS Food Technology',
      'Program Chair, BS Environmental Science',
      'Program Chair, BS Medical Technology',
      'College Extension and Services Unit (CESU) Head',
      'College Extension and Services Unit (CESU)',
      'College Research Development Unit (CRDU) Head',
      'College Research Development Unit (CRDU)',
      'Student Internship Program Coordinator',
      'College Clerk',
      'Laboratory Technician',
      'Medical Laboratory Technician',
      'Computer Laboratory Technician',
      'Professor, Science',
      'Professor, Mathematics',
      'Faculty (Part-Time), Science',
      'Faculty (Part-Time), Mathematics',
      'Assistant Professor',
      'Instructor',
      'Lecturer'
    ];

    // Check if the message contains any of the roles
    for (const role of facultyRoles) {
      if (lowerMsg.includes(role.toLowerCase().replace(/,/g, '').replace(/\s+/g, ' '))) {
        const facultyList = await prisma.faculty.findMany({
          where: { 
            position: role,
            college: 'College of Science'
          },
          orderBy: { lastName: 'asc' }
        });

        if (facultyList.length === 0) {
          return `There are currently no ${role}s listed for the College of Science.`;
        }

        const names = facultyList.map(f => `${f.firstName} ${f.lastName}`).join(', ');

        return `The ${role}s of the College of Science is ${names}.`;
      }
    }

    const programs = await prisma.universityProgram.findMany({ where: { college: 'College of Science', isActive: true } });
  let programMatch = programs.find(p => lowerMsg.includes(p.title.toLowerCase()) || (p.abbreviation && lowerMsg.includes(p.abbreviation.toLowerCase())));
  if (!programMatch) programMatch = programs.find(p => p.title.toLowerCase().includes('computer science')); // default fallback
  
  const yearMatch = lowerMsg.match(/(\d+)(st|nd|rd|th)?\s*year/)?.[1];
  const semesterMatch = lowerMsg.includes('2nd') || lowerMsg.includes('second') ? 2 : 1;

  if (programMatch && yearMatch) {
    const yearLevel = parseInt(yearMatch);

    const curriculum = await prisma.curriculumEntry.findMany({
      where: { programId: programMatch.id, semester: semesterMatch, yearLevel },
      orderBy: { courseCode: 'asc' },
    });

    if (curriculum.length > 0) {
      const formattedList = curriculum
        .map(c => `${c.courseCode} (${c.subjectName}) - ${c.units} Units`)
        .join('\n');
      return `For the ${programMatch.title} (${programMatch.abbreviation ?? ''}), the subjects for the ${semesterMatch}${semesterMatch===1?'st':'nd'} semester of Year ${yearLevel} are as follows:\n\n${formattedList}\n\nThese courses are designed to provide a strong foundational knowledge in the program.`;
    } else {
      return `Sorry, I could not find the subjects for ${programMatch.title} Year ${yearLevel}, Semester ${semesterMatch}.`;
    }
  }

    // --- Curriculum questions ---
    // if (lowerMsg.includes('1st sem') || lowerMsg.includes('first semester') || lowerMsg.includes('2nd sem') || lowerMsg.includes('second semester')) {
    //   // Detect program, default to BSCS if not mentioned
    //   const programName = lowerMsg.includes('bscs') ? 'Computer Science' : 'Computer Science'; // expand if more programs

    //   const semester = lowerMsg.includes('2nd') || lowerMsg.includes('second') ? 2 : 1;

    //   const entries = await prisma.curriculumEntry.findMany({
    //     where: {
    //       program: { title: { contains: programName } },
    //       semester,
    //     },
    //     orderBy: { yearLevel: 'asc' }
    //   });

    //   if (entries.length === 0) {
    //     return `Sorry, I couldn't find the ${semester} semester subjects for ${programName}.`;
    //   }

    //   const list = entries.map(c => {
    //     const pre = c.prerequisites.length > 0 ? ` (Prerequisites: ${c.prerequisites.join(', ')})` : '';
    //     return `${c.courseCode} - ${c.subjectName}${pre}`;
    //   }).join('\n• ');

    //   return `Here are the ${semester}${semester===1?'st':'nd'} semester subjects for ${programName}:\n• ${list}`;
    // }

    

    const isAskingAboutCOS = 
      lowerMsg.includes('college of science') ||
      lowerMsg.includes('cos') ||
      lowerMsg.includes('course offerings') ||
      lowerMsg.includes('programs') && lowerMsg.includes('science') ||
      lowerMsg.includes('what are the courses') ||
      lowerMsg.includes('bsu cos') ||
      lowerMsg.includes('offered programs') ||
      lowerMsg.includes('degrees');

    // Instant correct answer — works even if OpenAI is down
    if (isAskingAboutCOS) {
      return `**Bulacan State University – College of Science**

      Here are the official undergraduate programs as of 2025:

      • Bachelor of Science in Mathematics with Specialization in Applied Statistics  
      • Bachelor of Science in Mathematics with Specialization in Business Applications  
      • Bachelor of Science in Mathematics with Specialization in Computer Science  
      • BS Biology  
      • BS Environmental Science  
      • BS Food Technology  
      • BS Medical Technology / Medical Laboratory Science  

      Which program interests you? I can provide details on curriculum, admission, or career paths.`;
    }

    // Normal AI behavior with BSU COS knowledge baked in
    const systemPrompt = `${BSU_COS_PROGRAMS}

    You are TISA, a clear, professional, and encouraging AI tutor for Bulacan State University students.
    Use proper English at all times. Format answers with Markdown for readability.
    Keep responses concise (under 200 words) and educational.

    ${context ? `\n\nCurrent Context: ${context}` : ''}`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
      temperature: 0.7,
    });

    return completion.choices[0].message.content || 'Sorry, I could not generate a response. Please try again.';
  } catch (error: any) {
    console.error('OpenAI API Error:', error);

    // Fallback — still answers COS questions correctly even if API fails
    if (userMessage.toLowerCase().includes('college of science') || 
        userMessage.toLowerCase().includes('cos') || 
        userMessage.toLowerCase().includes('Kurso') || 
        userMessage.toLowerCase().includes('programs')) {
      return `**BSU College of Science – Official Programs (2025)**

      • BS Mathematics with Specialization in Applied Statistics  
      • BS Mathematics with Specialization in Business Applications  
      • BS Mathematics with Specialization in Computer Science  
      • BS Biology  
      • BS Environmental Science  
      • BS Food Technology  
      • BS Medical Technology / Medical Laboratory Science`;
    }

    return 'The AI service is temporarily unavailable. Please try again later.';
  }
};

// server/src/controllers/ai-tutor.controller.ts
export const askAITutor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { message, type } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    let contextInfo = '';

    // 1️⃣ Fetch all programs
    const programs = await prisma.universityProgram.findMany({
      where: { college: 'College of Science', isActive: true },
    });

    // 2️⃣ Detect program from message
    let program: any = null;
    const msgLower = message.toLowerCase();
    for (const p of programs) {
      if (msgLower.includes(p.title.toLowerCase()) || (p.abbreviation && msgLower.includes(p.abbreviation.toLowerCase()))) {
        program = p;
        break;
      }
    }

    if (program) {
      contextInfo += `Program: ${program.title} (${program.abbreviation}).\n`;

      // 3️⃣ Fetch relevant curriculum
      const curriculum = await prisma.curriculumEntry.findMany({
        where: { programId: program.id },
        orderBy: [{ yearLevel: 'asc' }, { semester: 'asc' }],
      });
      if (curriculum.length > 0) {
        contextInfo += `Curriculum:\n${curriculum.map(c =>
          `• ${c.courseCode} (${c.subjectName}), Year ${c.yearLevel}, Sem ${c.semester}, Units ${c.units}, Prerequisites: ${c.prerequisites.join(', ') || 'None'}`
        ).join('\n')}\n`;
      }
    }

    // 4️⃣ Fetch relevant faculty
    const faculty = await prisma.faculty.findMany({
      where: { college: 'College of Science' },
    });

    if (faculty.length > 0) {
      contextInfo += `Faculty Members:\n${faculty.map(f => `• ${f.position}: ${f.firstName} ${f.lastName}`).join('\n')}\n`;
    }

    // 5️⃣ Generate AI response with filtered context
    const aiResponse = await generateAIResponse(message, contextInfo || undefined);

    // 6️⃣ Save interaction
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
    });

  } catch (error) {
    console.error('AI tutor error:', error);
    res.status(500).json({ error: 'Server error processing AI request' });
  }
};




export const getAIHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { limit = 50, context } = req.query;

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

    const interactions = await prisma.aIInteraction.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: Number(limit),
    });

    res.json({ interactions });
  } catch (error) {
    console.error('Get AI history error:', error);
    res.status(500).json({ error: 'Server error fetching AI history' });
  }
};

export const rateAIResponse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
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
      data: { helpful },
    });

    res.json({ interaction: updated });
  } catch (error) {
    console.error('Rate AI response error:', error);
    res.status(500).json({ error: 'Server error rating response' });
  }
};