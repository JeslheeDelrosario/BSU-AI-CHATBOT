// client/src/pages/AdminCurriculum.tsx
// SEARCHABLE YEAR LEVEL + FULL BLACK CYBERPUNK DESIGN

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
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false); 
  const [semesterDropdownOpen, setSemesterDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");



  const [form, setForm] = useState({
    courseCode: '',
    subjectName: '',
    yearLevel: 1,
    semester: 1,
    units: 3,
    prerequisites: [] as string[]
  });

  // Year Level Options
  const yearOptions = [
    { value: 1, label: "1st Year" },
    { value: 2, label: "2nd Year" },
    { value: 3, label: "3rd Year" },
    { value: 4, label: "4th Year" }
  ];

  const filteredYears = yearOptions.filter(year =>
    year.label.toLowerCase().includes(
      yearOptions.find(y => y.value === form.yearLevel)?.label.toLowerCase() || ""
    )
  );

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
      const url = editingId ? `/api/admin/curriculum/${editingId}` : `/api/admin/curriculum`;
      const method = editingId ? 'PUT' : 'POST';
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          programId: selectedProgram,
          courseCode: form.courseCode.trim(),
          subjectName: form.subjectName.trim(),
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
    setYearDropdownOpen(false);
    setForm({
      courseCode: '',
      subjectName: '',
      yearLevel: 1,
      semester: 1,
      units: 3,
      prerequisites: []
    });
  };

  const selectedProgramName = programs.find(p => p.id === selectedProgram)?.title || 'Select Program';

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

  // 🔍 Filter curriculum results
  const filteredCurriculum = curriculum.filter((item) => {
    const q = searchQuery.toLowerCase();

    return (
      item.courseCode.toLowerCase().includes(q) ||
      item.subjectName.toLowerCase().includes(q) ||
      (item.prerequisites || []).join(", ").toLowerCase().includes(q) ||
      String(item.yearLevel).includes(q) ||
      (item.semester === 1 ? "1st sem" : "2nd sem").toLowerCase().includes(q)
    );
  });


  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Curriculum Management
          </h1>
          <p className="text-xl text-gray-400">
            Manage subjects, prerequisites, and semesters per program
          </p>
        </div>

        {/* Program Selector */}
        {/* PROGRAM SELECTOR — GOD-TIER CYBERPUNK DESIGN */}
<div className="bg-white/5 backdrop-blur-3xl rounded-3xl border border-cyan-500/30 shadow-2xl p-8 ring-2 ring-cyan-500/20 hover:ring-cyan-400/40 transition-all duration-500">
  <label className="text-xl font-bold text-cyan-300 tracking-wider mb-6 block">
    SELECT PROGRAM
  </label>

  <div className="relative group">
    {/* Custom Styled Select */}
    <select
      value={selectedProgram}
      onChange={e => setSelectedProgram(e.target.value)}
      className="appearance-none w-full px-10 py-7 bg-black/40 border-2 border-cyan-500/50 rounded-2xl text-cyan-100 text-xl font-medium tracking-wide
                 focus:outline-none focus:border-cyan-300 focus:ring-4 focus:ring-cyan-500/30 
                 transition-all duration-300 backdrop-blur-2xl cursor-pointer
                 hover:border-cyan-300 hover:bg-black/60"
    >
      <option value="" className="bg-black text-gray-400">
        Choose a program...
      </option>
      {programs.map(p => (
        <option key={p.id} value={p.id} className="bg-black text-cyan-100 py-4">
          {p.title} {p.abbreviation && `• ${p.abbreviation}`}
        </option>
      ))}
    </select>

    {/* Neon Arrow + Glow Effect */}
    <div className="absolute inset-y-0 right-0 flex items-center pr-10 pointer-events-none">
      <svg className="w-8 h-8 text-cyan-400 drop-shadow-glow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    {/* Floating Glow Line Underneath */}
    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
  </div>

  {/* Optional: Program count badge */}
  {programs.length > 0 && (
    <div className="mt-4 text-right">
      <span className="text-sm text-cyan-400/70 font-medium">
        {programs.length} program{programs.length !== 1 ? 's' : ''} available
      </span>
    </div>
  )}
