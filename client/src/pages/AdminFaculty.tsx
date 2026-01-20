// client/src/pages/AdminFaculty.tsx
// Updated: Full light/dark mode support + better visible gradient buttons in both themes

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTranslation } from '../lib/translations';
import { UserPlus, Trash2, Loader2, Edit2, X, Check, Calendar, Clock } from 'lucide-react';

export default function ManageFaculty() {
  const token = localStorage.getItem("token");
  const { user } = useAuth();
  const { settings: accessibilitySettings } = useAccessibility();
  const t = useTranslation(accessibilitySettings.language);

  const [faculty, setFaculty] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form States
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    position: 'Faculty',
    department: 'Mathematics',
    officeHours: '',
    consultationDays: [] as string[],
    consultationStart: '',
    consultationEnd: '',
    vacantTime: '',
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const positions = [
    'Dean',
    'Associate Dean',
    'Chairperson',
    'Department Head, Science Department',
    'Department Head, Mathematics Department',
    'Program Chair, BS Mathematics',
    'Program Chair, BS Biology',
    'Program Chair, BS Food Technology',
    'Program Chair, BS Environmental Science',
    'Program Chair, BS Medical Technology',
    'College Extension and Services Unit (CESU) Head',
    'College Extension and Services Unit (CESU)',
    'College Research Development Unit (CRDU) Head',
    'College Research Development Unit (CRDU)',
    'Student Internship Program Coordinator',
    'College Clerk',
    'Laboratory Technician',
    'Medical Laboratory Technician',
    'Computer Laboratory Technician',
    'Professor, Science',
    'Professor, Mathematics',
    'Faculty (Part-Time), Science',
    'Faculty (Part-Time), Mathematics',
    'Assistant Professor',
    'Instructor',
    'Lecturer',
    'Faculty',
    'Faculty (Adjunct)',
    'Guest Lecturer',
    'Others'
  ];

  const departments = [
    'Mathematics',
    'Science'
  ];

  // Add filter states
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter faculty members
  const filteredFaculty = faculty.filter(f => {
    let matchesDepartment = false;
    if (filterDepartment === 'all') {
      matchesDepartment = true;
    } else if (filterDepartment === 'Mathematics') {
      matchesDepartment = f.college?.includes('Mathematics') || false;
    } else if (filterDepartment === 'Science') {
      matchesDepartment = f.college?.includes('Science') && !f.college?.includes('Mathematics') || false;
    }
    
    const matchesPosition = filterPosition === 'all' || f.position === filterPosition;
    const matchesSearch = searchQuery === '' || 
      `${f.firstName} ${f.middleName || ''} ${f.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.position?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDepartment && matchesPosition && matchesSearch;
  });

  const fetchData = useCallback(async () => {
    setFetching(true);
    try {
      const facRes = await fetch('/api/admin/faculty', { 
        headers: { "Authorization": `Bearer ${token}` } 
      });
      const facData = await facRes.json();
      setFaculty(Array.isArray(facData) ? facData : []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setFetching(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchData();
  }, [user, fetchData]);

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName) return;
    setLoading(true);
    try {
      const url = editingId ? `/api/admin/faculty/${editingId}` : '/api/admin/faculty';
      const method = editingId ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          middleName: form.middleName.trim() || null,
          lastName: form.lastName.trim(),
          email: form.email.trim() || null,
          position: form.position.trim() || 'Faculty',
          college: `College of Science - ${form.department}`,
          officeHours: form.officeHours.trim() || null,
          consultationDays: form.consultationDays,
          consultationStart: form.consultationStart || null,
          consultationEnd: form.consultationEnd || null,
          vacantTime: form.vacantTime.trim() || null,
        })
      });

      resetForm();
      fetchData();
    } catch (err) {
      alert("Failed to save faculty member.");
    } finally {
      setLoading(false);
    }
  };

  const deleteFaculty = async (id: string) => {
    if (!confirm('Delete this faculty member? This cannot be undone.')) return;
    try {
      await fetch(`/api/admin/faculty/${id}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  const startEdit = (f: any) => {
    setEditingId(f.id);
    const dept = f.college?.includes('Mathematics') ? 'Mathematics' : 'Science';
    setForm({
      firstName: f.firstName || '',
      middleName: f.middleName || '',
      lastName: f.lastName || '',
      email: f.email || '',
      position: f.position || 'Faculty',
      department: dept,
      officeHours: f.officeHours || '',
      consultationDays: f.consultationDays || [],
      consultationStart: f.consultationStart || '',
      consultationEnd: f.consultationEnd || '',
      vacantTime: f.vacantTime || '',
    });
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      position: 'Faculty',
      department: 'Mathematics',
      officeHours: '',
      consultationDays: [],
      consultationStart: '',
      consultationEnd: '',
      vacantTime: '',
    });
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-6">
            Access Denied
          </h1>
          <p className="text-xl sm:text-2xl text-foreground font-bold">Admin Only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-12 text-center mb-10">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-4 pb-1 md:pb-4 leading-tight md:leading-snug inline-block">
          {t.faculty.title}
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          {accessibilitySettings.language === 'fil' ? 'Kolehiyo ng Agham • Bulacan State University' : 'College of Science • Bulacan State University'}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12 space-y-10 lg:space-y-12">

        {/* Add / Edit Form */}
        {isAdding && (
          <div className="bg-card/85 backdrop-blur-xl rounded-3xl border border-border shadow-xl p-8 lg:p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground flex items-center gap-4">
                <UserPlus className="w-9 h-9 lg:w-10 lg:h-10 text-cyan-500" />
                {editingId ? (accessibilitySettings.language === 'fil' ? 'I-edit' : 'Edit') : (accessibilitySettings.language === 'fil' ? 'Magdagdag ng Bago' : 'Add New')} {accessibilitySettings.language === 'fil' ? 'Miyembro ng Faculty' : 'Faculty Member'}
              </h2>
              <button 
                onClick={resetForm} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <input
                placeholder={accessibilitySettings.language === 'fil' ? 'Pangalan' : 'First Name'}
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
              />
              <input
                placeholder={accessibilitySettings.language === 'fil' ? 'Gitnang Pangalan / M.I. (Opsyonal)' : 'Middle Name / M.I. (Optional)'}
                value={form.middleName}
                onChange={e => setForm({ ...form, middleName: e.target.value })}
                className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
              />
              <input
                placeholder={accessibilitySettings.language === 'fil' ? 'Apelyido' : 'Last Name'}
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            {/* Position and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {accessibilitySettings.language === 'fil' ? 'Posisyon' : 'Position'}
                </label>
                <select
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                  className="w-full px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
                >
                  {positions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  {accessibilitySettings.language === 'fil' ? 'Departamento' : 'Department'}
                </label>
                <select
                  value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Email Address (Optional) */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                {accessibilitySettings.language === 'fil' ? 'Email Address (Opsyonal)' : 'Email Address (Optional)'}
              </label>
              <input
                type="email"
                placeholder={accessibilitySettings.language === 'fil' ? 'hal. juan.delacruz@bulsu.edu.ph' : 'e.g. juan.delacruz@bulsu.edu.ph'}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value.toLowerCase() })}
                className="w-full px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            {/* Consultation Hours Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                {accessibilitySettings.language === 'fil' ? 'Iskedyul ng Konsultasyon (Opsyonal)' : 'Consultation Schedule (Optional)'}
                <span className="text-xs text-muted-foreground font-normal ml-2">(GMT+8 Philippine Time)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  placeholder={accessibilitySettings.language === 'fil' ? 'Oras sa Opisina (hal., MWF 9AM-12PM)' : 'Office Hours (e.g., MWF 9AM-12PM)'}
                  value={form.officeHours}
                  onChange={e => setForm({ ...form, officeHours: e.target.value })}
                  className="px-6 py-4 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                />
                <input
                  placeholder={accessibilitySettings.language === 'fil' ? 'Bakanteng Oras (hal., TTh 2PM-4PM)' : 'Vacant Time (e.g., TTh 2PM-4PM)'}
                  value={form.vacantTime}
                  onChange={e => setForm({ ...form, vacantTime: e.target.value })}
                  className="px-6 py-4 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                />
              </div>

              {/* Consultation Days Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {accessibilitySettings.language === 'fil' ? 'Mga Araw ng Konsultasyon' : 'Consultation Days'}
                </label>
                <div className="flex flex-wrap gap-3">
                  {daysOfWeek.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const days = form.consultationDays.includes(day)
                          ? form.consultationDays.filter(d => d !== day)
                          : [...form.consultationDays, day];
                        setForm({ ...form, consultationDays: days });
                      }}
                      className={`px-4 py-3 text-sm font-medium rounded-xl border-2 transition-all transform hover:scale-105 ${
                        form.consultationDays.includes(day)
                          ? 'bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-card/60 border-border text-muted-foreground hover:border-purple-500/50 hover:bg-purple-500/10'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection with Enhanced UI */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {accessibilitySettings.language === 'fil' ? 'Oras ng Simula' : 'Start Time'}
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={form.consultationStart}
                      onChange={e => setForm({ ...form, consultationStart: e.target.value })}
                      className="w-full px-6 py-4 bg-card/60 border-2 border-border rounded-2xl text-foreground text-lg font-medium focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                    />
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500 pointer-events-none" />
                  </div>
                  {form.consultationStart && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {accessibilitySettings.language === 'fil' ? 'Nakatakda sa' : 'Set to'}: {form.consultationStart} (GMT+8)
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {accessibilitySettings.language === 'fil' ? 'Oras ng Pagtatapos' : 'End Time'}
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={form.consultationEnd}
                      onChange={e => setForm({ ...form, consultationEnd: e.target.value })}
                      className="w-full px-6 py-4 bg-card/60 border-2 border-border rounded-2xl text-foreground text-lg font-medium focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
                    />
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500 pointer-events-none" />
                  </div>
                  {form.consultationEnd && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {accessibilitySettings.language === 'fil' ? 'Nakatakda sa' : 'Set to'}: {form.consultationEnd} (GMT+8)
                    </p>
                  )}
                </div>
              </div>

              {/* Duration Display */}
              {form.consultationStart && form.consultationEnd && (
                <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                  <p className="text-sm text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="font-medium">
                      {accessibilitySettings.language === 'fil' ? 'Tagal ng Konsultasyon' : 'Consultation Duration'}:
                    </span>
                    <span className="text-purple-500 font-bold">
                      {(() => {
                        const [startHour, startMin] = form.consultationStart.split(':').map(Number);
                        const [endHour, endMin] = form.consultationEnd.split(':').map(Number);
                        const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                        const hours = Math.floor(durationMinutes / 60);
                        const minutes = durationMinutes % 60;
                        return `${hours}h ${minutes}m`;
                      })()}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 sm:gap-6">
              <button
                onClick={resetForm}
                className="px-8 py-4 bg-muted/20 border border-border text-foreground rounded-2xl hover:bg-muted/40 transition-all"
              >
                {accessibilitySettings.language === 'fil' ? 'Kanselahin' : 'Cancel'}
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="
                  relative px-10 py-4 lg:py-5
                  bg-gradient-to-r from-cyan-600 via-cyan-500 to-purple-600
                  text-white font-bold text-base lg:text-lg rounded-2xl
                  shadow-lg shadow-cyan-500/40
                  hover:shadow-cyan-400/70 hover:shadow-2xl
                  hover:brightness-110
                  transform hover:scale-105
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  flex items-center justify-center gap-3
                  border border-cyan-400/40
                  overflow-hidden
                  before:absolute before:inset-0 before:bg-gradient-to-r 
                  before:from-transparent before:via-white/10 before:to-transparent
                  before:opacity-0 hover:before:opacity-100 before:transition-opacity
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {accessibilitySettings.language === 'fil' ? 'Sine-save...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Check className="w-6 h-6" />
                    {editingId ? (accessibilitySettings.language === 'fil' ? 'I-update ang Faculty' : 'Update Faculty') : (accessibilitySettings.language === 'fil' ? 'Magdagdag ng Faculty' : 'Add Faculty')}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Faculty List with Filters */}
        <div className="bg-card/85 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="p-8 lg:p-10 border-b border-border bg-card/60">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                  {accessibilitySettings.language === 'fil' ? 'Mga Miyembro ng Faculty' : 'Faculty Members'}
                  <span className="text-cyan-500 ml-4">({filteredFaculty.length}/{faculty.length})</span>
                </h2>
                <p className="text-muted-foreground mt-2">{accessibilitySettings.language === 'fil' ? 'Kolehiyo ng Agham • Aktibong Teaching Staff' : 'College of Science • Active Teaching Staff'}</p>
              </div>
              <button
                onClick={() => setIsAdding(true)}
                className="
                  px-8 py-4 lg:py-5
                  bg-gradient-to-r from-cyan-600 via-cyan-500 to-purple-600
                  text-white font-bold text-base lg:text-lg rounded-2xl
                  shadow-lg shadow-cyan-500/40
                  hover:shadow-cyan-400/70 hover:shadow-2xl
                  hover:brightness-110
                  transform hover:scale-105
                  transition-all duration-300
                  flex items-center gap-3
                  border border-cyan-400/40
                  relative
                  overflow-hidden
                  before:absolute before:inset-0 before:bg-gradient-to-r 
                  before:from-transparent before:via-white/10 before:to-transparent
                  before:opacity-0 hover:before:opacity-100 before:transition-opacity
                "
              >
                <UserPlus className="w-6 h-6" />
                {accessibilitySettings.language === 'fil' ? 'Magdagdag ng Faculty' : 'Add Faculty'}
              </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder={accessibilitySettings.language === 'fil' ? 'Maghanap ng pangalan, email, posisyon...' : 'Search by name, email, position...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="px-5 py-3 bg-card/60 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
              />
              <select
                value={filterDepartment}
                onChange={e => setFilterDepartment(e.target.value)}
                className="px-5 py-3 bg-card/60 border border-border rounded-xl text-foreground focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 transition-all"
              >
                <option value="all">{accessibilitySettings.language === 'fil' ? 'Lahat ng Departamento' : 'All Departments'}</option>
                <option value="Mathematics">{accessibilitySettings.language === 'fil' ? 'Matematika' : 'Mathematics'}</option>
                <option value="Science">{accessibilitySettings.language === 'fil' ? 'Agham' : 'Science'}</option>
              </select>
              <select
                value={filterPosition}
                onChange={e => setFilterPosition(e.target.value)}
                className="px-5 py-3 bg-card/60 border border-border rounded-xl text-foreground focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
              >
                <option value="all">{accessibilitySettings.language === 'fil' ? 'Lahat ng Posisyon' : 'All Positions'}</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          </div>

          {fetching ? (
            <div className="p-16 lg:p-20 text-center">
              <Loader2 className="w-16 h-16 lg:w-20 lg:h-20 text-cyan-500 animate-spin mx-auto" />
            </div>
          ) : faculty.length === 0 ? (
            <div className="p-16 lg:p-20 text-center">
              <p className="text-3xl lg:text-4xl text-muted-foreground mb-4">{accessibilitySettings.language === 'fil' ? 'Wala pang miyembro ng faculty' : 'No faculty members yet'}</p>
              <p className="text-lg lg:text-xl text-muted-foreground">
                {accessibilitySettings.language === 'fil' ? 'I-click ang "Magdagdag ng Faculty" upang magsimula' : 'Click "Add Faculty" to begin'}
              </p>
            </div>
          ) : filteredFaculty.length === 0 ? (
            <div className="p-16 lg:p-20 text-center">
              <p className="text-2xl lg:text-3xl text-muted-foreground mb-4">{accessibilitySettings.language === 'fil' ? 'Walang nahanap na resulta' : 'No results found'}</p>
              <p className="text-lg text-muted-foreground">
                {accessibilitySettings.language === 'fil' ? 'Subukan ang ibang filter o search term' : 'Try different filters or search term'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 dark:bg-card/60 border-b-2 border-slate-300 dark:border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider">
                      {accessibilitySettings.language === 'fil' ? 'Buong Pangalan' : 'Full Name'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider">
                      {accessibilitySettings.language === 'fil' ? 'Posisyon' : 'Position'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider">
                      {accessibilitySettings.language === 'fil' ? 'Departamento' : 'Department'}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider">
                      {accessibilitySettings.language === 'fil' ? 'Email' : 'Email'}
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-700 dark:text-muted-foreground uppercase tracking-wider">
                      {accessibilitySettings.language === 'fil' ? 'Aksyon' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFaculty.map((f: any) => {
                    const dept = f.college?.includes('Mathematics') ? 'Mathematics' : 'Science';
                    return (
                      <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-card/40 transition-colors">
                        <td className="px-6 py-5">
                          <div className="text-base font-semibold text-slate-900 dark:text-foreground">
                            {f.lastName}, {f.firstName} {f.middleName ? `${f.middleName}.` : ''}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">{f.position}</span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30">
                            {dept}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <span className="text-sm text-slate-600 dark:text-muted-foreground">{f.email || '—'}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => startEdit(f)} 
                              className="p-2 bg-blue-100 dark:bg-blue-500/20 border border-blue-300 dark:border-blue-500/30 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-500/30 hover:text-blue-700 dark:hover:text-blue-300 transition-all"
                              title={accessibilitySettings.language === 'fil' ? 'I-edit' : 'Edit'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteFaculty(f.id)} 
                              className="p-2 bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/30 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 hover:text-red-700 dark:hover:text-red-300 transition-all"
                              title={accessibilitySettings.language === 'fil' ? 'Tanggalin' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}