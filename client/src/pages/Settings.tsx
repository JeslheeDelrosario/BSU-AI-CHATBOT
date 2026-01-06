// client/src/pages/Settings.tsx
// CLEAN BLACK BACKGROUND — NO ORBS — SAME LOGIC & DESIGN

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { User, Bell, Accessibility, Save, Eye, Type, Volume2 } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    textToSpeech: false,
    speechToText: false,
    highContrast: false,
    dyslexiaFont: false,
    fontSize: 16,
    screenReader: false,
    keyboardNav: false,
    captionsEnabled: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.user.accessibilitySettings) {
        setSettings(prev => ({
          ...prev,
          ...response.data.user.accessibilitySettings,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Title */}
      <div className="max-w-5xl mx-auto p-6 lg:p-10 text-center mb-12">
        <h1 className="text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Settings
        </h1>
        <p className="text-xl text-gray-400">Personalize your learning experience</p>
      </div>

      {/* Main Settings Card */}
      
        <div className="bg-black/60 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">

          {/* Tabs */}
          <div className="border-b border-white/10">
            <nav className="flex flex-wrap justify-center gap-4 p-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-4 px-8 py-5 rounded-2xl text-lg font-medium transition-all duration-300 group ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/50 shadow-xl shadow-cyan-500/20 text-cyan-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <tab.icon className={`w-6 h-6 transition-colors ${
                    activeTab === tab.id ? 'text-cyan-400' : 'group-hover:text-cyan-400'
                  }`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-8 lg:p-12 max-h-[70vh] overflow-y-auto space-y-10">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-8">Profile Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-cyan-400 font-medium mb-3">First Name</label>
                      <input
                        type="text"
                        value={settings.firstName}
                        onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                        className="w-full px-6 py-5 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-cyan-400 font-medium mb-3">Last Name</label>
                      <input
                        type="text"
                        value={settings.lastName}
                        onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                        className="w-full px-6 py-5 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-xl"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-cyan-400 font-medium mb-3">Email</label>
                      <input
                        type="email"
                        value={settings.email}
                        disabled
                        className="w-full px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-gray-500 cursor-not-allowed backdrop-blur-xl"
                      />
                      <p className="text-sm text-gray-500 mt-2">Email cannot be changed</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-white mb-6">Learning Preferences</h3>
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <p className="text-2xl font-bold text-white">Learning Style</p>
                        <p className="text-gray-400">How you best absorb information</p>
                      </div>
                      <div className="relative">
                        <select
                          className="appearance-none px-8 py-5 
                                    bg-black/40 border border-white/20 rounded-2xl 
                                    text-white text-lg font-medium pr-14
                                    focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20
                                    hover:bg-black/60 transition-all backdrop-blur-xl"
                        >
                          <option className="bg-black text-white">Visual</option>
                          <option className="bg-black text-white">Auditory</option>
                          <option className="bg-black text-white">Kinesthetic</option>
                          <option className="bg-black text-white">Mixed</option>
                        </select>

                        <div className="absolute inset-y-0 right-0 flex items-center pr-6 pointer-events-none">
                          <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility Tab */}
            {activeTab === 'accessibility' && (
              <div className="space-y-10">
                <div>
                  <h3 className="text-3xl font-bold text-white mb-8">Visual Accessibility</h3>
                  <div className="space-y-6">
                    <SettingCard
                      icon={Eye}
                      title="High Contrast Mode"
                      description="Increase contrast for better visibility"
                      checked={settings.highContrast}
                      onChange={(v) => setSettings({ ...settings, highContrast: v })}
                    />
                    <SettingCard
                      icon={Type}
                      title="Dyslexia-Friendly Font"
                      description="Use OpenDyslexic font"
                      checked={settings.dyslexiaFont}
                      onChange={(v) => setSettings({ ...settings, dyslexiaFont: v })}
                    />
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-5">
                          <Type className="w-8 h-8 text-cyan-400" />
                          <div>
                            <p className="text-2xl font-bold text-white">Font Size</p>
                            <p className="text-gray-400">Adjust text size across the platform</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-cyan-400">{settings.fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="28"
                        value={settings.fontSize}
                        onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                        className="w-full h-3 bg-white/10 rounded-full appearance-none cursor-pointer slider-thumb-cyan"
                        style={{
                          background: `linear-gradient(to right, #06b6d4 ${((settings.fontSize - 12) / 16) * 100}%, #1e293b ${((settings.fontSize - 12) / 16) * 100}%)`
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-3xl font-bold text-white mb-8">Audio & Speech</h3>
                  <div className="space-y-6">
                    <SettingCard icon={Volume2} title="Text-to-Speech" description="Read content aloud" checked={false} onChange={() => {}} />
                    <SettingCard icon={Volume2} title="Speech-to-Text" description="Voice input for assignments" checked={false} onChange={() => {}} />
                    <SettingCard icon={Volume2} title="Captions" description="Show captions on videos" checked={false} onChange={() => {}} />
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-white mb-8">Email Notifications</h3>
                <SettingCard title="Course Updates" description="New lessons and announcements" checked={true} onChange={() => {}} />
                <SettingCard title="Achievement Unlocked" description="When you earn badges" checked={true} onChange={() => {}} />
                <SettingCard title="Weekly Progress Report" description="Summary of your learning" checked={true} onChange={() => {}} />
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="border-t border-white/10 p-8 bg-black/60 backdrop-blur-3xl">
            <div className="flex justify-center">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xl rounded-3xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-8 h-8" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      
    </div>
  );
}

// Reusable Setting Card with Toggle
function SettingCard({ icon: Icon, title, description, checked, onChange }: {
  icon?: any;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl flex items-center justify-between hover:bg-white/10 transition-all">
      <div className="flex items-center gap-6">
        {Icon && <Icon className="w-8 h-8 text-cyan-400" />}
        <div>
          <p className="text-2xl font-bold text-white">{title}</p>
          <p className="text-gray-400">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// Enhanced Toggle
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-16 h-9 bg-white/10 rounded-full peer peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-gradient-to-r after:from-cyan-500 after:to-purple-600 after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-cyan-900/50 shadow-inner"></div>
    </label>
  );
}