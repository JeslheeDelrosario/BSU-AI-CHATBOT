// server/src/services/rag-context.service.ts
// RAG (Retrieval-Augmented Generation) Context Service
// This service retrieves relevant database context for AI responses
// CRITICAL: AI must ONLY answer based on this retrieved context

import { prisma } from '../lib/prisma';
import { FAQCacheService } from './faq-cache.service';
import fs from "fs";
import path from "path";

// Import modular components
export { analyzeQueryScope } from '../modules/rag/scope-analyzer';


let curriculumGuide: string = '';
try {
  const guidePath = path.join(__dirname, '../knowledge/curriculum-guide.md');
  curriculumGuide = fs.readFileSync(guidePath, 'utf-8');
  console.log('✅ Curriculum guide loaded successfully');
} catch (error) {
  console.error('❌ Failed to load curriculum guide:', error);
  curriculumGuide = '';
}

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
  teachingSchedule: TeachingSchedule[];
}

interface TeachingSchedule {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
  room: string;
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

/**
 * Sanitize user input for safe logging (prevents log injection attacks)
 */
function sanitizeForLogging(input: string): string {
  return input
    .replace(/[\r\n]/g, ' ')  // Remove newlines
    .replace(/[\x00-\x1F]/g, '') // Remove control characters
    .substring(0, 500); // Limit length to prevent log flooding
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
 * Retrieve comprehensive context for RAG
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
      msg.includes('associate dean') || msg.includes('chairperson') || 
      msg.includes('chair') || msg.includes('department head') ||
      msg.includes('program chair') || msg.includes('coordinator') ||
      msg.includes('instructor') || msg.includes('schedule')) {
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
    // Use database careerPaths if available, fallback to hardcoded
    careerPaths: (p.careerPaths && p.careerPaths.length > 0) ? p.careerPaths : (PROGRAM_CAREER_PATHS[p.title] || []),
    // Use database description if available, fallback to generated
    description: p.description || generateProgramDescription(p.title)
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
  // amazonq-ignore-next-line
  console.log(`🔍 Faculty search - original message: "${sanitizeForLogging(msg)}"`);
  
  // CRITICAL: Check for schedule queries with faculty names FIRST
  // Pattern: "schedule of [Name]" or "[Name]'s schedule" or "[Name] schedule"
  const scheduleWithNameMatch = msg.match(/(?:schedule|teaching|class)\s+(?:of|for)?\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)\b/i) ||
                                msg.match(/([A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(?:schedule|teaching|class)/i) ||
                                msg.match(/(?:sir|ma'am|maam|prof|professor|dr)\.?\s+([A-Za-z]+(?:\s+[A-Za-z]+)*)/i);
  
  if (scheduleWithNameMatch && scheduleWithNameMatch[1]) {
    const rawName = scheduleWithNameMatch[1].trim();
    console.log(`🔍 Schedule query with faculty name detected: "${sanitizeForLogging(rawName)}"`);
    
    // Search by name for schedule queries - use OR conditions for flexible matching
    const nameParts = rawName.split(/\s+/).filter(p => p.length > 0);
    const orConditions: any[] = [];
    
    // Try all combinations of name parts
    for (const part of nameParts) {
      orConditions.push(
        { firstName: { contains: part, mode: 'insensitive' as const } },
        { lastName: { contains: part, mode: 'insensitive' as const } },
        { middleName: { contains: part, mode: 'insensitive' as const } }
      );
    }
    
    // Also try first + last name combination
    if (nameParts.length >= 2) {
      orConditions.push({
        AND: [
          { firstName: { contains: nameParts[0], mode: 'insensitive' as const } },
          { lastName: { contains: nameParts[nameParts.length - 1], mode: 'insensitive' as const } }
        ]
      });
    }
    
    const whereClause: any = {
      college: { contains: 'College of Science', mode: 'insensitive' as const },
      OR: orConditions
    };
    
    const faculty = await prisma.faculty.findMany({
      where: whereClause,
      include: {
        FacultySubject: {
          include: { Subject: true }
        },
        FacultySchedule: {
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
        }
      },
      orderBy: [{ lastName: 'asc' }]
    });
    
    console.log(`🔍 Schedule query found ${faculty.length} faculty members`);
    
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
      subjects: f.FacultySubject.map((s: any) => s.Subject.name),
      teachingSchedule: f.FacultySchedule.map((s: any) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        subject: s.subject || 'N/A',
        room: s.room || 'TBA'
      }))
    }));
  }
  
  // Check for position mentions FIRST - before name extraction
  // IMPORTANT: More specific/longer keywords MUST come before shorter generic ones
  // (e.g. 'associate dean' before 'dean', 'program chair' before 'chair')
  // because the loop breaks on the FIRST match.
  const positionKeywords = [
    { keyword: 'associate dean', position: 'Associate Dean' },
    { keyword: 'extension coordinator', position: 'Extension Coordinator' },
    { keyword: 'research coordinator', position: 'Research Coordinator' },
    { keyword: 'program coordinator', position: 'Program Coordinator' },
    { keyword: 'program chair', position: 'Program Chair' },
    { keyword: 'department head', position: 'Department Head' },
    { keyword: 'dean', position: 'Dean' },
    { keyword: 'chairperson', position: 'Chairperson' },
    { keyword: 'coordinator', position: 'Coordinator' },
    { keyword: 'chair', position: 'Chair' },  // matches 'Program Chair, BS ...' via contains
    { keyword: 'faculty', position: 'Faculty' },
    { keyword: 'professor', position: 'Professor' },
    { keyword: 'instructor', position: 'Instructor' }
  ];

  let positionFilter: any = {};
  let foundPosition = false;
  let detectedPositionLabel = '';
  
  for (const { keyword, position } of positionKeywords) {
    if (msg.toLowerCase().includes(keyword)) {
      positionFilter = { position: { contains: position, mode: 'insensitive' as const } };
      foundPosition = true;
      detectedPositionLabel = position;
      console.log(`🔍 Position detected: ${sanitizeForLogging(position)} (keyword: ${sanitizeForLogging(keyword)})`);
      break;
    }
  }

  // If we found a position keyword, skip name extraction and prioritize position search
  if (foundPosition) {
    console.log(`🔍 Prioritizing position search over name search`);
    
    const whereClause = {
      college: { contains: 'College of Science', mode: 'insensitive' as const },
      ...positionFilter
    };
    
    console.log(`🔍 Faculty search - where clause:`, JSON.stringify(whereClause, null, 2).substring(0, 500));

    const faculty = await prisma.faculty.findMany({
      where: whereClause,
      include: {
        FacultySubject: {
          include: {
            Subject: true
          }
        },
        FacultySchedule: {
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
          ]
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
      subjects: f.FacultySubject.map((s: any) => s.Subject.name),
      teachingSchedule: f.FacultySchedule.map((s: any) => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        subject: s.subject || 'N/A',
        room: s.room || 'TBA'
      }))
    }));
  }

  // Only proceed with name extraction if no position was found
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
      // amazonq-ignore-next-line
      console.log(`🔍 Pattern matched: "${pattern.source}" -> extracted: "${searchName}"`);
      // amazonq-ignore-next-line
      console.log(`🔍 Name before filtering: "${searchName}"`);
      
      // Filter out common words that aren't names (including position titles)
      const excludeWords = ['who', 'what', 'where', 'when', 'why', 'how', 'the', 'is', 'are', 'was', 'were', 
                            'faculty', 'professor', 'teacher', 'instructor', 'chair', 'head', 'about',
                            'associate', 'department', 'program', 'college', 'science', 'cs', 'of'];
      
      console.log(`Ã°Å¸â€Â Exclude words: [${excludeWords.join(', ')}]`);
      
      if (searchName && searchName.length > 2 && !excludeWords.includes(searchName.toLowerCase())) {
        // Split the name into parts (first name, last name, etc.)
        const nameParts = searchName.split(/\s+/).filter(p => p.length > 2 && !excludeWords.includes(p.toLowerCase()));
        // amazonq-ignore-next-line
        // amazonq-ignore-next-line
        // amazonq-ignore-next-line
        // amazonq-ignore-next-line
        // amazonq-ignore-next-line
        console.log(`Ã°Å¸â€Â Name parts after filtering: [${nameParts.join(', ')}]`);
        
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

  // If no position was found and no name was extracted, return empty results
  if (!nameFilter || Object.keys(nameFilter).length === 0) {
    console.log(`🔍 No valid name or position found, returning empty results`);
    return [];
  }

  const whereClause = {
    college: { contains: 'College of Science', mode: 'insensitive' as const },
    ...nameFilter
  };
  
  // amazonq-ignore-next-line
  console.log(`ðŸ” Faculty search - where clause:`, JSON.stringify(whereClause, null, 2));

  const faculty = await prisma.faculty.findMany({
    where: whereClause,
    include: {
      FacultySubject: {
        include: {
          Subject: true
        }
      },
      FacultySchedule: {
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' }
        ]
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
    subjects: f.FacultySubject.map((s: any) => s.Subject.name),
    teachingSchedule: f.FacultySchedule.map((s: any) => ({
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      subject: s.subject || 'N/A',
      room: s.room || 'TBA'
    }))
  }));
}

