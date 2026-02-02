import { useState, useEffect } from 'react';
import { Gift, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import api from '../lib/api';

interface Holiday {
  id: string;
  name: string;
  date: string;
  type: 'NATIONAL' | 'REGIONAL' | 'LOCAL' | 'SPECIAL_NON_WORKING' | 'REGULAR_HOLIDAY';
  region: string;
  description?: string;
  isRecurring: boolean;
}

const HOLIDAY_TYPE_COLORS: { [key: string]: string } = {
  REGULAR_HOLIDAY: 'bg-red-500',
  SPECIAL_NON_WORKING: 'bg-orange-500',
  NATIONAL: 'bg-blue-500',
  REGIONAL: 'bg-purple-500',
  LOCAL: 'bg-green-500',
};

const HOLIDAY_TYPE_LABELS: { [key: string]: string } = {
  REGULAR_HOLIDAY: 'Regular Holiday',
  SPECIAL_NON_WORKING: 'Special Non-Working',
  NATIONAL: 'National',
  REGIONAL: 'Regional',
  LOCAL: 'Local',
};

export default function HolidayCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchHolidays();
  }, [currentDate]);

  useEffect(() => {
    filterHolidays();
  }, [holidays, selectedRegion, selectedType]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await api.get('/holidays', {
        params: { year, month }
      });

      setHolidays(response.data.holidays);
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHolidays = () => {
    let filtered = [...holidays];

    if (selectedRegion !== 'ALL') {
      filtered = filtered.filter(h => h.region === selectedRegion);
    }

    if (selectedType !== 'ALL') {
      filtered = filtered.filter(h => h.type === selectedType);
    }

    setFilteredHolidays(filtered);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getHolidaysForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    
    return filteredHolidays.filter(holiday => {
      const holidayDate = new Date(holiday.date).toISOString().split('T')[0];
      return holidayDate === dateStr;
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() &&
           currentDate.getMonth() === today.getMonth() &&
           currentDate.getFullYear() === today.getFullYear();
  };

  const days = getDaysInMonth();
  const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-600/20 rounded-2xl">
            <Gift className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Holiday Calendar</h2>
            <p className="text-sm text-gray-400">Philippines, Bulacan & Malolos</p>
          </div>
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all"
        >
          <Filter className="w-4 h-4 text-white" />
          <span className="text-white font-semibold">Filters</span>
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Region</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="ALL">All Regions</option>
                <option value="PHILIPPINES">Philippines</option>
                <option value="BULACAN">Bulacan</option>
                <option value="MALOLOS">Malolos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="ALL">All Types</option>
                <option value="REGULAR_HOLIDAY">Regular Holiday</option>
                <option value="SPECIAL_NON_WORKING">Special Non-Working</option>
                <option value="NATIONAL">National</option>
                <option value="REGIONAL">Regional</option>
                <option value="LOCAL">Local</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
          <h3 className="text-xl font-bold text-white">{monthYear}</h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day Headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-semibold text-gray-400 py-2">
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dayHolidays = getHolidaysForDay(day);
            const today = isToday(day);

            return (
              <div
                key={day}
                className={`aspect-square border rounded-xl p-2 ${
                  today
                    ? 'border-cyan-500 bg-cyan-500/20 ring-2 ring-cyan-500'
                    : dayHolidays.length > 0
                    ? 'border-red-500/50 bg-red-500/10'
                    : 'border-white/10 hover:bg-white/5'
                } transition-all`}
              >
                <div className={`text-sm font-semibold mb-1 ${
                  today ? 'text-cyan-400' : 'text-white'
                }`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayHolidays.map(holiday => (
                    <div
                      key={holiday.id}
                      className={`${HOLIDAY_TYPE_COLORS[holiday.type]} text-white text-xs px-1 py-0.5 rounded truncate`}
                      title={`${holiday.name} - ${HOLIDAY_TYPE_LABELS[holiday.type]}`}
                    >
                      {holiday.name}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-sm font-semibold text-white mb-3">Holiday Types</h4>
          <div className="flex flex-wrap gap-3">
            {Object.entries(HOLIDAY_TYPE_LABELS).map(([type, label]) => (
              <div key={type} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${HOLIDAY_TYPE_COLORS[type]}`} />
                <span className="text-xs text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Holidays List */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">
          Holidays This Month ({filteredHolidays.length})
        </h3>
        {filteredHolidays.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No holidays this month</p>
        ) : (
          <div className="space-y-3">
            {filteredHolidays.map(holiday => (
              <div
                key={holiday.id}
                className="flex items-start gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
              >
                <div className={`w-1 h-full ${HOLIDAY_TYPE_COLORS[holiday.type]} rounded-full`} />
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">{holiday.name}</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(holiday.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      {holiday.description && (
                        <p className="text-xs text-gray-500 mt-2">{holiday.description}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      <span className={`text-xs px-2 py-1 rounded ${HOLIDAY_TYPE_COLORS[holiday.type]} text-white`}>
                        {HOLIDAY_TYPE_LABELS[holiday.type]}
                      </span>
                      <span className="text-xs px-2 py-1 bg-white/10 text-gray-300 rounded">
                        {holiday.region}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
