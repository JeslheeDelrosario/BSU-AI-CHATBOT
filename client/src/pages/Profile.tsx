// client/src/pages/Profile.tsx
// User Profile Management Page

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { User, Mail, Phone, BookOpen, Users, Camera, Save, Loader2, GraduationCap, CheckCircle, XCircle, X } from 'lucide-react';
import api from '../lib/api';

interface EnrolledCourse {
  id: string;
  courseId: string;
  progress: number;
  Course: {
    id: string;
    title: string;
    description?: string;
  };
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { settings } = useAccessibility();
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    course: '',
    section: '',
    gradeLevel: '',
    avatar: ''
  });

  const [programs, setPrograms] = useState<Array<{ id: string; title: string; abbreviation: string; college: string }>>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        course: user.course || '',
        section: user.section || '',
        gradeLevel: (user as any).gradeLevel || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await api.get('/programs');
        setPrograms(res.data);
      } catch (error) {
        console.error('Failed to fetch programs:', error);
      }
    };
    fetchPrograms();
    fetchEnrolledCourses();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchEnrolledCourses = async () => {
    setLoadingCourses(true);
    try {
      const res = await api.get('/courses/my-enrollments');
      const data = res.data?.enrollments ?? (Array.isArray(res.data) ? res.data : []);
      setEnrolledCourses(data);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        course: profileData.course,
        section: profileData.section,
        gradeLevel: profileData.gradeLevel,
        avatar: profileData.avatar || undefined
      });

      if (res.data) {
        updateUser(res.data);
        setToast({ message: settings.language === 'fil' ? 'Profile na-update na!' : 'Profile updated successfully!', type: 'success' });
      }
    } catch (error: any) {
      setToast({ message: error.response?.data?.error || 'Failed to update profile', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit file size to 500KB for base64 storage (free, no cloud needed)
    if (file.size > 512000) {
      setToast({ message: settings.language === 'fil' ? 'Ang file ay masyadong malaki (max 500KB)' : 'File too large (max 500KB)', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData({ ...profileData, avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const getInitials = () => {
    return `${profileData.firstName[0] || ''}${profileData.lastName[0] || ''}`.toUpperCase();
  };

  return (
    <div className="min-h-screen py-10 px-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${
          toast.type === 'success' ? 'bg-green-50 dark:bg-green-900/80 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/80 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10">
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
          {settings.language === 'fil' ? 'Aking Profile' : 'My Profile'}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          {settings.language === 'fil' 
            ? 'Pamahalaan ang iyong personal na impormasyon at mga kurso' 
            : 'Manage your personal information and enrolled courses'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 lg:p-10">
          
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-xl">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  getInitials()
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-9 h-9 bg-cyan-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-600 transition-all shadow-lg ring-2 ring-white dark:ring-slate-800">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
              {settings.language === 'fil' ? 'I-click ang camera icon (max 500KB)' : 'Click camera icon to upload (max 500KB)'}
            </p>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-cyan-500" />
              {settings.language === 'fil' ? 'Personal na Impormasyon' : 'Personal Information'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {settings.language === 'fil' ? 'Pangalan' : 'First Name'}
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {settings.language === 'fil' ? 'Apelyido' : 'Last Name'}
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-400 dark:text-slate-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  {settings.language === 'fil' ? 'Hindi maaaring baguhin ang email' : 'Email cannot be changed'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {settings.language === 'fil' ? 'Numero ng Telepono' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={e => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                  placeholder="+63 912 345 6789"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              {settings.language === 'fil' ? 'Impormasyon sa Pag-aaral' : 'Academic Information'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  {settings.language === 'fil' ? 'Kurso' : 'Registered Course'}
                </label>
                <select
                  value={profileData.course}
                  onChange={e => setProfileData({ ...profileData, course: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="" className="bg-white dark:bg-slate-800">
                    {settings.language === 'fil' ? 'Pumili ng kurso' : 'Select a course'}
                  </option>
                  {programs.map(program => (
                    <option key={program.id} value={program.abbreviation || program.title} className="bg-white dark:bg-slate-800">
                      {program.abbreviation ? `${program.abbreviation} - ${program.title}` : program.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  {settings.language === 'fil' ? 'Antas ng Taon' : 'Year Level'}
                </label>
                <select
                  value={profileData.gradeLevel}
                  onChange={e => setProfileData({ ...profileData, gradeLevel: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="" className="bg-white dark:bg-slate-800">
                    {settings.language === 'fil' ? 'Pumili ng taon' : 'Select year level'}
                  </option>
                  <option value="1st Year" className="bg-white dark:bg-slate-800">1st Year</option>
                  <option value="2nd Year" className="bg-white dark:bg-slate-800">2nd Year</option>
                  <option value="3rd Year" className="bg-white dark:bg-slate-800">3rd Year</option>
                  <option value="4th Year" className="bg-white dark:bg-slate-800">4th Year</option>
                  <option value="5th Year" className="bg-white dark:bg-slate-800">5th Year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {settings.language === 'fil' ? 'Seksyon' : 'Section'}
                </label>
                <input
                  type="text"
                  value={profileData.section}
                  onChange={e => setProfileData({ ...profileData, section: e.target.value })}
                  placeholder={settings.language === 'fil' ? 'hal. 1A, 2B, 3C' : 'e.g. 1A, 2B, 3C'}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>
            </div>

            {profileData.course && (
              <div className="mt-4 p-4 bg-cyan-50 dark:bg-cyan-500/10 border border-cyan-200 dark:border-cyan-500/30 rounded-xl">
                <p className="text-sm text-slate-900 dark:text-white">
                  <span className="font-semibold">
                    {settings.language === 'fil' ? 'Nakarehistro sa:' : 'Registered in:'}
                  </span>{' '}
                  {profileData.course}
                  {profileData.gradeLevel && ` • ${profileData.gradeLevel}`}
                  {profileData.section && ` • Section ${profileData.section}`}
                </p>
              </div>
            )}
          </div>

          {/* Enrolled Courses Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-500" />
              {settings.language === 'fil' ? 'Mga Naka-enroll na Kurso' : 'Enrolled Courses'}
            </h2>
            {loadingCourses ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {settings.language === 'fil' 
                    ? 'Wala ka pang naka-enroll na kurso. Pumunta sa Courses para mag-enroll.' 
                    : 'No enrolled courses yet. Visit Courses to enroll.'}
                </p>
                <a href="/courses" className="inline-block mt-3 text-sm text-cyan-500 hover:text-cyan-400 font-semibold">
                  {settings.language === 'fil' ? 'Tingnan ang mga Kurso →' : 'Browse Courses →'}
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {enrolledCourses.map(enrollment => (
                  <div key={enrollment.id} className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{enrollment.Course.title}</p>
                      {enrollment.Course.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{enrollment.Course.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="w-24 h-2 bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all"
                          style={{ width: `${enrollment.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-10 text-right">
                        {Math.round(enrollment.progress || 0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {settings.language === 'fil' ? 'Sine-save...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {settings.language === 'fil' ? 'I-save ang Profile' : 'Save Profile'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
