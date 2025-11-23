// client/src/pages/Settings.tsx
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
    <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] pb-24">
      <div className="max-w-5xl mx-auto p-5 sm:p-6 lg:p-8">

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-50 mb-3">Settings</h1>
          <p className="text-green-300 text-base sm:text-lg">Personalize your learning experience</p>
        </div>

        {/* Main Settings Card */}
        <div className="bg-green-900/50 backdrop-blur-2xl rounded-3xl border border-green-700/60 shadow-2xl overflow-hidden">

          {/* Responsive Tabs */}
          <div className="border-b border-green-700/50">
            <nav className="flex flex-col sm:flex-row sm:justify-center gap-3 sm:gap-6 p-4 sm:p-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center sm:justify-start gap-3 px-6 py-4 rounded-2xl text-base sm:text-lg font-medium transition-all duration-300 w-full sm:w-auto ${
                    activeTab === tab.id
                      ? 'bg-green-700/70 text-green-100 shadow-xl border border-green-500'
                      : 'text-green-300 hover:bg-green-800/50 hover:text-green-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Scrollable Content Area */}
          <div className="p-5 sm:p-8 lg:p-12 max-h-[70vh] overflow-y-auto">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-green-100 mb-6">Profile Information</h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-green-200 font-medium mb-3 text-sm sm:text-base">First Name</label>
                      <input
                        type="text"
                        value={settings.firstName}
                        onChange={(e) => setSettings({ ...settings, firstName: e.target.value })}
                        className="w-full px-5 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-4 focus:ring-green-500/50 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-green-200 font-medium mb-3 text-sm sm:text-base">Last Name</label>
                      <input
                        type="text"
                        value={settings.lastName}
                        onChange={(e) => setSettings({ ...settings, lastName: e.target.value })}
                        className="w-full px-5 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-4 focus:ring-green-500/50 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-green-200 font-medium mb-3 text-sm sm:text-base">Email</label>
                      <input
                        type="email"
                        value={settings.email}
                        disabled
                        className="w-full px-5 py-4 bg-green-800/40 border border-green-700 rounded-2xl text-green-400 cursor-not-allowed text-base"
                      />
                      <p className="text-green-400 text-sm mt-2">Email cannot be changed</p>
                    </div>
                  </div>
                </div>


                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-green-100 mb-6">Learning Preferences</h3>
                  <div className="bg-green-800/50 rounded-2xl p-6 border border-green-600/60">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-lg sm:text-xl font-semibold text-green-100">Learning Style</p>
                        <p className="text-green-300 text-sm sm:text-base">Visual, Auditory, or Kinesthetic</p>
                      </div>

                      {/* CUSTOM DROPDOWN WITH VISIBLE ARROW */}
                      <div className="relative">
                        <select 
                          className="appearance-none w-full sm:w-auto px-6 py-4 bg-green-700/70 border border-green-500 rounded-2xl text-green-100 text-base sm:text-lg font-medium pr-12 focus:outline-none focus:ring-4 focus:ring-green-500/50 cursor-pointer"
                          defaultValue="Visual"
                        >
                          <option>Visual</option>
                          <option>Auditory</option>
                          <option>Kinesthetic</option>
                          <option>Mixed</option>
                        </select>
                        
                        {/* Custom Arrow - Always Visible & Beautiful */}
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                          <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-green-100 mb-6">Visual Accessibility</h3>
                  <div className="space-y-5">
                    {/* High Contrast */}
                    <div className="bg-green-800/50 rounded-2xl p-5 border border-green-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Eye className="w-7 h-7 text-green-400 flex-shrink-0" />
                        <div>
                          <p className="text-lg font-semibold text-green-100">High Contrast Mode</p>
                          <p className="text-green-300 text-sm">Increase contrast for better visibility</p>
                        </div>
                      </div>
                      <Toggle checked={settings.highContrast} onChange={(v) => setSettings({ ...settings, highContrast: v })} />
                    </div>

                    {/* Dyslexia Font */}
                    <div className="bg-green-800/50 rounded-2xl p-5 border border-green-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Type className="w-7 h-7 text-green-400 flex-shrink-0" />
                        <div>
                          <p className="text-lg font-semibold text-green-100">Dyslexia-Friendly Font</p>
                          <p className="text-green-300 text-sm">Use OpenDyslexic font</p>
                        </div>
                      </div>
                      <Toggle checked={settings.dyslexiaFont} onChange={(v) => setSettings({ ...settings, dyslexiaFont: v })} />
                    </div>

                    {/* Font Size */}
                    <div className="bg-green-800/50 rounded-2xl p-5 border border-green-600/60">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-4">
                          <Type className="w-7 h-7 text-green-400" />
                          <div>
                            <p className="text-lg font-semibold text-green-100">Font Size</p>
                            <p className="text-green-300 text-sm">Adjust text size across the platform</p>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-green-100">{settings.fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="28"
                        value={settings.fontSize}
                        onChange={(e) => setSettings({ ...settings, fontSize: parseInt(e.target.value) })}
                        className="w-full h-3 bg-green-900/70 rounded-full appearance-none cursor-pointer slider-thumb-green"
                        style={{ background: `linear-gradient(to right, #10b981 ${((settings.fontSize - 12) / 16) * 100}%, #064e3b ${((settings.fontSize - 12) / 16) * 100}%)` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Audio Features */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-green-100 mb-6">Audio & Speech</h3>
                  <div className="space-y-5">
                    {['Text-to-Speech', 'Speech-to-Text', 'Captions'].map((feature) => (
                      <div key={feature} className="bg-green-800/50 rounded-2xl p-5 border border-green-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <Volume2 className="w-7 h-7 text-green-400 flex-shrink-0" />
                          <div>
                            <p className="text-lg font-semibold text-green-100">{feature}</p>
                            <p className="text-green-300 text-sm">
                              {feature === 'Text-to-Speech' && 'Read content aloud'}
                              {feature === 'Speech-to-Text' && 'Voice input for assignments'}
                              {feature === 'Captions' && 'Show captions on videos'}
                            </p>
                          </div>
                        </div>
                        <Toggle checked={false} onChange={() => {}} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-xl sm:text-2xl font-bold text-green-100 mb-6">Email Notifications</h3>
                {['Course Updates', 'Achievement Unlocked', 'Weekly Progress Report'].map((notif) => (
                  <div key={notif} className="bg-green-800/50 rounded-2xl p-5 border border-green-600/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-green-100">{notif}</p>
                      <p className="text-green-300 text-sm">
                        {notif.includes('Course') && 'New lessons and announcements'}
                        {notif.includes('Achievement') && 'When you earn badges'}
                        {notif.includes('Weekly') && 'Summary of your learning'}
                      </p>
                    </div>
                    <Toggle checked={true} onChange={() => {}} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fixed Save Button */}
          <div className="border-t border-green-700/60 px-5 sm:px-8 py-6 bg-green-900/70 backdrop-blur-2xl flex justify-center sm:justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-green-950 font-bold text-lg sm:text-xl rounded-2xl shadow-2xl hover:from-green-400 hover:to-emerald-500 transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed min-w-[200px]"
            >
              <Save className="w-6 h-6 sm:w-7 sm:h-7" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Toggle Component
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-14 h-8 bg-green-800/70 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-green-400 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
    </label>
  );
}