/**
 * Fetch curriculum entries
 */
// Shared normaliser — handles "Thesis 1" → "Thesis I" etc.
// Place this OUTSIDE fetchCurriculum, at module scope (above the function)
function normaliseCourseName(s: string): string {
  const map: Record<string, string> = {
    'thesis 1':   'Thesis I',
    'thesis 2':   'Thesis II',
    'thesis 3':   'Thesis III',
    'thesis 4':   'Thesis IV',
    'thesis i':   'Thesis I',
    'thesis ii':  'Thesis II',
    'thesis iii': 'Thesis III',
    'thesis iv':  'Thesis IV',
  };
  return map[s.toLowerCase()] ?? s;
}

async function enrichCurriculumEntries(entries: any[]): Promise<CurriculumContext[]> {
  const allPrereqCodes = [...new Set(entries.flatMap(c => c.prerequisites || []))];
  const prereqMap = new Map<string, string>();
  
  if (allPrereqCodes.length > 0) {
    const prereqEntries = await prisma.curriculumEntry.findMany({
      where: { courseCode: { in: allPrereqCodes as string[] } },
      select: { courseCode: true, subjectName: true },
      distinct: ['courseCode']
    });
    prereqEntries.forEach(e => prereqMap.set(e.courseCode, e.subjectName));
  }

  return entries.map(c => ({
    programTitle:        c.UniversityProgram?.title ?? '',
    programAbbreviation: c.UniversityProgram?.abbreviation ?? null,
    yearLevel:           c.yearLevel,
    semester:            c.semester,
    courseCode:          c.courseCode,
    subjectName:         c.subjectName,
    lec:                 c.lec,
    lab:                 c.lab,
    totalUnits:          c.totalUnits,
    prerequisites:       (c.prerequisites || []).map((code: string) => {
      const name = prereqMap.get(code);
      return name ? `${code} - ${name}` : code;
    })
  }));
}

