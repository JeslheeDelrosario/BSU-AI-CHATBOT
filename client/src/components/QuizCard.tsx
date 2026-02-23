// QuizCard Component - Compact card with 'Open' button (like Google AI Studio)
import { FileText } from 'lucide-react';

interface QuizCardProps {
  exam: {
    id: string;
    title: string;
    description: string;
    subject: string;
    difficulty: string;
    totalQuestions: number;
    estimatedTime: number;
    createdAt?: string;
  };
  onClick: () => void;
}

export default function QuizCard({ exam, onClick }: QuizCardProps) {
  // Format the date/time
  const formatDateTime = () => {
    if (exam.createdAt) {
      const date = new Date(exam.createdAt);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
    return new Date().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-800/50 dark:bg-slate-800/80 border border-white/10 rounded-xl hover:border-white/20 transition-colors group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-700/50 flex items-center justify-center">
          <FileText className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-white truncate">
            {exam.title}
          </h3>
          <p className="text-xs text-gray-500">
            {formatDateTime()}
          </p>
        </div>
      </div>
      <button
        onClick={onClick}
        className="flex-shrink-0 px-4 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-sm font-medium rounded-lg transition-colors"
      >
        Open
      </button>
    </div>
  );
}
