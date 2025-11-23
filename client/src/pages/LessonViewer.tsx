import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, CheckCircle, Clock, FileText, Video, Headphones } from 'lucide-react';

export default function LessonViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    try {
      const response = await api.get(`/lessons/${id}`);
      setLesson(response.data.lesson);
      setProgress(response.data.progress);
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setCompleting(true);
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);
    
    try {
      await api.post(`/lessons/${id}/progress`, {
        completed: true,
        timeSpent,
        score: 100,
      });
      alert('Lesson completed! Great job! 🎉');
      navigate(-1);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update progress');
    } finally {
      setCompleting(false);
    }
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-6 h-6" />;
      case 'AUDIO':
        return <Headphones className="w-6 h-6" />;
      case 'READING':
        return <FileText className="w-6 h-6" />;
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        {progress?.completed && (
          <span className="flex items-center gap-2 text-green-600 font-medium">
            <CheckCircle className="w-5 h-5" />
            Completed
          </span>
        )}
      </div>

      {/* Lesson Content */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Lesson Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            {getLessonIcon(lesson.type)}
            <span className="text-sm font-medium opacity-90">
              {lesson.type.charAt(0) + lesson.type.slice(1).toLowerCase()}
            </span>
            <span className="text-sm opacity-75">•</span>
            <span className="text-sm opacity-90 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {lesson.duration} minutes
            </span>
          </div>
          <h1 className="text-3xl font-bold">{lesson.title}</h1>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {/* Video/Interactive Content Placeholder */}
          {lesson.type === 'VIDEO' && (
            <div className="aspect-video bg-gray-900 rounded-lg mb-6 flex items-center justify-center">
              <div className="text-center text-white">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Video Player</p>
                <p className="text-sm opacity-75 mt-2">
                  Video content would be displayed here
                </p>
                <p className="text-xs opacity-50 mt-1">
                  URL: {lesson.videoUrl || 'Not configured'}
                </p>
              </div>
            </div>
          )}

          {lesson.type === 'INTERACTIVE' && (
            <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg mb-6 flex items-center justify-center border-2 border-dashed border-indigo-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎮</span>
                </div>
                <p className="text-lg font-medium text-gray-900">Interactive Content</p>
                <p className="text-sm text-gray-600 mt-2">
                  Interactive exercises would be displayed here
                </p>
              </div>
            </div>
          )}

          {/* Lesson Content */}
          <div className="prose max-w-none">
            <div className="text-gray-700 leading-relaxed">
              {lesson.content ? (
                <div dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br/>') }} />
              ) : (
                <p className="text-gray-500 italic">No content available for this lesson yet.</p>
              )}
            </div>
          </div>

          {/* Resources */}
          {lesson.resources && lesson.resources.length > 0 && (
            <div className="mt-8 pt-8 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lesson.resources.map((resource: any) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                  >
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-medium text-gray-900">{resource.title}</p>
                      <p className="text-sm text-gray-500 capitalize">{resource.type.toLowerCase()}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="bg-gray-50 px-8 py-6 flex items-center justify-between border-t">
          <div className="text-sm text-gray-600">
            {progress?.timeSpent ? (
              <span>Time spent: {Math.floor(progress.timeSpent / 60)} minutes</span>
            ) : (
              <span>Start learning to track your progress</span>
            )}
          </div>
          
          {!progress?.completed && (
            <button
              onClick={handleComplete}
              disabled={completing}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              {completing ? 'Completing...' : 'Mark as Complete'}
            </button>
          )}
        </div>
      </div>

      {/* Next Lesson Suggestion */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
        <h3 className="font-semibold text-indigo-900 mb-2">Keep Learning!</h3>
        <p className="text-indigo-700 text-sm mb-4">
          Complete this lesson to unlock the next one and continue your learning journey.
        </p>
        <button
          onClick={() => navigate('/ai-tutor')}
          className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-2"
        >
          Need help? Ask the AI Tutor →
        </button>
      </div>
    </div>
  );
}
