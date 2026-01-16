// client/src/pages/AdminFaculty.tsx
// Updated: Full light/dark mode support + better visible gradient buttons in both themes

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTranslation } from '../lib/translations';
import { UserPlus, Trash2, Loader2, Edit2, X, Check } from 'lucide-react';

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
  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    position: 'Professor',
    subjectIds: [] as string[],
    officeHours: '',
    consultationDays: [] as string[],
    consultationStart: '',
    consultationEnd: '',
    vacantTime: '',
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const positions = [
    'Dean', 'Associate Dean', 'Chairperson',
    'Department Head, Science Department', 'Department Head, Mathematics Department',
    'Program Chair, BS Mathematics', 'Program Chair, BS Biology', 'Program Chair, BS Food Technology',
    'Program Chair, BS Environmental Science', 'Program Chair, BS Medical Technology',
    'College Extension and Services Unit (CESU) Head', 'College Extension and Services Unit (CESU)',
    'College Research Development Unit (CRDU) Head', 'College Research Development Unit (CRDU)',
    'Student Internship Program Coordinator', 'College Clerk',
    'Laboratory Technician', 'Medical Laboratory Technician', 'Computer Laboratory Technician',
    'Professor, Science', 'Professor, Mathematics',
    'Faculty (Part-Time), Science', 'Faculty (Part-Time), Mathematics',
    'Assistant Professor', 'Instructor', 'Lecturer'
  ];

  // Live filter positions
  const filteredPositions = positions.filter(pos =>
    pos.toLowerCase().includes(form.position.toLowerCase())
  );

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
    if (!form.firstName || !form.lastName || !form.email) return;
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
          email: form.email.toLowerCase().trim(),
          position: form.position.trim() || 'Professor',
          subjectIds: form.subjectIds,
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
    setForm({
      firstName: f.firstName || '',
      middleName: f.middleName || '',
      lastName: f.lastName || '',
      email: f.email || '',
      position: f.position || 'Professor',
      subjectIds: f.subjects?.map((s: any) => s.id) || [],
      officeHours: f.officeHours || '',
      consultationDays: f.consultationDays || [],
      consultationStart: f.consultationStart || '',
      consultationEnd: f.consultationEnd || '',
      vacantTime: f.vacantTime || '',
    });
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setPositionDropdownOpen(false);
    setForm({
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      position: 'Professor',
      subjectIds: [],
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

            {/* Email + Searchable Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <input
                type="email"
                placeholder={accessibilitySettings.language === 'fil' ? 'Email Address' : 'Email Address'}
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
              />

              {/* SEARCHABLE POSITION */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={accessibilitySettings.language === 'fil' ? 'Maghanap o mag-type ng posisyon...' : 'Search or type position...'}
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                  onFocus={() => setPositionDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setPositionDropdownOpen(false), 200)}
                  className="w-full px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground pr-14 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-5 pointer-events-none">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {positionDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-card border border-border rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-50 backdrop-blur-xl">
                    {filteredPositions.length === 0 ? (
                      <div className="px-6 py-5 text-muted-foreground text-center italic">
                        {form.position ? (accessibilitySettings.language === 'fil' ? 'Walang tugma — custom na posisyon ay pinapayagan' : 'No match — custom position allowed') : (accessibilitySettings.language === 'fil' ? 'Magsimulang mag-type...' : 'Start typing...')}
                      </div>
                    ) : (
                      filteredPositions.map(pos => (
                        <button
                          key={pos}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            setForm({ ...form, position: pos });
                            setPositionDropdownOpen(false);
                          }}
                          className="w-full px-6 py-4 text-left text-foreground hover:bg-cyan-500/15 hover:text-cyan-300 transition-colors"
                        >
                          {pos}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Consultation Hours Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {accessibilitySettings.language === 'fil' ? 'Iskedyul ng Konsultasyon (Opsyonal)' : 'Consultation Schedule (Optional)'}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">{accessibilitySettings.language === 'fil' ? 'Mga Araw ng Konsultasyon' : 'Consultation Days'}</label>
                  <div className="flex flex-wrap gap-2">
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
                        className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                          form.consultationDays.includes(day)
                            ? 'bg-purple-500/30 border-purple-500 text-purple-300'
                            : 'bg-card/60 border-border text-muted-foreground hover:border-purple-500/50'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="time"
                  placeholder="Start Time"
                  value={form.consultationStart}
                  onChange={e => setForm({ ...form, consultationStart: e.target.value })}
                  className="px-6 py-4 bg-card/60 border border-border rounded-2xl text-foreground focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                />
                <input
                  type="time"
                  placeholder="End Time"
                  value={form.consultationEnd}
                  onChange={e => setForm({ ...form, consultationEnd: e.target.value })}
                  className="px-6 py-4 bg-card/60 border border-border rounded-2xl text-foreground focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
                />
              </div>
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

        {/* Faculty List */}
        <div className="bg-card/85 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="p-8 lg:p-10 border-b border-border bg-card/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
                {accessibilitySettings.language === 'fil' ? 'Mga Miyembro ng Faculty' : 'Faculty Members'}
                <span className="text-cyan-500 ml-4">({faculty.length})</span>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 p-6 lg:p-10">
              {faculty.map((f: any) => (
                <div
                  key={f.id}
                  className="group relative bg-card/70 border border-border rounded-3xl p-7 lg:p-8 hover:border-cyan-500/50 hover:bg-card/90 transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl lg:text-2xl font-bold text-foreground">
                        {f.firstName} {f.middleName ? `${f.middleName}. ` : ''}{f.lastName}
                      </h3>
                      <p className="text-lg lg:text-xl text-cyan-500 font-semibold mt-2">{f.position}</p>
                      <p className="text-sm text-muted-foreground mt-1">{f.email}</p>
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(f)} 
                        className="p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 hover:bg-blue-500/30 hover:text-blue-300 transition-all"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteFaculty(f.id)} 
                        className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {f.subjects?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-3">{accessibilitySettings.language === 'fil' ? 'Nagtuturo ng:' : 'Teaches:'}</p>
                      <div className="flex flex-wrap gap-2">
                        {f.subjects.map((s: any) => (
                          <span 
                            key={s.id} 
                            className="px-3 py-1.5 bg-cyan-500/15 border border-cyan-500/30 rounded-lg text-cyan-300 text-xs lg:text-sm font-medium"
                          >
                            {s.code}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}