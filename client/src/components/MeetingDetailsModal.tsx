import { useState } from 'react';
import { X, Calendar, Video, Users, User, Trash2, ExternalLink } from 'lucide-react';
import api from '../lib/api';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  meetingType: string;
  googleMeetLink: string;
  startTime: string;
  endTime: string;
  status: string;
  CreatedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count: {
    Attendees: number;
  };
}

interface MeetingDetailsModalProps {
  meeting: Meeting;
  classroomId: string;
  isTeacher: boolean;
  currentUserId: string;
  onClose: () => void;
  onUpdate: () => void;
}

const MEETING_TYPE_LABELS: { [key: string]: string } = {
  LECTURE: 'Lecture',
  LAB_SESSION: 'Lab Session',
  DISCUSSION: 'Discussion',
  EXAM: 'Exam',
  QUIZ: 'Quiz',
  OFFICE_HOURS: 'Office Hours',
  REVIEW_SESSION: 'Review Session',
  WORKSHOP: 'Workshop',
  SEMINAR: 'Seminar',
  GROUP_WORK: 'Group Work',
};

const STATUS_COLORS: { [key: string]: string } = {
  SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  IN_PROGRESS: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function MeetingDetailsModal({
  meeting,
  classroomId,
  isTeacher,
  currentUserId,
  onClose,
  onUpdate
}: MeetingDetailsModalProps) {
  const [joining, setJoining] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const getDuration = () => {
    const start = new Date(meeting.startTime);
    const end = new Date(meeting.endTime);
    const minutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  const canJoin = () => {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const fifteenMinBefore = new Date(startTime.getTime() - 15 * 60000);
    return now >= fifteenMinBefore && meeting.status !== 'CANCELLED' && meeting.status !== 'COMPLETED';
  };

  const handleJoinMeeting = async () => {
    try {
      setJoining(true);
      const response = await api.post(`/classrooms/${classroomId}/meetings/${meeting.id}/join`);
      window.open(response.data.googleMeetLink, '_blank');
      onUpdate();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to join meeting');
    } finally {
      setJoining(false);
    }
  };

  const handleDeleteMeeting = async () => {
    if (!confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/classrooms/${classroomId}/meetings/${meeting.id}`);
      onUpdate();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete meeting');
      setDeleting(false);
    }
  };

  const canEdit = isTeacher || meeting.CreatedBy.id === currentUserId;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {meeting.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_COLORS[meeting.status]}`}>
                  {meeting.status.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm font-semibold">
                  {MEETING_TYPE_LABELS[meeting.meetingType]}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date and Time */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-cyan-500 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatDateTime(meeting.startTime)}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)} ({getDuration()})
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-purple-500 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  Created by {meeting.CreatedBy.firstName} {meeting.CreatedBy.lastName}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">
                  {meeting._count.Attendees} attendees
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {meeting.description && (
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                Description
              </h3>
              <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                {meeting.description}
              </p>
            </div>
          )}

          {/* Google Meet Link */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Video className="w-5 h-5 text-cyan-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Google Meet Link
              </h3>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
              <a
                href={meeting.googleMeetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-600 dark:text-cyan-400 hover:underline break-all flex items-center gap-2"
              >
                {meeting.googleMeetLink}
                <ExternalLink className="w-4 h-4 flex-shrink-0" />
              </a>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {canEdit && (
                  <button
                    onClick={handleDeleteMeeting}
                    disabled={deleting}
                    className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Close
                </button>
                {canJoin() && (
                  <button
                    onClick={handleJoinMeeting}
                    disabled={joining}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Video className="w-5 h-5" />
                    {joining ? 'Joining...' : 'Join Meeting'}
                  </button>
                )}
              </div>
            </div>

            {!canJoin() && meeting.status === 'SCHEDULED' && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-3 text-right">
                You can join this meeting 15 minutes before it starts
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
