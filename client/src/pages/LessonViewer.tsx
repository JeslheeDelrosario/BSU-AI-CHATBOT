// client\src\pages\LessonViewer.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, CheckCircle, Clock, FileText, Video, Headphones, ArrowRight, RotateCcw, XCircle } from 'lucide-react';

export default function LessonViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [startTime] = useState(Date.now());

  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // questionId -> selected option text
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(new Set()); // track which questions have been submitted
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/lessons/${id}`);
      setLesson(response.data.lesson);
      setProgress(response.data.progress);

      // If it's a quiz, fetch questions
      if (response.data.lesson.type === 'QUIZ') {
        await fetchQuizQuestions();
      }
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizQuestions = async () => {
    setQuizLoading(true);
    try {
      const res = await api.get(`/lessons/${id}/quiz`);
      setQuizQuestions(res.data.questions);
    } catch (error) {
      console.error('Failed to fetch quiz questions:', error);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleSelectAnswer = (questionId: string, optionText: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionText,
    }));
  };

  const handleSubmitAnswer = (questionId: string) => {
    if (!selectedAnswers[questionId]) return;
    setSubmittedQuestions(prev => new Set([...prev, questionId]));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setCompleting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    // Calculate score
    let correctCount = 0;
    quizQuestions.forEach(q => {
      const selected = selectedAnswers[q.id];
      const correctOption = q.options.find((o: any) => o.isCorrect);
      if (selected === correctOption?.text) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quizQuestions.length) * 100);
    setQuizScore(score);
    setShowQuizResult(true);

    // Update progress if passed (≥85%)
    if (score >= 85) {
      try {
        await api.post(`/lessons/${id}/progress`, {
          completed: true,
          timeSpent,
          score,
        });
        setProgress({ ...progress, completed: true });
      } catch (error) {
        console.error('Failed to update progress:', error);
      }
    }

    setCompleting(false);
  };

  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmittedQuestions(new Set());
    setShowQuizResult(false);
    setQuizScore(0);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-6 h-6" />;
      case 'AUDIO':
        return <Headphones className="w-6 h-6" />;
      case 'TEXT':
        return <FileText className="w-6 h-6" />;
      case 'QUIZ':
        return <FileText className="w-6 h-6" />; // or Brain icon later
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Lesson not found</p>
      </div>
    );
  }

  const isQuiz = lesson.type === 'QUIZ';
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestion?.id];
  const isSubmitted = submittedQuestions.has(currentQuestion?.id);
  const isLastQuestion = currentQuestionIndex === quizQuestions.length - 1;
  const allAnswered = Object.keys(selectedAnswers).length === quizQuestions.length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 dark:text-gray-600 hover:text-slate-900 dark:hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        {progress?.completed && (
          <span className="flex items-center gap-2 text-green-600 dark:text-green-500 font-medium">
            <CheckCircle className="w-5 h-5" />
            Completed
          </span>
        )}
      </div>

      {/* Lesson Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          {getLessonIcon(lesson.type)}
          <span className="text-sm font-medium opacity-90 capitalize">
            {lesson.type.toLowerCase()}
          </span>
          <span className="text-sm opacity-75">•</span>
          <span className="text-sm opacity-90 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {lesson.duration || '?'} minutes
          </span>
        </div>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isQuiz ? (
          <div className="p-8">
            {/* Quiz Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">
                Quiz: {lesson.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Answer all questions and submit to see your score. You need 85% to complete this lesson.
              </p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                <span>{Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100)}% complete</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {quizLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading questions...</p>
              </div>
            ) : quizQuestions.length === 0 ? (
              <p className="text-center text-gray-600 py-12">No questions available for this quiz.</p>
            ) : (
              <div className="space-y-8">
                {/* Current Question Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-xl p-6 border border-indigo-100 dark:border-indigo-800">
                  <h3 className="text-xl font-semibold text-indigo-800 dark:text-indigo-200 mb-6">
                    {currentQuestion.text}
                  </h3>

                  <div className="space-y-4">
                    {currentQuestion.options.map((option: any, index: number) => (
                      <label 
                        key={option.id}
                        className={`flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all
                          ${selectedAnswer === option.text 
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                            : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'}
                          ${isSubmitted && option.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : ''}
                          ${isSubmitted && selectedAnswer === option.text && !option.isCorrect ? 'border-red-500 bg-red-50 dark:bg-red-900/30' : ''}
                        `}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestion.id}`}
                          checked={selectedAnswer === option.text}
                          onChange={() => handleSelectAnswer(currentQuestion.id, option.text)}
                          disabled={isSubmitted}
                          className="w-5 h-5 text-indigo-600"
                        />
                        <span className="flex-1">
                          <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                          {option.text}
                        </span>
                      </label>
                    ))}
                  </div>

                  {/* Immediate Feedback & Explanation */}
                  {isSubmitted && (
                    <div className="mt-6 p-4 rounded-lg bg-opacity-10">
                      {selectedAnswer === currentQuestion.options.find((o: any) => o.isCorrect)?.text ? (
                        <div className="flex items-start gap-3 text-green-700 dark:text-green-300">
                          <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Correct!</p>
                            {currentQuestion.explanation && (
                              <p className="mt-2 text-sm">{currentQuestion.explanation}</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3 text-red-700 dark:text-red-300">
                          <XCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Incorrect</p>
                            <p className="mt-1 text-sm">
                              Correct answer: <span className="font-medium">
                                {currentQuestion.options.find((o: any) => o.isCorrect)?.text}
                              </span>
                            </p>
                            {currentQuestion.explanation && (
                              <p className="mt-2 text-sm">{currentQuestion.explanation}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation & Submit */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {isLastQuestion ? (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={!allAnswered || completing}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    >
                      {completing ? 'Submitting...' : 'Submit Quiz'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                      Next Question
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Normal lesson content (your original code)
          <div className="p-8">
            {/* ... your existing content for VIDEO/TEXT/AUDIO ... */}
            {/* Keep this part unchanged */}
          </div>
        )}
      </div>

      {/* Final Quiz Result */}
      {showQuizResult && (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            {quizScore >= 85 ? "Congratulations!" : "Keep Practicing!"}
          </h2>
          <p className="text-2xl mb-6">
            Your score: <span className={quizScore >= 85 ? "text-green-600" : "text-red-600"}>{quizScore}%</span>
          </p>
          <p className="text-gray-600 mb-8">
            {quizScore >= 85 
              ? "You passed! This lesson is now marked as completed." 
              : "You need 85% to complete this lesson. Try again!"}
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleRetryQuiz}
              className="px-8 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Retry Quiz
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Back to Course
            </button>
          </div>
        </div>
      )}

      {/* Next Lesson Suggestion */}
      <div className="bg-indigo-100 dark:bg-indigo-50 border border-indigo-300 dark:border-indigo-200 rounded-xl p-6">
        <h3 className="font-semibold text-indigo-900 dark:text-indigo-900 mb-2">Keep Learning!</h3>
        <p className="text-indigo-800 dark:text-indigo-700 text-sm mb-4">
          Complete this lesson to unlock the next one and continue your learning journey.
        </p>
        <button
          onClick={() => navigate('/ai-tutor')}
          className="text-indigo-700 dark:text-indigo-600 hover:text-indigo-800 dark:hover:text-indigo-700 font-medium text-sm flex items-center gap-2"
        >
          Need help? Ask the AI Tutor →
        </button>
      </div>
    </div>
  );
}