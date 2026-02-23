// server/src/services/rag-context.service.ts
// RAG (Retrieval-Augmented Generation) Context Service
// This service retrieves relevant database context for AI responses
// CRITICAL: AI must ONLY answer based on this retrieved context

import { prisma } from '../lib/prisma';

// Import modular components
export { analyzeQueryScope } from '../modules/rag/scope-analyzer';

export interface RAGContext {
  programs: ProgramContext[];
  faculty: FacultyContext[];
  curriculum: CurriculumContext[];
  faqs: FAQContext[];
  relevantSubjects: SubjectContext[];
  metadata: {
    totalPrograms: number;
    totalFaculty: number;
    totalCurriculumEntries: number;
    retrievedAt: string;
    queryType: string;
  };
}

interface ProgramContext {
  id: string;
  title: string;
  abbreviation: string | null;
  college: string;
  careerPaths?: string[];
  description?: string;
}

interface FacultyContext {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  position: string;
  college: string;
  email: string | null;
  officeHours: string | null;
  consultationDays: string[];
  subjects: string[];
}

interface CurriculumContext {
  programTitle: string;
  programAbbreviation: string | null;
  yearLevel: number;
  semester: number;
  courseCode: string;
  subjectName: string;
  lec: number;
  lab: number;
  totalUnits: number;
  prerequisites: string[];
}

interface SubjectContext {
  code: string;
  name: string;
  taughtBy: string[];
}

interface FAQContext {
  category: string;
  question: string;
  answer: string;
}

// Career paths mapping for programs (stored in code since not in DB)
const PROGRAM_CAREER_PATHS: Record<string, string[]> = {
  'BS Mathematics with Specialization in Applied Statistics': [
    'Data Analyst', 'Statistician', 'Research Analyst', 'Actuarial Scientist',
    'Business Intelligence Analyst', 'Quality Assurance Analyst'
  ],
  'BS Mathematics with Specialization in Business Applications': [
    'Business Analyst', 'Financial Analyst', 'Management Consultant',
    'Operations Research Analyst', 'Risk Analyst', 'Investment Analyst'
  ],
  'BS Mathematics with Specialization in Computer Science': [
    'Software Developer', 'Systems Analyst', 'IT Consultant', 'Data Scientist',
    'Machine Learning Engineer', 'Full Stack Developer', 'Database Administrator'
  ],
  'BS Biology': [
    'Biologist', 'Research Scientist', 'Environmental Consultant', 'Educator',
    'Laboratory Technician', 'Wildlife Biologist', 'Microbiologist'
  ],
  'BS Environmental Science': [
    'Environmental Specialist', 'Conservation Officer', 'Sustainability Consultant',
    'Environmental Impact Assessor', 'Climate Change Analyst', 'Ecologist'
  ],
  'BS Food Technology': [
    'Food Technologist', 'Quality Assurance Manager', 'Product Developer',
    'Food Safety Inspector', 'Research and Development Scientist', 'Production Manager'
  ],
  'BS Medical Technology': [
    'Medical Technologist', 'Laboratory Supervisor', 'Clinical Researcher',
    'Pathology Technician', 'Blood Bank Technologist', 'Histotechnologist'
  ],
  'BS Medical Laboratory Science': [
    'Medical Laboratory Scientist', 'Clinical Laboratory Technologist',
    'Pathology Laboratory Manager', 'Research Laboratory Scientist'
  ]
};

/**
 * Retrieve comprehensive database context for RAG
 * This is the ONLY source of truth for AI responses
 */
export async function retrieveRAGContext(userMessage: string): Promise<RAGContext> {
  const lowerMsg = userMessage.toLowerCase();
  
  // Determine query type for optimized retrieval
  const queryType = detectQueryType(lowerMsg);
  
  // Parallel fetch all relevant data
  const [programs, faculty, curriculum, faqs, subjects] = await Promise.all([
    fetchPrograms(lowerMsg, queryType),
    fetchFaculty(lowerMsg, queryType),
    fetchCurriculum(lowerMsg, queryType),
    fetchFAQs(lowerMsg),
    fetchSubjects(lowerMsg)
  ]);

  return {
    programs,
    faculty,
    curriculum,
    faqs,
    relevantSubjects: subjects,
    metadata: {
      totalPrograms: programs.length,
      totalFaculty: faculty.length,
      totalCurriculumEntries: curriculum.length,
      retrievedAt: new Date().toISOString(),
      queryType
    }
  };
}

