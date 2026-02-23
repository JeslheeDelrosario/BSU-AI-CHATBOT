// QuizSidePanel Component - Side panel quiz that appears beside the chatbot
import { useState, useEffect } from 'react';
import { X, Share2, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import api from '../lib/api';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // Index of the correct option (0, 1, 2, 3)
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

interface QuizSidePanelProps {
  exam: PracticeExam;
  onClose: () => void;
  onComplete: (results: any) => void;
}

export default function QuizSidePanel({ exam, onClose, onComplete }: QuizSidePanelProps) {
  const { settings } = useAccessibility();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // Store answer index
  const [showHint, setShowHint] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [startTime] = useState(Date.now());
  const [resultsSaved, setResultsSaved] = useState(false);

  const currentQuestion = exam.questions[currentQuestionIndex];
  const correctCount = Object.entries(answers).filter(
    ([idx, answerIdx]) => answerIdx === exam.questions[parseInt(idx)].correctAnswer
  ).length;
  const incorrectCount = Object.keys(answers).length - correctCount;

  // Save results to database when quiz is completed
  useEffect(() => {
    if (showResults && !resultsSaved && exam.id) {
      const saveResults = async () => {
        try {
          const timeSpent = Math.floor((Date.now() - startTime) / 1000);
          await api.post(`/practice-exams/${exam.id}/submit`, {
            answers,
            timeSpent
          });
          setResultsSaved(true);
          console.log('[Quiz] Results saved to database');
        } catch (error) {
          console.error('[Quiz] Failed to save results:', error);
        }
      };
      saveResults();
    }
  }, [showResults, resultsSaved, exam.id, answers, startTime]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (answers[currentQuestionIndex] !== undefined) return; // Already answered
    
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: answerIndex }));
    setShowHint(false);
    
    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < exam.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setShowResults(true);
      }
    }, 800);
  };

  const selectedAnswerIndex = answers[currentQuestionIndex];
  const hasAnswered = selectedAnswerIndex !== undefined;

  // Calculate progress percentage
  const progressPercent = ((currentQuestionIndex + 1) / exam.totalQuestions) * 100;

  // Note: isCorrect helper removed as we check inline

  if (showResults) {
    const score = Math.round((correctCount / exam.totalQuestions) * 100);
    return (
      <div className="h-full flex flex-col bg-slate-900 text-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-bold">📝</span>
            </div>
            <span className="font-medium text-white">{exam.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Share2 className="w-4 h-4 text-gray-400" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Results Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-6xl mb-4">{score >= 70 ? '🎉' : score >= 50 ? '👍' : '📚'}</div>
          <h2 className="text-2xl font-bold mb-2">
            {settings.language === 'fil' ? 'Tapos na!' : 'Quiz Complete!'}
          </h2>
          <p className="text-4xl font-bold text-cyan-400 mb-4">{score}%</p>
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">{correctCount} correct</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400 font-medium">{incorrectCount} wrong</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentQuestionIndex(0);
                setAnswers({});
                setShowResults(false);
              }}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-medium transition-colors"
            >
              {settings.language === 'fil' ? 'Ulitin' : 'Retake'}
            </button>
            <button
              onClick={() => onComplete({ score, correctCount, incorrectCount, totalQuestions: exam.totalQuestions })}
              className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 rounded-lg font-medium transition-colors"
            >
              {settings.language === 'fil' ? 'Tapos' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-slate-900 text-white">
      {/* Header - Compact like reference */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs">📝</span>
          </div>
          <span className="text-sm font-medium text-white truncate">{exam.title}</span>
          <span className="text-xs text-gray-400 flex-shrink-0">{currentQuestionIndex + 1}/{exam.totalQuestions}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-500/20 rounded text-orange-400 text-xs font-medium">
            <XCircle className="w-3 h-3" />
            <span>{incorrectCount}</span>
          </div>
          <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-green-500/20 rounded text-green-400 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>{correctCount}</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors ml-1">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-white/10">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Content - Compact */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Question Number and Text */}
        <div className="mb-4">
          <div className="flex items-start gap-2">
            <span className="text-gray-400 text-sm font-medium">{currentQuestionIndex + 1}.</span>
            <p className="text-sm text-white leading-relaxed">{currentQuestion.question}</p>
          </div>
        </div>

        {/* Options - Compact */}
        <div className="space-y-2">
          {currentQuestion.options.map((option, idx) => {
            const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D
            const isSelected = selectedAnswerIndex === idx;
            const isCorrectAnswer = idx === currentQuestion.correctAnswer;
            
            let optionStyle = 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800';
            
            if (hasAnswered) {
              if (isCorrectAnswer) {
                optionStyle = 'bg-green-500/20 border-green-500/50 text-green-400';
              } else if (isSelected && !isCorrectAnswer) {
                optionStyle = 'bg-red-500/20 border-red-500/50 text-red-400';
              } else {
                optionStyle = 'bg-slate-800/30 border-slate-700/50 text-gray-500';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswerSelect(idx)}
                disabled={hasAnswered}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all duration-200 ${optionStyle} ${!hasAnswered ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    hasAnswered && isCorrectAnswer ? 'border-green-500 text-green-400 bg-green-500/20' :
                    hasAnswered && isSelected && !isCorrectAnswer ? 'border-red-500 text-red-400 bg-red-500/20' :
                    'border-slate-600 text-slate-400'
                  }`}>
                    {optionLetter}
                  </span>
                  <span className="flex-1 text-sm">{option}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation (shown after answering) */}
        {hasAnswered && currentQuestion.explanation && (
          <div className="mt-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <p className="text-xs text-cyan-300">
              <span className="font-medium">Explanation:</span> {currentQuestion.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Show Hint Toggle - Compact */}
      <div className="px-3 py-2 border-t border-slate-700">
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <span>{settings.language === 'fil' ? 'Ipakita ang hint' : 'Show hint'}</span>
          {showHint ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        
        {showHint && !hasAnswered && (
          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded">
            <p className="text-xs text-amber-300">
              {currentQuestion.explanation ? 
                `Hint: Think about ${currentQuestion.explanation.split(' ').slice(0, 5).join(' ')}...` :
                'No hint available for this question.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Navigation - Compact */}
      <div className="px-3 py-2 border-t border-slate-700 flex items-center justify-between">
        <button
          onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
          className="text-xs text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          ← {settings.language === 'fil' ? 'Nakaraan' : 'Previous'}
        </button>
        
        <div className="flex gap-0.5">
          {exam.questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentQuestionIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                idx === currentQuestionIndex ? 'bg-cyan-500' :
                answers[idx] !== undefined ? 
                  (answers[idx] === exam.questions[idx].correctAnswer ? 'bg-green-500' : 'bg-red-500') :
                  'bg-white/20'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            if (currentQuestionIndex < exam.questions.length - 1) {
              setCurrentQuestionIndex(prev => prev + 1);
            } else {
              setShowResults(true);
            }
          }}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          {currentQuestionIndex === exam.questions.length - 1 
            ? (settings.language === 'fil' ? 'Tapusin' : 'Finish')
            : (settings.language === 'fil' ? 'Susunod' : 'Next')} →
        </button>
      </div>
    </div>
  );
}
