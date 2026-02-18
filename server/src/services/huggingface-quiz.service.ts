import { HfInference } from '@huggingface/inference';

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

export class HuggingFaceQuizService {
  private hf: HfInference | null = null;
  private isEnabled: boolean = false;

  constructor() {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    
    if (apiKey && apiKey !== 'your-huggingface-api-key-here') {
      this.hf = new HfInference(apiKey);
      this.isEnabled = true;
      console.log('✓ Hugging Face Quiz Generator enabled');
    } else {
      console.warn('⚠ Hugging Face Quiz Generator disabled (API key not configured)');
    }
  }

  isAvailable(): boolean {
    return this.isEnabled && this.hf !== null;
  }

  async generateQuiz(
    topic: string,
    questionCount: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed'
  ): Promise<GeneratedQuiz | null> {
    if (!this.isAvailable()) {
      console.warn('[HF QuizGen] Service not available');
      return null;
    }

    try {
      const prompt = this.buildQuizPrompt(topic, questionCount, difficulty);
      
      // Use chat completion with Mistral model
      const response = await this.hf!.chatCompletion({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.95
      });

      const generatedText = response.choices[0]?.message?.content || '';
      const quizData = this.parseQuizResponse(generatedText, topic, questionCount);
      
      if (!quizData || quizData.questions.length === 0) {
        console.warn('[HF QuizGen] Failed to parse quiz from response');
        return null;
      }

      return quizData;
    } catch (error: any) {
      console.error('[HF QuizGen] Error generating quiz:', error.message);
      return null;
    }
  }

  private buildQuizPrompt(topic: string, questionCount: number, difficulty: string): string {
    return `You are an expert educator creating a multiple-choice quiz about ${topic}.

Generate ${questionCount} educational questions about ${topic}. Each question should test understanding of core concepts.

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
A) 2x
B) x
C) 2x²
D) x³
CORRECT: A
EXPLANATION: Using the power rule d/dx(xⁿ) = n·xⁿ⁻¹, the derivative of x² is 2x.
DIFFICULTY: easy

Now generate ${questionCount} questions about ${topic}:`;
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
            correctAnswer = answer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
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
      console.error('[HF QuizGen] Error parsing response:', error.message);
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

export const huggingFaceQuizService = new HuggingFaceQuizService();
