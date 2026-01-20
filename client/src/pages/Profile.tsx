// client/src/pages/Profile.tsx
// User Profile Management Page

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { User, Mail, Phone, BookOpen, Users, Camera, Save, Loader2 } from 'lucide-react';
import api from '../lib/api';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { settings } = useAccessibility();
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    course: '',
    section: '',
    avatar: ''
  });

  const [programs, setPrograms] = useState<Array<{ id: string; title: string; abbreviation: string; college: string }>>([]);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        course: user.course || '',
        section: user.section || '',
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
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phoneNumber: profileData.phoneNumber,
        course: profileData.course,
        section: profileData.section
      });

      if (res.data) {
        updateUser(res.data);
        alert(settings.language === 'fil' ? 'Profile na-update na!' : 'Profile updated successfully!');
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, we'll use a placeholder. In production, upload to cloud storage
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
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10">
        <h1 className="text-4xl lg:text-5xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4">
          {settings.language === 'fil' ? 'Aking Profile' : 'My Profile'}
        </h1>
        <p className="text-lg text-slate-600 dark:text-gray-400">
          {settings.language === 'fil' 
            ? 'Pamahalaan ang iyong personal na impormasyon at mga kurso' 
            : 'Manage your personal information and enrolled courses'}
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10">
          
          {/* Profile Photo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  getInitials()
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-cyan-600 transition-all shadow-lg">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-4 text-sm text-gray-400">
              {settings.language === 'fil' ? 'I-click ang camera icon para mag-upload ng larawan' : 'Click camera icon to upload photo'}
            </p>
          </div>

          {/* Personal Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-cyan-500" />
              {settings.language === 'fil' ? 'Personal na Impormasyon' : 'Personal Information'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {settings.language === 'fil' ? 'Pangalan' : 'First Name'}
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {settings.language === 'fil' ? 'Apelyido' : 'Last Name'}
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {settings.language === 'fil' ? 'Email Address' : 'Email Address'}
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  disabled
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-500 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {settings.language === 'fil' ? 'Hindi maaaring baguhin ang email' : 'Email cannot be changed'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {settings.language === 'fil' ? 'Numero ng Telepono' : 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={e => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                  placeholder="+63 912 345 6789"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-500" />
              {settings.language === 'fil' ? 'Impormasyon sa Pag-aaral' : 'Academic Information'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {settings.language === 'fil' ? 'Kurso' : 'Registered Course'}
                </label>
                <select
                  value={profileData.course}
                  onChange={e => setProfileData({ ...profileData, course: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30"
                >
                  <option value="" className="bg-slate-800">
                    {settings.language === 'fil' ? 'Pumili ng kurso' : 'Select a course'}
                  </option>
                  {programs.map(program => (
                    <option key={program.id} value={program.abbreviation || program.title} className="bg-slate-800">
                      {program.abbreviation || program.title}
                    </option>
                  ))}
                </select>
                {programs.length === 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    {settings.language === 'fil' ? 'Naglo-load ng mga kurso...' : 'Loading programs...'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {settings.language === 'fil' ? 'Seksyon' : 'Section'}
                </label>
                <input
                  type="text"
                  value={profileData.section}
                  onChange={e => setProfileData({ ...profileData, section: e.target.value })}
                  placeholder={settings.language === 'fil' ? 'hal. 1A, 2B, 3C' : 'e.g. 1A, 2B, 3C'}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                />
              </div>
            </div>

            {profileData.course && profileData.section && (
              <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                <p className="text-sm text-slate-900 dark:text-white">
                  <span className="font-semibold">
                    {settings.language === 'fil' ? 'Nakarehistro sa:' : 'Registered in:'}
                  </span>{' '}
                  {profileData.course} - Section {profileData.section}
                </p>
              </div>
            )}
          </div>

          {/* Enrolled Courses Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-pink-500" />
              {settings.language === 'fil' ? 'Mga Naka-enroll na Kurso' : 'Enrolled Courses'}
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <p className="text-gray-400 text-center">
                {settings.language === 'fil' 
                  ? 'Makikita mo dito ang iyong mga naka-enroll na kurso' 
                  : 'Your enrolled courses will appear here'}
              </p>
              {/* TODO: Fetch and display enrolled courses from API */}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
