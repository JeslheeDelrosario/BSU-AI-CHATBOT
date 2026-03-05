// client/src/pages/AdminFacultyAccounts.tsx
// Admin-only: Create and manage faculty user accounts (TEACHER role)
// Faculty accounts can only be created here by admin — not via self-registration.

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserPlus, Search, Shield, UserCheck, UserX, Eye,
  Loader2, Link2, Unlink, BarChart3, X, Check,
  Mail, Lock, User, AlertCircle, CheckCircle,
  Users, Activity, Calendar, BookOpen
} from 'lucide-react';
import api from '../lib/api';

interface FacultyAccount {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  FacultyProfile: {
    id: string;
    firstName: string;
    lastName: string;
    position: string;
    college: string;
    consultationDays: string[];
    consultationStart: string | null;
    consultationEnd: string | null;
  } | null;
}

interface UnlinkedFaculty {
  id: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  email: string | null;
  position: string;
  college: string;
}

interface Stats {
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  linkedAccounts: number;
  unlinkedRecords: number;
}

interface UsageStat {
  userId: string;
  name: string;
  email: string;
  isActive: boolean;
  position: string;
  createdAt: string;
  classroomCount: number;
  totalStudentsInClassrooms: number;
  consultationStats: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
}

type TabType = 'accounts' | 'usage';

