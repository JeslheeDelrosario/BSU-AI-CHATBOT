// client/src/pages/AdminFaculty.tsx
// SEARCHABLE POSITION + MIDDLE NAME + CYBERPUNK BLACK DESIGN

import { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { UserPlus, Trash2, Loader2, Edit2, X, Check } from 'lucide-react';

export default function ManageFaculty() {
  const token = localStorage.getItem("token");
  const { user } = useAuth();

  const [faculty, setFaculty] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  // Form States
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false); // NEW

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

  // Live filter positions as user types
  const filteredPositions = positions.filter(pos =>
    pos.toLowerCase().includes(form.position.toLowerCase())
  );

  const fetchData = async () => {
    setFetching(true);
    try {
      const [facRes, subRes] = await Promise.all([
        fetch('/api/admin/faculty', { headers: { "Authorization": `Bearer ${token}` } }),
        fetch('/api/admin/subjects', { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      const facData = await facRes.json();
      const subData = await subRes.json();
      setFaculty(Array.isArray(facData) ? facData : []);
      setSubjects(Array.isArray(subData) ? subData : []);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchData();
  }, [user]);

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

  const toggleSubject = (id: string) => {
    setForm(prev => ({
      ...prev,
      subjectIds: prev.subjectIds.includes(id)
        ? prev.subjectIds.filter(s => s !== id)
        : [...prev.subjectIds, id]
    }));
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-6xl font-black bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-6">
            Access Denied
          </h1>
          <p className="text-2xl text-cyan-400 font-bold">Admin Only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <div className="max-w-7xl mx-auto p-6 lg:p-10 text-center mb-12">
        <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
          Manage Faculty Members
        </h1>
        <p className="text-xl text-gray-400">
          College of Science • Bulacan State University
        </p>
      </div>

      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">

        {/* Add / Edit Form */}
        {isAdding && (
          <div className="bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl p-8 lg:p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white flex items-center gap-4">
                <UserPlus className="w-10 h-10 text-cyan-400" />
                {editingId ? 'Edit' : 'Add New'} Faculty Member
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Name Fields - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <input
                placeholder="First Name"
                value={form.firstName}
                onChange={e => setForm({ ...form, firstName: e.target.value })}
                className="px-8 py-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-xl"
              />
              <input
                placeholder="Middle Name / M.I. (Optional)"
                value={form.middleName}
                onChange={e => setForm({ ...form, middleName: e.target.value })}
                className="px-8 py-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all backdrop-blur-xl"
              />
              <input
                placeholder="Last Name"
                value={form.lastName}
                onChange={e => setForm({ ...form, lastName: e.target.value })}
                className="px-8 py-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-xl"
              />
            </div>

            {/* Email + Searchable Position */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="px-8 py-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-xl"
              />

              {/* SEARCHABLE POSITION FIELD */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search or type position..."
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                  onFocus={() => setPositionDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setPositionDropdownOpen(false), 200)}
                  className="w-full px-8 py-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 pr-16 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-xl cursor-pointer"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Dropdown */}
                {positionDropdownOpen && (
                  <div className="absolute top-full mt-2 w-full bg-black/90 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl max-h-80 overflow-y-auto z-50">
                    {filteredPositions.length === 0 ? (
                      <div className="px-8 py-6 text-gray-400 text-center italic">
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
                          className="w-full px-8 py-5 text-left text-white hover:bg-cyan-500/20 hover:text-cyan-300 transition-all first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          {pos}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
            

            <div className="flex justify-end gap-6">
              <button
                onClick={resetForm}
                className="px-10 py-5 bg-white/10 border border-white/20 rounded-2xl text-gray-300 hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-12 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all flex items-center gap-4 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-7 h-7 animate-spin" /> : <Check className="w-7 h-7" />}
                {editingId ? 'Update Faculty' : 'Add Faculty'}
              </button>
            </div>
          </div>
        )}

        {/* Faculty List */}
        <div className="bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-8 lg:p-10 border-b border-white/10 bg-white/5 flex justify-between items-center flex-wrap gap-6">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                Faculty Members
                <span className="text-cyan-400 ml-4">({faculty.length})</span>
              </h2>
              <p className="text-gray-400 mt-2">College of Science • Active Teaching Staff</p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all flex items-center gap-4"
            >
              <UserPlus className="w-7 h-7" />
              Add Faculty
            </button>
          </div>

          {fetching ? (
            <div className="p-20 text-center">
              <Loader2 className="w-20 h-20 text-cyan-400 animate-spin mx-auto" />
            </div>
          ) : faculty.length === 0 ? (
            <div className="p-20 text-center text-gray-500">
              <p className="text-4xl mb-6">No faculty members yet</p>
              <p className="text-xl">Click "Add Faculty" to begin</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 p-8 lg:p-10">
              {faculty.map((f: any) => (
                <div
                  key={f.id}
                  className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-500"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {f.firstName} {f.middleName ? `${f.middleName}. ` : ''}{f.lastName}
                      </h3>
                      <p className="text-xl text-cyan-400 font-semibold mt-2">{f.position}</p>
                      <p className="text-gray-400 text-sm mt-1">{f.email}</p>
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(f)} className="p-3 bg-blue-600/20 border border-blue-600/40 rounded-xl text-blue-400 hover:bg-blue-600/40">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => deleteFaculty(f.id)} className="p-3 bg-red-600/20 border border-red-600/40 rounded-xl text-red-400 hover:bg-red-600/40">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {f.subjects?.length > 0 && (
                    <div>
                      <p className="text-gray-300 text-sm font-semibold mb-3">Teaches:</p>
                      <div className="flex flex-wrap gap-2">
                        {f.subjects.map((s: any) => (
                          <span key={s.id} className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 rounded-lg text-cyan-300 text-xs font-medium">
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