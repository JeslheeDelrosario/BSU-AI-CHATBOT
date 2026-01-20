import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, Search, UserPlus, Edit2, Trash2, Key, 
  UserCheck, UserX, Eye, Loader2, ChevronLeft, ChevronRight,
  GraduationCap, BookOpen, MessageSquare, Trophy
} from 'lucide-react';
import api from '../lib/api';

interface Student {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar: string | null;
  isActive: boolean;
  learningStyle: string | null;
  gradeLevel: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    enrollments: number;
    progress: number;
    aiInteractions: number;
  };
}

interface StudentDetail extends Student {
  dateOfBirth: string | null;
  accessibilitySettings: any;
  enrollments: Array<{
    id: string;
    status: string;
    progress: number;
    enrolledAt: string;
    course: {
      id: string;
      title: string;
      thumbnail: string | null;
      level: string;
    };
  }>;
  achievements: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    earnedAt: string;
  }>;
  aiInteractions: Array<{
    id: string;
    type: string;
    userMessage: string;
    aiResponse: string;
    helpful: boolean | null;
    createdAt: string;
  }>;
}

interface Stats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  learningStyleDistribution: Array<{ style: string; count: number }>;
  recentEnrollments: Array<{
    studentName: string;
    studentEmail: string;
    courseName: string;
    enrolledAt: string;
  }>;
}