/**
 * Detect the type of query for optimized retrieval
 */
function detectQueryType(msg: string): string {
  if (msg.includes('faculty') || msg.includes('professor') || msg.includes('teacher') || 
      msg.includes('who is') || msg.includes('sino') || msg.includes('dean') ||
      msg.includes('chairperson') || msg.includes('instructor')) {
    return 'faculty';
  }
  if (msg.includes('curriculum') || msg.includes('subject') || msg.includes('course') ||
      msg.includes('year') || msg.includes('semester') || msg.includes('prerequisite')) {
    return 'curriculum';
  }
  if (msg.includes('program') || msg.includes('degree') || msg.includes('offering') ||
      msg.includes('career') || msg.includes('job') || msg.includes('recommend') ||
      msg.includes('software developer') || msg.includes('best course') ||
      msg.includes('graduate') || msg.includes('work') || msg.includes('employment') ||
      msg.includes('after finishing') || msg.includes('opportunities')) {
    return 'programs';
  }
  if (msg.includes('admission') || msg.includes('enroll') || msg.includes('requirement') ||
      msg.includes('how to') || msg.includes('apply')) {
    return 'faq';
  }
  return 'general';
}

/**
 * Fetch programs with career paths
 */
async function fetchPrograms(msg: string, queryType: string): Promise<ProgramContext[]> {
  const programs = await prisma.universityProgram.findMany({
    where: { 
      college: 'College of Science',
      isActive: true 
    },
    orderBy: { order: 'asc' }
  });

  return programs.map(p => ({
    id: p.id,
    title: p.title,
    abbreviation: p.abbreviation,
    college: p.college,
    careerPaths: PROGRAM_CAREER_PATHS[p.title] || [],
    description: generateProgramDescription(p.title)
  }));
}

/**
 * Generate program description based on title
 */
function generateProgramDescription(title: string): string {
  const descriptions: Record<string, string> = {
    'BS Mathematics with Specialization in Applied Statistics': 
      'Focus on statistical analysis, data science, research methods, and quantitative analysis techniques.',
    'BS Mathematics with Specialization in Business Applications': 
      'Focus on business analytics, financial modeling, operations research, and management science.',
    'BS Mathematics with Specialization in Computer Science': 
      'Focus on algorithms, software development, computational mathematics, and programming.',
    'BS Biology': 
      'Focus on life sciences, ecology, molecular biology, genetics, and biological research.',
    'BS Environmental Science': 
      'Focus on environmental conservation, sustainability, climate science, and ecological management.',
    'BS Food Technology': 
      'Focus on food processing, quality control, food safety, and product development.',
    'BS Medical Technology': 
      'Focus on clinical laboratory procedures, diagnostics, pathology, and medical testing.',
    'BS Medical Laboratory Science': 
      'Focus on clinical laboratory science, medical diagnostics, and laboratory management.'
  };
  return descriptions[title] || 'A program offered by the College of Science at Bulacan State University.';
}

/**
 * Fetch faculty members with their subjects
 */
