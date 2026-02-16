// client/src/pages/LessonViewer.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import {
  ArrowLeft, CheckCircle, Clock, FileText, Video, Headphones, XCircle, Brain, Check
} from 'lucide-react';
import { useToast } from '../components/Toast';
export default function LessonViewer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [startTime] = useState(Date.now());
  const { showToast } = useToast();
  //For non-quiz completion
  const [canComplete, setCanComplete] = useState(false);
  const MIN_TIME_TO_COMPLETE = 0; // 30 seconds – change to 0 for instant complete

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/lessons/${id}`);
      let fetchedLesson = response.data.lesson;

      // Clean inline dark colors that break dark mode
      if (fetchedLesson.content) {
        // Type the callback parameters to satisfy TypeScript
        const cleanedContent = fetchedLesson.content.replace(
          /style\s*=\s*["']([^"']*)color\s*:\s*(black|#000000|rgb\(0,\s*0,\s*0\)|#000)[^"']*["']/gi,
          (match: string, p1: string) => `style="${p1}"`  // Keep other styles, remove only the bad color part
        ).replace(
          /color\s*:\s*(black|#000000|rgb\(0,\s*0,\s*0\)|#000)/gi,
          ''  // Remove any remaining color properties
        );

        fetchedLesson = {
          ...fetchedLesson,
          content: cleanedContent,
        };
      }

      setLesson(fetchedLesson);
      setProgress(response.data.progress);

      setCourseLessons(response.data.courseLessons || []);


      // Parse quiz data if needed
      if (fetchedLesson.type === 'QUIZ' && fetchedLesson.content) {
        try {
          const parsed = JSON.parse(fetchedLesson.content);
          setQuizData({
            instructions: parsed.instructions || 'Answer the following questions.',
            questions: parsed.questions || [],
          });
        } catch (parseError) {
          console.error('Failed to parse quiz JSON:', parseError);
        }
      }
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  // Quiz states
  const [quizData, setQuizData] = useState<{
    instructions: string;
    questions: Array<{
      text: string;
      explanation: string | null;
      answers: Array<{ text: string; isCorrect: boolean }>;
    }>;
  } | null>(null);

  const lessonTypeDisplay: Record<string, string> = {
    TEXT: 'Reading',
    READ: 'Reading',
    VIDEO: 'Video',
    AUDIO: 'Audio',
    QUIZ: 'Quiz',
    INTERACTIVE: 'Interactive',
    ASSIGNMENT: 'Assignment',
    
  };

  useEffect(() => {
    fetchLesson();
  }, [id]);

  // NEW: Timer for non-quiz lessons – enable complete button after min time
  useEffect(() => {
    if (!lesson || lesson.type === 'QUIZ' || progress?.completed) return;

    const timer = setTimeout(() => {
      setCanComplete(true);
    }, MIN_TIME_TO_COMPLETE);

    return () => clearTimeout(timer);
  }, [lesson, progress]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins} min ${secs} sec` : `${secs} sec`;
  };

  const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;

    // Common YouTube URL patterns
    const patterns = [
      // youtu.be short links
      /(?:youtu\.be\/)([^#&?]{11})/,
      // youtube.com/watch?v=...
      /youtube\.com\/watch\?.*v=([^#&?]{11})/,
      // youtube.com/embed/...
      /youtube\.com\/embed\/([^#&?]{11})/,
      // youtube.com/v/...
      /youtube\.com\/v\/([^#&?]{11})/,
      // General fallback - capture 11-char ID after v= or / or ?v=
      /[?&]v=([^#&?]{11})/,
    ];

    for (const regex of patterns) {
      const match = url.match(regex);
      if (match && match[1]) {
        const videoId = match[1];
        // Use privacy-enhanced domain + rel=0 to hide related videos
        // No autoplay, allow fullscreen
        return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
      }
    }

    return null; // Not a YouTube link we recognize
  };

  // NEW: Mark non-quiz lesson as complete
  const handleMarkComplete = async () => {
    if (progress?.completed) return;

    setCompleting(true);
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

    try {
      await api.post(`/lessons/${id}/progress`, {
        completed: true,
        timeSpent: elapsedSeconds,
        score: null, // no score for non-quiz
      });

      setProgress({ ...progress, completed: true });

      showToast({
        type: 'success',
        title: 'Lesson Completed!',
        message: 'Great job! You can now proceed to the next lesson.'
      });

      // Auto-redirect back to course after 1.5 seconds
      // setTimeout(() => {
      //   navigate(`/courses/${lesson.courseId}`);
      // }, 30000);
    } catch (err: any) {
      console.error('Failed to mark complete:', err);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to mark lesson as complete. Try again.'
      });
    } finally {
      setCompleting(false);
    }
  };

  const handleGoToNext = () => {
    if (nextLesson) {
      navigate(`/lessons/${nextLesson.id}`);
    } else {
      navigate(`/courses/${lesson.courseId}`);
    }
  };


  const handleSelectAnswer = (qIndex: number, optionText: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: optionText }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < (quizData?.questions.length || 0) - 1) {
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
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    setTimeTaken(elapsedSeconds);

    if (!quizData) return;

    let correctCount = 0;
    quizData.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answers.find(a => a.isCorrect)?.text) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quizData.questions.length) * 100);
    setQuizScore(score);
    setShowQuizResult(true);

    if (score >= 85) {
      try {
        await api.post(`/lessons/${id}/progress`, {
          completed: true,
          timeSpent: elapsedSeconds,
          score,
        });
        setProgress({ ...progress, completed: true, score });

        // setTimeout(() => {
        //   navigate(`/courses/${lesson.courseId}`);
        // }, 30000);
      } catch (err) {
        console.error('Failed to save progress:', err);
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
    setTimeTaken(0);
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO': return <Video className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />;
      case 'AUDIO': return <Headphones className="w-10 h-10 text-purple-600 dark:text-purple-400" />;
      case 'TEXT': return <FileText className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />;
      case 'QUIZ': return <Brain className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />;
      default: return <FileText className="w-10 h-10 text-gray-500 dark:text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="text-center py-20 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950">
        Lesson not found
      </div>
    );
  }

  const currentLessonIndex = courseLessons.findIndex(
    (l) => l.id === lesson?.id
  );

  const nextLesson =
    currentLessonIndex !== -1 &&
    currentLessonIndex < courseLessons.length - 1
      ? courseLessons[currentLessonIndex + 1]
      : null;


  const isQuiz = lesson.type === 'QUIZ';
  const currentQuestion = quizData?.questions[currentQuestionIndex];
  const selectedAnswer = selectedAnswers[currentQuestionIndex];
  const isSubmitted = submittedQuestions.has(currentQuestionIndex);
  const isLastQuestion = currentQuestionIndex === (quizData?.questions.length || 0) - 1;
  const allAnswered = Object.keys(selectedAnswers).length === (quizData?.questions.length || 0);
  const isCompleted = progress?.completed;
  const showNextButton = isCompleted || (isQuiz && showQuizResult && quizScore >= 85);
  
  const showCompleteButton = !isQuiz && !progress?.completed && canComplete;
  const youtubeEmbedSrc = getYouTubeEmbedUrl(lesson.videoUrl);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8  min-h-screen">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {progress?.completed && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
            <CheckCircle className="w-5 h-5" />
            Completed
          </div>
        )}
      </div>

      {/* Lesson Card */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-cyan-500/30 rounded-2xl overflow-hidden shadow-lg dark:shadow-cyan-900/20">
        {/* Header Gradient - toned down for light mode */}
        <div className="bg-gradient-to-r from-cyan-600 to-purple-600 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            {getLessonIcon(lesson.type)}
            <div>
              <span className="text-lg font-large uppercase tracking-wider opacity-90">
                {lessonTypeDisplay[lesson.type] || lesson.type.toLowerCase()}
              </span>
              <div className="flex items-center gap-3 text-sm opacity-90 mt-1">
                <Clock className="w-4 h-4" />
                {lesson.duration || '?'} min
              </div>
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black">{lesson.title}</h1>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-10">
          {isQuiz ? (
            <>
              <div className="mb-10 prose prose-slate dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
      <div
        dangerouslySetInnerHTML={{
          __html:
            quizData?.instructions?.trim() ||
            'Test your knowledge. Score 85%+ to unlock the next lesson.',
        }}
      />
    </div>

              <div className="mb-10">
                <div className="flex justify-between text-sm text-gray-600 dark:text-cyan-300/80 mb-2">
                  <span>Question {currentQuestionIndex + 1} / {quizData?.questions.length || 0}</span>
                  <span>
                    {Math.round(((currentQuestionIndex + 1) / (quizData?.questions.length || 1)) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-300 dark:border-cyan-500/20">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-500"
                    style={{ width: `${((currentQuestionIndex + 1) / (quizData?.questions.length || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {quizData && quizData.questions.length > 0 ? (
                <div className="space-y-10">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-cyan-500/20 rounded-xl p-6 md:p-8 shadow-sm">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      {currentQuestion?.text}
                    </h3>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {currentQuestion?.answers.map((option: any, idx: number) => (
                        <label
                          key={idx}
                          className={`
                            flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all duration-300
                            ${selectedAnswer === option.text
                              ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40'
                              : 'border-gray-300 dark:border-gray-700 hover:border-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/20'}
                            ${isSubmitted && option.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : ''}
                            ${isSubmitted && selectedAnswer === option.text && !option.isCorrect
                              ? 'border-red-500 bg-red-50 dark:bg-red-950/30' : ''}
                          `}
                        >
                          <input
                            type="radio"
                            name={`q-${currentQuestionIndex}`}
                            checked={selectedAnswer === option.text}
                            onChange={() => handleSelectAnswer(currentQuestionIndex, option.text)}
                            disabled={isSubmitted}
                            className="w-5 h-5 accent-cyan-600 dark:accent-cyan-400"
                          />
                          <span className="text-gray-800 dark:text-gray-200 flex-1">
                            {String.fromCharCode(65 + idx)}. {option.text}
                          </span>
                        </label>
                      ))}
                    </div>

                    {isSubmitted && currentQuestion && (
                      <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                        {selectedAnswer === currentQuestion.answers.find((a: any) => a.isCorrect)?.text ? (
                          <div className="flex gap-4 text-green-700 dark:text-green-400">
                            <CheckCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-lg">Correct!</p>
                              {currentQuestion.explanation && (
                                <p className="mt-2 text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-4 text-red-700 dark:text-red-400">
                            <XCircle className="w-6 h-6 mt-1 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-lg">Incorrect</p>
                              <p className="mt-1 text-gray-700 dark:text-gray-300">
                                Correct answer: <span className="font-medium text-gray-900 dark:text-white">
                                  {currentQuestion.answers.find((a: any) => a.isCorrect)?.text}
                                </span>
                              </p>
                              {currentQuestion.explanation && (
                                <p className="mt-3 text-gray-700 dark:text-gray-300">{currentQuestion.explanation}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
                    <button
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      className="px-8 py-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-xl disabled:opacity-50 transition disabled:cursor-not-allowed border border-gray-300 dark:border-gray-700"
                    >
                      Previous
                    </button>

                    {isLastQuestion ? (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={!allAnswered || completing}
                        className={`
                          px-10 py-4 rounded-xl font-bold transition-all duration-300
                          ${allAnswered && !completing
                            ? 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
                        `}
                      >
                        {completing ? 'Submitting...' : 'Submit Quiz'}
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl transition hover:scale-105"
                      >
                        Next Question →
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-600 dark:text-gray-400 py-12">
                  No questions available for this quiz.
                </p>
              )}
            </>
          ) : (
            <div className="space-y-6 text-gray-800 dark:text-gray-200">
              {['TEXT', 'READ', 'INTERACTIVE', 'ASSIGNMENT', 'QUIZ'].includes(lesson.type) &&
              lesson.content &&
              lesson.content.trim() !== '' &&
              lesson.content !== '<p><br></p>' && (
                <div className="max-w-none text-base leading-relaxed text-gray-800 dark:text-gray-200">
                  <div
                    className={`
                      ql-editor                           
                      prose prose-slate dark:prose-invert 
                      max-w-none
                      text-gray-800 dark:text-gray-200
                      leading-relaxed
                      [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-6
                      [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-5
                      [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-4
                      [&_p]:mb-4
                      [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
                      [&_ol]:ml-6 [&_ol]:mb-4
                      [&_li]:mb-2
                      [&_strong]:font-bold
                      [&_a]:text-cyan-600 dark:[&_a]:text-cyan-400 [&_a]:underline
                      [&_pre]:bg-gray-800 [&_pre]:text-gray-200 [&_pre]:p-4 [&_pre]:rounded
                      [&_code]:bg-gray-800 [&_code]:text-cyan-300 [&_code]:px-2 [&_code]:rounded
                    `}
                    dangerouslySetInnerHTML={{ __html: lesson.content }}
                  />
                </div>
              )}

              {lesson.videoUrl && (
                <>
                  {youtubeEmbedSrc ? (
                    // YouTube case → responsive iframe
                    <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden border border-gray-200 dark:border-cyan-500/30 shadow-md dark:shadow-cyan-900/20">
                      <iframe
                        className="absolute inset-0 w-full h-full"
                        src={youtubeEmbedSrc}
                        title={lesson.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    // Direct video file case → native <video>
                    <video
                      src={lesson.videoUrl}
                      controls
                      className="w-full rounded-xl border border-gray-200 dark:border-cyan-500/30 shadow-md dark:shadow-cyan-900/20"
                    />
                  )}
                </>
              )}

              {lesson.audioUrl && (
                <audio
                  src={lesson.audioUrl}
                  controls
                  className="w-full mt-6"
                />
              )}
              {/* NEW: Complete button for non-quiz lessons */}
              {showCompleteButton && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={handleMarkComplete}
                    disabled={completing}
                    className={`
                      flex items-center gap-3 px-10 py-5 text-lg font-bold rounded-2xl transition-all duration-300
                      ${completing 
                        ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:scale-105'
                      }
                    `}
                  >
                    <Check className="w-6 h-6" />
                    {completing ? 'Marking as Complete...' : 'Mark Lesson as Complete'}
                  </button>
                </div>
              )}

              {/* Already completed message */}
              {progress?.completed && (
                <div className="text-center py-8">
                  <div className="inline-flex items-center gap-3 px-8 py-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-2xl text-green-700 dark:text-green-300 font-medium">
                    <CheckCircle className="w-6 h-6" />
                    This lesson is already completed
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* NEW: Next Lesson Button – appears after completion */}
     
{showNextButton && (
  <div className="flex justify-center mt-10 gap-6 flex-wrap">
    {nextLesson ? (
      <button
        onClick={handleGoToNext}
        className="flex items-center gap-3 px-12 py-5 text-xl font-bold 
                   bg-gradient-to-r from-cyan-600 to-purple-600 
                   hover:from-cyan-500 hover:to-purple-500 text-white 
                   rounded-2xl transition-all duration-300 
                   shadow-xl shadow-cyan-500/40 hover:shadow-cyan-500/60 
                   hover:scale-105"
      >
        Next Lesson →
      </button>
    ) : (
      <button
        onClick={() => navigate(`/courses/${lesson.courseId}`)}
        className="flex items-center gap-3 px-12 py-5 text-xl font-bold 
                   bg-gradient-to-r from-emerald-600 to-teal-600 
                   hover:from-emerald-500 hover:to-teal-500 text-white 
                   rounded-2xl transition-all duration-300 
                   shadow-xl shadow-emerald-500/40 hover:shadow-emerald-500/60 
                   hover:scale-105"
      >
        Back to Course Overview
      </button>
    )}
  </div>
)}

      {/* Result Panel */}
      {showQuizResult && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-cyan-500/30 rounded-2xl p-8 md:p-12 shadow-xl dark:shadow-cyan-900/20 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">
            {quizScore >= 85 ? "Congratulations!" : "REBOOT REQUIRED"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto mb-10">
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-cyan-500/20 rounded-xl p-6">
              <p className="text-cyan-700 dark:text-cyan-300 text-lg mb-2">Your Score</p>
              <p className={`text-5xl font-black ${quizScore >= 85 ? 'text-green-600' : 'text-red-600'}`}>
                {quizScore}%
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-cyan-500/20 rounded-xl p-6">
              <p className="text-cyan-700 dark:text-cyan-300 text-lg mb-2">Time Taken</p>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-300">
                {formatTime(timeTaken)}
              </p>
            </div>
          </div>

          <p className="text-xl text-gray-700 dark:text-gray-300 mb-10">
            {quizScore >= 85
              ? "Access granted. Lesson completed."
              : "85% required to unlock next content. Retry to improve."}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6">
            {quizScore >= 85 ? (
              <>
                <button
                  onClick={handleRetryQuiz}
                  className="px-10 py-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-cyan-600 text-gray-800 dark:text-cyan-300 rounded-xl transition hover:scale-105"
                >
                  Retry Challenge
                </button>

                <button
  onClick={handleGoToNext}
  className="..."
>
  {nextLesson ? "Proceed to Next Lesson →" : "Finish Course 🎉"}
</button>

              </>
            ) : (
              <>
                <button
                  onClick={handleRetryQuiz}
                  className="px-10 py-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-300 dark:border-cyan-600 text-gray-800 dark:text-cyan-300 rounded-xl transition hover:scale-105"
                >
                  Try Again
                </button>

                <button
                  onClick={() => navigate(`/courses/${lesson.courseId}`)}
                  className="px-10 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-xl font-bold transition hover:scale-105 shadow-lg shadow-cyan-500/30"
                >
                  Back to Course Overview
                </button>
              </>
            )}
          </div>

          
        </div>
      )}

      {/* AI Tutor CTA */}
      <div className="text-center">
        <button
          onClick={() => navigate('/ai-tutor')}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white rounded-xl font-medium transition hover:scale-105 shadow-lg shadow-cyan-500/30"
        >
          <Brain className="w-6 h-6" />
          Need help? Ask AI Tutor
        </button>
      </div>
    </div>
  );
}