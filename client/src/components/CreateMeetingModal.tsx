import { useState } from 'react';
import { X, Calendar, Clock, Video, FileText, Users } from 'lucide-react';
import api from '../lib/api';

interface CreateMeetingModalProps {
  classroomId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const MEETING_TYPES = [
  { value: 'LECTURE', label: 'Lecture' },
  { value: 'LAB_SESSION', label: 'Lab Session' },
  { value: 'DISCUSSION', label: 'Discussion' },
  { value: 'EXAM', label: 'Exam' },
  { value: 'QUIZ', label: 'Quiz' },
  { value: 'OFFICE_HOURS', label: 'Office Hours' },
  { value: 'REVIEW_SESSION', label: 'Review Session' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'SEMINAR', label: 'Seminar' },
  { value: 'GROUP_WORK', label: 'Group Work' },
];

const DURATIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 150, label: '2.5 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' },
];

export default function CreateMeetingModal({ classroomId, onClose, onSuccess }: CreateMeetingModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingType: 'LECTURE',
    googleMeetLink: '',
    date: '',
    time: '',
    duration: 60,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.googleMeetLink || !formData.date || !formData.time) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.googleMeetLink.includes('meet.google.com')) {
      setError('Please enter a valid Google Meet link');
      return;
    }

    try {
      setSubmitting(true);

      const startDateTime = new Date(`${formData.date}T${formData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60000);

      await api.post(`/classrooms/${classroomId}/meetings`, {
        title: formData.title,
        description: formData.description || null,
        meetingType: formData.meetingType,
        googleMeetLink: formData.googleMeetLink,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create meeting');
    } finally {
      setSubmitting(false);
    }
  };

  const generateGoogleMeetLink = () => {
    // Generate Google Meet format: xxx-yyyy-zzz
    const generateSegment = (length: number) => {
      return Math.random().toString(36).substring(2, 2 + length);
    };
    
    const part1 = generateSegment(3);
    const part2 = generateSegment(4);
    const part3 = generateSegment(3);
    
    setFormData({ ...formData, googleMeetLink: `https://meet.google.com/${part1}-${part2}-${part3}` });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Meeting</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Meeting Title <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to Data Structures"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                maxLength={200}
              />
            </div>
          </div>

          {/* Meeting Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Meeting Type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={formData.meetingType}
                onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none cursor-pointer"
              >
                {MEETING_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add meeting details, agenda, or notes..."
              rows={3}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
              maxLength={2000}
            />
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={getTomorrowDate()}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Duration <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none cursor-pointer"
              >
                {DURATIONS.map(duration => (
                  <option key={duration.value} value={duration.value}>{duration.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Google Meet Link */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Google Meet Link <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <div className="relative">
                <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  value={formData.googleMeetLink}
                  onChange={(e) => setFormData({ ...formData, googleMeetLink: e.target.value })}
                  placeholder="https://meet.google.com/xxx-xxxx-xxx"
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={generateGoogleMeetLink}
                className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Generate sample link (replace with your actual Google Meet link)
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
