// server/src/services/quiz-generator.service.ts
/**
 * Quiz Generation Service using Hugging Face and Gemini AI
 * Generates quizzes based on course materials and curriculum data
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { openAIQuizService } from './openai-quiz.service';
import { huggingFaceQuizService } from './huggingface-quiz.service';
import { prisma } from '../lib/prisma';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface GeneratedQuiz {
  title: string;
  description: string;
  questions: QuizQuestion[];
  totalPoints: number;
  estimatedTime: number;
  courseCode?: string;
  topic?: string;
}

// Pre-loaded list of common academic topics that can be used for quiz generation
// This helps avoid "topic not found" errors and reduces database queries
const SUPPORTED_QUIZ_TOPICS: Record<string, string[]> = {
  // Biology topics
  'microbiology': ['Bacteria', 'Viruses', 'Fungi', 'Protozoa', 'Microbial genetics', 'Immunology', 'Sterilization', 'Antibiotics'],
  'biology': ['Cell biology', 'Genetics', 'Evolution', 'Ecology', 'Anatomy', 'Physiology', 'Molecular biology', 'Biochemistry'],
  'genetics': ['DNA structure', 'RNA', 'Protein synthesis', 'Mendelian genetics', 'Mutations', 'Gene expression', 'Chromosomes'],
  'ecology': ['Ecosystems', 'Food chains', 'Biodiversity', 'Conservation', 'Population dynamics', 'Biomes', 'Environmental factors'],
  
  // Chemistry topics
  'chemistry': ['Atomic structure', 'Chemical bonding', 'Stoichiometry', 'Acids and bases', 'Organic chemistry', 'Thermodynamics'],
  'organic chemistry': ['Hydrocarbons', 'Functional groups', 'Reactions', 'Isomers', 'Polymers', 'Biochemistry'],
  'biochemistry': ['Proteins', 'Enzymes', 'Carbohydrates', 'Lipids', 'Metabolism', 'DNA/RNA'],
  
  // Mathematics topics
  'calculus': ['Limits', 'Derivatives', 'Integrals', 'Differential equations', 'Series', 'Multivariable calculus'],
  'statistics': ['Probability', 'Distributions', 'Hypothesis testing', 'Regression', 'ANOVA', 'Sampling'],
  'algebra': ['Linear equations', 'Quadratic equations', 'Polynomials', 'Matrices', 'Functions', 'Inequalities'],
  'mathematics': ['Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Statistics', 'Number theory'],
  
  // Computer Science topics
  'computer science': ['Algorithms', 'Data structures', 'Programming', 'Databases', 'Networks', 'Operating systems'],
  'programming': ['Variables', 'Control structures', 'Functions', 'OOP', 'Data types', 'Debugging'],
  'data structures': ['Arrays', 'Linked lists', 'Trees', 'Graphs', 'Hash tables', 'Stacks', 'Queues'],
  'algorithms': ['Sorting', 'Searching', 'Recursion', 'Dynamic programming', 'Graph algorithms', 'Complexity'],
  
  // Physics topics
  'physics': ['Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics', 'Waves', 'Modern physics'],
  'mechanics': ['Kinematics', 'Dynamics', 'Energy', 'Momentum', 'Rotation', 'Oscillations'],
  
  // Environmental Science topics
  'environmental science': ['Climate change', 'Pollution', 'Conservation', 'Sustainability', 'Ecosystems', 'Renewable energy'],
  
  // Food Technology topics
  'food technology': ['Food processing', 'Food safety', 'Preservation', 'Quality control', 'Nutrition', 'Food chemistry', 'HACCP', 'Foodborne diseases'],
  'food safety': ['HACCP', 'Foodborne diseases', 'Food hygiene', 'Cross-contamination', 'Temperature control', 'Food storage', 'Sanitation', 'Food regulations'],
  'food processing': ['Thermal processing', 'Non-thermal methods', 'Packaging', 'Storage', 'Preservation', 'Canning', 'Pasteurization'],
  'food hygiene': ['Sanitation', 'Personal hygiene', 'Cross-contamination', 'Cleaning', 'Disinfection', 'Food handling'],
  
  // Medical Technology topics
  'medical technology': ['Clinical chemistry', 'Hematology', 'Microbiology', 'Immunology', 'Urinalysis', 'Blood banking']
};

// Function to find matching topic from user input
function findMatchingTopic(userTopic: string): { topic: string; subtopics: string[] } | null {
  const normalized = userTopic.toLowerCase().trim();
  
  // Direct match
  if (SUPPORTED_QUIZ_TOPICS[normalized]) {
    return { topic: normalized, subtopics: SUPPORTED_QUIZ_TOPICS[normalized] };
  }
  
  // Partial match
  for (const [topic, subtopics] of Object.entries(SUPPORTED_QUIZ_TOPICS)) {
    if (topic.includes(normalized) || normalized.includes(topic)) {
      return { topic, subtopics };
    }
    // Check if user input matches any subtopic
    if (subtopics.some(sub => sub.toLowerCase().includes(normalized) || normalized.includes(sub.toLowerCase()))) {
      return { topic, subtopics };
    }
  }
  
  return null;
}

export class QuizGeneratorService {
  private geminiAI: GoogleGenerativeAI | null = null;
  private geminiModel: any = null;
  private isEnabled: boolean = false;
  private lastGeminiCall: number = 0;
  private static readonly MIN_CALL_INTERVAL_MS = 2000;
  private static readonly MAX_RETRIES = 2;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (apiKey && apiKey !== 'your-gemini-api-key-here') {
      this.geminiAI = new GoogleGenerativeAI(apiKey);
      const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
      this.geminiModel = this.geminiAI.getGenerativeModel({ model: modelName });
      this.isEnabled = true;
      console.log(`✓ Quiz Generator service enabled (Gemini AI - ${modelName})`);
    } else {
      console.warn('⚠ Quiz Generator service disabled (Gemini API key not configured)');
    }
  }

  /**
   * Throttle Gemini calls to avoid rate limits on free tier
   */
  private async throttleGemini(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastGeminiCall;
    if (elapsed < QuizGeneratorService.MIN_CALL_INTERVAL_MS) {
      const waitMs = QuizGeneratorService.MIN_CALL_INTERVAL_MS - elapsed;
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
    this.lastGeminiCall = Date.now();
  }

  /**
   * Call Gemini with retry + exponential backoff for rate limit errors
   */
  private async callGeminiWithRetry(prompt: string): Promise<string> {
    for (let attempt = 0; attempt <= QuizGeneratorService.MAX_RETRIES; attempt++) {
      try {
        await this.throttleGemini();
        const result = await this.geminiModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
      } catch (error: any) {
        const isRateLimit = error?.status === 429 || 
          error?.message?.includes('429') || 
          error?.message?.toLowerCase()?.includes('rate limit') ||
          error?.message?.toLowerCase()?.includes('quota');
        
        if (isRateLimit && attempt < QuizGeneratorService.MAX_RETRIES) {
          const backoffMs = Math.pow(2, attempt + 1) * 2000;
          console.warn(`[QuizGen] Gemini rate limited (attempt ${attempt + 1}/${QuizGeneratorService.MAX_RETRIES + 1}), retrying in ${backoffMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Gemini max retries exceeded');
  }

  /**
   * Check if quiz generation is available (OpenAI, Gemini, or Hugging Face)
   */
  isAvailable(): boolean {
    return openAIQuizService.isAvailable() || 
           (this.isEnabled && this.geminiModel !== null) || 
           huggingFaceQuizService.isAvailable();
  }

  /**
   * Generate quiz based on course code and topic
   */
  async generateQuizFromCourse(
    courseCode: string,
    topic: string,
    questionCount: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed'
  ): Promise<GeneratedQuiz | null> {
    if (!this.isAvailable()) {
      console.warn('[QuizGen] Service not available');
      return null;
    }

    // PRIORITY 1: Try OpenAI first (most reliable)
    if (openAIQuizService.isAvailable()) {
      try {
        const quiz = await openAIQuizService.generateQuizFromCourse(
          courseCode,
          topic,
          questionCount,
          difficulty
        );
        if (quiz && quiz.questions.length >= questionCount) {
          console.log(`[QuizGen] Generated ${quiz.questions.length} questions using OpenAI`);
          return quiz;
        }
      } catch (error: any) {
        console.warn('[QuizGen] OpenAI failed, trying Gemini:', error.message);
      }
    }

    // PRIORITY 2: Fallback to Gemini
    if (this.isEnabled && this.geminiModel) {
      try {
        const curriculum = await prisma.curriculumEntry.findFirst({
          where: { courseCode: { contains: courseCode, mode: 'insensitive' } },
          include: { UniversityProgram: true }
        });

        if (!curriculum) {
          console.warn(`[QuizGen] Course ${courseCode} not found in database`);
          return this.generateQuizFromTopic(topic, questionCount, difficulty);
        }

        const prompt = this.buildQuizPrompt(
          curriculum.subjectName,
          topic,
          questionCount,
          difficulty,
          curriculum.courseCode
        );

        const text = await this.callGeminiWithRetry(prompt);

        const quiz = this.parseQuizResponse(text, curriculum.subjectName, topic, courseCode);
        console.log(`[QuizGen] Generated ${quiz.questions.length} questions using Gemini`);
        
        return quiz;
      } catch (error: any) {
        console.warn('[QuizGen] Gemini failed, trying Hugging Face:', error.message);
      }
    }

    // PRIORITY 3: Fallback to Hugging Face
    if (huggingFaceQuizService.isAvailable()) {
      try {
        const quiz = await huggingFaceQuizService.generateQuizFromCourse(
          courseCode,
          topic,
          questionCount,
          difficulty
        );
        if (quiz && quiz.questions.length >= questionCount) {
          console.log(`[QuizGen] Generated ${quiz.questions.length} questions using Hugging Face`);
          return quiz;
        }
      } catch (error: any) {
        console.warn('[QuizGen] Hugging Face failed:', error.message);
      }
    }

    // All AI methods failed
    return null;
  }

  /**
   * Generate quiz based on topic only (no specific course)
   */
  async generateQuizFromTopic(
    topic: string,
    questionCount: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed'
  ): Promise<GeneratedQuiz | null> {
    if (!this.isAvailable()) {
      console.warn('[QuizGen] Service not available');
      return null;
    }

    // PRIORITY 1: Try OpenAI first (most reliable)
    if (openAIQuizService.isAvailable()) {
      try {
        const quiz = await openAIQuizService.generateQuiz(topic, questionCount, difficulty);
        if (quiz && quiz.questions.length >= questionCount) {
          console.log(`[QuizGen] Generated ${quiz.questions.length} questions using OpenAI`);
          return quiz;
        }
      } catch (error: any) {
        console.warn('[QuizGen] OpenAI failed, trying Gemini:', error.message);
      }
    }

    // PRIORITY 2: Fallback to Gemini
    if (this.isEnabled && this.geminiModel) {
      try {
        const prompt = this.buildQuizPrompt(topic, topic, questionCount, difficulty);

        const text = await this.callGeminiWithRetry(prompt);

        const quiz = this.parseQuizResponse(text, topic, topic);
        console.log(`[QuizGen] Generated ${quiz.questions.length} questions using Gemini`);
        
        return quiz;
      } catch (error: any) {
        console.warn('[QuizGen] Gemini failed, trying Hugging Face:', error.message);
      }
    }

    // PRIORITY 3: Fallback to Hugging Face
    if (huggingFaceQuizService.isAvailable()) {
      try {
        const quiz = await huggingFaceQuizService.generateQuiz(topic, questionCount, difficulty);
        if (quiz && quiz.questions.length >= questionCount) {
          console.log(`[QuizGen] Generated ${quiz.questions.length} questions using Hugging Face`);
          return quiz;
        }
      } catch (error: any) {
        console.warn('[QuizGen] Hugging Face failed:', error.message);
      }
    }

    // All AI methods failed
    return null;
  }

  /**
   * Generate quiz from lesson data (optimized for minimal context)
   * This method reduces token usage by using only lesson content
   */
  async generateQuizFromLessons(
    topic: string,
    lessons: any[],
    questionCount: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed'
  ): Promise<GeneratedQuiz | null> {
    if (!this.isAvailable() || !lessons || lessons.length === 0) {
      console.warn('[QuizGen] No lessons available for quiz generation');
      return null;
    }

    // Build minimal context from lessons
    const lessonContext = lessons.map(lesson => ({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content ? lesson.content.substring(0, 500) : '' // Limit content to 500 chars
    }));

    // PRIORITY 1: Try OpenAI with minimal context
    if (openAIQuizService.isAvailable()) {
      try {
        const quiz = await this.generateQuizWithLessonContext(
          openAIQuizService,
          topic,
          lessonContext,
          questionCount,
          difficulty
        );
        if (quiz && quiz.questions.length >= questionCount) {
          console.log(`[QuizGen] Generated ${quiz.questions.length} questions from lessons using OpenAI`);
          return quiz;
        }
      } catch (error: any) {
        console.warn('[QuizGen] OpenAI failed with lessons:', error.message);
      }
    }

    // PRIORITY 2: Try Gemini with minimal context
    if (this.isEnabled && this.geminiModel) {
      try {
        const prompt = this.buildLessonBasedPrompt(topic, lessonContext, questionCount, difficulty);
        const text = await this.callGeminiWithRetry(prompt);

        const quiz = this.parseQuizResponse(text, topic, topic);
        if (quiz && quiz.questions.length >= questionCount) {
          console.log(`[QuizGen] Generated ${quiz.questions.length} questions from lessons using Gemini`);
          return quiz;
        }
      } catch (error: any) {
        console.warn('[QuizGen] Gemini failed with lessons:', error.message);
      }
    }

    // PRIORITY 3: Try Hugging Face with minimal context
    if (huggingFaceQuizService.isAvailable()) {
      try {
        const quiz = await this.generateQuizWithLessonContext(
          huggingFaceQuizService,
          topic,
          lessonContext,
          questionCount,
          difficulty
        );
        if (quiz && quiz.questions.length >= questionCount) {
          console.log(`[QuizGen] Generated ${quiz.questions.length} questions from lessons using Hugging Face`);
          return quiz;
        }
      } catch (error: any) {
        console.warn('[QuizGen] Hugging Face failed with lessons:', error.message);
      }
    }

    return null;
  }

  /**
   * Build optimized prompt from lesson context
   */
  private buildLessonBasedPrompt(
    topic: string,
    lessonContext: any[],
    questionCount: number,
    difficulty: string
  ): string {
    const lessonsText = lessonContext.map((lesson) => {
      const cleanTitle = lesson.title
        .replace(/^lesson\s*\d+(\.\d+)?\s*[:.-]\s*/i, '')
        .trim();
      const desc = lesson.description ? `\nDescription: ${lesson.description}` : '';
      const content = lesson.content ? `\nContent: ${lesson.content}` : '';
      return `Topic: ${cleanTitle}${desc}${content}`;
    }).join('\n\n');

    return `You are an expert university professor creating a real practice exam for students studying ${topic}.

Here is the course material to base questions on:

${lessonsText}

CRITICAL RULES:
- Generate ${questionCount} multiple-choice questions that test ACTUAL KNOWLEDGE of ${topic}
- Questions must ask about real scientific facts, concepts, definitions, processes, and applications
- NEVER ask meta-questions like "What is the key concept of this lesson?" or "What is the focus of studying X?"
- NEVER reference lesson numbers, lesson titles, or course structure in questions
- Each question must have 4 plausible options where only 1 is correct
- Wrong options must be realistic distractors, not obviously wrong (e.g. never use "Skip the basics" or "Ignore applications" as options)
- Difficulty: ${difficulty === 'mixed' ? '40% easy, 40% medium, 20% hard' : `100% ${difficulty}`}
- Shuffle which option (A/B/C/D) is correct — do NOT always make A the correct answer

EXAMPLES of GOOD questions:
- "What is the primary function of mitochondria in a cell?" (Biology)
- "What is the derivative of sin(x)?" (Calculus)
- "Which data structure uses FIFO ordering?" (Computer Science)

EXAMPLES of BAD questions (NEVER generate these):
- "Based on the lesson 'Prokaryotic Cells', which of the following is a key concept?"
- "What is the primary focus of studying General Biology?"
- "Which lesson covers cell division?"

Format each question EXACTLY as follows:
Q1: [Question text]
A) [Option 1]
B) [Option 2]
C) [Option 3]
D) [Option 4]
CORRECT: [A/B/C/D]
EXPLANATION: [Brief explanation]
DIFFICULTY: [easy/medium/hard]

Generate ${questionCount} real practice test questions now:`;
  }

  /**
   * Generate quiz using AI service with lesson context
   */
  private async generateQuizWithLessonContext(
    aiService: any,
    topic: string,
    lessonContext: any[],
    questionCount: number,
    difficulty: string
  ): Promise<GeneratedQuiz | null> {
    const lessonsText = lessonContext.map((lesson) => {
      const cleanTitle = lesson.title
        .replace(/^lesson\s*\d+(\.\d+)?\s*[:.-]\s*/i, '')
        .trim();
      return `- ${cleanTitle}: ${lesson.description || ''}`;
    }).join('\n');

    const enhancedTopic = `${topic}. Create real practice test questions about actual ${topic} concepts. Key topics to cover:\n${lessonsText}\n\nIMPORTANT: Ask about real facts, definitions, and processes. NEVER ask meta-questions about lessons or course structure. Shuffle correct answers across A/B/C/D.`;
    return await aiService.generateQuiz(enhancedTopic, questionCount, difficulty);
  }

  /**
   * Generate quiz from database curriculum data (NO AI REQUIRED)
   * Creates questions based on learning materials and course content
   */
  async generateQuizFromDatabaseCurriculum(
    topic: string,
    yearLevel?: number,
    questionCount: number = 10
  ): Promise<GeneratedQuiz | null> {
    try {
      // Search curriculum entries by subject name (more flexible)
      const curriculum = await prisma.curriculumEntry.findMany({
        where: {
          subjectName: { contains: topic, mode: 'insensitive' }
        },
        include: {
          UniversityProgram: true
        },
        orderBy: [{ yearLevel: 'asc' }, { semester: 'asc' }],
        take: 20
      });

      // If no direct match, try broader search across all curriculum
      if (curriculum.length === 0) {
        const allCurriculum = await prisma.curriculumEntry.findMany({
          include: {
            UniversityProgram: true
          },
          orderBy: [{ yearLevel: 'asc' }, { semester: 'asc' }],
          take: 20
        });
        
        if (allCurriculum.length === 0) {
          console.warn(`[QuizGen] No curriculum found for topic: ${topic}`);
          return null;
        }
        
        curriculum.push(...allCurriculum);
      }

      // Try to find courses with learning materials
      const courses = await prisma.course.findMany({
        where: {
          title: { contains: topic, mode: 'insensitive' }
        },
        include: {
          Lesson: {
            where: { isPublished: true },
            take: 10
          },
          modules: {
            include: {
              lessons: {
                where: { isPublished: true },
                take: 5
              }
            },
            take: 5
          }
        },
        take: 5
      });

      // Generate questions based on the user's requested topic
      const questions: QuizQuestion[] = [];
      const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
      const usedQuestions = new Set<string>(); // Track used questions to avoid duplicates

      // PRIORITY 1: Generate topic-specific questions first (most relevant to user's request)
      // This ensures quizzes match the user's requested topic, not random lesson content
      for (let i = 0; i < questionCount; i++) {
        const difficulty = difficulties[i % 3];
        const question = this.createTopicBasedQuestion(topic, difficulty, usedQuestions);
        if (question) {
          usedQuestions.add(question.question);
          questions.push(question);
        }
      }

      // PRIORITY 2: If we don't have enough topic-specific questions, try learning materials
      if (questions.length < questionCount) {
        for (const course of courses) {
          const lessons = course.Lesson.length > 0 
            ? course.Lesson 
            : course.modules.flatMap((m: any) => m.lessons);
          
          for (const lesson of lessons) {
            if (questions.length >= questionCount) break;
            const difficulty = difficulties[questions.length % 3];
            const question = this.createQuestionFromLearningMaterial(lesson, difficulty);
            if (!usedQuestions.has(question.question)) {
              usedQuestions.add(question.question);
              questions.push(question);
            }
          }
          if (questions.length >= questionCount) break;
        }
      }

      // PRIORITY 3: Fallback to curriculum-based questions if still not enough
      if (questions.length < questionCount) {
        for (let i = questions.length; i < questionCount; i++) {
          const difficulty = difficulties[i % 3];
          // Use the user's requested topic directly, not curriculum subjects
          const question = this.createTopicBasedQuestion(topic, difficulty, usedQuestions);
          if (question) {
            usedQuestions.add(question.question);
            questions.push(question);
          }
        }
      }

      const programAbbr = curriculum[0]?.UniversityProgram?.abbreviation;
      
      // Use topic name for quiz title (more relevant to user's request)
      const capitalizedTopic = topic.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      return {
        title: `${capitalizedTopic} Quiz`,
        description: `Test your knowledge of ${topic}`,
        questions,
        totalPoints: questions.length * 10,
        estimatedTime: questions.length * 2,
        courseCode: programAbbr || undefined,
        topic: topic
      };
    } catch (error: any) {
      console.error('[QuizGen] Error generating quiz from database:', error.message);
      return null;
    }
  }

  /**
   * Create educational question from learning material content
   * Generates real subject-matter questions based on lesson topic
   */
  private createQuestionFromLearningMaterial(
    lesson: any,
    difficulty: 'easy' | 'medium' | 'hard'
  ): QuizQuestion {
    const title = (lesson.title || '').toLowerCase();
    const content = (lesson.content || '').toLowerCase();
    const combined = `${title} ${content}`;

    // Biology-related lessons
    if (combined.includes('prokaryot') || combined.includes('cell') || combined.includes('bacteria')) {
      const questions = [
        { question: 'Which of the following is a characteristic of prokaryotic cells?', options: ['They lack a membrane-bound nucleus', 'They have a nuclear envelope', 'They contain mitochondria', 'They are always multicellular'], correctAnswer: 0, explanation: 'Prokaryotic cells are defined by the absence of a membrane-bound nucleus. Their DNA is located in a nucleoid region.' },
        { question: 'What structure do bacteria use for movement?', options: ['Cilia', 'Flagella', 'Pseudopodia', 'Pili'], correctAnswer: 1, explanation: 'Bacteria primarily use flagella for locomotion. Pili are used for attachment and DNA transfer, not movement.' },
        { question: 'Which organelle is responsible for protein synthesis in cells?', options: ['Golgi apparatus', 'Mitochondria', 'Ribosomes', 'Lysosomes'], correctAnswer: 2, explanation: 'Ribosomes are the cellular structures responsible for translating mRNA into proteins.' },
        { question: 'What is the cell wall of most bacteria primarily composed of?', options: ['Cellulose', 'Chitin', 'Peptidoglycan', 'Phospholipids'], correctAnswer: 2, explanation: 'Bacterial cell walls are primarily composed of peptidoglycan, a polymer of sugars and amino acids.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }

    if (combined.includes('eukaryot') || combined.includes('organelle') || combined.includes('nucleus')) {
      const questions = [
        { question: 'Which organelle is known as the "powerhouse of the cell"?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Endoplasmic reticulum'], correctAnswer: 2, explanation: 'Mitochondria generate most of the cell\'s ATP through cellular respiration, earning the nickname "powerhouse of the cell".' },
        { question: 'What is the function of the Golgi apparatus?', options: ['DNA replication', 'Modifying and packaging proteins', 'Photosynthesis', 'Cell division'], correctAnswer: 1, explanation: 'The Golgi apparatus modifies, sorts, and packages proteins and lipids for transport to their destinations.' },
        { question: 'Which structure controls what enters and exits the cell?', options: ['Cell wall', 'Cytoplasm', 'Plasma membrane', 'Nucleus'], correctAnswer: 2, explanation: 'The plasma membrane is selectively permeable, controlling the movement of substances in and out of the cell.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }

    if (combined.includes('dna') || combined.includes('genetic') || combined.includes('heredit') || combined.includes('gene')) {
      const questions = [
        { question: 'What are the four nitrogenous bases found in DNA?', options: ['Adenine, Guanine, Cytosine, Thymine', 'Adenine, Guanine, Cytosine, Uracil', 'Alanine, Glycine, Cysteine, Tyrosine', 'Adenine, Glucose, Cellulose, Thiamine'], correctAnswer: 0, explanation: 'DNA contains four nitrogenous bases: Adenine (A), Guanine (G), Cytosine (C), and Thymine (T). RNA replaces Thymine with Uracil.' },
        { question: 'What is the shape of the DNA molecule?', options: ['Single helix', 'Double helix', 'Triple helix', 'Linear chain'], correctAnswer: 1, explanation: 'DNA has a double helix structure, first described by Watson and Crick in 1953.' },
        { question: 'During DNA replication, which enzyme unwinds the double helix?', options: ['DNA polymerase', 'RNA polymerase', 'Helicase', 'Ligase'], correctAnswer: 2, explanation: 'Helicase unwinds and separates the two strands of the DNA double helix during replication.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }

    if (combined.includes('photosynthe') || combined.includes('chloro') || combined.includes('plant')) {
      const questions = [
        { question: 'Where does the light-dependent reaction of photosynthesis occur?', options: ['Stroma', 'Thylakoid membranes', 'Cytoplasm', 'Mitochondria'], correctAnswer: 1, explanation: 'Light-dependent reactions occur in the thylakoid membranes of chloroplasts, where light energy is captured by chlorophyll.' },
        { question: 'What is the primary pigment involved in photosynthesis?', options: ['Carotenoid', 'Xanthophyll', 'Chlorophyll', 'Anthocyanin'], correctAnswer: 2, explanation: 'Chlorophyll is the primary pigment that absorbs light energy for photosynthesis, giving plants their green color.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }

    if (combined.includes('evolution') || combined.includes('natural selection') || combined.includes('darwin') || combined.includes('species')) {
      const questions = [
        { question: 'What is natural selection?', options: ['Random genetic mutations', 'Survival and reproduction of organisms best adapted to their environment', 'Artificial breeding by humans', 'Migration of species to new habitats'], correctAnswer: 1, explanation: 'Natural selection is the process where organisms with favorable traits are more likely to survive and reproduce in their environment.' },
        { question: 'Who is credited with the theory of evolution by natural selection?', options: ['Gregor Mendel', 'Louis Pasteur', 'Charles Darwin', 'Carl Linnaeus'], correctAnswer: 2, explanation: 'Charles Darwin proposed the theory of evolution by natural selection in his 1859 book "On the Origin of Species".' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }

    if (combined.includes('ecology') || combined.includes('ecosystem') || combined.includes('biome') || combined.includes('habitat')) {
      const questions = [
        { question: 'What is the role of decomposers in an ecosystem?', options: ['Produce food through photosynthesis', 'Hunt and consume other organisms', 'Break down dead organic matter and recycle nutrients', 'Regulate the water cycle'], correctAnswer: 2, explanation: 'Decomposers break down dead organisms and waste products, recycling nutrients back into the ecosystem.' },
        { question: 'Which level of ecological organization includes all living and non-living components in an area?', options: ['Population', 'Community', 'Ecosystem', 'Organism'], correctAnswer: 2, explanation: 'An ecosystem includes all living organisms (biotic) and non-living components (abiotic) interacting in a given area.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }

    // Generic biology fallback — still real questions, not meta-questions
    const genericBioQuestions = [
      { question: 'What is the basic unit of life?', options: ['Atom', 'Molecule', 'Cell', 'Organ'], correctAnswer: 2, explanation: 'The cell is the smallest structural and functional unit of all living organisms.' },
      { question: 'Which macromolecule stores genetic information?', options: ['Proteins', 'Lipids', 'Carbohydrates', 'Nucleic acids'], correctAnswer: 3, explanation: 'Nucleic acids (DNA and RNA) store and transmit genetic information in living organisms.' },
      { question: 'What process do cells use to divide and produce two identical daughter cells?', options: ['Meiosis', 'Mitosis', 'Binary fission', 'Budding'], correctAnswer: 1, explanation: 'Mitosis is the process of cell division that produces two genetically identical daughter cells from a single parent cell.' },
      { question: 'Which type of bond holds the two strands of DNA together?', options: ['Covalent bonds', 'Ionic bonds', 'Hydrogen bonds', 'Metallic bonds'], correctAnswer: 2, explanation: 'Hydrogen bonds between complementary base pairs (A-T and G-C) hold the two strands of DNA together.' },
      { question: 'What is homeostasis?', options: ['The study of body structure', 'The maintenance of a stable internal environment', 'The process of cell death', 'The formation of new species'], correctAnswer: 1, explanation: 'Homeostasis is the ability of an organism to maintain a stable internal environment despite changes in external conditions.' },
      { question: 'Which molecule is the primary energy currency of cells?', options: ['DNA', 'RNA', 'ATP', 'Glucose'], correctAnswer: 2, explanation: 'ATP (adenosine triphosphate) is the primary energy currency used by cells to power biological processes.' },
    ];
    return { ...genericBioQuestions[Math.floor(Math.random() * genericBioQuestions.length)], difficulty };
  }

  /**
   * Create educational question based on subject name
   * Uses subject-specific knowledge templates
   */
  private createEducationalQuestion(
    subject: any,
    difficulty: 'easy' | 'medium' | 'hard'
  ): QuizQuestion {
    const subjectName = subject.subjectName.toLowerCase();
    
    // Calculus questions
    if (subjectName.includes('calculus')) {
      const questions = [
        { question: 'What is the derivative of x²?', options: ['x', '2x', '2x²', 'x³'], correctAnswer: 1, explanation: 'The power rule states that d/dx(xⁿ) = n·xⁿ⁻¹. For x², the derivative is 2x.' },
        { question: 'What does the definite integral of a function represent geometrically?', options: ['The slope of the tangent line', 'The maximum value of the function', 'The area under the curve between two points', 'The rate of change'], correctAnswer: 2, explanation: 'A definite integral calculates the signed area between the function and the x-axis over an interval.' },
        { question: 'What is the limit of sin(x)/x as x approaches 0?', options: ['0', '∞', 'undefined', '1'], correctAnswer: 3, explanation: 'This is a fundamental limit in calculus. Using L\'Hôpital\'s rule or the squeeze theorem, lim(x→0) sin(x)/x = 1.' },
        { question: 'Which rule is used to differentiate a product of two functions?', options: ['Chain rule', 'Quotient rule', 'Product rule', 'Power rule'], correctAnswer: 2, explanation: 'The product rule states: d/dx[f(x)·g(x)] = f\'(x)·g(x) + f(x)·g\'(x).' },
        { question: 'What is the integral of 1/x dx?', options: ['x²/2 + C', '1/x² + C', 'ln|x| + C', '-1/x² + C'], correctAnswer: 2, explanation: 'The integral of 1/x is the natural logarithm of the absolute value of x, plus a constant.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }
    
    // Programming/Computer Science questions
    if (subjectName.includes('programming') || subjectName.includes('computer')) {
      const questions = [
        { question: 'Which data structure operates on a Last-In-First-Out (LIFO) principle?', options: ['Queue', 'Array', 'Linked List', 'Stack'], correctAnswer: 3, explanation: 'A stack follows LIFO ordering — the last element added is the first one removed.' },
        { question: 'What does OOP stand for?', options: ['Online Operating Platform', 'Object-Oriented Programming', 'Optimal Output Process', 'Organized Operation Protocol'], correctAnswer: 1, explanation: 'OOP stands for Object-Oriented Programming, a paradigm based on objects containing data and methods.' },
        { question: 'What is the time complexity of binary search on a sorted array?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correctAnswer: 2, explanation: 'Binary search halves the search space each step, giving O(log n) time complexity.' },
        { question: 'In programming, what is a "variable"?', options: ['A fixed constant', 'A named storage location for data', 'A type of loop', 'A function definition'], correctAnswer: 1, explanation: 'A variable is a named storage location that holds a value which can be changed during execution.' },
        { question: 'Which sorting algorithm has the best average-case time complexity?', options: ['Bubble Sort — O(n²)', 'Selection Sort — O(n²)', 'Merge Sort — O(n log n)', 'Insertion Sort — O(n²)'], correctAnswer: 2, explanation: 'Merge Sort has O(n log n) average and worst-case complexity, making it more efficient than quadratic algorithms.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }
    
    // Biology questions
    if (subjectName.includes('biology')) {
      const questions = [
        { question: 'What is the basic unit of life?', options: ['Atom', 'Molecule', 'Cell', 'Organ'], correctAnswer: 2, explanation: 'The cell is the smallest structural and functional unit of all living organisms.' },
        { question: 'Which process converts glucose into ATP in the presence of oxygen?', options: ['Photosynthesis', 'Fermentation', 'Cellular respiration', 'Chemosynthesis'], correctAnswer: 2, explanation: 'Cellular respiration is the metabolic process that converts glucose and oxygen into ATP, CO₂, and water.' },
        { question: 'What molecule carries amino acids to the ribosome during translation?', options: ['mRNA', 'rRNA', 'tRNA', 'DNA'], correctAnswer: 2, explanation: 'Transfer RNA (tRNA) carries specific amino acids to the ribosome, matching them to the mRNA codons during protein synthesis.' },
        { question: 'Which kingdom includes organisms that are prokaryotic and unicellular?', options: ['Plantae', 'Fungi', 'Animalia', 'Monera (Bacteria)'], correctAnswer: 3, explanation: 'Monera (now split into Bacteria and Archaea) includes all prokaryotic, unicellular organisms.' },
        { question: 'What is the function of the cell membrane?', options: ['Store genetic information', 'Produce energy', 'Regulate what enters and exits the cell', 'Synthesize proteins'], correctAnswer: 2, explanation: 'The cell membrane is selectively permeable, controlling the movement of substances in and out of the cell.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }
    
    // Physics questions
    if (subjectName.includes('physics')) {
      const questions = [
        { question: 'According to Newton\'s Second Law, what equals mass times acceleration?', options: ['Energy', 'Force', 'Power', 'Momentum'], correctAnswer: 1, explanation: 'Newton\'s Second Law states F = ma, where Force equals mass times acceleration.' },
        { question: 'What is the SI unit of electric current?', options: ['Volt', 'Ohm', 'Watt', 'Ampere'], correctAnswer: 3, explanation: 'The ampere (A) is the SI unit of electric current, measuring the flow of electric charge.' },
        { question: 'What is the speed of light in a vacuum (approximately)?', options: ['150,000 km/s', '300,000 km/s', '500,000 km/s', '100,000 km/s'], correctAnswer: 1, explanation: 'The speed of light in vacuum is approximately 299,792 km/s, commonly rounded to 300,000 km/s.' },
        { question: 'Which law states that energy cannot be created or destroyed?', options: ['Newton\'s First Law', 'Law of Conservation of Energy', 'Ohm\'s Law', 'Hooke\'s Law'], correctAnswer: 1, explanation: 'The Law of Conservation of Energy states energy can only be transformed from one form to another, not created or destroyed.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }
    
    // Chemistry questions
    if (subjectName.includes('chemistry')) {
      const questions = [
        { question: 'What is the atomic number of an element determined by?', options: ['Number of neutrons', 'Number of electrons', 'Number of protons', 'Atomic mass'], correctAnswer: 2, explanation: 'The atomic number equals the number of protons in the nucleus, which uniquely identifies each element.' },
        { question: 'What type of bond involves the sharing of electron pairs between atoms?', options: ['Ionic bond', 'Covalent bond', 'Metallic bond', 'Hydrogen bond'], correctAnswer: 1, explanation: 'A covalent bond forms when two atoms share one or more pairs of electrons.' },
        { question: 'What is Avogadro\'s number approximately equal to?', options: ['3.14 × 10²³', '6.022 × 10²³', '1.602 × 10⁻¹⁹', '9.81 × 10¹'], correctAnswer: 1, explanation: 'Avogadro\'s number (6.022 × 10²³) represents the number of particles in one mole of a substance.' },
        { question: 'Which of the following is an example of a chemical change?', options: ['Melting ice', 'Dissolving sugar in water', 'Rusting of iron', 'Boiling water'], correctAnswer: 2, explanation: 'Rusting involves a chemical reaction (iron + oxygen → iron oxide), forming a new substance with different properties.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }
    
    // Mathematics questions (general)
    if (subjectName.includes('math') || subjectName.includes('algebra') || subjectName.includes('geometry')) {
      const questions = [
        { question: 'In a right triangle, what does the Pythagorean theorem state?', options: ['a + b = c', 'a × b = c²', 'a² + b² = c²', 'a² - b² = c²'], correctAnswer: 2, explanation: 'The Pythagorean theorem states that the square of the hypotenuse equals the sum of the squares of the other two sides.' },
        { question: 'What is the value of the square root of 144?', options: ['10', '11', '12', '14'], correctAnswer: 2, explanation: '√144 = 12, because 12 × 12 = 144.' },
        { question: 'What is the slope of a horizontal line?', options: ['1', 'Undefined', '0', '-1'], correctAnswer: 2, explanation: 'A horizontal line has no vertical change (rise = 0), so its slope is 0.' },
        { question: 'If f(x) = 3x + 5, what is f(2)?', options: ['8', '10', '11', '6'], correctAnswer: 2, explanation: 'f(2) = 3(2) + 5 = 6 + 5 = 11.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }
    
    // Microbiology questions
    if (subjectName.includes('microbiology') || subjectName.includes('micro')) {
      const questions = [
        { question: 'Which type of microorganism is responsible for causing malaria?', options: ['Bacteria', 'Virus', 'Protozoan (Plasmodium)', 'Fungus'], correctAnswer: 2, explanation: 'Malaria is caused by Plasmodium species, which are protozoan parasites transmitted by Anopheles mosquitoes.' },
        { question: 'What is the Gram stain used for in microbiology?', options: ['Measuring bacterial growth rate', 'Classifying bacteria by cell wall structure', 'Identifying viruses', 'Testing antibiotic resistance'], correctAnswer: 1, explanation: 'Gram staining differentiates bacteria into Gram-positive and Gram-negative based on cell wall composition.' },
        { question: 'Which structure allows bacteria to survive harsh environmental conditions?', options: ['Flagellum', 'Pilus', 'Endospore', 'Capsule'], correctAnswer: 2, explanation: 'Endospores are highly resistant dormant structures that allow bacteria to survive extreme conditions like heat and desiccation.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }

    // Statistics questions
    if (subjectName.includes('statistic') || subjectName.includes('probability')) {
      const questions = [
        { question: 'What measure of central tendency is most affected by outliers?', options: ['Mode', 'Median', 'Mean', 'Range'], correctAnswer: 2, explanation: 'The mean (average) is most affected by extreme values because it uses every data point in its calculation.' },
        { question: 'What is the probability of getting heads when flipping a fair coin?', options: ['0.25', '0.75', '1.0', '0.5'], correctAnswer: 3, explanation: 'A fair coin has two equally likely outcomes, so P(heads) = 1/2 = 0.5.' },
        { question: 'What does a standard deviation measure?', options: ['The center of a dataset', 'The spread or dispersion of data from the mean', 'The most frequent value', 'The range of the data'], correctAnswer: 1, explanation: 'Standard deviation quantifies how spread out data values are from the mean of the dataset.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }
    
    // Food Safety questions
    if (subjectName.includes('food safety') || subjectName.includes('food hygiene') || subjectName.includes('haccp')) {
      const questions = [
        { question: 'What does HACCP stand for?', options: ['Hazard Analysis and Critical Control Points', 'Health and Cleanliness Control Program', 'Hygiene Assessment and Contamination Control Plan', 'Hazardous Agent Control and Cleaning Protocol'], correctAnswer: 0, explanation: 'HACCP stands for Hazard Analysis and Critical Control Points, a systematic approach to food safety.' },
        { question: 'What is the temperature danger zone for food?', options: ['0°C to 10°C', '5°C to 60°C', '10°C to 40°C', '20°C to 80°C'], correctAnswer: 1, explanation: 'The temperature danger zone is 5°C to 60°C (41°F to 140°F), where bacteria grow most rapidly.' },
        { question: 'Which of the following is a biological hazard in food?', options: ['Glass fragments', 'Pesticide residues', 'Salmonella bacteria', 'Metal shavings'], correctAnswer: 2, explanation: 'Salmonella is a biological hazard. Glass and metal are physical hazards, pesticides are chemical hazards.' },
        { question: 'What is cross-contamination?', options: ['Cooking food at wrong temperature', 'Transfer of harmful substances from one food to another', 'Using expired ingredients', 'Improper food storage'], correctAnswer: 1, explanation: 'Cross-contamination is the transfer of harmful bacteria or substances from one food, surface, or person to another.' },
        { question: 'What is the minimum internal temperature for cooking poultry?', options: ['63°C (145°F)', '68°C (155°F)', '74°C (165°F)', '82°C (180°F)'], correctAnswer: 2, explanation: 'Poultry must be cooked to a minimum internal temperature of 74°C (165°F) to kill harmful bacteria.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }
    
    // Food Technology questions
    if (subjectName.includes('food') || subjectName.includes('nutrition')) {
      const questions = [
        { question: 'What is pasteurization?', options: ['Freezing food to preserve it', 'Heating food to kill pathogens', 'Adding preservatives to food', 'Drying food to remove moisture'], correctAnswer: 1, explanation: 'Pasteurization is a heat treatment process that kills harmful microorganisms in food and beverages.' },
        { question: 'What is the purpose of food preservation?', options: ['To change food color', 'To extend shelf life and prevent spoilage', 'To increase food weight', 'To add artificial flavors'], correctAnswer: 1, explanation: 'Food preservation extends shelf life by preventing microbial growth and chemical changes.' },
        { question: 'Which method of food preservation uses low temperatures?', options: ['Canning', 'Smoking', 'Refrigeration', 'Irradiation'], correctAnswer: 2, explanation: 'Refrigeration uses low temperatures to slow down microbial growth and enzymatic reactions.' },
        { question: 'What is the main purpose of food packaging?', options: ['To make food look attractive only', 'To protect food from contamination and extend shelf life', 'To increase food cost', 'To hide food defects'], correctAnswer: 1, explanation: 'Food packaging protects against contamination, physical damage, and helps extend shelf life.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }
    
    // Ecology questions
    if (subjectName.includes('ecology') || subjectName.includes('ecosystem')) {
      const questions = [
        { question: 'What is an ecosystem?', options: ['A single organism', 'A community of organisms and their physical environment', 'Only the plants in an area', 'A type of biome'], correctAnswer: 1, explanation: 'An ecosystem includes all living organisms in an area and their interactions with the physical environment.' },
        { question: 'What is the role of decomposers in an ecosystem?', options: ['Produce food through photosynthesis', 'Hunt and eat other organisms', 'Break down dead organic matter', 'Provide shelter for animals'], correctAnswer: 2, explanation: 'Decomposers break down dead organisms and waste, recycling nutrients back into the ecosystem.' },
        { question: 'What is biodiversity?', options: ['The number of plants only', 'The variety of life in an ecosystem', 'The size of an ecosystem', 'The climate of an area'], correctAnswer: 1, explanation: 'Biodiversity refers to the variety of all living species, including plants, animals, and microorganisms.' },
        { question: 'What is a food chain?', options: ['A grocery store network', 'A linear sequence of organisms where each is eaten by the next', 'A type of restaurant', 'A food processing method'], correctAnswer: 1, explanation: 'A food chain shows the linear transfer of energy from producers to consumers in an ecosystem.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }
    
    // Environmental Science questions
    if (subjectName.includes('environment') || subjectName.includes('pollution') || subjectName.includes('climate')) {
      const questions = [
        { question: 'What is the greenhouse effect?', options: ['Growing plants in greenhouses', 'Trapping of heat in the atmosphere by greenhouse gases', 'A type of pollution', 'Cooling of the Earth'], correctAnswer: 1, explanation: 'The greenhouse effect is the trapping of heat by gases like CO2 and methane in Earth\'s atmosphere.' },
        { question: 'Which gas is the primary contributor to global warming?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Helium'], correctAnswer: 2, explanation: 'Carbon dioxide (CO2) is the main greenhouse gas contributing to global warming from human activities.' },
        { question: 'What is sustainable development?', options: ['Rapid industrialization', 'Development that meets present needs without compromising future generations', 'Stopping all development', 'Only economic growth'], correctAnswer: 1, explanation: 'Sustainable development balances economic, social, and environmental needs for present and future generations.' },
        { question: 'What is the ozone layer?', options: ['A layer of oxygen in the ocean', 'A protective layer in the stratosphere that absorbs UV radiation', 'A type of pollution', 'A layer of clouds'], correctAnswer: 1, explanation: 'The ozone layer in the stratosphere absorbs harmful ultraviolet radiation from the sun.' },
      ];
      return { ...questions[Math.floor(Math.random() * questions.length)], difficulty };
    }
    
    // Default: generate a real general science question instead of a meta-question
    const generalQuestions = [
      { question: 'What is the scientific method?', options: ['A way to memorize facts', 'A systematic approach to inquiry involving observation, hypothesis, experimentation, and conclusion', 'A type of laboratory equipment', 'A mathematical formula'], correctAnswer: 1, explanation: 'The scientific method is a systematic process of observation, hypothesis formation, experimentation, and analysis used to understand natural phenomena.' },
      { question: 'What is the difference between a hypothesis and a theory?', options: ['They are the same thing', 'A hypothesis is tested; a theory is a well-supported explanation backed by extensive evidence', 'A theory is a guess; a hypothesis is proven', 'Theories are only used in physics'], correctAnswer: 1, explanation: 'A hypothesis is a testable prediction, while a scientific theory is a well-substantiated explanation supported by a large body of evidence.' },
      { question: 'What is the SI unit of temperature?', options: ['Fahrenheit', 'Celsius', 'Kelvin', 'Rankine'], correctAnswer: 2, explanation: 'The Kelvin (K) is the SI base unit of temperature. 0 K represents absolute zero.' },
      { question: 'What does pH measure?', options: ['Temperature of a solution', 'Concentration of hydrogen ions (acidity/basicity)', 'Density of a liquid', 'Electrical conductivity'], correctAnswer: 1, explanation: 'pH measures the hydrogen ion concentration in a solution, indicating how acidic or basic it is on a scale of 0-14.' },
      { question: 'Which state of matter has a definite volume but no definite shape?', options: ['Solid', 'Liquid', 'Gas', 'Plasma'], correctAnswer: 1, explanation: 'Liquids have a definite volume but take the shape of their container, unlike solids (definite shape) or gases (no definite volume).' },
    ];
    return { ...generalQuestions[Math.floor(Math.random() * generalQuestions.length)], difficulty };
  }

  /**
   * Create topic-based question using the user's requested topic directly
   * Prevents duplicate questions by tracking used questions
   */
  private createTopicBasedQuestion(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    usedQuestions: Set<string>
  ): QuizQuestion | null {
    const normalizedTopic = topic.toLowerCase();
    
    // Computer Science / Programming questions
    const csQuestions = [
      { question: 'Which data structure operates on a Last-In-First-Out (LIFO) principle?', options: ['Queue', 'Array', 'Linked List', 'Stack'], correctAnswer: 3, explanation: 'A stack follows LIFO ordering — the last element added is the first one removed.' },
      { question: 'What does OOP stand for?', options: ['Online Operating Platform', 'Object-Oriented Programming', 'Optimal Output Process', 'Organized Operation Protocol'], correctAnswer: 1, explanation: 'OOP stands for Object-Oriented Programming, a paradigm based on objects containing data and methods.' },
      { question: 'What is the time complexity of binary search on a sorted array?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correctAnswer: 2, explanation: 'Binary search halves the search space each step, giving O(log n) time complexity.' },
      { question: 'In programming, what is a "variable"?', options: ['A fixed constant', 'A named storage location for data', 'A type of loop', 'A function definition'], correctAnswer: 1, explanation: 'A variable is a named storage location that holds a value which can be changed during execution.' },
      { question: 'Which sorting algorithm has the best average-case time complexity?', options: ['Bubble Sort — O(n²)', 'Selection Sort — O(n²)', 'Merge Sort — O(n log n)', 'Insertion Sort — O(n²)'], correctAnswer: 2, explanation: 'Merge Sort has O(n log n) average and worst-case complexity, making it more efficient than quadratic algorithms.' },
      { question: 'What is a "function" in programming?', options: ['A type of variable', 'A reusable block of code that performs a specific task', 'A database query', 'A hardware component'], correctAnswer: 1, explanation: 'A function is a reusable block of code designed to perform a particular task, promoting code reusability.' },
      { question: 'What does SQL stand for?', options: ['Structured Query Language', 'Simple Question Logic', 'System Quality Level', 'Sequential Query List'], correctAnswer: 0, explanation: 'SQL stands for Structured Query Language, used for managing and querying relational databases.' },
      { question: 'What is recursion in programming?', options: ['A loop that runs forever', 'A function that calls itself', 'A type of variable', 'A sorting algorithm'], correctAnswer: 1, explanation: 'Recursion is when a function calls itself to solve smaller instances of the same problem.' },
      { question: 'What is the purpose of an "if" statement?', options: ['To repeat code', 'To make decisions based on conditions', 'To define variables', 'To import libraries'], correctAnswer: 1, explanation: 'An if statement allows conditional execution of code based on whether a condition is true or false.' },
      { question: 'What is an algorithm?', options: ['A programming language', 'A step-by-step procedure to solve a problem', 'A type of computer', 'A database'], correctAnswer: 1, explanation: 'An algorithm is a finite sequence of well-defined instructions to solve a class of problems.' },
      { question: 'What does API stand for?', options: ['Application Programming Interface', 'Automated Program Integration', 'Advanced Protocol Internet', 'Application Process Identifier'], correctAnswer: 0, explanation: 'API stands for Application Programming Interface, which allows different software systems to communicate.' },
      { question: 'What is the difference between "==" and "===" in JavaScript?', options: ['No difference', '"==" checks value only, "===" checks value and type', '"===" is faster', '"==" is deprecated'], correctAnswer: 1, explanation: '"==" performs type coercion before comparison, while "===" checks both value and type without coercion.' },
    ];

    // Biology questions
    const biologyQuestions = [
      { question: 'What is the basic unit of life?', options: ['Atom', 'Molecule', 'Cell', 'Organ'], correctAnswer: 2, explanation: 'The cell is the smallest structural and functional unit of all living organisms.' },
      { question: 'Which process converts glucose into ATP in the presence of oxygen?', options: ['Photosynthesis', 'Fermentation', 'Cellular respiration', 'Chemosynthesis'], correctAnswer: 2, explanation: 'Cellular respiration is the metabolic process that converts glucose and oxygen into ATP, CO₂, and water.' },
      { question: 'What molecule carries amino acids to the ribosome during translation?', options: ['mRNA', 'rRNA', 'tRNA', 'DNA'], correctAnswer: 2, explanation: 'Transfer RNA (tRNA) carries specific amino acids to the ribosome, matching them to the mRNA codons during protein synthesis.' },
      { question: 'What is the function of the cell membrane?', options: ['Store genetic information', 'Produce energy', 'Regulate what enters and exits the cell', 'Synthesize proteins'], correctAnswer: 2, explanation: 'The cell membrane is selectively permeable, controlling the movement of substances in and out of the cell.' },
      { question: 'Which organelle is known as the "powerhouse of the cell"?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Endoplasmic reticulum'], correctAnswer: 2, explanation: 'Mitochondria generate most of the cell\'s ATP through cellular respiration.' },
    ];

    // Calculus questions
    const calculusQuestions = [
      { question: 'What is the derivative of x²?', options: ['x', '2x', '2x²', 'x³'], correctAnswer: 1, explanation: 'The power rule states that d/dx(xⁿ) = n·xⁿ⁻¹. For x², the derivative is 2x.' },
      { question: 'What does the definite integral of a function represent geometrically?', options: ['The slope of the tangent line', 'The maximum value of the function', 'The area under the curve between two points', 'The rate of change'], correctAnswer: 2, explanation: 'A definite integral calculates the signed area between the function and the x-axis over an interval.' },
      { question: 'What is the limit of sin(x)/x as x approaches 0?', options: ['0', '∞', 'undefined', '1'], correctAnswer: 3, explanation: 'This is a fundamental limit in calculus. Using L\'Hôpital\'s rule or the squeeze theorem, lim(x→0) sin(x)/x = 1.' },
      { question: 'Which rule is used to differentiate a product of two functions?', options: ['Chain rule', 'Quotient rule', 'Product rule', 'Power rule'], correctAnswer: 2, explanation: 'The product rule states: d/dx[f(x)·g(x)] = f\'(x)·g(x) + f(x)·g\'(x).' },
      { question: 'What is the integral of 1/x dx?', options: ['x²/2 + C', '1/x² + C', 'ln|x| + C', '-1/x² + C'], correctAnswer: 2, explanation: 'The integral of 1/x is the natural logarithm of the absolute value of x, plus a constant.' },
    ];

    // Microbiology questions
    const microbiologyQuestions = [
      { question: 'Which type of microorganism is responsible for causing malaria?', options: ['Bacteria', 'Virus', 'Protozoan (Plasmodium)', 'Fungus'], correctAnswer: 2, explanation: 'Malaria is caused by Plasmodium species, which are protozoan parasites transmitted by Anopheles mosquitoes.' },
      { question: 'What is the Gram stain used for in microbiology?', options: ['Measuring bacterial growth rate', 'Classifying bacteria by cell wall structure', 'Identifying viruses', 'Testing antibiotic resistance'], correctAnswer: 1, explanation: 'Gram staining differentiates bacteria into Gram-positive and Gram-negative based on cell wall composition.' },
      { question: 'Which structure allows bacteria to survive harsh environmental conditions?', options: ['Flagellum', 'Pilus', 'Endospore', 'Capsule'], correctAnswer: 2, explanation: 'Endospores are highly resistant dormant structures that allow bacteria to survive extreme conditions like heat and desiccation.' },
      { question: 'What is the primary function of antibiotics?', options: ['Kill viruses', 'Kill or inhibit bacteria', 'Boost immune system', 'Treat fungal infections'], correctAnswer: 1, explanation: 'Antibiotics are designed to kill or inhibit the growth of bacteria, not viruses.' },
      { question: 'Which microorganism is used in bread making?', options: ['Bacteria', 'Yeast', 'Virus', 'Protozoa'], correctAnswer: 1, explanation: 'Yeast (Saccharomyces cerevisiae) ferments sugars and produces CO₂, which makes bread rise.' },
    ];

    // Select questions based on topic
    let questionPool: QuizQuestion[] = [];
    
    if (normalizedTopic.includes('computer') || normalizedTopic.includes('programming') || 
        normalizedTopic.includes('software') || normalizedTopic.includes('coding') ||
        normalizedTopic.includes('data structure') || normalizedTopic.includes('algorithm')) {
      questionPool = csQuestions.map(q => ({ ...q, difficulty }));
    } else if (normalizedTopic.includes('biology') || normalizedTopic.includes('bio')) {
      questionPool = biologyQuestions.map(q => ({ ...q, difficulty }));
    } else if (normalizedTopic.includes('calculus') || normalizedTopic.includes('derivative') || normalizedTopic.includes('integral')) {
      questionPool = calculusQuestions.map(q => ({ ...q, difficulty }));
    } else if (normalizedTopic.includes('microbiology') || normalizedTopic.includes('micro') || normalizedTopic.includes('bacteria')) {
      questionPool = microbiologyQuestions.map(q => ({ ...q, difficulty }));
    } else if (normalizedTopic.includes('food safety') || normalizedTopic.includes('food hygiene') || normalizedTopic.includes('haccp')) {
      // Food Safety questions
      const foodSafetyQuestions = [
        { question: 'What does HACCP stand for?', options: ['Hazard Analysis and Critical Control Points', 'Health and Cleanliness Control Program', 'Hygiene Assessment and Contamination Control Plan', 'Hazardous Agent Control and Cleaning Protocol'], correctAnswer: 0, explanation: 'HACCP stands for Hazard Analysis and Critical Control Points, a systematic approach to food safety.' },
        { question: 'What is the temperature danger zone for food?', options: ['0°C to 10°C', '5°C to 60°C', '10°C to 40°C', '20°C to 80°C'], correctAnswer: 1, explanation: 'The temperature danger zone is 5°C to 60°C (41°F to 140°F), where bacteria grow most rapidly.' },
        { question: 'Which of the following is a biological hazard in food?', options: ['Glass fragments', 'Pesticide residues', 'Salmonella bacteria', 'Metal shavings'], correctAnswer: 2, explanation: 'Salmonella is a biological hazard. Glass and metal are physical hazards, pesticides are chemical hazards.' },
        { question: 'What is cross-contamination?', options: ['Cooking food at wrong temperature', 'Transfer of harmful substances from one food to another', 'Using expired ingredients', 'Improper food storage'], correctAnswer: 1, explanation: 'Cross-contamination is the transfer of harmful bacteria or substances from one food, surface, or person to another.' },
        { question: 'What is the minimum internal temperature for cooking poultry?', options: ['63°C (145°F)', '68°C (155°F)', '74°C (165°F)', '82°C (180°F)'], correctAnswer: 2, explanation: 'Poultry must be cooked to a minimum internal temperature of 74°C (165°F) to kill harmful bacteria.' },
        { question: 'Which bacteria is commonly associated with undercooked eggs?', options: ['E. coli', 'Listeria', 'Salmonella', 'Clostridium'], correctAnswer: 2, explanation: 'Salmonella is commonly found in raw or undercooked eggs and can cause food poisoning.' },
        { question: 'What is the primary purpose of food safety regulations?', options: ['Increase food prices', 'Protect public health', 'Reduce food production', 'Limit food variety'], correctAnswer: 1, explanation: 'Food safety regulations are designed to protect public health by ensuring food is safe for consumption.' },
        { question: 'How should raw meat be stored in a refrigerator?', options: ['On the top shelf', 'On the bottom shelf', 'Next to ready-to-eat foods', 'At room temperature'], correctAnswer: 1, explanation: 'Raw meat should be stored on the bottom shelf to prevent dripping onto other foods.' },
        { question: 'What is the correct order for washing hands in food preparation?', options: ['Rinse, soap, scrub, dry', 'Wet, soap, scrub, rinse, dry', 'Soap, rinse, dry', 'Scrub, rinse, soap, dry'], correctAnswer: 1, explanation: 'Proper handwashing: wet hands, apply soap, scrub for 20 seconds, rinse thoroughly, and dry with clean towel.' },
        { question: 'Which foodborne illness is caused by Clostridium botulinum?', options: ['Salmonellosis', 'Botulism', 'Listeriosis', 'Campylobacteriosis'], correctAnswer: 1, explanation: 'Botulism is caused by Clostridium botulinum, often found in improperly canned foods.' },
      ];
      questionPool = foodSafetyQuestions.map(q => ({ ...q, difficulty }));
    } else if (normalizedTopic.includes('food') || normalizedTopic.includes('nutrition')) {
      // Food Technology questions
      const foodTechQuestions = [
        { question: 'What is pasteurization?', options: ['Freezing food to preserve it', 'Heating food to kill pathogens', 'Adding preservatives to food', 'Drying food to remove moisture'], correctAnswer: 1, explanation: 'Pasteurization is a heat treatment process that kills harmful microorganisms in food and beverages.' },
        { question: 'What is the purpose of food preservation?', options: ['To change food color', 'To extend shelf life and prevent spoilage', 'To increase food weight', 'To add artificial flavors'], correctAnswer: 1, explanation: 'Food preservation extends shelf life by preventing microbial growth and chemical changes.' },
        { question: 'Which method of food preservation uses low temperatures?', options: ['Canning', 'Smoking', 'Refrigeration', 'Irradiation'], correctAnswer: 2, explanation: 'Refrigeration uses low temperatures to slow down microbial growth and enzymatic reactions.' },
        { question: 'What is the main purpose of food packaging?', options: ['To make food look attractive only', 'To protect food from contamination and extend shelf life', 'To increase food cost', 'To hide food defects'], correctAnswer: 1, explanation: 'Food packaging protects against contamination, physical damage, and helps extend shelf life.' },
        { question: 'What is water activity (aw) in food science?', options: ['The amount of water in food', 'The availability of water for microbial growth', 'The water used in processing', 'The moisture content percentage'], correctAnswer: 1, explanation: 'Water activity measures the availability of water for microbial growth and chemical reactions.' },
      ];
      questionPool = foodTechQuestions.map(q => ({ ...q, difficulty }));
    } else if (normalizedTopic.includes('ecology') || normalizedTopic.includes('ecosystem')) {
      // Ecology questions
      const ecologyQuestions = [
        { question: 'What is an ecosystem?', options: ['A single organism', 'A community of organisms and their physical environment', 'Only the plants in an area', 'A type of biome'], correctAnswer: 1, explanation: 'An ecosystem includes all living organisms in an area and their interactions with the physical environment.' },
        { question: 'What is the role of decomposers in an ecosystem?', options: ['Produce food through photosynthesis', 'Hunt and eat other organisms', 'Break down dead organic matter', 'Provide shelter for animals'], correctAnswer: 2, explanation: 'Decomposers break down dead organisms and waste, recycling nutrients back into the ecosystem.' },
        { question: 'What is biodiversity?', options: ['The number of plants only', 'The variety of life in an ecosystem', 'The size of an ecosystem', 'The climate of an area'], correctAnswer: 1, explanation: 'Biodiversity refers to the variety of all living species, including plants, animals, and microorganisms.' },
        { question: 'What is a food chain?', options: ['A grocery store network', 'A linear sequence of organisms where each is eaten by the next', 'A type of restaurant', 'A food processing method'], correctAnswer: 1, explanation: 'A food chain shows the linear transfer of energy from producers to consumers in an ecosystem.' },
        { question: 'What are primary producers in an ecosystem?', options: ['Carnivores', 'Herbivores', 'Organisms that make their own food (autotrophs)', 'Decomposers'], correctAnswer: 2, explanation: 'Primary producers are autotrophs like plants that produce their own food through photosynthesis.' },
      ];
      questionPool = ecologyQuestions.map(q => ({ ...q, difficulty }));
    } else if (normalizedTopic.includes('environment') || normalizedTopic.includes('pollution') || normalizedTopic.includes('climate')) {
      // Environmental Science questions
      const envSciQuestions = [
        { question: 'What is the greenhouse effect?', options: ['Growing plants in greenhouses', 'Trapping of heat in the atmosphere by greenhouse gases', 'A type of pollution', 'Cooling of the Earth'], correctAnswer: 1, explanation: 'The greenhouse effect is the trapping of heat by gases like CO2 and methane in Earth\'s atmosphere.' },
        { question: 'Which gas is the primary contributor to global warming?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Helium'], correctAnswer: 2, explanation: 'Carbon dioxide (CO2) is the main greenhouse gas contributing to global warming from human activities.' },
        { question: 'What is sustainable development?', options: ['Rapid industrialization', 'Development that meets present needs without compromising future generations', 'Stopping all development', 'Only economic growth'], correctAnswer: 1, explanation: 'Sustainable development balances economic, social, and environmental needs for present and future generations.' },
        { question: 'What is the ozone layer?', options: ['A layer of oxygen in the ocean', 'A protective layer in the stratosphere that absorbs UV radiation', 'A type of pollution', 'A layer of clouds'], correctAnswer: 1, explanation: 'The ozone layer in the stratosphere absorbs harmful ultraviolet radiation from the sun.' },
        { question: 'What is the main cause of acid rain?', options: ['Carbon dioxide only', 'Sulfur dioxide and nitrogen oxides', 'Water vapor', 'Oxygen'], correctAnswer: 1, explanation: 'Acid rain is caused by sulfur dioxide and nitrogen oxides reacting with water in the atmosphere.' },
      ];
      questionPool = envSciQuestions.map(q => ({ ...q, difficulty }));
    } else {
      // Default: Return null to force AI generation for unknown topics
      return null;
    }

    // Filter out already used questions
    const availableQuestions = questionPool.filter(q => !usedQuestions.has(q.question));
    
    if (availableQuestions.length === 0) {
      return null;
    }

    // Return a random question from available pool
    return availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
  }

  /**
   * Generate quiz based on learning materials/modules
   */
  async generateQuizFromMaterials(
    moduleId: string,
    questionCount: number = 10
  ): Promise<GeneratedQuiz | null> {
    if (!this.isAvailable()) {
      console.warn('[QuizGen] Service not available');
      return null;
    }

    try {
      // Fetch module data
      const module = await prisma.module.findUnique({
        where: { id: moduleId },
        include: {
          lessons: true,
          course: true
        }
      });

      if (!module) {
        console.warn(`[QuizGen] Module ${moduleId} not found`);
        return null;
      }

      // Extract content from lessons
      const lessonContents = module.lessons.map((lesson: any) => ({
        title: lesson.title,
        content: lesson.content
      }));

      const prompt = this.buildQuizPromptFromMaterials(
        module.title,
        module.description || '',
        lessonContents,
        questionCount
      );

      const text = await this.callGeminiWithRetry(prompt);

      const quiz = this.parseQuizResponse(text, module.title, module.title);
      console.log(`[QuizGen] Generated ${quiz.questions.length} questions from module: ${module.title}`);
      
      return quiz;
    } catch (error: any) {
      console.error('[QuizGen] Error generating quiz from materials:', error.message);
      return null;
    }
  }

  /**
   * Build quiz generation prompt
   */
  private buildQuizPrompt(
    subject: string,
    topic: string,
    questionCount: number,
    difficulty: string,
    courseCode?: string
  ): string {
    return `You are an expert university professor creating a real practice exam for students studying ${subject}.

Generate a comprehensive quiz with the following specifications:

**Subject**: ${subject}
**Topic**: ${topic}
${courseCode ? `**Course Code**: ${courseCode}` : ''}
**Number of Questions**: ${questionCount}
**Difficulty**: ${difficulty === 'mixed' ? '40% easy, 40% medium, 20% hard' : `100% ${difficulty}`}

**CRITICAL RULES**:
1. Create ${questionCount} multiple-choice questions that test ACTUAL KNOWLEDGE of ${topic}
2. Questions must ask about real facts, concepts, definitions, processes, formulas, and applications
3. NEVER ask meta-questions like "What is the key concept of this lesson?" or "What is the focus of studying X?"
4. NEVER reference lesson numbers, lesson titles, or course structure in questions
5. Each question must have exactly 4 options — only ONE correct answer
6. Wrong options must be realistic distractors, not obviously wrong
7. Shuffle which option is correct — do NOT always put the correct answer as option A (index 0)
8. Include a brief explanation for each correct answer

**Output Format** (STRICT JSON):
{
  "title": "Quiz title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Generate the quiz now in valid JSON format:`;
  }

  /**
   * Build quiz prompt from learning materials
   */
  private buildQuizPromptFromMaterials(
    moduleTitle: string,
    moduleDescription: string,
    lessons: Array<{ title: string; content: string }>,
    questionCount: number
  ): string {
    const lessonSummary = lessons.map((l) => {
      const cleanTitle = l.title
        .replace(/^lesson\s*\d+(\.\d+)?\s*[:.-]\s*/i, '')
        .trim();
      return `Topic: ${cleanTitle}\nContent: ${l.content.substring(0, 500)}`;
    }).join('\n\n');

    return `You are an expert university professor creating a real practice exam based on the following learning materials.

**Module**: ${moduleTitle}
**Description**: ${moduleDescription}

**Course Material**:
${lessonSummary}

**CRITICAL RULES**:
1. Create ${questionCount} multiple-choice questions that test ACTUAL KNOWLEDGE of the subject matter
2. Questions must ask about real facts, concepts, definitions, processes, and applications
3. NEVER ask meta-questions like "What is the key concept of this lesson?" or "What is the focus of studying X?"
4. NEVER reference lesson numbers, lesson titles, module names, or course structure in questions
5. Each question must have exactly 4 options — only ONE correct answer
6. Wrong options must be realistic distractors, not obviously wrong
7. Shuffle which option is correct — do NOT always put the correct answer as index 0
8. Include a brief explanation for each correct answer
9. Mix of difficulty levels (easy, medium, hard)

**Output Format** (STRICT JSON):
{
  "title": "Quiz title",
  "description": "Brief description",
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct",
      "difficulty": "easy|medium|hard"
    }
  ]
}

Generate the quiz now in valid JSON format:`;
  }

  /**
   * Parse Gemini response into structured quiz
   */
  private parseQuizResponse(
    responseText: string,
    subject: string,
    topic: string,
    courseCode?: string
  ): GeneratedQuiz {
    try {
      // Extract JSON from response (handle markdown code blocks)
      let jsonText = responseText.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
      }

      const parsed = JSON.parse(jsonText);

      // Validate and structure the quiz
      const questions: QuizQuestion[] = (parsed.questions || []).map((q: any) => ({
        question: q.question || '',
        options: Array.isArray(q.options) ? q.options : [],
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
        explanation: q.explanation || '',
        difficulty: ['easy', 'medium', 'hard'].includes(q.difficulty) ? q.difficulty : 'medium'
      }));

      return {
        title: parsed.title || `${subject} Quiz`,
        description: parsed.description || `Quiz on ${topic}`,
        questions,
        totalPoints: questions.length * 10,
        estimatedTime: questions.length * 2, // 2 minutes per question
        courseCode,
        topic
      };
    } catch (error: any) {
      console.error('[QuizGen] Error parsing quiz response:', error.message);
      
      // Return fallback quiz
      return {
        title: `${subject} Quiz`,
        description: `Quiz on ${topic}`,
        questions: [],
        totalPoints: 0,
        estimatedTime: 0,
        courseCode,
        topic
      };
    }
  }

  /**
   * Save generated quiz to database
   * Note: Currently returns the quiz object for frontend use
   * Database save can be implemented when needed
   */
  async saveQuizToDatabase(
    quiz: GeneratedQuiz,
    moduleId: string
  ): Promise<string | null> {
    try {
      // For now, return the quiz as JSON for frontend to handle
      // Database integration can be added when Quiz schema is updated
      console.log(`[QuizGen] Quiz generated for module: ${moduleId}`);
      console.log(`[QuizGen] Quiz has ${quiz.questions.length} questions`);
      
      // TODO: Implement database save when Quiz schema includes title, description, etc.
      return quiz.title;
    } catch (error: any) {
      console.error('[QuizGen] Error processing quiz:', error.message);
      return null;
    }
  }
}

export const quizGeneratorService = new QuizGeneratorService();
