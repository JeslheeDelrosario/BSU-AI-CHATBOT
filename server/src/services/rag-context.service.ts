// server/src/services/rag-context.service.ts
// RAG (Retrieval-Augmented Generation) Context Service
// This service retrieves relevant database context for AI responses
// CRITICAL: AI must ONLY answer based on this retrieved context

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
      msg.includes('software developer') || msg.includes('best course')) {
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
  // Extract potential name from message
  const namePatterns = [
    /who is (\w+\s*\w*)/i,
    /sino si (\w+\s*\w*)/i,
    /about (\w+\s*\w*)/i,
    /(\w+)\s+galvez/i,
    /galvez/i,
    /(\w+)\s+(\w+)/i
  ];

  let nameFilter: any = {};
  
  // Check for specific name mentions
  for (const pattern of namePatterns) {
    const match = msg.match(pattern);
    if (match) {
      const searchName = match[1] || match[0];
      if (searchName && searchName.length > 2) {
        nameFilter = {
          OR: [
            { firstName: { contains: searchName, mode: 'insensitive' } },
            { lastName: { contains: searchName, mode: 'insensitive' } }
          ]
        };
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
      positionFilter = { position: { contains: position, mode: 'insensitive' } };
      break;
    }
  }

  const faculty = await prisma.faculty.findMany({
    where: {
      college: 'College of Science',
      ...nameFilter,
      ...positionFilter
    },
    include: {
      subjects: {
        include: {
          subject: true
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
    subjects: f.subjects.map(s => s.subject.name)
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
      program: true
    },
    orderBy: [
      { yearLevel: 'asc' },
      { semester: 'asc' },
      { courseCode: 'asc' }
    ],
    take: 100 // Limit for performance
  });

  return curriculum.map(c => ({
    programTitle: c.program.title,
    programAbbreviation: c.program.abbreviation,
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
 * Fetch relevant FAQs
 */
async function fetchFAQs(msg: string): Promise<FAQContext[]> {
  const faqs = await prisma.fAQ.findMany({
    where: {
      isPublished: true,
      OR: [
        { question: { contains: msg.substring(0, 50), mode: 'insensitive' } },
        { keywords: { hasSome: msg.split(' ').filter(w => w.length > 3) } }
      ]
    },
    take: 5,
    orderBy: { viewCount: 'desc' }
  });

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
      faculty: {
        include: {
          faculty: true
        }
      }
    },
    take: 10
  });

  return subjects.map(s => ({
    code: s.code,
    name: s.name,
    taughtBy: s.faculty.map(f => `${f.faculty.firstName} ${f.faculty.lastName}`)
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

/**
 * Check if a query is within the BSU COS knowledge scope
 * Returns detailed analysis for better handling
 */
export function analyzeQueryScope(userMessage: string): {
  isInScope: boolean;
  confidence: number;
  category: string;
  reason: string;
} {
  const lowerMsg = userMessage.toLowerCase();

  // Definite OUT OF SCOPE topics
  const outOfScopePatterns = [
    // Geography/General Knowledge
    { pattern: /regions?\s*(in|of)?\s*(the)?\s*philippines/i, category: 'geography' },
    { pattern: /provinces?\s*(in|of)/i, category: 'geography' },
    { pattern: /capital\s*(of|city)/i, category: 'geography' },
    { pattern: /population\s*(of)?/i, category: 'geography' },
    
    // Weather/News
    { pattern: /weather|forecast|temperature|climate\s+today/i, category: 'weather' },
    { pattern: /news|headline|current\s+events/i, category: 'news' },
    
    // Entertainment
    { pattern: /movie|film|actor|actress|celebrity|singer|band/i, category: 'entertainment' },
    { pattern: /song|music|album|concert/i, category: 'entertainment' },
    { pattern: /game|gaming|esports/i, category: 'entertainment' },
    
    // Sports
    { pattern: /basketball|football|soccer|volleyball|sports?\s+score/i, category: 'sports' },
    { pattern: /nba|pba|uaap|ncaa\s+(?!course)/i, category: 'sports' },
    
    // Food/Recipes
    { pattern: /recipe|how\s+to\s+cook|ingredients?\s+for/i, category: 'cooking' },
    { pattern: /restaurant|food\s+delivery/i, category: 'food' },
    
    // Shopping/Commerce
    { pattern: /buy|purchase|price\s+of|how\s+much\s+is/i, category: 'shopping' },
    { pattern: /lazada|shopee|amazon/i, category: 'shopping' },
    
    // Travel
    { pattern: /hotel|resort|travel|vacation|tourist\s+spot/i, category: 'travel' },
    { pattern: /flight|airline|booking/i, category: 'travel' },
    
    // Politics
    { pattern: /president|senator|mayor|election|politics|government\s+(?!requirement)/i, category: 'politics' },
    
    // Health (non-academic)
    { pattern: /medicine|symptom|disease|doctor|hospital\s+(?!internship)/i, category: 'health' },
    
    // Technology (non-academic)
    { pattern: /iphone|android|samsung|laptop\s+(?!requirement)/i, category: 'tech_products' },
    
    // Random trivia
    { pattern: /who\s+invented|when\s+was\s+(?!bsu|bulacan)/i, category: 'trivia' },
    { pattern: /what\s+is\s+the\s+(?!bsu|college|program|curriculum|course|subject)/i, category: 'trivia' }
  ];

  // Check for out of scope patterns
  for (const { pattern, category } of outOfScopePatterns) {
    if (pattern.test(lowerMsg)) {
      return {
        isInScope: false,
        confidence: 0.95,
        category,
        reason: `Query appears to be about ${category}, which is outside BSU COS knowledge scope.`
      };
    }
  }

  // Definite IN SCOPE keywords
  const inScopeKeywords = [
    'bsu', 'bulacan state', 'college of science', 'cos',
    'program', 'curriculum', 'subject', 'course', 'faculty',
    'professor', 'teacher', 'instructor', 'dean', 'chairperson',
    'admission', 'enrollment', 'requirement', 'apply',
    'computer science', 'biology', 'food technology',
    'environmental science', 'mathematics', 'statistics',
    'medical technology', 'business applications',
    'career', 'job', 'graduate', 'degree', 'recommend',
    'semester', 'year level', 'prerequisite', 'units',
    'lab', 'lecture', 'thesis', 'ojt', 'internship',
    'tisa', 'tutor', 'study', 'learn', 'academic'
  ];

  const matchedKeywords = inScopeKeywords.filter(kw => lowerMsg.includes(kw));
  
  if (matchedKeywords.length > 0) {
    return {
      isInScope: true,
      confidence: Math.min(0.5 + (matchedKeywords.length * 0.1), 0.95),
      category: 'bsu_cos',
      reason: `Query contains BSU COS related keywords: ${matchedKeywords.join(', ')}`
    };
  }

  // Greetings are in scope
  const greetings = ['hi', 'hello', 'hey', 'kumusta', 'good morning', 'good afternoon', 'good evening'];
  if (greetings.some(g => lowerMsg.trim() === g || lowerMsg.trim() === g + '!')) {
    return {
      isInScope: true,
      confidence: 1.0,
      category: 'greeting',
      reason: 'Simple greeting'
    };
  }

  // Default: uncertain - treat as potentially out of scope for safety
  return {
    isInScope: false,
    confidence: 0.6,
    category: 'unknown',
    reason: 'Query does not contain recognizable BSU COS keywords. Cannot verify if within scope.'
  };
}

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
    include: { program: true },
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
    programTitle: c.program.title,
    programAbbreviation: c.program.abbreviation,
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
