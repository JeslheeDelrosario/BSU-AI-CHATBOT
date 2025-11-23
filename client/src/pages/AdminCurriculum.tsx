// client/src/pages/AdminCurriculum.tsx
import { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Loader2
} from 'lucide-react';

export default function AdminCurriculum() {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [curriculum, setCurriculum] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    courseCode: '',
    subjectName: '',
    yearLevel: 1,
    semester: 1,
    units: 3,
    prerequisites: [] as string[]
  });

  // Fetch programs and initial data
  useEffect(() => {
    if (user?.role === 'ADMIN') fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    setFetching(true);
    try {
      const res = await fetch('/api/admin/cos-programs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPrograms(data || []);
      if (data.length > 0) setSelectedProgram(data[0].id);
    } catch (err) {
      console.error("Failed to load programs:", err);
    } finally {
      setFetching(false);
    }
  };

  // Fetch curriculum for selected program
  useEffect(() => {
    if (selectedProgram) fetchCurriculum(selectedProgram);
  }, [selectedProgram]);

  const fetchCurriculum = async (programId: string) => {
    setFetching(true);
    try {
      const res = await fetch(`/api/admin/curriculum/${programId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setCurriculum(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch curriculum:", err);
      setCurriculum([]);
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (!form.courseCode || !form.subjectName || !selectedProgram) return;
    try {
      const url = editingId
        ? `/api/admin/curriculum/${editingId}`
        : `/api/admin/curriculum`;
      const method = editingId ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          programId: selectedProgram,
          courseCode: form.courseCode,
          subjectName: form.subjectName,
          yearLevel: form.yearLevel,
          semester: form.semester,
          units: form.units,
          prerequisites: form.prerequisites
        })
      });
      resetForm();
      fetchCurriculum(selectedProgram);
    } catch (err) {
      alert("Failed to save curriculum entry.");
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Remove this subject from the curriculum?")) return;
    try {
      await fetch(`/api/admin/curriculum/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCurriculum(selectedProgram);
    } catch (err) {
      alert("Failed to remove subject.");
    }
  };

  const startEdit = (entry: any) => {
    setEditingId(entry.id);
    setForm({
      courseCode: entry.courseCode,
      subjectName: entry.subjectName,
      yearLevel: entry.yearLevel,
      semester: entry.semester,
      units: entry.units,
      prerequisites: entry.prerequisites || []
    });
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({ courseCode: '', subjectName: '', yearLevel: 1, semester: 1, units: 3, prerequisites: [] });
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535]">
        <div className="text-center text-green-300">
          <p className="text-6xl text-red-400 font-bold">Access Denied</p>
          <p className="text-2xl mt-4">Admin Only</p>
        </div>
      </div>
    );
  }

  const selectedProgramName = programs.find(p => p.id === selectedProgram)?.title || 'Select Program';

  return (
    <div className="min-h-screen p-6 sm:p-8 bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-50 mb-4">
            Curriculum Management
          </h1>
          <p className="text-green-300 text-lg">Manage subjects, prerequisites, and semesters per program</p>
        </div>

        {/* Program Selector */}
        <div className="bg-green-900/60 backdrop-blur-2xl rounded-3xl border border-green-700/70 shadow-2xl p-6">
          <label className="text-green-200 font-semibold mb-3 block">Select Program</label>
          <select
            value={selectedProgram}
            onChange={e => setSelectedProgram(e.target.value)}
            className="w-full px-6 py-4 bg-green-800/70 border border-green-600 rounded-2xl text-green-100 text-lg font-medium"
          >
            <option value="">Choose a program...</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.title} ({p.abbreviation})</option>
            ))}
          </select>
        </div>

        {/* Add/Edit Form */}
        {selectedProgram && (
          <div className="bg-green-900/60 backdrop-blur-2xl rounded-3xl border border-green-700/70 shadow-2xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-green-100 flex items-center gap-3">
                <Plus className="w-8 h-8 text-green-400" />
                {editingId ? 'Edit' : 'Add New'} Subject
              </h2>
              {isAdding && (
                <button onClick={resetForm} className="text-green-400 hover:text-green-300">
                  <X className="w-7 h-7" />
                </button>
              )}
            </div>

            {isAdding && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <input
                  type="text"
                  placeholder="Course Code"
                  value={form.courseCode}
                  onChange={e => setForm({...form, courseCode: e.target.value})}
                  className="px-5 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100"
                />
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={form.subjectName}
                  onChange={e => setForm({...form, subjectName: e.target.value})}
                  className="px-5 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100"
                />
                <select
                  value={form.yearLevel}
                  onChange={e => setForm({...form, yearLevel: Number(e.target.value)})}
                  className="px-5 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100"
                >
                  {[1,2,3,4].map(y => <option key={y} value={y}>{y} Year</option>)}
                </select>
                <select
                  value={form.semester}
                  onChange={e => setForm({...form, semester: Number(e.target.value)})}
                  className="px-5 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100"
                >
                  <option value={1}>1st Semester</option>
                  <option value={2}>2nd Semester</option>
                </select>
                <input
                  type="number"
                  min={1}
                  max={6}
                  value={form.units}
                  onChange={e => setForm({...form, units: Number(e.target.value)})}
                  placeholder="Units"
                  className="px-5 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100"
                />
                <input
                  type="text"
                  placeholder="Prerequisites (comma-separated codes)"
                  value={form.prerequisites.join(', ')}
                  onChange={e => setForm({...form, prerequisites: e.target.value.split(',').map(s => s.trim())})}
                  className="px-5 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100"
                />
                <button
                  onClick={handleSave}
                  className="col-span-full lg:col-span-1 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-green-950 font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3"
                >
                  <Check className="w-6 h-6" /> {editingId ? 'Update' : 'Add'} Subject
                </button>
              </div>
            )}

            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-green-950 font-bold rounded-2xl shadow-xl flex items-center gap-3"
              >
                <Plus className="w-6 h-6" /> Add Subject
              </button>
            )}
          </div>
        )}

        {/* Curriculum Table */}
        {selectedProgram && (
          <div className="bg-green-900/50 backdrop-blur-2xl rounded-3xl border border-green-700/60 shadow-2xl overflow-auto">
            <div className="p-6 sm:p-8 bg-green-800/40 border-b border-green-700/50">
              <h2 className="text-2xl sm:text-3xl font-bold text-green-100">
                Curriculum • {selectedProgramName}
              </h2>
              <p className="text-green-300 mt-2">Total Subjects: {curriculum.length}</p>
            </div>

            {fetching ? (
              <div className="p-20 text-center">
                <Loader2 className="w-16 h-16 text-green-400 animate-spin mx-auto" />
              </div>
            ) : curriculum.length === 0 ? (
              <div className="p-20 text-center text-green-400">
                <p className="text-4xl mb-4">No subjects added yet</p>
                <p>Click "Add Subject" to build the curriculum</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-green-700/50">
                      <th className="text-left p-6 text-green-200 font-semibold">Course Code</th>
                      <th className="text-left p-6 text-green-200 font-semibold">Subject Name</th>
                      <th className="text-center p-6 text-green-200 font-semibold">Year</th>
                      <th className="text-center p-6 text-green-200 font-semibold">Semester</th>
                      <th className="text-center p-6 text-green-200 font-semibold">Units</th>
                      <th className="text-left p-6 text-green-200 font-semibold">Prerequisites</th>
                      <th className="text-right p-6 text-green-200 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {curriculum.map((c: any) => (
                      <tr key={c.id} className="border-b border-green-800/30 hover:bg-green-800/20 transition-all">
                        <td className="p-6 text-green-100 font-medium">{c.courseCode}</td>
                        <td className="p-6 text-green-100">{c.subjectName}</td>
                        <td className="p-6 text-center text-green-300">{c.yearLevel}</td>
                        <td className="p-6 text-center text-green-300">{c.semester}</td>
                        <td className="p-6 text-center text-green-300 font-bold">{c.units}</td>
                        <td className="p-6 text-green-100">{(c.prerequisites || []).join(', ')}</td>
                        <td className="p-6 text-right">
                          <button onClick={() => startEdit(c)} className="p-2 bg-blue-600/30 text-blue-400 rounded-xl hover:bg-blue-600/50 mr-2">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => deleteEntry(c.id)} className="p-2 bg-red-600/30 text-red-400 rounded-xl hover:bg-red-600/50">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