async function fetchCurriculum(msg: string, queryType: string): Promise<CurriculumContext[]> {
  console.log(`[fetchCurriculum] Starting - message: "${sanitizeForLogging(msg.substring(0, 60))}..."`);

  // ─────────────────────────────────────────────────────────────────────────
  // NEW BLOCK: Detect "can I take X if I failed Y" BEFORE anything else.
  // We only need to fetch the TARGET course (X) here — the prerequisite
  // intercept in the controller will handle the actual yes/no logic.
  // ─────────────────────────────────────────────────────────────────────────
  const conditionalEnrollmentMatch =
    msg.match(
      /can i (?:still )?take\s+(.+?)\s+if\s+(?:i\s+)?(?:failed|didn'?t pass|did not pass|flunked|bumagsak)/i
    ) ||
    msg.match(
      /pwede (?:ba )?(?:akong )?kumuha (?:ng )?(.+?)\s+(?:kahit|kung)\s+(?:bumagsak|failed|hindi pumasa)/i
    );

  if (conditionalEnrollmentMatch) {
    const rawTarget  = conditionalEnrollmentMatch[1].trim();
    const normalised = normaliseCourseName(rawTarget);

    console.log(`[fetchCurriculum] Conditional enrollment pattern detected → target course: "${sanitizeForLogging(normalised)}"`);

    const entries = await prisma.curriculumEntry.findMany({
      where: {
        OR: [
          { subjectName: { contains: normalised, mode: 'insensitive' } },
          { courseCode:  { contains: normalised, mode: 'insensitive' } },
        ],
      },
      include: { UniversityProgram: true },
      orderBy: [{ yearLevel: 'asc' }, { semester: 'asc' }],
      take: 10,
    });

    console.log(`[fetchCurriculum] Conditional match found ${entries.length} entries for "${sanitizeForLogging(normalised)}"`);

    return await enrichCurriculumEntries(entries);
  }
  // ─────────────────────────────────────────────────────────────────────────
  // END NEW BLOCK — everything below is UNCHANGED from the original
  // ─────────────────────────────────────────────────────────────────────────

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
      console.log(`[fetchCurriculum] Program filter detected: ${sanitizeForLogging(programFilter)}`);
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

  // Detect subject name for specific course searches (e.g., "Thesis 1", "Calculus")
  let subjectFilter: string | null = null;
  let courseCodeFilter: string | null = null;

  // Check for common course names in queries about prerequisites
  if (msg.toLowerCase().includes('prerequisite') || msg.toLowerCase().includes('prerequisites')) {
    // Try to extract course code first (e.g., "MAT 102", "MCS 205")
    const courseCodeMatch = msg.match(/\b([A-Z]{2,4}\s*\d{3}[a-z]?)\b/i);
    if (courseCodeMatch) {
      courseCodeFilter = courseCodeMatch[1].trim();
    } else {
      const patterns = [
        /'([^']+)'/,
        /"([^"]+)"/,
        /(?:of|for)\s+(?:the\s+)?([a-zA-Z0-9\s]+?)(?:\s+(?:in|for|course)|\?|$)/i
      ];

      for (const pattern of patterns) {
        const match = msg.match(pattern);
        if (match && match[1]) {
          subjectFilter = match[1].trim();
          break;
        }
      }
    }
  }

  // Fallback: if no subject filter yet and message mentions thesis
  if (!subjectFilter && msg.toLowerCase().includes('thesis')) {
    subjectFilter = 'Thesis';
  }

  // Normalize subject names: convert numbers to Roman numerals for Thesis courses
  if (subjectFilter) {
    console.log(`[fetchCurriculum] Subject filter before normalization: "${sanitizeForLogging(subjectFilter)}"`);
    const numberToRoman: Record<string, string> = {
      'Thesis 1': 'Thesis I',
      'Thesis 2': 'Thesis II',
      'Thesis 3': 'Thesis III',
      'Thesis 4': 'Thesis IV',
      'thesis 1': 'Thesis I',
      'thesis 2': 'Thesis II',
      'thesis 3': 'Thesis III',
      'thesis 4': 'Thesis IV'
    };

    for (const [numForm, romanForm] of Object.entries(numberToRoman)) {
      if (subjectFilter.toLowerCase() === numForm.toLowerCase()) {
        subjectFilter = romanForm;
        console.log(`[fetchCurriculum] Normalized subject filter to: "${sanitizeForLogging(subjectFilter)}"`);
        break;
      }
    }
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

  if (courseCodeFilter) {
    whereClause.courseCode = { contains: courseCodeFilter, mode: 'insensitive' };
  } else if (subjectFilter) {
    whereClause.OR = [
      { subjectName: { contains: subjectFilter, mode: 'insensitive' } },
      { courseCode: { contains: subjectFilter, mode: 'insensitive' } }
    ];
  }

  console.log(`[fetchCurriculum] Final whereClause:`, JSON.stringify(whereClause, null, 2).substring(0, 500));

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
    take: 30
  });

  console.log(`[fetchCurriculum] Found ${curriculum.length} curriculum entries`);
  if (curriculum.length > 0) {
    console.log(`[fetchCurriculum] First result: ${sanitizeForLogging(curriculum[0].subjectName)} (${sanitizeForLogging(curriculum[0].courseCode)})`);
  }

  return await enrichCurriculumEntries(curriculum);
}

