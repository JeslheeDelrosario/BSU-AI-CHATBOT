// QuizModal Component - Production Ready
import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Clock, Award, CheckCircle, XCircle } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface PracticeExam {
  id: string;
  title: string;
  description: string;
  subject: string;
  difficulty: string;
  totalQuestions: number;
  estimatedTime: number;
  questions: QuizQuestion[];
  createdAt: string;
}

interface QuizModalProps {
  exam: PracticeExam;
  onClose: () => void;
  onComplete: (results: any) => void;
}

export default function QuizModal({ exam, onClose, onComplete }: QuizModalProps) {
  const { settings } = useAccessibility();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = exam.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === exam.questions.length - 1;
  const correctCount = Object.entries(answers).filter(
    ([idx, answer]) => answer === exam.questions[parseInt(idx)].correctAnswer
  ).length;
  const incorrectCount = Object.keys(answers).length - correctCount;

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1] || null);
      setShowFeedback(!!answers[currentQuestionIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] || null);
      setShowFeedback(!!answers[currentQuestionIndex - 1]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (showResults) {
    return (
      <QuizResults
        exam={exam}
        answers={answers}
        timeSpent={timeSpent}
        onClose={onClose}
        onRetake={() => {
          setCurrentQuestionIndex(0);
          setAnswers({});
          setShowResults(false);
          setSelectedAnswer(null);
          setShowFeedback(false);
        }}
        onComplete={onComplete}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-slideUp">
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.2s ease-out;
          }
          .animate-slideUp {
            animation: slideUp 0.3s ease-out;
          }
        `}</style>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">{exam.title}</h2>
              <p className="text-sm text-gray-400">{exam.description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Close quiz"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">
                  {settings.language === 'fil' ? 'Tanong' : 'Question'} {currentQuestionIndex + 1}/{exam.totalQuestions}
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>{correctCount}</span>
                  </div>
                  <div className="flex items-center gap-1 text-red-400">
                    <XCircle className="w-4 h-4" />
                    <span>{incorrectCount}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(timeSpent)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{exam.estimatedTime} {settings.language === 'fil' ? 'min' : 'min'}</span>
                </div>
              </div>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / exam.totalQuestions) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <QuizQuestion
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            selectedAnswer={selectedAnswer}
            showFeedback={showFeedback}
            onAnswerSelect={handleAnswerSelect}
            language={settings.language}
          />
        </div>

        {/* Navigation Footer */}
        <div className="p-6 border-t border-white/10 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              {settings.language === 'fil' ? 'Bumalik' : 'Back'}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-400">
                {Object.keys(answers).length}/{exam.totalQuestions} {settings.language === 'fil' ? 'nasagot' : 'answered'}
              </p>
            </div>

            <button
              onClick={handleNext}
              disabled={!selectedAnswer}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all"
            >
              {isLastQuestion
                ? (settings.language === 'fil' ? 'Tapusin' : 'Finish')
                : (settings.language === 'fil' ? 'Susunod' : 'Next')}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
