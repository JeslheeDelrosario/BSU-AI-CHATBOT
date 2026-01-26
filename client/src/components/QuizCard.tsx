// QuizCard Component - Clickable card to open quiz modal
import { FileText, Clock, Award, ChevronRight } from 'lucide-react';

interface QuizCardProps {
  exam: {
    id: string;
    title: string;
    description: string;
    subject: string;
    difficulty: string;
    totalQuestions: number;
    estimatedTime: number;
  };
  onClick: () => void;
}

export default function QuizCard({ exam, onClick }: QuizCardProps) {
  const difficultyColors = {
    Easy: 'bg-green-500/20 text-green-400 border-green-500/50',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    Hard: 'bg-red-500/20 text-red-400 border-red-500/50',
    Mixed: 'bg-purple-500/20 text-purple-400 border-purple-500/50'
  };

  const difficultyColor = difficultyColors[exam.difficulty as keyof typeof difficultyColors] || difficultyColors.Mixed;

  return (
    <button
      onClick={onClick}
      className="w-full text-left group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02]"
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-white mb-1 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                {exam.title}
              </h3>
              {exam.description && (
                <p className="text-sm text-gray-400 line-clamp-2">
                  {exam.description}
                </p>
              )}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className={`px-3 py-1 rounded-full border ${difficultyColor} font-medium`}>
            {exam.difficulty}
          </div>
          
          <div className="flex items-center gap-1.5 text-gray-400">
            <FileText className="w-4 h-4" />
            <span>{exam.totalQuestions} questions</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{exam.estimatedTime} min</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-gray-400">
            <Award className="w-4 h-4" />
            <span>{exam.subject}</span>
          </div>
        </div>

        {/* Click indicator */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-500 group-hover:text-cyan-400 transition-colors">
            Click to start practice exam →
          </p>
        </div>
      </div>
    </button>
  );
}
