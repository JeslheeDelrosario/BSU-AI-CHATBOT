import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import {
  Brain,
  Settings,
  MessageSquare,
  Users,
  RefreshCw,
  Save,
  RotateCcw,
  Trash2,
  BarChart3,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info,
  Zap,
  Shield,
  Clock,
  Target,
} from 'lucide-react';

interface AISettings {
  id: string;
  conversationHistoryLength: number;
  pronounResolutionEnabled: boolean;
  entityExtractionEnabled: boolean;
  contextInjectionEnabled: boolean;
  scopeRestrictionEnabled: boolean;
  scopeConfidenceThreshold: number;
  cacheEnabled: boolean;
  cacheTTLMinutes: number;
  maxResponseTokens: number;
  temperature: number;
}

interface Analytics {
  totalInteractions: number;
  pronounResolutionRate: string;
  contextUsageRate: string;
  avgResponseTimeMs: number;
  dailyStats: Array<{
    date: string;
    total: number;
    pronouns_resolved: number;
    context_used: number;
  }>;
  topExtractedEntities: Array<{
    entity: string;
    count: number;
  }>;
}

export default function AdminAISettings() {
  const { user } = useAuth();
  const { settings: accessibilitySettings } = useAccessibility();
  const { showToast } = useToast();
  const isFilipino = accessibilitySettings.language === 'fil';

  const [settings, setSettings] = useState<AISettings | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [clearingContext, setClearingContext] = useState(false);
  const [userIdToClear, setUserIdToClear] = useState('');

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/ai/settings');
      setSettings(response.data.settings);
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to fetch AI settings',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await api.get('/admin/ai/analytics?days=7');
      setAnalytics(response.data.analytics);
    } catch (error: any) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchAnalytics();
  }, []);

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      setSaving(true);
      await api.put('/admin/ai/settings', settings);
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Na-save ang mga settings' : 'Settings saved successfully',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to save settings',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (!window.confirm(isFilipino ? 'I-reset ang lahat ng settings sa default?' : 'Reset all settings to defaults?')) return;
    try {
      setSaving(true);
      const response = await api.post('/admin/ai/settings/reset');
      setSettings(response.data.settings);
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Na-reset ang mga settings' : 'Settings reset to defaults',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to reset settings',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClearUserContext = async () => {
    if (!userIdToClear.trim()) {
      showToast({
        type: 'error',
        title: 'Error',
        message: isFilipino ? 'Maglagay ng User ID' : 'Please enter a User ID',
      });
      return;
    }
    if (!window.confirm(isFilipino ? 'I-clear ang context ng user na ito?' : 'Clear context for this user?')) return;
    
    try {
      setClearingContext(true);
      await api.post('/admin/ai/clear-context', { userId: userIdToClear });
      setUserIdToClear('');
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Na-clear ang context' : 'User context cleared',
      });
    } catch (error: any) {
      showToast({
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to clear context',
      });
    } finally {
      setClearingContext(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="py-20 text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isFilipino ? 'Hindi pinapayagan' : 'Access Denied'}
        </h2>
        <p className="text-slate-500 dark:text-gray-400 mt-2">
          {isFilipino ? 'Admin access lamang' : 'Admin access required'}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-10 lg:py-16 max-w-7xl mx-auto px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Brain className="w-8 h-8 text-cyan-500" />
            {isFilipino ? 'AI Context Awareness Settings' : 'AI Context Awareness Settings'}
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mt-2">
            {isFilipino 
              ? 'I-configure ang context awareness ng AI-Tutor' 
              : 'Configure AI-Tutor context awareness and conversation settings'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleResetSettings}
            disabled={saving}
            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 rounded-xl flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {isFilipino ? 'I-reset' : 'Reset'}
          </button>
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isFilipino ? 'I-save' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Context Awareness Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conversation History */}
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              {isFilipino ? 'Conversation History' : 'Conversation History'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {isFilipino ? 'Bilang ng messages na i-retain' : 'Number of messages to retain'}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="2"
                    max="20"
                    value={settings?.conversationHistoryLength || 10}
                    onChange={(e) => setSettings(s => s ? { ...s, conversationHistoryLength: parseInt(e.target.value) } : null)}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span className="w-12 text-center text-white font-bold bg-cyan-500/20 px-3 py-1 rounded-lg">
                    {settings?.conversationHistoryLength || 10}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isFilipino 
                    ? 'Mas maraming messages = mas magandang context pero mas mabagal' 
                    : 'More messages = better context but slower responses'}
                </p>
              </div>
            </div>
          </div>

          {/* Context Features */}
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              {isFilipino ? 'Context Features' : 'Context Features'}
            </h2>
            
            <div className="space-y-4">
              {/* Pronoun Resolution */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {isFilipino ? 'Pronoun Resolution' : 'Pronoun Resolution'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isFilipino 
                        ? 'I-resolve ang "him", "her", "it" sa tamang entity' 
                        : 'Resolve "him", "her", "it" to correct entities'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.pronounResolutionEnabled ?? true}
                    onChange={(e) => setSettings(s => s ? { ...s, pronounResolutionEnabled: e.target.checked } : null)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Entity Extraction */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {isFilipino ? 'Entity Extraction' : 'Entity Extraction'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isFilipino 
                        ? 'I-extract ang mga pangalan at topics mula sa conversation' 
                        : 'Extract names and topics from conversation'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.entityExtractionEnabled ?? true}
                    onChange={(e) => setSettings(s => s ? { ...s, entityExtractionEnabled: e.target.checked } : null)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Context Injection */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {isFilipino ? 'Context Injection' : 'Context Injection'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isFilipino 
                        ? 'I-inject ang recommended programs sa retrieval context' 
                        : 'Inject recommended programs into retrieval context'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.contextInjectionEnabled ?? true}
                    onChange={(e) => setSettings(s => s ? { ...s, contextInjectionEnabled: e.target.checked } : null)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>

              {/* Scope Restriction */}
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {isFilipino ? 'BSU COS Scope Restriction' : 'BSU COS Scope Restriction'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isFilipino 
                        ? 'I-block ang queries na hindi related sa BSU COS' 
                        : 'Block queries outside BSU COS scope'}
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.scopeRestrictionEnabled ?? true}
                    onChange={(e) => setSettings(s => s ? { ...s, scopeRestrictionEnabled: e.target.checked } : null)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-amber-400" />
              {isFilipino ? 'Advanced Settings' : 'Advanced Settings'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {isFilipino ? 'Scope Confidence Threshold' : 'Scope Confidence Threshold'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={settings?.scopeConfidenceThreshold || 0.8}
                    onChange={(e) => setSettings(s => s ? { ...s, scopeConfidenceThreshold: parseFloat(e.target.value) } : null)}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span className="w-16 text-center text-white font-bold bg-amber-500/20 px-2 py-1 rounded-lg text-sm">
                    {((settings?.scopeConfidenceThreshold || 0.8) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {isFilipino ? 'AI Temperature' : 'AI Temperature'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings?.temperature || 0.7}
                    onChange={(e) => setSettings(s => s ? { ...s, temperature: parseFloat(e.target.value) } : null)}
                    className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span className="w-12 text-center text-white font-bold bg-purple-500/20 px-2 py-1 rounded-lg text-sm">
                    {settings?.temperature || 0.7}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {isFilipino ? 'Max Response Tokens' : 'Max Response Tokens'}
                </label>
                <input
                  type="number"
                  min="1024"
                  max="8192"
                  value={settings?.maxResponseTokens || 4096}
                  onChange={(e) => setSettings(s => s ? { ...s, maxResponseTokens: parseInt(e.target.value) } : null)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  {isFilipino ? 'Cache TTL (minutes)' : 'Cache TTL (minutes)'}
                </label>
                <input
                  type="number"
                  min="5"
                  max="1440"
                  value={settings?.cacheTTLMinutes || 60}
                  onChange={(e) => setSettings(s => s ? { ...s, cacheTTLMinutes: parseInt(e.target.value) } : null)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="font-medium text-white">
                    {isFilipino ? 'Response Caching' : 'Response Caching'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isFilipino 
                      ? 'I-cache ang mga frequently asked questions' 
                      : 'Cache frequently asked questions for faster responses'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings?.cacheEnabled ?? true}
                  onChange={(e) => setSettings(s => s ? { ...s, cacheEnabled: e.target.checked } : null)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          </div>

          {/* Clear Context */}
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-400" />
              {isFilipino ? 'Clear User Context' : 'Clear User Context'}
            </h2>
            
            <p className="text-gray-400 text-sm mb-4">
              {isFilipino 
                ? 'I-clear ang conversation history at context ng isang user para sa troubleshooting' 
                : 'Clear conversation history and context for a specific user for troubleshooting'}
            </p>

            <div className="flex gap-3">
              <input
                type="text"
                value={userIdToClear}
                onChange={(e) => setUserIdToClear(e.target.value)}
                placeholder={isFilipino ? 'User ID' : 'Enter User ID'}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleClearUserContext}
                disabled={clearingContext}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl flex items-center gap-2"
              >
                {clearingContext ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isFilipino ? 'I-clear' : 'Clear'}
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-6">
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-400" />
                {isFilipino ? 'Analytics' : 'Analytics'}
              </h2>
              <button
                onClick={fetchAnalytics}
                disabled={analyticsLoading}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 text-gray-400 ${analyticsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {analyticsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            ) : analytics ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-cyan-500/10 rounded-xl text-center">
                    <p className="text-2xl font-bold text-cyan-400">{analytics.totalInteractions}</p>
                    <p className="text-xs text-gray-400">{isFilipino ? 'Total Interactions' : 'Total Interactions'}</p>
                  </div>
                  <div className="p-4 bg-purple-500/10 rounded-xl text-center">
                    <p className="text-2xl font-bold text-purple-400">{analytics.pronounResolutionRate}%</p>
                    <p className="text-xs text-gray-400">{isFilipino ? 'Pronoun Resolution' : 'Pronoun Resolution'}</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-xl text-center">
                    <p className="text-2xl font-bold text-green-400">{analytics.contextUsageRate}%</p>
                    <p className="text-xs text-gray-400">{isFilipino ? 'Context Usage' : 'Context Usage'}</p>
                  </div>
                  <div className="p-4 bg-amber-500/10 rounded-xl text-center">
                    <p className="text-2xl font-bold text-amber-400">{Math.round(analytics.avgResponseTimeMs)}ms</p>
                    <p className="text-xs text-gray-400">{isFilipino ? 'Avg Response' : 'Avg Response'}</p>
                  </div>
                </div>

                {analytics.topExtractedEntities.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">
                      {isFilipino ? 'Top Extracted Entities' : 'Top Extracted Entities'}
                    </h3>
                    <div className="space-y-2">
                      {analytics.topExtractedEntities.slice(0, 5).map((entity, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                          <span className="text-sm text-white truncate">{entity.entity}</span>
                          <span className="text-xs text-cyan-400 font-bold">{entity.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Info className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">{isFilipino ? 'Walang data' : 'No analytics data'}</p>
              </div>
            )}
          </div>

          {/* Feature Status */}
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {isFilipino ? 'Feature Status' : 'Feature Status'}
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Conversation History (10 msgs)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Pronoun Resolution</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Entity Extraction</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Context Injection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">BSU COS Scope Restriction</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-300">Admin Configuration Panel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
