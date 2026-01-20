// client\src\pages\Admin\AdminFaculty.tsx

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import { UserPlus, Trash2, Loader2, Edit2, X, Check } from 'lucide-react';

export default function ManageFaculty() {
  const token = localStorage.getItem("token");
  const { user } = useAuth();

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
    subjectIds: [] as string[]
  });

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
          subjectIds: form.subjectIds
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
      subjectIds: f.subjects?.map((s: any) => s.id) || []
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
      subjectIds: []
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
          Manage Faculty Members
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          College of Science • Bulacan State University
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12 space-y-10 lg:space-y-12">

        {/* Add / Edit Form */}
        {isAdding && (
          <div className="bg-card/85 backdrop-blur-xl rounded-3xl border border-border shadow-xl p-8 lg:p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground flex items-center gap-4">
                <UserPlus className="w-9 h-9 lg:w-10 lg:h-10 text-cyan-500" />
                {editingId ? 'Edit' : 'Add New'} Faculty Member
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
                placeholder="First Name"
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
              />
              <input
                placeholder="Middle Name / M.I. (Optional)"
                value={form.middleName}
                onChange={e => setForm({ ...form, middleName: e.target.value })}
                className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all"
              />
              <input
                placeholder="Last Name"
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            {/* Email + Searchable Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all"
              />

              {/* SEARCHABLE POSITION */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search or type position..."
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
                        {form.position ? 'No match — custom position allowed' : 'Start typing...'}
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

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 sm:gap-6">
              <button
                onClick={resetForm}
                className="px-8 py-4 bg-muted/20 border border-border text-foreground rounded-2xl hover:bg-muted/40 transition-all"
              >
                Cancel
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-6 h-6" />
                    {editingId ? 'Update Faculty' : 'Add Faculty'}
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
                Faculty Members
                <span className="text-cyan-500 ml-4">({faculty.length})</span>
              </h2>
              <p className="text-muted-foreground mt-2">College of Science • Active Teaching Staff</p>
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
              Add Faculty
            </button>
          </div>

          {fetching ? (
            <div className="p-16 lg:p-20 text-center">
              <Loader2 className="w-16 h-16 lg:w-20 lg:h-20 text-cyan-500 animate-spin mx-auto" />
            </div>
          ) : faculty.length === 0 ? (
            <div className="p-16 lg:p-20 text-center">
              <p className="text-3xl lg:text-4xl text-muted-foreground mb-4">No faculty members yet</p>
              <p className="text-lg lg:text-xl text-muted-foreground">
                Click "Add Faculty" to begin
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
                      <p className="text-sm font-semibold text-muted-foreground mb-3">Teaches:</p>
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