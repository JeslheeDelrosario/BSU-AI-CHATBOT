// QuizResults Component - Production Ready
import { Trophy, RotateCcw, X, CheckCircle, XCircle, Clock, Award, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import api from '../lib/api';

interface QuizResultsProps {
  exam: {
    id: string;
    title: string;
    subject: string;
    difficulty: string;
    totalQuestions: number;
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string;
    }>;
  };
  answers: Record<number, string>;
  timeSpent: number;
  onClose: () => void;
  onRetake: () => void;
  onComplete: (results: any) => void;
}

export default function QuizResults({ exam, answers, timeSpent, onClose, onRetake, onComplete }: QuizResultsProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Calculate results
  const correctAnswers = Object.entries(answers).filter(
    ([idx, answer]) => answer === exam.questions[parseInt(idx)].correctAnswer
  ).length;
  const incorrectAnswers = Object.keys(answers).length - correctAnswers;
  const score = Math.round((correctAnswers / exam.totalQuestions) * 100);
  const passed = score >= 70;

  // Submit results to backend
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await api.post(`/practice-exams/${exam.id}/submit`, {
        answers,
        timeSpent
      });
      setSubmitted(true);
      onComplete(response.data.results);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4 md:p-6">
      <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Quiz Complete!</h2>
              <p className="text-gray-400">{exam.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="p-6 space-y-6">
          {/* Score Card */}
          <div className={`relative overflow-hidden rounded-2xl p-8 ${
            passed
              ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50'
              : 'bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/50'
          }`}>
            <div className="text-center space-y-4">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
                passed ? 'bg-green-500' : 'bg-orange-500'
              }`}>
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="text-6xl font-bold text-white mb-2">{score}%</div>
                <p className={`text-xl font-semibold ${passed ? 'text-green-400' : 'text-orange-400'}`}>
                  {passed ? '🎉 Passed!' : '📚 Keep Practicing!'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Correct</span>
              </div>
              <div className="text-2xl font-bold text-white">{correctAnswers}</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <XCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Incorrect</span>
              </div>
              <div className="text-2xl font-bold text-white">{incorrectAnswers}</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm font-medium">Time</span>
              </div>
              <div className="text-2xl font-bold text-white">{formatTime(timeSpent)}</div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Award className="w-5 h-5" />
                <span className="text-sm font-medium">Grade</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'}
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-white">Performance Insights</h3>
            </div>
            <div className="space-y-3 text-gray-300">
              <p>
                • You answered <span className="text-white font-semibold">{correctAnswers} out of {exam.totalQuestions}</span> questions correctly
              </p>
              <p>
                • Your accuracy rate is <span className="text-white font-semibold">{score}%</span>
              </p>
              <p>
                • Average time per question: <span className="text-white font-semibold">{Math.round(timeSpent / exam.totalQuestions)}s</span>
              </p>
              {!passed && (
                <p className="text-orange-400">
                  • Keep practicing! You need 70% to pass. You're {70 - score}% away.
                </p>
              )}
            </div>
          </div>

          {/* Detailed Results */}
          <div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
            >
              <span className="text-white font-semibold">
                {showDetails ? 'Hide' : 'Show'} Detailed Results
              </span>
              <span className="text-gray-400">{showDetails ? '▲' : '▼'}</span>
            </button>

            {showDetails && (
              <div className="mt-4 space-y-4">
                {exam.questions.map((question, idx) => {
                  const userAnswer = answers[idx];
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border-2 ${
                        isCorrect
                          ? 'bg-green-500/10 border-green-500/50'
                          : 'bg-red-500/10 border-red-500/50'
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <p className="text-white font-medium mb-2">
                            {idx + 1}. {question.question}
                          </p>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-300">
                              Your answer: <span className={isCorrect ? 'text-green-400' : 'text-red-400'}>{userAnswer || 'Not answered'}</span>
                            </p>
                            {!isCorrect && (
                              <p className="text-gray-300">
                                Correct answer: <span className="text-green-400">{question.correctAnswer}</span>
                              </p>
                            )}
                          </div>
                          <div className="mt-2 p-3 bg-white/5 rounded-lg">
                            <p className="text-gray-300 text-sm">{question.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRetake}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold transition-colors border border-white/10"
            >
              <RotateCcw className="w-5 h-5" />
              Retake Quiz
            </button>
            
            {!submitted && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
              >
                {submitting ? 'Saving...' : 'Save Results'}
              </button>
            )}

            {submitted && (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold"
              >
                ✓ Results Saved
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
