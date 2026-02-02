import { useState } from 'react';
import { Calendar, CalendarDays, CalendarRange, CalendarClock, List, Gift, Cloud, ChevronDown } from 'lucide-react';

export type CalendarViewType = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'SCHEDULE' | 'HOLIDAY' | 'WEATHER';

interface ViewOption {
  value: CalendarViewType;
  label: string;
  icon: any;
  description: string;
}

interface CalendarViewSelectorProps {
  currentView: CalendarViewType;
  onViewChange: (view: CalendarViewType) => void;
}

const VIEW_OPTIONS: ViewOption[] = [
  { 
    value: 'DAY', 
    label: 'Day', 
    icon: Calendar,
    description: 'View today\'s schedule'
  },
  { 
    value: 'WEEK', 
    label: 'Week', 
    icon: CalendarDays,
    description: 'View this week\'s schedule'
  },
  { 
    value: 'MONTH', 
    label: 'Month', 
    icon: CalendarRange,
    description: 'View monthly calendar'
  },
  { 
    value: 'YEAR', 
    label: 'Year', 
    icon: CalendarClock,
    description: 'View yearly overview'
  },
  { 
    value: 'SCHEDULE', 
    label: 'Schedule', 
    icon: List,
    description: 'View all meetings list'
  },
  { 
    value: 'HOLIDAY', 
    label: 'Holidays', 
    icon: Gift,
    description: 'View holiday calendar'
  },
  { 
    value: 'WEATHER', 
    label: 'Weather', 
    icon: Cloud,
    description: 'View weather forecast'
  }
];

export default function CalendarViewSelector({ currentView, onViewChange }: CalendarViewSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const currentOption = VIEW_OPTIONS.find(opt => opt.value === currentView) || VIEW_OPTIONS[2];
  const CurrentIcon = currentOption.icon;

  const handleSelect = (view: CalendarViewType) => {
    onViewChange(view);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl transition-all group"
      >
        <CurrentIcon className="w-5 h-5 text-cyan-400" />
        <span className="font-semibold text-white">{currentOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 w-72 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50">
            <div className="p-2">
              {VIEW_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = option.value === currentView;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/30 to-purple-600/30 border border-cyan-500/50'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? 'bg-cyan-500/20' 
                        : 'bg-white/5'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isSelected ? 'text-cyan-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1 text-left">
                      <div className={`font-semibold ${
                        isSelected ? 'text-cyan-400' : 'text-white'
                      }`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
