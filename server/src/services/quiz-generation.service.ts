// Quiz Generation Service - Production-Ready Implementation
import OpenAI from 'openai';
import { learningMaterials, searchMaterialsByTopic, QuizQuestion } from '../data/learning-materials';

const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface GenerateQuizParams {
  topic?: string;
  subject?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
  questionCount: number;
  conversationContext?: string;
  userLanguage?: string;
}

export interface QuizResult {
  id: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  totalQuestions: number;
  estimatedTime: number; // in minutes
  difficulty: string;
  subject: string;
  createdAt: Date;
}

/**
 * Generate a quiz based on topic, subject, or conversation context
 * Uses learning materials dataset and AI to create contextual questions
 */
export const generateQuiz = async (params: GenerateQuizParams): Promise<QuizResult> => {
  const {
    topic,
    subject,
    difficulty = 'mixed',
    questionCount = 10,
    conversationContext,
    userLanguage = 'en'
  } = params;

  // Step 1: Find relevant learning materials
  let relevantMaterials = topic 
    ? searchMaterialsByTopic(topic)
    : learningMaterials;

  if (subject) {
    relevantMaterials = relevantMaterials.filter(m => 
      m.subject.toLowerCase().includes(subject.toLowerCase())
    );
  }

  // Step 2: If no materials found, use general knowledge
  if (relevantMaterials.length === 0) {
    relevantMaterials = learningMaterials.slice(0, 3);
  }

  // Step 3: Extract sample questions from materials
  const sampleQuestions: QuizQuestion[] = [];
  relevantMaterials.forEach(material => {
    sampleQuestions.push(...material.sampleQuestions);
  });

  // Step 4: Build context for AI
  const contextText = relevantMaterials
    .map(m => `Topic: ${m.topic}\nContent: ${m.content}\nKey Points:\n${m.keyPoints.join('\n')}`)
    .join('\n\n');

  // Step 5: Generate additional questions using AI
  let aiGeneratedQuestions: QuizQuestion[] = [];
  
  if (openai && relevantMaterials.length > 0) {
    try {
      aiGeneratedQuestions = await generateQuestionsWithAI(
        contextText,
        conversationContext || '',
        questionCount,
        difficulty,
        userLanguage
      );
    } catch (error) {
      console.error('AI question generation failed, using sample questions:', error);
    }
  }

  // Step 6: Combine and select questions
  let allQuestions = [...aiGeneratedQuestions, ...sampleQuestions];
  
  // If AI failed, ensure we have enough sample questions
  if (allQuestions.length === 0) {
    console.warn('No questions generated, using all available samples');
    allQuestions = [...sampleQuestions];
  }
  
  // Filter by difficulty if specified
  if (difficulty !== 'mixed') {
    const filtered = allQuestions.filter(q => q.difficulty === difficulty);
    if (filtered.length > 0) {
      allQuestions = filtered;
    }
  }

  // Shuffle and select requested number
  const shuffled = allQuestions.sort(() => Math.random() - 0.5);
  let selectedQuestions = shuffled.slice(0, questionCount);

  // Step 7: If not enough questions, fill with samples
  if (selectedQuestions.length < questionCount) {
    const remaining = questionCount - selectedQuestions.length;
    const additionalSamples = sampleQuestions
      .filter(q => !selectedQuestions.includes(q))
      .slice(0, remaining);
    selectedQuestions.push(...additionalSamples);
  }

  // Final fallback: if still no questions, use first N samples
  if (selectedQuestions.length === 0) {
    selectedQuestions = sampleQuestions.slice(0, Math.min(questionCount, sampleQuestions.length));
  }

  // Step 8: Build quiz result
  const quizTitle = topic 
    ? `${topic} Practice Exam`
    : subject 
    ? `${subject} Quiz`
    : 'General Knowledge Quiz';

  const quizDescription = userLanguage === 'fil'
    ? `Pagsusulit na may ${selectedQuestions.length} tanong. Subukin ang iyong kaalaman!`
    : `Practice exam with ${selectedQuestions.length} questions. Test your knowledge!`;

  return {
    id: `quiz-${Date.now()}`,
    title: quizTitle,
    description: quizDescription,
    questions: selectedQuestions,
    totalQuestions: selectedQuestions.length,
    estimatedTime: Math.ceil(selectedQuestions.length * 1.5), // 1.5 min per question
    difficulty: difficulty === 'mixed' ? 'Mixed' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
    subject: subject || relevantMaterials[0]?.subject || 'General',
    createdAt: new Date()
  };
};

/**
 * Generate questions using OpenAI based on context
 */
const generateQuestionsWithAI = async (
  contextText: string,
  conversationContext: string,
  count: number,
  difficulty: string,
  userLanguage: string
): Promise<QuizQuestion[]> => {
  if (!openai) {
    return [];
  }

  const difficultyInstruction = difficulty === 'mixed'
    ? 'Mix of easy, medium, and hard questions'
    : `All questions should be ${difficulty} difficulty`;

  const languageInstruction = userLanguage === 'fil'
    ? 'Generate questions in Filipino (Tagalog) language.'
    : 'Generate questions in English.';

  // Optimize context to reduce tokens - use only first 2 materials
  const optimizedContext = contextText.slice(0, 1500);
  const optimizedConversation = conversationContext.slice(0, 500);

  const prompt = `Generate ${count} quiz questions. ${languageInstruction}

Topic: ${optimizedContext.split('\n')[0]}

Requirements:
- ${difficultyInstruction}
- 4 options (A, B, C, D)
- Include explanation

JSON format:
[{"question":"?","options":["A) ...","B) ...","C) ...","D) ..."],"correctAnswer":"A","explanation":"...","difficulty":"easy"}]

Return ONLY JSON array:`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Expert quiz generator. Return valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '[]';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No JSON found in AI response');
      return [];
    }

    const questions = JSON.parse(jsonMatch[0]) as QuizQuestion[];
    
    // Validate questions
    return questions.filter(q => 
      q.question &&
      q.options &&
      q.options.length === 4 &&
      q.correctAnswer &&
      q.explanation
    );
  } catch (error) {
    console.error('Error generating questions with AI:', error);
    return [];
  }
};

/**
 * Validate quiz answers and calculate score
 */
export interface QuizSubmission {
  quizId: string;
  answers: Record<number, string>; // questionIndex -> selectedAnswer
}

export interface QuizResults {
  quizId: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number; // percentage
  passed: boolean;
  timeSpent?: number; // in seconds
  results: Array<{
    questionIndex: number;
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }>;
}

export const gradeQuiz = (
  quiz: QuizResult,
  submission: QuizSubmission
): QuizResults => {
  const results: QuizResults['results'] = [];
  let correctCount = 0;

  quiz.questions.forEach((question, index) => {
    const userAnswer = submission.answers[index];
    const isCorrect = userAnswer === question.correctAnswer;
    
    if (isCorrect) {
      correctCount++;
    }

    results.push({
      questionIndex: index,
      question: question.question,
      userAnswer: userAnswer || 'Not answered',
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation
    });
  });

  const score = Math.round((correctCount / quiz.totalQuestions) * 100);
  const passed = score >= 70; // 70% passing grade

  return {
    quizId: quiz.id,
    totalQuestions: quiz.totalQuestions,
    correctAnswers: correctCount,
    incorrectAnswers: quiz.totalQuestions - correctCount,
    score,
    passed,
    results
  };
};