</div>

        {/* Add/Edit Form */}
        {selectedProgram && (
          <div className="bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl p-8 lg:p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl lg:text-4xl font-bold text-white flex items-center gap-4">
                <BookOpen className="w-10 h-10 text-cyan-400" />
                {editingId ? 'Edit' : 'Add New'} Subject
              </h2>
              {isAdding && (
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X className="w-8 h-8" />
                </button>
              )}
            </div>

            {isAdding && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <input
                  type="text"
                  placeholder="Course Code (e.g. IT 101)"
                  value={form.courseCode}
                  onChange={e => setForm({ ...form, courseCode: e.target.value.toUpperCase() })}
                  className="px-8 py-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-xl"
                />
                <input
                  type="text"
                  placeholder="Subject Name"
                  value={form.subjectName}
                  onChange={e => setForm({ ...form, subjectName: e.target.value })}
                  className="px-8 py-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-xl"
                />

                {/* SEARCHABLE YEAR LEVEL */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Year Level (e.g. 2nd Year)"
                    value={yearOptions.find(y => y.value === form.yearLevel)?.label || ''}
                    onChange={e => {
                      const match = yearOptions.find(y => 
                        y.label.toLowerCase().includes(e.target.value.toLowerCase())
                      );
                      if (match) setForm({ ...form, yearLevel: match.value });
                    }}
                    onFocus={() => setYearDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setYearDropdownOpen(false), 200)}
                    className="w-full px-8 py-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 pr-16 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all backdrop-blur-xl cursor-pointer"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {yearDropdownOpen && (
                    <div className="absolute top-full mt-2 w-full bg-black/90 backdrop-blur-3xl border border-white/20 rounded-2xl shadow-2xl z-50">
                      {yearOptions.map(year => (
                        <button
                          key={year.value}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => {
                            setForm({ ...form, yearLevel: year.value });
                            setYearDropdownOpen(false);
                          }}
                          className="w-full px-8 py-5 text-left text-white hover:bg-purple-500/20 hover:text-purple-300 transition-all first:rounded-t-2xl last:rounded-b-2xl"
                        >
                          {year.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

               {/* SEARCHABLE SEMESTER SELECTOR */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Semester (e.g. 1st Semester)"
                    value={
                      form.semester === 1
                        ? "1st Semester"
                        : form.semester === 2
                        ? "2nd Semester"
                        : ""
                    }
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase();
                      
                      // Match 1st
                      if (value.includes("1") || value.includes("first") || value.includes("1st")) {
                        setForm({ ...form, semester: 1 });
                      }
                      // Match 2nd
                      if (value.includes("2") || value.includes("second") || value.includes("2nd")) {
                        setForm({ ...form, semester: 2 });
                      }
                    }}
                    onFocus={() => setSemesterDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setSemesterDropdownOpen(false), 200)}
                    className="w-full px-8 py-6 bg-white/5 border border-white/20 rounded-2xl 
                              text-white placeholder-gray-500 pr-16 
                              focus:outline-none focus:border-cyan-500 focus:ring-4 
                              focus:ring-cyan-500/20 transition-all backdrop-blur-xl cursor-pointer"
                  />

                  {/* Neon Arrow */}
                  <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Dropdown Options */}
                  {semesterDropdownOpen && (
                    <div className="absolute top-full mt-2 w-full bg-black/90 backdrop-blur-3xl 
                                    border border-white/20 rounded-2xl shadow-2xl z-50">
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setForm({ ...form, semester: 1 });
                          setSemesterDropdownOpen(false);
                        }}
                        className="w-full px-8 py-5 text-left text-white hover:bg-cyan-500/20 
                                  hover:text-cyan-300 transition-all first:rounded-t-2xl"
                      >
                        1st Semester
                      </button>

                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setForm({ ...form, semester: 2 });
                          setSemesterDropdownOpen(false);
                        }}
                        className="w-full px-8 py-5 text-left text-white hover:bg-cyan-500/20 
                                  hover:text-cyan-300 transition-all last:rounded-b-2xl"
                      >
                        2nd Semester
                      </button>
                    </div>
                  )}
                </div>


                <input
                  type="number"
                  min={1}
                  max={6}
                  value={form.units}
                  onChange={e => setForm({ ...form, units: Number(e.target.value) || 3 })}
                  placeholder="Units"
                  className="px-8 py-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-xl"
                />

                <input
                  type="text"
                  placeholder="Prerequisites (e.g. IT 101, MATH 201)"
                  value={form.prerequisites.join(', ')}
                  onChange={e => setForm({
                    ...form,
                    prerequisites: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="px-8 py-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all backdrop-blur-xl"
                />

                <button
                  onClick={handleSave}
                  className="col-span-full lg:col-span-1 px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all flex items-center justify-center gap-4"
                >
                  <Check className="w-7 h-7" />
                  {editingId ? 'Update Subject' : 'Add Subject'}
                </button>
              </div>
            )}

            {!isAdding && (
              <button
                onClick={() => setIsAdding(true)}
                className="px-12 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all flex items-center gap-4"
              >
                <Plus className="w-7 h-7" /> Add Subject
              </button>
            )}
          </div>
        )}

        {/* Curriculum Table */}
        {selectedProgram && (
          <div className="bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="p-8 lg:p-10 border-b border-white/10 bg-white/5">
              <h2 className="text-3xl lg:text-4xl font-bold text-white">
                Curriculum • {selectedProgramName}
              </h2>
              <p className="text-gray-400 mt-2">Total Subjects: {curriculum.length}</p>
            </div>
            {/* 🔍 Search Bar inside curriculum table */}
            <div className="p-8 lg:p-10 border-b border-white/10 bg-black/30 backdrop-blur-2xl">
              <input
                type="text"
                placeholder="Search subjects (code, name, prerequisites, year, sem...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-10 py-6 bg-black/40 border-2 border-cyan-500/40 
                          rounded-2xl text-white placeholder-cyan-300/40
                          focus:outline-none focus:border-cyan-300 
                          focus:ring-4 focus:ring-cyan-500/20 transition-all"
              />
            </div>


            {fetching ? (
              <div className="p-20 text-center">
                <Loader2 className="w-20 h-20 text-cyan-400 animate-spin mx-auto" />
              </div>
            ) : curriculum.length === 0 ? (
              <div className="p-20 text-center text-gray-500">
                <p className="text-4xl mb-6">No subjects added yet</p>
                <p className="text-xl">Click "Add Subject" to begin</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-6 text-cyan-300 font-semibold">Code</th>
                      <th className="text-left p-6 text-cyan-300 font-semibold">Subject</th>
                      <th className="text-center p-6 text-cyan-300 font-semibold">Year</th>
                      <th className="text-center p-6 text-cyan-300 font-semibold">Sem</th>
                      <th className="text-center p-6 text-cyan-300 font-semibold">Units</th>
                      <th className="text-left p-6 text-cyan-300 font-semibold">Prerequisites</th>
                      <th className="text-right p-6 text-cyan-300 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCurriculum.map((c: any) => (

                      <tr key={c.id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                        <td className="p-6 text-white font-mono font-bold">{c.courseCode}</td>
                        <td className="p-6 text-white">{c.subjectName}</td>
                        <td className="p-6 text-center text-purple-400 font-bold">
                          {c.yearLevel}{c.yearLevel === 1 ? 'st' : c.yearLevel === 2 ? 'nd' : c.yearLevel === 3 ? 'rd' : 'th'} Year
                        </td>
                        <td className="p-6 text-center text-cyan-400">{c.semester === 1 ? '1st' : '2nd'} Sem</td>
                        <td className="p-6 text-center text-white font-bold">{c.units}</td>
                        <td className="p-6 text-gray-300 text-sm">
                          {(c.prerequisites || []).join(', ') || '—'}
                        </td>
                        <td className="p-6 text-right space-x-3">
                          <button onClick={() => startEdit(c)} className="p-3 bg-blue-600/20 border border-blue-600/40 rounded-xl text-blue-400 hover:bg-blue-600/40">
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button onClick={() => deleteEntry(c.id)} className="p-3 bg-red-600/20 border border-red-600/40 rounded-xl text-red-400 hover:bg-red-600/40">
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