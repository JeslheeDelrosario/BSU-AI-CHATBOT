// client/src/pages/Settings.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import { User, Bell, Accessibility, Save, Eye, Type, Volume2, Globe } from 'lucide-react';
import { useTranslation } from '../lib/translations';

export default function Settings() {
  const { user } = useAuth();
  const { settings: accessibilitySettings, updateSettings: updateAccessibility, saveSettings: saveAccessibilitySettings } = useAccessibility();
  const { showToast } = useToast();
  const t = useTranslation(accessibilitySettings.language);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [profileSettings, setProfileSettings] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  // Local state for pending accessibility changes (only applied on Save)
  const [pendingAccessibilitySettings, setPendingAccessibilitySettings] = useState(accessibilitySettings);

  const [notificationSettings, setNotificationSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('tisaNotificationSettings');
      return saved ? JSON.parse(saved) : { courseUpdates: true, achievements: true, weeklyReport: true, learningStyle: 'visual' };
    } catch { return { courseUpdates: true, achievements: true, weeklyReport: true, learningStyle: 'visual' }; }
  });

  useEffect(() => {
    fetchSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync pending settings when accessibility settings load from server
  useEffect(() => {
    setPendingAccessibilitySettings(accessibilitySettings);
  }, [accessibilitySettings]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/auth/me');
      if (response.data.user) {
        setProfileSettings(prev => ({
          ...prev,
          firstName: response.data.user.firstName || prev.firstName,
          lastName: response.data.user.lastName || prev.lastName,
          email: response.data.user.email || prev.email,
        }));
      }
    } catch (error) {
      showToast({ type: 'error', title: t.settings.messages.updateFailed });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Apply pending accessibility settings
      Object.keys(pendingAccessibilitySettings).forEach(key => {
        if (pendingAccessibilitySettings[key as keyof typeof pendingAccessibilitySettings] !== 
            accessibilitySettings[key as keyof typeof accessibilitySettings]) {
          updateAccessibility({ [key]: pendingAccessibilitySettings[key as keyof typeof pendingAccessibilitySettings] });
        }
      });

      // Save accessibility settings
      const accessibilitySaved = await saveAccessibilitySettings();
      
      // Save profile settings
      await api.put('/auth/profile', {
        firstName: profileSettings.firstName,
        lastName: profileSettings.lastName,
      });

      // Persist notification settings to localStorage
      localStorage.setItem('tisaNotificationSettings', JSON.stringify(notificationSettings));

      if (accessibilitySaved) {
        showToast({ type: 'success', title: t.settings.messages.profileUpdated });
      } else {
        showToast({
          type: 'warning',
          title: 'Partially Saved',
          message: 'Profile saved, but some accessibility settings may not have persisted.',
        });
      }
    } catch (error) {
      showToast({ type: 'error', title: t.settings.messages.updateFailed });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t.settings.tabs.profile, icon: User },
    { id: 'accessibility', label: t.settings.tabs.accessibility, icon: Accessibility },
    { id: 'notifications', label: t.settings.tabs.notifications, icon: Bell },
  ];

  return (
    <div className="min-h-screen text-foreground py-5 lg:py-2.5">
      {/* Scoped Cyberpunk Scrollbar Styles - Only affects this page */}
      <style>{`
        .settings-cyberpunk-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .settings-cyberpunk-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .settings-cyberpunk-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #06b6d4, #a855f7);
          border-radius: 6px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .settings-cyberpunk-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #0891b2, #9333ea);
          background-clip: content-box;
        }
      `}</style>

      {/* Page Title */}
      <div className="max-w-5xl mx-auto px-6 text-center mb-8">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 pb-1 md:pb-4 leading-tight md:leading-snug inline-block">
          {t.settings.title}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          {t.settings.description}
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-card/80 backdrop-blur-3xl rounded-3xl border border-border shadow-2xl overflow-hidden">

          {/* Tabs */}
          <div className="border-b border-border">
            <nav className="flex flex-wrap justify-center gap-3 sm:gap-5 p-5 sm:p-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-5 sm:px-7 py-3.5 sm:py-4 
                    rounded-2xl text-base sm:text-lg font-medium 
                    transition-all duration-300 group
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/20 text-cyan-300'
                      : 'text-muted-foreground hover:text-cyan-400 hover:bg-card/60 border border-transparent'
                    }
                  `}
                >
                  <tab.icon className={`
                    w-5 h-5 sm:w-6 sm:h-6 transition-colors
                    ${activeTab === tab.id ? 'text-cyan-400' : 'text-muted-foreground group-hover:text-cyan-400'}
                  `} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Scrollable Content with Custom Scrollbar */}
          <div className="p-6 sm:p-8 lg:p-10 max-h-[65vh] overflow-y-auto settings-cyberpunk-scrollbar space-y-12">
            
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-12">
                <section>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">{t.settings.profile.title}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-semibold text-foreground mb-3">{t.settings.profile.firstName}</label>
                      <input
                        type="text"
                        value={profileSettings.firstName}
                        onChange={(e) => setProfileSettings({ ...profileSettings, firstName: e.target.value })}
                        className="w-full px-5 py-4 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-lg font-semibold text-foreground mb-3">{t.settings.profile.lastName}</label>
                      <input
                        type="text"
                        value={profileSettings.lastName}
                        onChange={(e) => setProfileSettings({ ...profileSettings, lastName: e.target.value })}
                        className="w-full px-5 py-4 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-lg font-semibold text-foreground mb-3">{t.settings.profile.email}</label>
                      <input
                        type="email"
                        value={profileSettings.email}
                        disabled
                        className="w-full px-5 py-4 bg-card/40 border border-border/50 rounded-2xl text-muted-foreground cursor-not-allowed"
                      />
                      <p className="text-sm text-muted-foreground mt-3">{t.settings.profile.emailDescription}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">{t.settings.notifications.title}</h3>
                  <div className="bg-card/60 border border-border rounded-3xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-foreground">{t.settings.notifications.learningStyle}</p>
                        <p className="text-muted-foreground mt-1">{t.settings.notifications.learningStyleDescription}</p>
                      </div>
                      <div className="relative">
                        <select
                          value={notificationSettings.learningStyle}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, learningStyle: e.target.value })}
                          className="appearance-none px-6 py-4 bg-card/80 border border-border rounded-2xl text-foreground text-base sm:text-lg font-medium pr-12 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 hover:bg-card/90 transition-all"
                        >
                          <option value="visual">{t.settings.notifications.learningStyleOptions.visual}</option>
                          <option value="auditory">{t.settings.notifications.learningStyleOptions.auditory}</option>
                          <option value="kinesthetic">{t.settings.notifications.learningStyleOptions.kinesthetic}</option>
                          <option value="mixed">{t.settings.notifications.learningStyleOptions.mixed}</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Accessibility Tab */}
            {activeTab === 'accessibility' && (
              <div className="space-y-12">
                {/* Language Section */}
                <section>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">{t.settings.accessibility.language.title}</h3>
                  <div className="bg-card/60 border border-border rounded-3xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 flex-shrink-0" />
                        <div>
                          <p className="text-xl sm:text-2xl font-bold text-foreground">{t.settings.accessibility.language.systemLanguage}</p>
                          <p className="text-muted-foreground">{t.settings.accessibility.language.description}</p>
                        </div>
                      </div>
                      <div className="relative">
                        <select 
                          value={pendingAccessibilitySettings.language}
                          onChange={(e) => setPendingAccessibilitySettings({ ...pendingAccessibilitySettings, language: e.target.value as 'en' | 'fil' })}
                          className="appearance-none px-6 py-4 bg-card/80 border border-border rounded-2xl text-foreground text-base sm:text-lg font-medium pr-12 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 hover:bg-card/90 transition-all min-w-[180px]"
                        >
                          <option value="en">{t.settings.accessibility.language.english}</option>
                          <option value="fil">{t.settings.accessibility.language.filipino}</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      {pendingAccessibilitySettings.language === 'fil' 
                        ? '🇵🇭 Ang TISA AI ay sasagot sa Filipino/Tagalog pagkatapos i-save.' 
                        : '🇺🇸 TISA AI will respond in English after saving.'}
                    </p>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">{t.settings.accessibility.visual.title}</h3>
                  <div className="space-y-6">
                    <SettingCard
                      icon={Eye}
                      title={t.settings.accessibility.visual.highContrast.title}
                      description={t.settings.accessibility.visual.highContrast.description}
                      checked={pendingAccessibilitySettings.highContrast}
                      onChange={(v) => setPendingAccessibilitySettings({ ...pendingAccessibilitySettings, highContrast: v })}
                    />
                    <SettingCard
                      icon={Type}
                      title={t.settings.accessibility.visual.dyslexiaFont.title}
                      description={t.settings.accessibility.visual.dyslexiaFont.description}
                      checked={pendingAccessibilitySettings.dyslexiaFont}
                      onChange={(v) => setPendingAccessibilitySettings({ ...pendingAccessibilitySettings, dyslexiaFont: v })}
                    />

                    <div className="bg-card/60 border border-border rounded-3xl p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-5">
                        <div className="flex items-center gap-5">
                          <Type className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 flex-shrink-0" />
                          <div>
                            <label className="block text-lg font-semibold text-foreground mb-3">{t.settings.accessibility.visual.fontSize.title}</label>
                            <p className="text-muted-foreground mb-4">{t.settings.accessibility.visual.fontSize.description}</p>
                          </div>
                        </div>
                        <span className="text-xl sm:text-2xl font-bold text-cyan-400">{pendingAccessibilitySettings.fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="12"
                        max="28"
                        value={pendingAccessibilitySettings.fontSize}
                        onChange={(e) => setPendingAccessibilitySettings({ ...pendingAccessibilitySettings, fontSize: parseInt(e.target.value) })}
                        className="w-full h-3 bg-muted/40 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #06b6d4 ${((pendingAccessibilitySettings.fontSize - 12) / 16) * 100}%, #475569 ${((pendingAccessibilitySettings.fontSize - 12) / 16) * 100}%)`
                        }}
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">{t.settings.accessibility.audio.title}</h3>
                  <div className="space-y-6">
                    <SettingCard icon={Volume2} title={t.settings.accessibility.audio.textToSpeech.title} description={t.settings.accessibility.audio.textToSpeech.description} checked={pendingAccessibilitySettings.textToSpeech} onChange={(v) => setPendingAccessibilitySettings({ ...pendingAccessibilitySettings, textToSpeech: v })} />
                    <SettingCard icon={Volume2} title={t.settings.accessibility.audio.speechToText.title} description={t.settings.accessibility.audio.speechToText.description} checked={pendingAccessibilitySettings.speechToText} onChange={(v) => setPendingAccessibilitySettings({ ...pendingAccessibilitySettings, speechToText: v })} />
                    <SettingCard icon={Volume2} title={t.settings.accessibility.audio.captions.title} description={t.settings.accessibility.audio.captions.description} checked={pendingAccessibilitySettings.captionsEnabled} onChange={(v) => setPendingAccessibilitySettings({ ...pendingAccessibilitySettings, captionsEnabled: v })} />
                  </div>
                </section>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">{t.settings.notifications.title}</h3>
                <div className="space-y-6">
                  <SettingCard title={t.settings.notifications.courseUpdates.title} description={t.settings.notifications.courseUpdates.description} checked={notificationSettings.courseUpdates} onChange={(v) => setNotificationSettings({ ...notificationSettings, courseUpdates: v })} />
                  <SettingCard title={t.settings.notifications.achievements.title} description={t.settings.notifications.achievements.description} checked={notificationSettings.achievements} onChange={(v) => setNotificationSettings({ ...notificationSettings, achievements: v })} />
                  <SettingCard title={t.settings.notifications.weeklyReport.title} description={t.settings.notifications.weeklyReport.description} checked={notificationSettings.weeklyReport} onChange={(v) => setNotificationSettings({ ...notificationSettings, weeklyReport: v })} />
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="border-t border-border p-6 sm:p-8 bg-card/60 backdrop-blur-xl">
            <div className="flex justify-center">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-lg sm:text-xl rounded-2xl shadow-xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Save className="w-6 h-6 sm:w-7 sm:h-7" />
                {saving 
                  ? (accessibilitySettings.language === 'fil' ? 'Sine-save...' : 'Saving...') 
                  : (accessibilitySettings.language === 'fil' ? 'I-save ang mga Pagbabago' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Setting Card
function SettingCard({ 
  icon: Icon, 
  title, 
  description, 
  checked, 
  onChange 
}: {
  icon?: any;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="bg-card/60 border border-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-card/80 transition-all">
      <div className="flex items-center gap-5 sm:gap-6">
        {Icon && <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-400 flex-shrink-0" />}
        <div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{title}</p>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// Toggle Switch
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-14 h-8 bg-muted/50 rounded-full peer 
                      peer-checked:after:translate-x-6 
                      after:content-[''] after:absolute after:top-1 after:left-1 
                      after:bg-gradient-to-r after:from-cyan-500 after:to-purple-600 
                      after:rounded-full after:h-6 after:w-6 after:transition-all 
                      peer-checked:bg-cyan-900/30 shadow-inner"></div>
    </label>
  );
}