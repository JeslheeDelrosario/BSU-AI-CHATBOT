// Admin Forums Dashboard - Permission and Visibility Settings
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import {
  Shield,
  Users,
  MessageSquare,
  Settings,
  Search,
  Eye,
  EyeOff,
  Trash2,
  Flag,
  CheckCircle,
  Globe,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface Community {
  id: string;
  name: string;
  slug: string;
  visibility: string;
  joinPolicy: string;
  memberCount: number;
  postCount: number;
  isArchived: boolean;
  createdAt: string;
  Creator: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ForumReport {
  id: string;
  reason: string;
  description?: string;
  status: string;
  createdAt: string;
  Reporter: {
    id: string;
    firstName: string;
    lastName: string;
  };
  Post?: {
    id: string;
    title: string;
  };
  Comment?: {
    id: string;
    content: string;
  };
}

interface ForumSettings {
  id: string;
  allowAnonymousPosts: boolean;
  requirePostApproval: boolean;
  allowMediaUploads: boolean;
  maxMediaSize: number;
  minPostLength: number;
  maxPostLength: number;
  profanityFilterEnabled: boolean;
  spamFilterEnabled: boolean;
}

export default function AdminForums() {
  const { user } = useAuth();
  const { settings } = useAccessibility();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'communities' | 'reports' | 'settings'>('communities');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [reports, setReports] = useState<ForumReport[]>([]);
  const [forumSettings, setForumSettings] = useState<ForumSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setSelectedCommunity] = useState<Community | null>(null);
  const [, setShowPermissionsModal] = useState(false);

  const isFilipino = settings.language === 'fil';
  const isAdmin = user?.role === 'ADMIN';

  // Fetch communities
  const fetchCommunities = async () => {
    try {
      const response = await api.get('/forums/communities?limit=100');
      setCommunities(response.data.communities || []);
    } catch (error) {
      console.error('Failed to fetch communities:', error);
    }
  };

  // Fetch reports (mock for now - would need backend endpoint)
  const fetchReports = async () => {
    // This would fetch from /forums/admin/reports
    setReports([]);
  };

  // Fetch forum settings (mock for now - would need backend endpoint)
  const fetchSettings = async () => {
    setForumSettings({
      id: '1',
      allowAnonymousPosts: false,
      requirePostApproval: false,
      allowMediaUploads: true,
      maxMediaSize: 10485760,
      minPostLength: 10,
      maxPostLength: 50000,
      profanityFilterEnabled: true,
      spamFilterEnabled: true,
    });
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCommunities(), fetchReports(), fetchSettings()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter communities
  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle community actions
  const handleArchiveCommunity = async (communityId: string, archive: boolean) => {
    try {
      await api.put(`/forums/communities/${communityId}`, { isArchived: archive });
      setCommunities(prev =>
        prev.map(c => (c.id === communityId ? { ...c, isArchived: archive } : c))
      );
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: archive
          ? isFilipino ? 'Na-archive na ang community' : 'Community archived'
          : isFilipino ? 'Na-restore na ang community' : 'Community restored',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: isFilipino ? 'Error' : 'Error',
        message: isFilipino ? 'May error' : 'Failed to update community',
      });
    }
  };

  const handleDeleteCommunity = async (communityId: string) => {
    if (!confirm(isFilipino ? 'Sigurado ka bang gusto mong i-delete ang community na ito?' : 'Are you sure you want to delete this community?')) {
      return;
    }
    try {
      await api.delete(`/forums/communities/${communityId}`);
      setCommunities(prev => prev.filter(c => c.id !== communityId));
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Na-delete na ang community' : 'Community deleted',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: isFilipino ? 'Error' : 'Error',
        message: isFilipino ? 'May error' : 'Failed to delete community',
      });
    }
  };

  // Handle report actions
  const handleReviewReport = async (reportId: string, action: 'dismiss' | 'action_taken') => {
    try {
      // Would call /forums/admin/reports/:id/review
      setReports(prev =>
        prev.map(r => (r.id === reportId ? { ...r, status: action === 'dismiss' ? 'DISMISSED' : 'ACTION_TAKEN' } : r))
      );
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Na-review na ang report' : 'Report reviewed',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: isFilipino ? 'Error' : 'Error',
        message: isFilipino ? 'May error' : 'Failed to review report',
      });
    }
  };

  // Handle settings update
  const handleUpdateSettings = async (updates: Partial<ForumSettings>) => {
    try {
      // Would call /forums/admin/settings
      setForumSettings(prev => (prev ? { ...prev, ...updates } : null));
      showToast({
        type: 'success',
        title: isFilipino ? 'Tagumpay' : 'Success',
        message: isFilipino ? 'Na-update na ang settings' : 'Settings updated',
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: isFilipino ? 'Error' : 'Error',
        message: isFilipino ? 'May error' : 'Failed to update settings',
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isFilipino ? 'Hindi Pinapayagan' : 'Access Denied'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isFilipino ? 'Kailangan mo ng admin access' : 'You need admin access to view this page'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-500" />
            {isFilipino ? 'Admin: Forums' : 'Admin: Forums Management'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {isFilipino
              ? 'I-manage ang mga community, reports, at settings ng forum'
              : 'Manage communities, reports, and forum settings'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{communities.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isFilipino ? 'Mga Community' : 'Communities'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {communities.reduce((sum, c) => sum + c.postCount, 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isFilipino ? 'Kabuuang Post' : 'Total Posts'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Flag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reports.filter(r => r.status === 'PENDING').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isFilipino ? 'Pending Reports' : 'Pending Reports'}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {communities.filter(c => c.visibility === 'PUBLIC').length}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isFilipino ? 'Public Communities' : 'Public Communities'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-slate-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('communities')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'communities'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {isFilipino ? 'Mga Community' : 'Communities'}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'reports'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  {isFilipino ? 'Mga Report' : 'Reports'}
                  {reports.filter(r => r.status === 'PENDING').length > 0 && (
                    <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {reports.filter(r => r.status === 'PENDING').length}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  {isFilipino ? 'Mga Setting' : 'Settings'}
                </span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              </div>
            ) : activeTab === 'communities' ? (
              <div>
                {/* Search */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={isFilipino ? 'Maghanap ng community...' : 'Search communities...'}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-slate-700 border-0 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <button
                    onClick={() => fetchCommunities()}
                    className="p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>

                {/* Communities Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          {isFilipino ? 'Community' : 'Community'}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          {isFilipino ? 'Visibility' : 'Visibility'}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          {isFilipino ? 'Miyembro' : 'Members'}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          {isFilipino ? 'Post' : 'Posts'}
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          {isFilipino ? 'Status' : 'Status'}
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                          {isFilipino ? 'Aksyon' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCommunities.map(community => (
                        <tr
                          key={community.id}
                          className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                {community.name[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{community.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">/{community.slug}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                community.visibility === 'PUBLIC'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                  : community.visibility === 'PRIVATE'
                                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                  : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                              }`}
                            >
                              {community.visibility}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{community.memberCount}</td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{community.postCount}</td>
                          <td className="py-3 px-4">
                            {community.isArchived ? (
                              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">
                                {isFilipino ? 'Archived' : 'Archived'}
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full">
                                {isFilipino ? 'Active' : 'Active'}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedCommunity(community);
                                  setShowPermissionsModal(true);
                                }}
                                className="p-1.5 text-gray-400 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 rounded-lg transition-colors"
                                title={isFilipino ? 'I-edit ang permissions' : 'Edit permissions'}
                              >
                                <Shield className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleArchiveCommunity(community.id, !community.isArchived)}
                                className="p-1.5 text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                title={community.isArchived ? 'Restore' : 'Archive'}
                              >
                                {community.isArchived ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={() => handleDeleteCommunity(community.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title={isFilipino ? 'I-delete' : 'Delete'}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredCommunities.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      {isFilipino ? 'Walang community na nahanap' : 'No communities found'}
                    </div>
                  )}
                </div>
              </div>
            ) : activeTab === 'reports' ? (
              <div>
                {reports.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                      {isFilipino ? 'Walang pending reports' : 'No pending reports'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {isFilipino ? 'Lahat ng reports ay na-review na' : 'All reports have been reviewed'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map(report => (
                      <div
                        key={report.id}
                        className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-2 py-0.5 text-xs rounded-full ${
                                  report.status === 'PENDING'
                                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                                    : report.status === 'ACTION_TAKEN'
                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}
                              >
                                {report.status}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(report.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900 dark:text-white">{report.reason}</p>
                            {report.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{report.description}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                              {isFilipino ? 'Ni-report ni' : 'Reported by'} {report.Reporter.firstName} {report.Reporter.lastName}
                            </p>
                          </div>
                          {report.status === 'PENDING' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleReviewReport(report.id, 'action_taken')}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                              >
                                {isFilipino ? 'Aksyon' : 'Take Action'}
                              </button>
                              <button
                                onClick={() => handleReviewReport(report.id, 'dismiss')}
                                className="px-3 py-1.5 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-200 text-sm rounded-lg transition-colors"
                              >
                                {isFilipino ? 'I-dismiss' : 'Dismiss'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {forumSettings && (
                  <>
                    {/* Content Moderation */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {isFilipino ? 'Content Moderation' : 'Content Moderation'}
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {isFilipino ? 'Profanity Filter' : 'Profanity Filter'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {isFilipino ? 'I-filter ang mga bad words' : 'Automatically filter profane language'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleUpdateSettings({ profanityFilterEnabled: !forumSettings.profanityFilterEnabled })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              forumSettings.profanityFilterEnabled ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-slate-600'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                forumSettings.profanityFilterEnabled ? 'left-7' : 'left-1'
                              }`}
                            />
                          </button>
                        </label>
                        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {isFilipino ? 'Spam Filter' : 'Spam Filter'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {isFilipino ? 'I-detect ang spam posts' : 'Automatically detect and filter spam'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleUpdateSettings({ spamFilterEnabled: !forumSettings.spamFilterEnabled })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              forumSettings.spamFilterEnabled ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-slate-600'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                forumSettings.spamFilterEnabled ? 'left-7' : 'left-1'
                              }`}
                            />
                          </button>
                        </label>
                        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {isFilipino ? 'Require Post Approval' : 'Require Post Approval'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {isFilipino ? 'Kailangan ng approval bago ma-publish' : 'Posts require admin approval before publishing'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleUpdateSettings({ requirePostApproval: !forumSettings.requirePostApproval })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              forumSettings.requirePostApproval ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-slate-600'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                forumSettings.requirePostApproval ? 'left-7' : 'left-1'
                              }`}
                            />
                          </button>
                        </label>
                      </div>
                    </div>

                    {/* Media Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {isFilipino ? 'Media Settings' : 'Media Settings'}
                      </h3>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {isFilipino ? 'Allow Media Uploads' : 'Allow Media Uploads'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {isFilipino ? 'Payagan ang pag-upload ng images at videos' : 'Allow users to upload images and videos'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleUpdateSettings({ allowMediaUploads: !forumSettings.allowMediaUploads })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              forumSettings.allowMediaUploads ? 'bg-cyan-500' : 'bg-gray-300 dark:bg-slate-600'
                            }`}
                          >
                            <span
                              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                forumSettings.allowMediaUploads ? 'left-7' : 'left-1'
                              }`}
                            />
                          </button>
                        </label>
                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                          <p className="font-medium text-gray-900 dark:text-white mb-2">
                            {isFilipino ? 'Max File Size' : 'Maximum File Size'}
                          </p>
                          <select
                            value={forumSettings.maxMediaSize}
                            onChange={e => handleUpdateSettings({ maxMediaSize: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded-lg text-gray-900 dark:text-white"
                          >
                            <option value={5242880}>5 MB</option>
                            <option value={10485760}>10 MB</option>
                            <option value={26214400}>25 MB</option>
                            <option value={52428800}>50 MB</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Post Limits */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        {isFilipino ? 'Post Limits' : 'Post Limits'}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                          <p className="font-medium text-gray-900 dark:text-white mb-2">
                            {isFilipino ? 'Min Post Length' : 'Minimum Post Length'}
                          </p>
                          <input
                            type="number"
                            value={forumSettings.minPostLength}
                            onChange={e => handleUpdateSettings({ minPostLength: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded-lg text-gray-900 dark:text-white"
                          />
                        </div>
                        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                          <p className="font-medium text-gray-900 dark:text-white mb-2">
                            {isFilipino ? 'Max Post Length' : 'Maximum Post Length'}
                          </p>
                          <input
                            type="number"
                            value={forumSettings.maxPostLength}
                            onChange={e => handleUpdateSettings({ maxPostLength: parseInt(e.target.value) })}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded-lg text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