async function fetchFaculty(msg: string, queryType: string): Promise<FacultyContext[]> {
  // Extract potential name from message - improved patterns
  const namePatterns = [
    /who\s+is\s+([a-z]+(?:\s+[a-z]+)*)/i,
    /sino\s+(?:si|ang)?\s*([a-z]+(?:\s+[a-z]+)*)/i,
    /tell\s+me\s+about\s+([a-z]+(?:\s+[a-z]+)*)/i,
    /about\s+([a-z]+(?:\s+[a-z]+)*)/i,
    /(?:prof|professor|dr|dean|chair)\.?\s+([a-z]+(?:\s+[a-z]+)*)/i,
    /\b([a-z]{3,}(?:\s+[a-z]{3,})*)\b/i  // Catch any name-like words (3+ chars)
  ];

  let nameFilter: any = {};
  let searchName = '';
  
  // Check for specific name mentions
  for (const pattern of namePatterns) {
    const match = msg.match(pattern);
    if (match) {
      searchName = match[1]?.trim() || '';
      
      // Filter out common words that aren't names
      const excludeWords = ['who', 'what', 'where', 'when', 'why', 'how', 'the', 'is', 'are', 'was', 'were', 
                            'faculty', 'professor', 'teacher', 'instructor', 'dean', 'chair', 'head', 'about'];
      
      if (searchName && searchName.length > 2 && !excludeWords.includes(searchName.toLowerCase())) {
        // Split the name into parts (first name, last name, etc.)
        const nameParts = searchName.split(/\s+/).filter(p => p.length > 2 && !excludeWords.includes(p.toLowerCase()));
        
        if (nameParts.length === 1) {
          // Single word - could be first or last name (fuzzy match)
          nameFilter = {
            OR: [
              { firstName: { contains: nameParts[0], mode: 'insensitive' as const } },
              { lastName: { contains: nameParts[0], mode: 'insensitive' as const } },
              { middleName: { contains: nameParts[0], mode: 'insensitive' as const } }
            ]
          };
        } else if (nameParts.length >= 2) {
          // Multiple words - match first AND last name combinations
          const orConditions = [];
          
          // Try matching first + last name
          orConditions.push({
            AND: [
              { firstName: { contains: nameParts[0], mode: 'insensitive' as const } },
              { lastName: { contains: nameParts[nameParts.length - 1], mode: 'insensitive' as const } }
            ]
          });
          
          // Also try each part individually
          for (const part of nameParts) {
            orConditions.push(
              { firstName: { contains: part, mode: 'insensitive' as const } },
              { lastName: { contains: part, mode: 'insensitive' as const } },
              { middleName: { contains: part, mode: 'insensitive' as const } }
            );
          }
          
          nameFilter = { OR: orConditions };
        }
        break;
      }
    }
  }

  // Check for position mentions
  const positionKeywords = [
    { keyword: 'dean', position: 'Dean' },
    { keyword: 'associate dean', position: 'Associate Dean' },
    { keyword: 'chairperson', position: 'Chairperson' },
    { keyword: 'department head', position: 'Department Head' },
    { keyword: 'program chair', position: 'Program Chair' }
  ];

  let positionFilter: any = {};
  for (const { keyword, position } of positionKeywords) {
    if (msg.includes(keyword)) {
      positionFilter = { position: { contains: position, mode: 'insensitive' as const } };
      break;
    }
  }

  const faculty = await prisma.faculty.findMany({
    where: {
      college: { contains: 'College of Science', mode: 'insensitive' as const },
      ...nameFilter,
      ...positionFilter
    },
    include: {
      FacultySubject: {
        include: {
          Subject: true
        }
      }
    },
    orderBy: [
      { position: 'asc' },
      { lastName: 'asc' }
    ]
  });

  return faculty.map(f => ({
    id: f.id,
    fullName: `${f.firstName}${f.middleName ? ' ' + f.middleName : ''} ${f.lastName}`,
    firstName: f.firstName,
    lastName: f.lastName,
    position: f.position,
    college: f.college,
    email: f.email,
    officeHours: f.officeHours,
    consultationDays: f.consultationDays,
    subjects: f.FacultySubject.map((s: any) => s.Subject.name)
  }));
}

/**
 * Fetch curriculum entries
 */