export default function AdminStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [learningStyleFilter, setLearningStyleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    learningStyle: '',
    gradeLevel: '',
  });

  const [newPassword, setNewPassword] = useState('');

  const learningStyles = ['VISUAL', 'AUDITORY', 'KINESTHETIC', 'READING_WRITING', 'MIXED'];

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchStudents();
      fetchStats();
    }
  }, [user, page, searchQuery, statusFilter, learningStyleFilter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (learningStyleFilter) params.learningStyle = learningStyleFilter;

      const res = await api.get('/admin/students', { params });
      setStudents(res.data.students || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/students/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const fetchStudentDetail = async (id: string) => {
    try {
      const res = await api.get(`/admin/students/${id}`);
      setSelectedStudent(res.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Failed to fetch student detail:', err);
      alert('Failed to load student details');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      alert('Please fill in all required fields');
      return;
    }

    setActionLoading(true);
    try {
      await api.post('/admin/students', formData);
      setShowCreateModal(false);
      setFormData({ email: '', password: '', firstName: '', lastName: '', learningStyle: '', gradeLevel: '' });
      fetchStudents();
      fetchStats();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setActionLoading(true);
    try {
      await api.put(`/admin/students/${selectedStudent.id}`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        learningStyle: formData.learningStyle || null,
        gradeLevel: formData.gradeLevel || null,
      });
      setShowEditModal(false);
      fetchStudents();
      if (showDetailModal) {
        fetchStudentDetail(selectedStudent.id);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update student');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (student: Student) => {
    try {
      await api.patch(`/admin/students/${student.id}/toggle-status`);
      fetchStudents();
      fetchStats();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert('Failed to update student status');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newPassword) return;

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    setActionLoading(true);
    try {
      await api.post(`/admin/students/${selectedStudent.id}/reset-password`, { newPassword });
      setShowResetPasswordModal(false);
      setNewPassword('');
      alert('Password reset successfully');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (student: Student) => {
    if (!confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/admin/students/${student.id}`);
      fetchStudents();
      fetchStats();
    } catch (err) {
      console.error('Failed to delete student:', err);
      alert('Failed to delete student');
    }
  };

  const openEditModal = (student: Student) => {
    setSelectedStudent(student as StudentDetail);
    setFormData({
      email: student.email,
      password: '',
      firstName: student.firstName,
      lastName: student.lastName,
      learningStyle: student.learningStyle || '',
      gradeLevel: student.gradeLevel || '',
    });
    setShowEditModal(true);
  };

  const openResetPasswordModal = (student: Student) => {
    setSelectedStudent(student as StudentDetail);
    setNewPassword('');
    setShowResetPasswordModal(true);
  };

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
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-cyan-500/20 rounded-2xl">
              <Users className="w-16 h-16 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Student Management
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Manage student accounts, enrollments, and progress
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-4xl font-black text-cyan-400">{stats.totalStudents}</div>
              <div className="text-sm text-gray-400">Total Students</div>
            </div>
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-4xl font-black text-green-400">{stats.activeStudents}</div>
              <div className="text-sm text-gray-400">Active</div>
            </div>
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-4xl font-black text-orange-400">{stats.inactiveStudents}</div>
              <div className="text-sm text-gray-400">Inactive</div>
            </div>
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="text-4xl font-black text-purple-400">
                {stats.learningStyleDistribution.length}
              </div>
              <div className="text-sm text-gray-400">Learning Styles</div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row gap-4">
            <button
              onClick={() => {
                setFormData({ email: '', password: '', firstName: '', lastName: '', learningStyle: '', gradeLevel: '' });
                setShowCreateModal(true);
              }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50"
            >
              <UserPlus className="w-5 h-5" />
              Add Student
            </button>

            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={learningStyleFilter}
              onChange={(e) => { setLearningStyleFilter(e.target.value); setPage(1); }}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="">All Learning Styles</option>
              {learningStyles.map(style => (
                <option key={style} value={style}>{style.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-12 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No students found</p>
          </div>
        ) : (
          <>
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Student</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Learning Style</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-400">Enrollments</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {student.firstName[0]}{student.lastName[0]}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{student.firstName} {student.lastName}</div>
                              <div className="text-sm text-gray-400">{student.gradeLevel || 'No grade level'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{student.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-lg">
                            {student.learningStyle?.replace('_', ' ') || 'Not Set'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-sm rounded-lg ${
                            student.isActive 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }`}>
                            {student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{student._count.enrollments}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => fetchStudentDetail(student.id)}
                              className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openEditModal(student)}
                              className="p-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(student)}
                              className={`p-2 rounded-lg transition-colors ${
                                student.isActive
                                  ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                                  : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                              }`}
                              title={student.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {student.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => openResetPasswordModal(student)}
                              className="p-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors"
                              title="Reset Password"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(student)}
                              className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-foreground">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Create Student Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-2xl bg-gray-900/95 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-6">Add New Student</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Learning Style</label>
                  <select
                    value={formData.learningStyle}
                    onChange={(e) => setFormData({ ...formData, learningStyle: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="">Select...</option>
                    {learningStyles.map(style => (
                      <option key={style} value={style}>{style.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Grade Level</label>
                  <input
                    type="text"
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    placeholder="e.g., 1st Year, 2nd Year"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? 'Creating...' : 'Create Student'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-foreground font-bold rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Student Modal */}
        {showEditModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-2xl bg-gray-900/95 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-6">Edit Student</h2>
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Learning Style</label>
                  <select
                    value={formData.learningStyle}
                    onChange={(e) => setFormData({ ...formData, learningStyle: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="">Select...</option>
                    {learningStyles.map(style => (
                      <option key={style} value={style}>{style.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Grade Level</label>
                  <input
                    type="text"
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-foreground font-bold rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {showResetPasswordModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="backdrop-blur-2xl bg-gray-900/95 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <h2 className="text-2xl font-bold text-foreground mb-2">Reset Password</h2>
              <p className="text-gray-400 mb-6">
                Reset password for {selectedStudent.firstName} {selectedStudent.lastName}
              </p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
                  >
                    {actionLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetPasswordModal(false)}
                    className="px-6 py-3 bg-white/5 border border-white/10 text-foreground font-bold rounded-xl hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Student Detail Modal */}
        {showDetailModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="backdrop-blur-2xl bg-gray-900/95 border border-white/10 rounded-3xl p-8 max-w-4xl w-full shadow-2xl my-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                    {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </h2>
                    <p className="text-gray-400">{selectedStudent.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <BookOpen className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{selectedStudent._count?.enrollments || 0}</div>
                  <div className="text-xs text-gray-400">Enrollments</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <GraduationCap className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{selectedStudent._count?.progress || 0}</div>
                  <div className="text-xs text-gray-400">Lessons</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <MessageSquare className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{selectedStudent._count?.aiInteractions || 0}</div>
                  <div className="text-xs text-gray-400">AI Chats</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-foreground">{selectedStudent.achievements?.length || 0}</div>
                  <div className="text-xs text-gray-400">Achievements</div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="font-bold text-foreground mb-3">Profile Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className={selectedStudent.isActive ? 'text-green-400' : 'text-red-400'}>
                        {selectedStudent.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Learning Style</span>
                      <span className="text-foreground">{selectedStudent.learningStyle?.replace('_', ' ') || 'Not Set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Grade Level</span>
                      <span className="text-foreground">{selectedStudent.gradeLevel || 'Not Set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Joined</span>
                      <span className="text-foreground">{new Date(selectedStudent.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="font-bold text-foreground mb-3">Recent Enrollments</h3>
                  {selectedStudent.enrollments?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedStudent.enrollments.slice(0, 3).map(enrollment => (
                        <div key={enrollment.id} className="flex items-center justify-between text-sm">
                          <span className="text-foreground truncate flex-1">{enrollment.course.title}</span>
                          <span className="text-cyan-400 ml-2">{Math.round(enrollment.progress)}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">No enrollments yet</p>
                  )}
                </div>
              </div>

              {/* Recent AI Interactions */}
              {selectedStudent.aiInteractions?.length > 0 && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <h3 className="font-bold text-foreground mb-3">Recent AI Interactions</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {selectedStudent.aiInteractions.slice(0, 5).map(interaction => (
                      <div key={interaction.id} className="bg-white/5 rounded-lg p-3">
                        <div className="text-sm text-foreground mb-1 line-clamp-1">{interaction.userMessage}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(interaction.createdAt).toLocaleString()}
                          {interaction.helpful !== null && (
                            <span className={`ml-2 ${interaction.helpful ? 'text-green-400' : 'text-red-400'}`}>
                              {interaction.helpful ? '👍 Helpful' : '👎 Not Helpful'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