export default function AdminFacultyAccounts() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('accounts');
  const [facultyAccounts, setFacultyAccounts] = useState<FacultyAccount[]>([]);
  const [unlinkedFaculty, setUnlinkedFaculty] = useState<UnlinkedFaculty[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState<UsageStat | null>(null);

  // Create form
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    facultyId: '',
  });
  const [createError, setCreateError] = useState('');

  // Link form
  const [linkUserId, setLinkUserId] = useState('');
  const [linkFacultyId, setLinkFacultyId] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/faculty-accounts');
      setFacultyAccounts(res.data.facultyAccounts || []);
      setUnlinkedFaculty(res.data.unlinkedFacultyRecords || []);
      setStats(res.data.stats || null);
    } catch (err) {
      console.error('Failed to fetch faculty accounts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsageStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/faculty-accounts/usage');
      setUsageStats(res.data || []);
    } catch (err) {
      console.error('Failed to fetch usage stats:', err);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchAccounts();
      fetchUsageStats();
    }
  }, [user, fetchAccounts, fetchUsageStats]);

  // Filtered accounts
  const filteredAccounts = facultyAccounts.filter(a => {
    const matchesSearch = searchQuery === '' ||
      `${a.firstName} ${a.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.FacultyProfile?.position?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && a.isActive) ||
      (statusFilter === 'inactive' && !a.isActive);

    return matchesSearch && matchesStatus;
  });

  // Create faculty account
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    const { email, password, firstName, lastName } = createForm;
    if (!email || !password || !firstName || !lastName) {
      setCreateError('All fields except Faculty Link are required');
      return;
    }
    if (password.length < 6) {
      setCreateError('Password must be at least 6 characters');
      return;
    }

    setActionLoading(true);
    try {
      await api.post('/admin/faculty-accounts', createForm);
      setShowCreateModal(false);
      setCreateForm({ email: '', password: '', firstName: '', lastName: '', facultyId: '' });
      showToast('Faculty account created successfully', 'success');
      fetchAccounts();
      fetchUsageStats();
    } catch (err: any) {
      setCreateError(err.response?.data?.error || 'Failed to create faculty account');
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle activate/deactivate
  const handleToggleStatus = async (account: FacultyAccount) => {
    const newStatus = !account.isActive;
    const action = newStatus ? 'activate' : 'deactivate';

    if (!confirm(`Are you sure you want to ${action} ${account.firstName} ${account.lastName}'s account?`)) {
      return;
    }

    try {
      await api.put(`/admin/faculty-accounts/${account.id}/status`, { isActive: newStatus });
      showToast(`Account ${action}d successfully`, 'success');
      fetchAccounts();
      fetchUsageStats();
    } catch (err: any) {
      showToast(err.response?.data?.error || `Failed to ${action} account`, 'error');
    }
  };

  // Link faculty record
  const handleLink = async () => {
    if (!linkUserId || !linkFacultyId) {
      showToast('Please select both a user and a faculty record', 'error');
      return;
    }

    setActionLoading(true);
    try {
      await api.post('/admin/faculty-accounts/link', {
        userId: linkUserId,
        facultyId: linkFacultyId,
      });
      setShowLinkModal(false);
      setLinkUserId('');
      setLinkFacultyId('');
      showToast('Faculty record linked successfully', 'success');
      fetchAccounts();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to link', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Unlink faculty record
  const handleUnlink = async (accountId: string, name: string) => {
    if (!confirm(`Unlink ${name} from their faculty record? They will be demoted to Student role.`)) {
      return;
    }

    try {
      await api.delete(`/admin/faculty-accounts/${accountId}/unlink`);
      showToast('Faculty record unlinked', 'success');
      fetchAccounts();
      fetchUsageStats();
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Failed to unlink', 'error');
    }
  };

  // Access guard
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-6">
            Restricted Access
          </h1>
          <p className="text-xl sm:text-2xl text-foreground font-bold">Admin Access Required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-12">

        {/* Toast */}
        {toast && (
          <div className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-2xl animate-in slide-in-from-right ${
            toast.type === 'success'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/20 border-red-500/40 text-red-300'
          }`}>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-purple-500/20 rounded-2xl">
              <Shield className="w-16 h-16 text-purple-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Faculty Account Management
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Create and manage BulSU College of Science faculty accounts
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Only verified BulSU College of Science members can be registered as faculty
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="backdrop-blur-2xl bg-white/5 dark:bg-white/5 bg-slate-100 border border-white/10 dark:border-white/10 border-slate-200 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-cyan-400">{stats.totalAccounts}</div>
              <div className="text-sm text-muted-foreground mt-1">Total Faculty</div>
            </div>
            <div className="backdrop-blur-2xl bg-white/5 dark:bg-white/5 bg-slate-100 border border-white/10 dark:border-white/10 border-slate-200 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-emerald-400">{stats.activeAccounts}</div>
              <div className="text-sm text-muted-foreground mt-1">Active</div>
            </div>
            <div className="backdrop-blur-2xl bg-white/5 dark:bg-white/5 bg-slate-100 border border-white/10 dark:border-white/10 border-slate-200 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-orange-400">{stats.inactiveAccounts}</div>
              <div className="text-sm text-muted-foreground mt-1">Inactive</div>
            </div>
            <div className="backdrop-blur-2xl bg-white/5 dark:bg-white/5 bg-slate-100 border border-white/10 dark:border-white/10 border-slate-200 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-purple-400">{stats.linkedAccounts}</div>
              <div className="text-sm text-muted-foreground mt-1">Linked Profiles</div>
            </div>
            <div className="backdrop-blur-2xl bg-white/5 dark:bg-white/5 bg-slate-100 border border-white/10 dark:border-white/10 border-slate-200 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-amber-400">{stats.unlinkedRecords}</div>
              <div className="text-sm text-muted-foreground mt-1">Unlinked Records</div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'accounts'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                : 'bg-white/5 dark:bg-white/5 bg-slate-100 border border-white/10 dark:border-white/10 border-slate-200 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-5 h-5" />
            Faculty Accounts
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'usage'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                : 'bg-white/5 dark:bg-white/5 bg-slate-100 border border-white/10 dark:border-white/10 border-slate-200 text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Usage Monitor
          </button>
        </div>

        {/* ─── ACCOUNTS TAB ─── */}
        {activeTab === 'accounts' && (
          <>
            {/* Actions Bar */}
            <div className="backdrop-blur-2xl bg-white/5 dark:bg-white/5 bg-slate-50 border border-white/10 dark:border-white/10 border-slate-200 rounded-3xl p-6 mb-8 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by name, email, or position..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-white/10 bg-white border border-white/20 dark:border-white/20 border-slate-200 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400 transition-all"
                    />
                  </div>
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-4 py-3 bg-white/10 dark:bg-white/10 bg-white border border-white/20 dark:border-white/20 border-slate-200 rounded-xl text-foreground focus:outline-none focus:border-cyan-400 transition-all"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  {/* Link Button */}
                  {unlinkedFaculty.length > 0 && (
                    <button
                      onClick={() => setShowLinkModal(true)}
                      className="flex items-center gap-2 px-5 py-3 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-xl font-semibold hover:bg-amber-500/30 transition-all"
                    >
                      <Link2 className="w-5 h-5" />
                      Link ({unlinkedFaculty.length})
                    </button>
                  )}
                  {/* Create Button */}
                  <button
                    onClick={() => { setShowCreateModal(true); setCreateError(''); }}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-cyan-500/25 shadow-xl transition-all"
                  >
                    <UserPlus className="w-5 h-5" />
                    Create Faculty Account
                  </button>
                </div>
              </div>
            </div>

            {/* Accounts Table */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
              </div>
            ) : filteredAccounts.length === 0 ? (
              <div className="text-center py-20">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">No faculty accounts found</p>
                <p className="text-sm text-muted-foreground mt-2">Create a faculty account to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="backdrop-blur-2xl bg-white/5 dark:bg-white/5 bg-slate-50 border border-white/10 dark:border-white/10 border-slate-200 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Faculty Info */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xl ${
                          account.isActive
                            ? 'bg-gradient-to-br from-cyan-400 to-purple-600'
                            : 'bg-gradient-to-br from-gray-400 to-gray-600'
                        }`}>
                          {account.firstName[0]}{account.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-bold text-foreground">
                              {account.firstName} {account.lastName}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              account.isActive
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {account.isActive ? 'Active' : 'Inactive'}
                            </span>
                            {account.FacultyProfile ? (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                Linked
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                Not Linked
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{account.email}</p>
                          {account.FacultyProfile && (
                            <p className="text-sm text-cyan-400 mt-1">
                              {account.FacultyProfile.position} — {account.FacultyProfile.college}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Created: {new Date(account.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => handleToggleStatus(account)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            account.isActive
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                          }`}
                          title={account.isActive ? 'Deactivate account' : 'Activate account'}
                        >
                          {account.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          {account.isActive ? 'Deactivate' : 'Activate'}
                        </button>

                        {account.FacultyProfile && (
                          <button
                            onClick={() => handleUnlink(account.id, `${account.firstName} ${account.lastName}`)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
                            title="Unlink faculty record"
                          >
                            <Unlink className="w-4 h-4" />
                            Unlink
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── USAGE MONITOR TAB ─── */}
        {activeTab === 'usage' && (
          <div className="space-y-4">
            {usageStats.length === 0 ? (
              <div className="text-center py-20">
                <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">No usage data available</p>
              </div>
            ) : (
              usageStats.map((stat) => (
                <div
                  key={stat.userId}
                  className="backdrop-blur-2xl bg-white/5 dark:bg-white/5 bg-slate-50 border border-white/10 dark:border-white/10 border-slate-200 rounded-2xl p-6 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-foreground">{stat.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          stat.isActive
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {stat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{stat.email} — {stat.position}</p>
                    </div>

                    {/* Usage Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-white/5 dark:bg-white/5 bg-white border border-white/10 dark:border-white/10 border-slate-200 rounded-xl p-3 text-center">
                        <BookOpen className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                        <div className="text-xl font-black text-cyan-400">{stat.classroomCount}</div>
                        <div className="text-xs text-muted-foreground">Classrooms</div>
                      </div>
                      <div className="bg-white/5 dark:bg-white/5 bg-white border border-white/10 dark:border-white/10 border-slate-200 rounded-xl p-3 text-center">
                        <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <div className="text-xl font-black text-purple-400">{stat.totalStudentsInClassrooms}</div>
                        <div className="text-xs text-muted-foreground">Students</div>
                      </div>
                      <div className="bg-white/5 dark:bg-white/5 bg-white border border-white/10 dark:border-white/10 border-slate-200 rounded-xl p-3 text-center">
                        <Calendar className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                        <div className="text-xl font-black text-emerald-400">{stat.consultationStats.total}</div>
                        <div className="text-xs text-muted-foreground">Consultations</div>
                      </div>
                      <div className="bg-white/5 dark:bg-white/5 bg-white border border-white/10 dark:border-white/10 border-slate-200 rounded-xl p-3 text-center">
                        <Check className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                        <div className="text-xl font-black text-amber-400">{stat.consultationStats.completed}</div>
                        <div className="text-xs text-muted-foreground">Completed</div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowUsageModal(stat)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ─── CREATE FACULTY ACCOUNT MODAL ─── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Create Faculty Account
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <p className="text-sm text-amber-300 font-medium">
                  Faculty accounts grant access to Classroom Management and Consultation Scheduling features.
                  Only create accounts for verified BulSU College of Science members.
                </p>
              </div>

              {createError && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{createError}</p>
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={createForm.firstName}
                        onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 dark:bg-white/10 bg-white border border-white/20 dark:border-white/20 border-slate-200 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400 transition-all"
                        placeholder="Juan"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">Last Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={createForm.lastName}
                        onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 dark:bg-white/10 bg-white border border-white/20 dark:border-white/20 border-slate-200 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400 transition-all"
                        placeholder="Dela Cruz"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 dark:bg-white/10 bg-white border border-white/20 dark:border-white/20 border-slate-200 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400 transition-all"
                      placeholder="faculty@bulsu.edu.ph"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 dark:bg-white/10 bg-white border border-white/20 dark:border-white/20 border-slate-200 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-400 transition-all"
                      placeholder="Min. 6 characters"
                      minLength={6}
                      required
                    />
                  </div>
                </div>

                {/* Optional: Link to existing faculty record */}
                {unlinkedFaculty.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Link to Faculty Record (optional)
                    </label>
                    <select
                      value={createForm.facultyId}
                      onChange={(e) => setCreateForm({ ...createForm, facultyId: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 dark:bg-white/10 bg-white border border-white/20 dark:border-white/20 border-slate-200 rounded-xl text-foreground focus:outline-none focus:border-cyan-400 transition-all"
                    >
                      <option value="">— No link (create account only) —</option>
                      {unlinkedFaculty.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.firstName} {f.middleName ? f.middleName + ' ' : ''}{f.lastName} — {f.position}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 bg-white/10 dark:bg-white/10 bg-slate-100 border border-white/20 dark:border-white/20 border-slate-200 rounded-xl font-semibold text-muted-foreground hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl font-semibold shadow-xl hover:shadow-cyan-500/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                    {actionLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── LINK FACULTY MODAL ─── */}
      {showLinkModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Link Faculty Record
                </h2>
                <button onClick={() => setShowLinkModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Link an existing user account to a faculty record. The user will be promoted to TEACHER role.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Select Faculty User Account</label>
                  <select
                    value={linkUserId}
                    onChange={(e) => setLinkUserId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 dark:bg-white/10 bg-white border border-white/20 dark:border-white/20 border-slate-200 rounded-xl text-foreground focus:outline-none focus:border-cyan-400 transition-all"
                  >
                    <option value="">— Select user —</option>
                    {facultyAccounts
                      .filter(a => !a.FacultyProfile)
                      .map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.firstName} {a.lastName} ({a.email})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Select Faculty Record to Link</label>
                  <select
                    value={linkFacultyId}
                    onChange={(e) => setLinkFacultyId(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 dark:bg-white/10 bg-white border border-white/20 dark:border-white/20 border-slate-200 rounded-xl text-foreground focus:outline-none focus:border-cyan-400 transition-all"
                  >
                    <option value="">— Select faculty record —</option>
                    {unlinkedFaculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.firstName} {f.middleName ? f.middleName + ' ' : ''}{f.lastName} — {f.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowLinkModal(false)}
                    className="flex-1 py-3 bg-white/10 dark:bg-white/10 bg-slate-100 border border-white/20 dark:border-white/20 border-slate-200 rounded-xl font-semibold text-muted-foreground hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLink}
                    disabled={actionLoading || !linkUserId || !linkFacultyId}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-semibold shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Link2 className="w-5 h-5" />}
                    {actionLoading ? 'Linking...' : 'Link Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── USAGE DETAIL MODAL ─── */}
      {showUsageModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-foreground">
                  {showUsageModal.name}
                </h2>
                <button onClick={() => setShowUsageModal(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 dark:bg-white/5 bg-slate-100 border border-white/10 dark:border-white/10 border-slate-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-cyan-400">{showUsageModal.classroomCount}</div>
                    <div className="text-sm text-muted-foreground mt-1">Classrooms</div>
                  </div>
                  <div className="bg-white/5 dark:bg-white/5 bg-slate-100 border border-white/10 dark:border-white/10 border-slate-200 rounded-xl p-4 text-center">
                    <div className="text-3xl font-black text-purple-400">{showUsageModal.totalStudentsInClassrooms}</div>
                    <div className="text-sm text-muted-foreground mt-1">Total Students</div>
                  </div>
                </div>

                <div className="bg-white/5 dark:bg-white/5 bg-slate-100 border border-white/10 dark:border-white/10 border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-foreground mb-3">Consultation Breakdown</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-foreground">{showUsageModal.consultationStats.total}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pending:</span>
                      <span className="font-bold text-amber-400">{showUsageModal.consultationStats.pending}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Confirmed:</span>
                      <span className="font-bold text-blue-400">{showUsageModal.consultationStats.confirmed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="font-bold text-emerald-400">{showUsageModal.consultationStats.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cancelled:</span>
                      <span className="font-bold text-red-400">{showUsageModal.consultationStats.cancelled}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Account created: {new Date(showUsageModal.createdAt).toLocaleDateString()}
                </div>
              </div>

              <button
                onClick={() => setShowUsageModal(null)}
                className="w-full mt-6 py-3 bg-white/10 dark:bg-white/10 bg-slate-100 border border-white/20 dark:border-white/20 border-slate-200 rounded-xl font-semibold text-muted-foreground hover:text-foreground transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