async function fetchCurriculum(msg: string, queryType: string): Promise<CurriculumContext[]> {
  // Detect program from message
  const programKeywords: Record<string, string[]> = {
    'computer science': ['computer science', 'cs', 'bsm cs', 'programming', 'software'],
    'biology': ['biology', 'bio', 'bs bio'],
    'food technology': ['food technology', 'food tech', 'bs ft'],
    'environmental science': ['environmental', 'envi sci', 'environment'],
    'applied statistics': ['statistics', 'stat', 'bsm as', 'data'],
    'business applications': ['business', 'bsm ba', 'business applications'],
    'medical technology': ['medical technology', 'med tech', 'bs mt', 'medical laboratory']
  };

  let programFilter: string | null = null;
  for (const [program, keywords] of Object.entries(programKeywords)) {
    if (keywords.some(k => msg.includes(k))) {
      programFilter = program;
      break;
    }
  }

  // Detect year level
  const yearMatch = msg.match(/(\d+)(?:st|nd|rd|th)?\s*year/i) || 
                    msg.match(/(first|second|third|fourth)\s*year/i);
  let yearLevel: number | null = null;
  if (yearMatch) {
    const yearMap: Record<string, number> = { first: 1, second: 2, third: 3, fourth: 4 };
    yearLevel = yearMap[yearMatch[1].toLowerCase()] || parseInt(yearMatch[1]);
  }

  // Detect semester
  const semMatch = msg.match(/(\d+)(?:st|nd|rd|th)?\s*sem/i) ||
                   msg.match(/(first|second)\s*sem/i);
  let semester: number | null = null;
  if (semMatch) {
    const semMap: Record<string, number> = { first: 1, second: 2 };
    semester = semMap[semMatch[1].toLowerCase()] || parseInt(semMatch[1]);
  }

  // Build query
  const whereClause: any = {};
  
  if (programFilter) {
    const program = await prisma.universityProgram.findFirst({
      where: {
        title: { contains: programFilter, mode: 'insensitive' },
        college: 'College of Science'
      }
    });
    if (program) {
      whereClause.programId = program.id;
    }
  }

  if (yearLevel) {
    whereClause.yearLevel = yearLevel;
  }

  if (semester) {
    whereClause.semester = semester;
  }

  const curriculum = await prisma.curriculumEntry.findMany({
    where: whereClause,
    include: {
      UniversityProgram: true
    },
    orderBy: [
      { yearLevel: 'asc' },
      { semester: 'asc' },
      { courseCode: 'asc' }
    ],
    take: 100 // Limit for performance
  });

  return curriculum.map(c => ({
    programTitle: c.UniversityProgram.title,
    programAbbreviation: c.UniversityProgram.abbreviation,
    yearLevel: c.yearLevel,
    semester: c.semester,
    courseCode: c.courseCode,
    subjectName: c.subjectName,
    lec: c.lec,
    lab: c.lab,
    totalUnits: c.totalUnits,
    prerequisites: c.prerequisites
  }));
}

/**
 * Fetch relevant FAQs with improved keyword matching
 */
async function fetchFAQs(msg: string): Promise<FAQContext[]> {
  // Extract meaningful keywords from user message
  const stopWords = ['what', 'is', 'are', 'the', 'a', 'an', 'how', 'when', 'where', 'who', 'why', 'can', 'do', 'does', 'i', 'my', 'me', 'about', 'tell', 'explain'];
  const keywords = msg.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word));

  // Build search conditions
  const searchConditions: any[] = [];
  
  // Search in question text
  keywords.forEach(keyword => {
    searchConditions.push({ question: { contains: keyword, mode: 'insensitive' } });
    searchConditions.push({ answer: { contains: keyword, mode: 'insensitive' } });
  });
  
  // Search in keywords array
  if (keywords.length > 0) {
    searchConditions.push({ keywords: { hasSome: keywords } });
  }

  // Search in category
  searchConditions.push({ category: { contains: msg.substring(0, 30), mode: 'insensitive' } });

  const faqs = await prisma.fAQ.findMany({
    where: {
      isPublished: true,
      OR: searchConditions.length > 0 ? searchConditions : undefined
    },
    take: 10, // Increased to get more relevant FAQs
    orderBy: [
      { helpful: 'desc' },
      { viewCount: 'desc' }
    ]
  });

  console.log(`[FAQ Retrieval] Query: "${msg.substring(0, 50)}..." | Found: ${faqs.length} FAQs | Keywords: ${keywords.join(', ')}`);

  // Update view count for retrieved FAQs
  if (faqs.length > 0) {
    await Promise.all(
      faqs.map(faq => 
        prisma.fAQ.update({
          where: { id: faq.id },
          data: { viewCount: { increment: 1 } }
        }).catch(() => {}) // Ignore errors for view count updates
      )
    );
  }

  return faqs.map(f => ({
    category: f.category,
    question: f.question,
    answer: f.answer
  }));
}

/**
 * Fetch subjects with faculty
 */
