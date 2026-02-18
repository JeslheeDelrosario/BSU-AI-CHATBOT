import OpenAI from 'openai';

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

export class OpenAIQuizService {
  private openai: OpenAI | null = null;
  private isEnabled: boolean = false;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey && apiKey.startsWith('sk-')) {
      this.openai = new OpenAI({ apiKey });
      this.isEnabled = true;
      console.log('✓ OpenAI Quiz Generator enabled');
    } else {
      console.warn('⚠ OpenAI Quiz Generator disabled (API key not configured)');
    }
  }

  isAvailable(): boolean {
    return this.isEnabled && this.openai !== null;
  }

  async generateQuiz(
    topic: string,
    questionCount: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed'
  ): Promise<GeneratedQuiz | null> {
    if (!this.isAvailable()) {
      console.warn('[OpenAI QuizGen] Service not available');
      return null;
    }

    try {
      const prompt = this.buildQuizPrompt(topic, questionCount, difficulty);
      
      const response = await this.openai!.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator creating educational quizzes. Generate questions in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const generatedText = response.choices[0]?.message?.content || '';
      const quizData = this.parseQuizResponse(generatedText, topic, questionCount);
      
      if (!quizData || quizData.questions.length === 0) {
        console.warn('[OpenAI QuizGen] Failed to parse quiz from response');
        return null;
      }

      console.log(`[OpenAI QuizGen] Generated ${quizData.questions.length} questions for ${topic}`);
      return quizData;
    } catch (error: any) {
      console.error('[OpenAI QuizGen] Error generating quiz:', error.message);
      return null;
    }
  }

  private buildQuizPrompt(topic: string, questionCount: number, difficulty: string): string {
    return `You are an expert university professor creating a real practice exam for students studying ${topic}.

Generate ${questionCount} multiple-choice questions that test ACTUAL KNOWLEDGE of ${topic}.

CRITICAL RULES:
- Questions must ask about real facts, concepts, definitions, processes, and applications
- NEVER ask meta-questions like "What is the key concept of this lesson?" or "What is the focus of studying X?"
- NEVER reference lesson numbers, lesson titles, or course structure in questions
- Wrong options must be realistic distractors, not obviously wrong
- Shuffle which option (A/B/C/D) is correct — do NOT always make A the correct answer
- Difficulty: ${difficulty === 'mixed' ? '40% easy, 40% medium, 20% hard' : `100% ${difficulty}`}

Format each question EXACTLY as follows:
Q1: [Question text]
A) [Option 1]
B) [Option 2]
C) [Option 3]
D) [Option 4]
CORRECT: [A/B/C/D]
EXPLANATION: [Brief explanation]
DIFFICULTY: [easy/medium/hard]

Example:
Q1: What is the derivative of x²?
A) x³
B) 2x
C) 2x²
D) x
CORRECT: B
EXPLANATION: Using the power rule d/dx(xⁿ) = n·xⁿ⁻¹, the derivative of x² is 2x.
DIFFICULTY: easy

Generate ${questionCount} real practice test questions about ${topic} now:`;
  }

  private parseQuizResponse(response: string, topic: string, expectedCount: number): GeneratedQuiz | null {
    try {
      const questions: QuizQuestion[] = [];
      const questionBlocks = response.split(/Q\d+:/g).filter(block => block.trim());

      for (const block of questionBlocks) {
        if (questions.length >= expectedCount) break;

        const lines = block.trim().split('\n').filter(line => line.trim());
        if (lines.length < 6) continue;

        const questionText = lines[0].trim();
        const options: string[] = [];
        let correctAnswer = 0;
        let explanation = '';
        let difficulty: 'easy' | 'medium' | 'hard' = 'medium';

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if (line.match(/^[A-D]\)/)) {
            options.push(line.substring(3).trim());
          } else if (line.startsWith('CORRECT:')) {
            const answer = line.substring(8).trim().toUpperCase();
            correctAnswer = answer.charCodeAt(0) - 65;
          } else if (line.startsWith('EXPLANATION:')) {
            explanation = line.substring(12).trim();
          } else if (line.startsWith('DIFFICULTY:')) {
            const diff = line.substring(11).trim().toLowerCase();
            if (diff === 'easy' || diff === 'medium' || diff === 'hard') {
              difficulty = diff;
            }
          }
        }

        if (questionText && options.length === 4 && explanation) {
          questions.push({
            question: questionText,
            options,
            correctAnswer: Math.max(0, Math.min(3, correctAnswer)),
            explanation,
            difficulty
          });
        }
      }

      if (questions.length === 0) {
        return null;
      }

      return {
        title: `${topic} Quiz`,
        description: `Test your knowledge of ${topic} fundamentals`,
        questions,
        totalPoints: questions.length * 10,
        estimatedTime: questions.length * 2,
        topic
      };
    } catch (error: any) {
      console.error('[OpenAI QuizGen] Error parsing response:', error.message);
      return null;
    }
  }

  async generateQuizFromCourse(
    courseCode: string,
    topic: string,
    questionCount: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed'
  ): Promise<GeneratedQuiz | null> {
    const quiz = await this.generateQuiz(topic, questionCount, difficulty);
    if (quiz) {
      quiz.courseCode = courseCode;
      quiz.title = `${courseCode}: ${topic} Quiz`;
    }
    return quiz;
  }
}

export const openAIQuizService = new OpenAIQuizService();
