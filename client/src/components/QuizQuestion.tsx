// QuizQuestion Component - Production Ready
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { useState } from 'react';

interface QuizQuestionProps {
  question: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: 'easy' | 'medium' | 'hard';
  };
  questionNumber: number;
  selectedAnswer: string | null;
  showFeedback: boolean;
  onAnswerSelect: (answer: string) => void;
  language: string;
}

export default function QuizQuestion({
  question,
  questionNumber,
  selectedAnswer,
  showFeedback,
  onAnswerSelect,
  language
}: QuizQuestionProps) {
  const [showHint, setShowHint] = useState(false);

  const isCorrect = selectedAnswer === question.correctAnswer;
  const difficultyColors = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400'
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-400">
              {language === 'fil' ? 'Tanong' : 'Question'} {questionNumber}
            </span>
            <span className={`text-xs font-medium ${difficultyColors[question.difficulty]}`}>
              {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-white leading-relaxed">
            {question.question}
          </h3>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const optionLetter = option.charAt(0); // A, B, C, D
          const isSelected = selectedAnswer === optionLetter;
          const isCorrectOption = optionLetter === question.correctAnswer;
          
          let optionClass = 'bg-white/5 border-white/10 hover:bg-white/10';
          if (showFeedback) {
            if (isSelected && isCorrect) {
              optionClass = 'bg-green-500/20 border-green-500 ring-2 ring-green-500/50';
            } else if (isSelected && !isCorrect) {
              optionClass = 'bg-red-500/20 border-red-500 ring-2 ring-red-500/50';
            } else if (isCorrectOption) {
              optionClass = 'bg-green-500/10 border-green-500/50';
            }
          } else if (isSelected) {
            optionClass = 'bg-cyan-500/20 border-cyan-500 ring-2 ring-cyan-500/50';
          }

          return (
            <button
              key={index}
              onClick={() => !showFeedback && onAnswerSelect(optionLetter)}
              disabled={showFeedback}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${optionClass} ${
                showFeedback ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  showFeedback && isCorrectOption
                    ? 'bg-green-500 text-white'
                    : showFeedback && isSelected && !isCorrect
                    ? 'bg-red-500 text-white'
                    : isSelected
                    ? 'bg-cyan-500 text-white'
                    : 'bg-white/10 text-gray-300'
                }`}>
                  {optionLetter}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{option.substring(3)}</p>
                </div>
                {showFeedback && isCorrectOption && (
                  <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                )}
                {showFeedback && isSelected && !isCorrect && (
                  <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`p-4 rounded-xl border-2 ${
          isCorrect
            ? 'bg-green-500/10 border-green-500/50'
            : 'bg-red-500/10 border-red-500/50'
        }`}>
          <div className="flex items-start gap-3">
            {isCorrect ? (
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-bold mb-2 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {isCorrect
                  ? (language === 'fil' ? "Tama! 🎉" : "That's right! 🎉")
                  : (language === 'fil' ? "Hindi tama" : "Not quite")}
              </p>
              <p className="text-gray-300 leading-relaxed">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hint Button */}
      {!showFeedback && (
        <button
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <Lightbulb className="w-4 h-4" />
          {showHint
            ? (language === 'fil' ? 'Itago ang hint' : 'Hide hint')
            : (language === 'fil' ? 'Ipakita ang hint' : 'Show hint')}
        </button>
      )}

      {showHint && !showFeedback && (
        <div className="p-4 bg-yellow-500/10 border-2 border-yellow-500/50 rounded-xl">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-gray-300 text-sm">
              {language === 'fil'
                ? `Isipin ang mga pangunahing konsepto ng ${question.difficulty} na tanong na ito.`
                : `Think about the key concepts for this ${question.difficulty} question.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