async function fetchSubjects(msg: string): Promise<SubjectContext[]> {
  const subjects = await prisma.subject.findMany({
    where: {
      OR: [
        { name: { contains: msg.substring(0, 30), mode: 'insensitive' } },
        { code: { contains: msg.substring(0, 10), mode: 'insensitive' } }
      ]
    },
    include: {
      FacultySubject: {
        include: {
          Faculty: true
        }
      }
    },
    take: 10
  });

  return subjects.map(s => ({
    code: s.code,
    name: s.name,
    taughtBy: s.FacultySubject.map((f: any) => `${f.Faculty.firstName} ${f.Faculty.lastName}`)
  }));
}

/**
 * Format RAG context into a string for the AI prompt
 */
export function formatRAGContextForPrompt(context: RAGContext): string {
  let formatted = `\n## DATABASE KNOWLEDGE BASE (ONLY SOURCE OF TRUTH)\n`;
  formatted += `Retrieved at: ${context.metadata.retrievedAt}\n`;
  formatted += `Query Type: ${context.metadata.queryType}\n\n`;

  // Programs section
  if (context.programs.length > 0) {
    formatted += `### AVAILABLE PROGRAMS (${context.programs.length} total)\n`;
    for (const p of context.programs) {
      formatted += `\n**${p.title}**${p.abbreviation ? ` (${p.abbreviation})` : ''}\n`;
      formatted += `- College: ${p.college}\n`;
      if (p.description) {
        formatted += `- Description: ${p.description}\n`;
      }
      if (p.careerPaths && p.careerPaths.length > 0) {
        formatted += `- Career Paths: ${p.careerPaths.join(', ')}\n`;
      }
    }
    formatted += '\n';
  }

  // Faculty section
  if (context.faculty.length > 0) {
    formatted += `### FACULTY MEMBERS (${context.faculty.length} found)\n`;
    
    if (context.faculty.length > 1) {
      formatted += `\n**MULTIPLE MATCHES FOUND - Please clarify which person:**\n`;
    }
    
    for (const f of context.faculty) {
      formatted += `\n**${f.fullName}**\n`;
      formatted += `- Position: ${f.position}\n`;
      formatted += `- College: ${f.college}\n`;
      if (f.email) formatted += `- Email: ${f.email}\n`;
      if (f.officeHours) formatted += `- Office Hours: ${f.officeHours}\n`;
      if (f.consultationDays.length > 0) {
        formatted += `- Consultation Days: ${f.consultationDays.join(', ')}\n`;
      }
      if (f.subjects.length > 0) {
        formatted += `- Subjects: ${f.subjects.join(', ')}\n`;
      }
    }
    
    if (context.faculty.length > 1) {
      formatted += `\n**INSTRUCTION**: Since multiple people match this name, list all of them and ask the user which one they meant. Provide distinguishing details (position, subjects taught) to help them choose.\n`;
    }
    
    formatted += '\n';
  }

  // Curriculum section
  if (context.curriculum.length > 0) {
    formatted += `### CURRICULUM ENTRIES (${context.curriculum.length} subjects)\n`;
    
    // Group by program and year
    const grouped: Record<string, Record<number, Record<number, CurriculumContext[]>>> = {};
    for (const c of context.curriculum) {
      if (!grouped[c.programTitle]) grouped[c.programTitle] = {};
      if (!grouped[c.programTitle][c.yearLevel]) grouped[c.programTitle][c.yearLevel] = {};
      if (!grouped[c.programTitle][c.yearLevel][c.semester]) {
        grouped[c.programTitle][c.yearLevel][c.semester] = [];
      }
      grouped[c.programTitle][c.yearLevel][c.semester].push(c);
    }

    for (const [program, years] of Object.entries(grouped)) {
      formatted += `\n**${program}**\n`;
      for (const [year, semesters] of Object.entries(years)) {
        for (const [sem, subjects] of Object.entries(semesters)) {
          formatted += `\nYear ${year}, Semester ${sem}:\n`;
          let totalUnits = 0;
          for (const s of subjects) {
            formatted += `- ${s.courseCode}: ${s.subjectName} (${s.totalUnits} units)`;
            if (s.prerequisites.length > 0) {
              formatted += ` [Prerequisites: ${s.prerequisites.join(', ')}]`;
            }
            formatted += '\n';
            totalUnits += s.totalUnits;
          }
          formatted += `Total Units: ${totalUnits}\n`;
        }
      }
    }
    formatted += '\n';
  }

  // FAQs section
  if (context.faqs.length > 0) {
    formatted += `### RELEVANT FAQs\n`;
    for (const f of context.faqs) {
      formatted += `\nQ: ${f.question}\n`;
      formatted += `A: ${f.answer}\n`;
    }
    formatted += '\n';
  }

  // If no data found
  if (context.programs.length === 0 && context.faculty.length === 0 && 
      context.curriculum.length === 0 && context.faqs.length === 0) {
    formatted += `\n**NO SPECIFIC DATA FOUND FOR THIS QUERY**\n`;
    formatted += `The database does not contain information directly related to this question.\n`;
    formatted += `You should politely inform the user that this topic is outside your knowledge scope.\n`;
  }

  return formatted;
}

