// client/src/pages/Classrooms.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { Users, Plus, LogIn, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface Classroom {
  id: string;
  name: string;
  section?: string;
  description?: string;
  inviteCode: string;
  Course: {
    title: string;
  };
  ClassroomMembers: Array<{
    role: string;
    User: {
      id: string;
      firstName: string;
      lastName: string;
    };
  }>;
  _count: {
    ClassroomMembers: number;
    ClassroomPosts: number;
  };
}

export default function Classrooms() {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBrowse, setLoadingBrowse] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-room' | 'browse'>('my-room');
  const [allClassrooms, setAllClassrooms] = useState<Classroom[]>([]);

  useEffect(() => {
    fetchClassrooms();
    if (activeTab === 'browse') {
      fetchAllClassrooms();
    }
  }, [activeTab]);

  const fetchClassrooms = async () => {
    try {
      const res = await api.get('/classrooms');
      setClassrooms(res.data);
    } catch (error) {
      console.error('Failed to fetch classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllClassrooms = async () => {
    setLoadingBrowse(true);
    try {
      const res = await api.get('/classrooms/browse/all');
      setAllClassrooms(res.data);
    } catch (error) {
      console.error('Failed to fetch all classrooms:', error);
    } finally {
      setLoadingBrowse(false);
    }
  };

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'ADMIN';

  const displayedClassrooms = activeTab === 'my-room' ? classrooms : allClassrooms;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
              {settings.language === 'fil' ? 'Mga Classroom' : 'Classrooms'}
            </h1>
            <p className="text-lg text-slate-600 dark:text-gray-400">
              {settings.language === 'fil' 
                ? 'Pamahalaan at mag-browse ng mga virtual classroom' 
                : 'Manage and browse virtual classrooms'}
            </p>
          </div>
          
          <div className="flex gap-3">
            {isTeacher && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                <Plus className="w-5 h-5" />
                {settings.language === 'fil' ? 'Gumawa ng Classroom' : 'Create Classroom'}
              </button>
            )}
            
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-white/10 transition-all"
            >
              <LogIn className="w-5 h-5" />
              {settings.language === 'fil' ? 'Sumali sa Classroom' : 'Join Classroom'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('my-room')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'my-room'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {settings.language === 'fil' ? 'Aking Silid' : 'My Room'}
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'browse'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {settings.language === 'fil' ? 'Mag-browse' : 'Browse Classroom'}
          </button>
        </div>
      </div>

      {/* Classrooms Grid */}
      <div className="max-w-7xl mx-auto mt-6">
        {(activeTab === 'browse' && loadingBrowse) ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
          </div>
        ) : displayedClassrooms.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-20 h-20 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {settings.language === 'fil' ? 'Walang Classroom' : 'No Classrooms Yet'}
            </h3>
            <p className="text-gray-400 mb-6">
              {settings.language === 'fil' 
                ? 'Gumawa o sumali sa isang classroom para magsimula' 
                : 'Create or join a classroom to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedClassrooms.map((classroom) => {
              const teacher = classroom.ClassroomMembers.find(m => m.role === 'TEACHER');
              return (
                <Link
                  key={classroom.id}
                  to={`/classrooms/${classroom.id}`}
                  className="block bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/10 hover:shadow-xl hover:shadow-cyan-500/20 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 group-hover:text-cyan-400 transition-colors">
                        {classroom.name}
                      </h3>
                      {classroom.section && (
                        <p className="text-sm text-gray-400">{classroom.section}</p>
                      )}
                    </div>
                    <Users className="w-6 h-6 text-cyan-400" />
                  </div>

                  <p className="text-sm text-gray-400 mb-4">{classroom.Course.title}</p>

                  {teacher && (
                    <p className="text-sm text-gray-500 mb-4">
                      {teacher.User.firstName} {teacher.User.lastName}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{classroom._count.ClassroomMembers} {settings.language === 'fil' ? 'miyembro' : 'members'}</span>
                      <span>{classroom._count.ClassroomPosts} {settings.language === 'fil' ? 'post' : 'posts'}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create Classroom</h2>
            <p className="text-gray-400 mb-4">Create classroom modal coming soon...</p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Join Modal Placeholder */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-6">
          <div className="bg-card border border-border rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Join Classroom</h2>
            <p className="text-gray-400 mb-4">Join classroom modal coming soon...</p>
            <button
              onClick={() => setShowJoinModal(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