/**
 * Fetch relevant FAQs with improved keyword matching
 */
async function fetchFAQs(msg: string): Promise<FAQContext[]> {
  const lowerMsg = msg.toLowerCase();

  // CRITICAL: Check if this is a faculty schedule query BEFORE ANY FAQ SEARCH
  const isFacultyScheduleQuery =
    lowerMsg.match(
      /(?:schedule|teaching|class)\s+(?:of|for)?\s+([a-z]+(?:\s+[a-z]+)*)\b/i,
    ) ||
    lowerMsg.match(/([a-z]+(?:\s+[a-z]+)*)\s+(?:schedule|teaching|class)/i) ||
    lowerMsg.match(
      /(?:sir|ma'am|maam|prof|professor|dr)\.?\s+([a-z]+(?:\s+[a-z]+)*)/i,
    ) ||
    (lowerMsg.includes("schedule") &&
      (lowerMsg.includes("prof") ||
        lowerMsg.includes("sir") ||
        lowerMsg.includes("ma'am") ||
        lowerMsg.includes("maam") ||
        lowerMsg.includes("faculty") ||
        lowerMsg.includes("instructor") ||
        lowerMsg.includes("teacher")));

  // Check if this is a room schedule query
  const isRoomScheduleQuery =
    lowerMsg.match(/(?:fh|fs|room|lab|building|hall)\s*\d+/i) ||
    lowerMsg.match(/(?:room|classroom)\s+[a-z0-9]+\s*schedule/i) ||
    (lowerMsg.includes("room") && lowerMsg.includes("schedule"));

  // Extract faculty name if present
  let facultyName: string | null = null;
  let rawFacultyName: string | null = null;

  const nameMatch =
    lowerMsg.match(
      /(?:schedule|teaching|class)\s+(?:of|for)?\s+([a-z]+(?:\s+[a-z]+)*)\b/i,
    ) ||
    lowerMsg.match(
      /(?:sir|ma'am|maam|prof|professor|dr)\.?\s+([a-z]+(?:\s+[a-z]+)*)/i,
    );

  if (nameMatch && nameMatch[1]) {
    rawFacultyName = nameMatch[1].trim();
    facultyName = rawFacultyName.toLowerCase();
    console.log(`[FAQ Retrieval] Extracted faculty name: "${facultyName}"`);
  }

  // CASE 1: FACULTY SCHEDULE QUERY
  if (isFacultyScheduleQuery && !isRoomScheduleQuery) {
    console.log(`[FAQ Retrieval] Faculty schedule query detected`);

    // Extract keywords for faculty search
    const stopWords = [
      "what",
      "is",
      "are",
      "the",
      "a",
      "an",
      "how",
      "when",
      "where",
      "who",
      "why",
      "can",
      "do",
      "does",
      "i",
      "my",
      "me",
      "about",
      "tell",
      "explain",
      "prof",
      "prof.",
      "professor",
      "maam",
      "ma'am",
      "sir",
      "of",
      "for",
      "schedule",
      "teaching",
      "class",
      "classes",
      "give",
      "me",
    ];

    let keywords = lowerMsg
      .replace(/[?.,!;:'"()]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.includes(word));

    // Add faculty name as a keyword if available
    if (facultyName) {
      const nameParts = facultyName.split(/\s+/);
      keywords.push(...nameParts);
    }

    // Remove duplicates
    keywords = [...new Set(keywords)];

    if (keywords.length === 0) {
      console.log(`[FAQ Retrieval] No keywords extracted, returning empty`);
      return [];
    }

    console.log(
      `[FAQ Retrieval] Searching Faculty Schedules with keywords: ${keywords.join(", ")}`,
    );

    

    // ONLY fetch FAQs from "Faculty Schedules" category
    const facultySchedules = await FAQCacheService.searchFAQs(keywords, [
      "Faculty Schedules",
    ]);

    console.log(
      `[FAQ Retrieval] Faculty schedule query - Found: ${facultySchedules.length} FAQs`,
    );
    console.log(
      `[FAQ Retrieval] Results:`,
      facultySchedules.map((f) => ({
        category: f.category,
        question: f.question.substring(0, 50),
      })),
    );

    // Update view count for retrieved FAQs
    if (facultySchedules.length > 0) {
      Promise.all(
        facultySchedules.map((faq) =>
          prisma.fAQ
            .update({
              where: { id: faq.id },
              data: { viewCount: { increment: 1 } },
            })
            .catch(() => {}),
        ),
      ).catch(() => {});
    }

    return facultySchedules.map((f) => ({
      category: f.category,
      question: f.question,
      answer: f.answer,
    }));
  }

  // CASE 2: ROOM SCHEDULE QUERY
  if (isRoomScheduleQuery) {
    console.log(`[FAQ Retrieval] Room schedule query detected`);

    // Extract room number if present
    const roomMatch =
      lowerMsg.match(/(?:fh|fs|room|lab)\s*(\d+[a-z]?)/i) ||
      lowerMsg.match(/(?:room|classroom)\s+([a-z0-9]+)/i);

    let keywords: string[] = [];

    if (roomMatch && roomMatch[1]) {
      const roomNumber = roomMatch[1].toLowerCase();
      keywords.push(roomNumber);
      console.log(`[FAQ Retrieval] Extracted room number: "${roomNumber}"`);
    }

    // Add common room keywords
    keywords.push("room", "schedule");

    // Also extract any room location like "FH", "FS"
    const locationMatch = lowerMsg.match(/\b(fh|fs|avr)\b/i);
    if (locationMatch) {
      keywords.push(locationMatch[1].toLowerCase());
    }

    console.log(
      `[FAQ Retrieval] Searching Room Schedules with keywords: ${keywords.join(", ")}`,
    );

    // ONLY fetch from "Room Schedules" category
    const roomSchedules = await FAQCacheService.searchFAQs(keywords, [
      "Room Schedules",
    ]);

    console.log(
      `[FAQ Retrieval] Room schedule query - Found: ${roomSchedules.length} FAQs`,
    );

    if (roomSchedules.length > 0) {
      Promise.all(
        roomSchedules.map((faq) =>
          prisma.fAQ
            .update({
              where: { id: faq.id },
              data: { viewCount: { increment: 1 } },
            })
            .catch(() => {}),
        ),
      ).catch(() => {});
    }

    return roomSchedules.map((f) => ({
      category: f.category,
      question: f.question,
      answer: f.answer,
    }));
  }

  // CASE 3: GENERAL QUERY - search all categories
  console.log(
    `[FAQ Retrieval] General query detected - searching all categories`,
  );

  const stopWords = [
    "what",
    "is",
    "are",
    "the",
    "a",
    "an",
    "how",
    "when",
    "where",
    "who",
    "why",
    "can",
    "do",
    "does",
    "i",
    "my",
    "me",
    "about",
    "tell",
    "explain",
  ];

  const keywords = lowerMsg
    .replace(/[?.,!;:'"()]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.includes(word));

  if (keywords.length === 0) {
    return [];
  }

  console.log(`[FAQ Retrieval] General query keywords: ${keywords.join(", ")}`);

  // Search all categories
  const faqs = await FAQCacheService.searchFAQs(keywords);

  console.log(`[FAQ Retrieval] General query - Found: ${faqs.length} FAQs`);

  if (faqs.length > 0) {
    Promise.all(
      faqs.map((faq) =>
        prisma.fAQ
          .update({
            where: { id: faq.id },
            data: { viewCount: { increment: 1 } },
          })
          .catch(() => {}),
      ),
    ).catch(() => {});
  }

  return faqs.map((f) => ({
    category: f.category,
    question: f.question,
    answer: f.answer,
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
  let formatted = `\n## INFORMATION FROM BULACAN STATE UNIVERSITY - COLLEGE OF SCIENCE\n\n`;

  const isPrerequisiteQuery =
    context.metadata.queryType === "curriculum" ||
    context.metadata.queryType === "general";

     if (isPrerequisiteQuery && curriculumGuide) {
       formatted += `### COMPLETE CURRICULUM GUIDE\n\n`;
       formatted += curriculumGuide;
       formatted += `\n\n`;
     }

  // Programs section
  if (context.programs.length > 0) {
    formatted += `### PROGRAMS OFFERED\n`;
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
    // Determine if this was a position-based search (e.g. "who is the Associate Dean")
    // vs a name-based search — position searches should give a direct answer.
    const isPositionQuery = context.metadata.queryType === 'faculty' &&
      context.faculty.every(f => f.position && f.position.trim().length > 0);

    formatted += `### FACULTY INFORMATION\n`;
    
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
      
      // Add teaching schedule if available
      if (f.teachingSchedule.length > 0) {
        formatted += `- Teaching Schedule:\n`;
        // Group schedules by day for better readability
        const schedulesByDay = f.teachingSchedule.reduce((acc, schedule) => {
          if (!acc[schedule.dayOfWeek]) acc[schedule.dayOfWeek] = [];
          acc[schedule.dayOfWeek].push(schedule);
          return acc;
        }, {} as Record<string, typeof f.teachingSchedule>);
        
        // Sort days of week
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        for (const day of dayOrder) {
          if (schedulesByDay[day]) {
            formatted += `  ${day}:\n`;
            for (const schedule of schedulesByDay[day]) {
              formatted += `    • ${schedule.startTime} - ${schedule.endTime}: ${schedule.subject}`;
              if (schedule.room && schedule.room !== 'TBA') {
                formatted += ` - ${schedule.room}`;
              }
              formatted += '\n';
            }
          }
        }
      }

    }
    
    // Only ask for clarification when searching by NAME and multiple people match.
    // For position-based queries, just list all people with that position directly.
    if (context.faculty.length > 1 && !isPositionQuery) {
      formatted += `\n**NOTE**: Multiple people match this name. List all of them and ask which one they meant.\n`;
    } else if (context.faculty.length > 1 && isPositionQuery) {
      formatted += `\n**NOTE**: List all faculty members with this position directly.\n`;
    }
    
    formatted += '\n';
  }

  // Curriculum section
  if (context.curriculum.length > 0) {
    formatted += `### CURRICULUM\n`;
    
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
    formatted += `### FREQUENTLY ASKED QUESTIONS\n`;
    
    // Separate schedule FAQs from other FAQs for better formatting
    const scheduleFAQs = context.faqs.filter(f => 
      f.question.toLowerCase().includes('schedule') || 
      f.answer.toLowerCase().includes('monday') ||
      f.answer.toLowerCase().includes('tuesday') ||
      f.answer.toLowerCase().includes('wednesday') ||
      f.answer.toLowerCase().includes('thursday') ||
      f.answer.toLowerCase().includes('friday') ||
      f.answer.toLowerCase().includes('saturday') ||
      f.answer.toLowerCase().includes('sunday')
    );
    
    const otherFAQs = context.faqs.filter(f => !scheduleFAQs.includes(f));
    
    // Display schedule FAQs first with special formatting
    if (scheduleFAQs.length > 0) {
      formatted += `\n**FACULTY SCHEDULES:**\n`;
      for (const f of scheduleFAQs) {
        formatted += `\nQ: ${f.question}\n`;
        formatted += `A: ${f.answer}\n`;
      }
    }
    
    // Display other FAQs
    if (otherFAQs.length > 0) {
      formatted += `\n**OTHER INFORMATION:**\n`;
      for (const f of otherFAQs) {
        formatted += `\nQ: ${f.question}\n`;
        formatted += `A: ${f.answer}\n`;
      }
    }
    
    formatted += '\n';
  }

  // If no data found
  if (context.programs.length === 0 && context.faculty.length === 0 && 
      context.curriculum.length === 0 && context.faqs.length === 0) {
    formatted += `\n**NO INFORMATION AVAILABLE FOR THIS QUERY**\n`;
    formatted += `I don't have information about this topic in my knowledge base.\n`;
    formatted += `\n**OFFICIAL RESOURCES FOR UPDATED INFORMATION:**\n`;
    formatted += `- College of Science Facebook Page: https://www.facebook.com/BulSUCSOfficial\n`;
    formatted += `- BULSU Admissions Office: https://www.facebook.com/BulSUAdmissionsOffice\n`;
    formatted += `- BULSU Official Facebook Page: https://www.facebook.com/bulsuofficial\n`;
    formatted += `- BULSU Official Website: https://www.bulsu.edu.ph/\n`;
    formatted += `\nPlease visit these official pages for the most current information and announcements.\n`;
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
      reasoning: 'No specific program match found for this career goal. Here are all available programs at BULSU College of Science.'
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