// OLD analyzeQueryScope function removed - now using modular version from scope-analyzer.ts
// The function is imported and re-exported at the top of this file

/**
 * Generate course recommendation based on career goal
 */
export async function generateCourseRecommendation(careerGoal: string): Promise<{
  recommendedProgram: ProgramContext | null;
  relevantSubjects: CurriculumContext[];
  reasoning: string;
}> {
  const lowerGoal = careerGoal.toLowerCase();

  // Career to program mapping
  const careerProgramMap: Record<string, string[]> = {
    'software developer': ['computer science'],
    'programmer': ['computer science'],
    'web developer': ['computer science'],
    'data scientist': ['computer science', 'applied statistics'],
    'data analyst': ['applied statistics', 'computer science'],
    'statistician': ['applied statistics'],
    'business analyst': ['business applications'],
    'financial analyst': ['business applications'],
    'biologist': ['biology'],
    'researcher': ['biology', 'environmental science'],
    'food technologist': ['food technology'],
    'quality assurance': ['food technology'],
    'medical technologist': ['medical technology'],
    'laboratory': ['medical technology', 'biology'],
    'environmental': ['environmental science'],
    'conservation': ['environmental science']
  };

  let matchedPrograms: string[] = [];
  for (const [career, programs] of Object.entries(careerProgramMap)) {
    if (lowerGoal.includes(career)) {
      matchedPrograms = programs;
      break;
    }
  }

  if (matchedPrograms.length === 0) {
    // Default to showing all programs
    const allPrograms = await prisma.universityProgram.findMany({
      where: { college: 'College of Science', isActive: true }
    });
    
    return {
      recommendedProgram: null,
      relevantSubjects: [],
      reasoning: 'No specific program match found for this career goal. Here are all available programs at BSU College of Science.'
    };
  }

  // Find the best matching program
  const program = await prisma.universityProgram.findFirst({
    where: {
      title: { contains: matchedPrograms[0], mode: 'insensitive' },
      college: 'College of Science',
      isActive: true
    }
  });

  if (!program) {
    return {
      recommendedProgram: null,
      relevantSubjects: [],
      reasoning: 'Program not found in database.'
    };
  }

  // Get relevant subjects (focus on major subjects from year 2-4)
  const curriculum = await prisma.curriculumEntry.findMany({
    where: {
      programId: program.id,
      yearLevel: { gte: 2 }
    },
    include: { UniversityProgram: true },
    orderBy: [{ yearLevel: 'asc' }, { semester: 'asc' }],
    take: 20
  });

  const programContext: ProgramContext = {
    id: program.id,
    title: program.title,
    abbreviation: program.abbreviation,
    college: program.college,
    careerPaths: PROGRAM_CAREER_PATHS[program.title] || [],
    description: generateProgramDescription(program.title)
  };

  const subjectContexts: CurriculumContext[] = curriculum.map(c => ({
    programTitle: c.UniversityProgram.title,
    programAbbreviation: c.UniversityProgram.abbreviation,
    yearLevel: c.yearLevel,
    semester: c.semester,
    courseCode: c.courseCode,
    subjectName: c.subjectName,
    lec: c.lec,
    lab: c.lab,
    totalUnits: c.totalUnits,
    prerequisites: c.prerequisites
  }));

  return {
    recommendedProgram: programContext,
    relevantSubjects: subjectContexts,
    reasoning: `Based on your career goal, ${program.title} is highly recommended as it provides the necessary foundation and skills.`
  };
}
