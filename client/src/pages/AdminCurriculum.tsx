// client/src/pages/AdminCurriculum.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useTranslation } from '../lib/translations';
import {
  BookOpen, Plus, Trash2, Edit2, X, Check, Loader2,
  ChevronDown, ChevronRight,
} from 'lucide-react';

type SemesterType = 1 | 2 | 3;

interface CurriculumEntry {
  id: string;
  courseCode: string;
  subjectName: string;
  yearLevel: number;
  semester: SemesterType;
  lec: number;
  lab: number;
  totalUnits: number;
  lecHours: number;
  labHours: number;
  totalHours: number;
  prerequisites: string[];
}

const YEAR_LABELS = {
  1: "1st Year",
  2: "2nd Year",
  3: "3rd Year",
  4: "4th Year",
  // you can add 5 if needed later
};

const SEMESTER_LABELS = {
  1: "1st Semester",
  2: "2nd Semester",
  3: "Mid-Year",
};

export default function AdminCurriculum() {
  const { user } = useAuth();
  const { settings: accessibilitySettings } = useAccessibility();
  const t = useTranslation(accessibilitySettings.language);
  const token = localStorage.getItem("token");

  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [curriculum, setCurriculum] = useState<CurriculumEntry[]>([]);
  const [fetching, setFetching] = useState(true);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<number | 'all'>('all');
  const [filterSemester, setFilterSemester] = useState<SemesterType | 'all'>('all');

  const [form, setForm] = useState({
    courseCode: '',
    subjectName: '',
    yearLevel: 1,
    semester: 1 as SemesterType,
    lec: 3,
    lab: 0,
    totalUnits: 3,
    lecHours: 3,
    labHours: 0,
    totalHours: 3,
    prerequisites: [] as string[]
  });

  // Which years are currently expanded
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set([1,2,3,4]));

 // ==================================================================
  // Fetch programs on mount
  // ==================================================================
  const fetchPrograms = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/cos-programs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPrograms(data || []);
      if (data.length > 0) setSelectedProgram(data[0].id);
    } catch (err) {
      console.error("Failed to load programs:", err);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === 'ADMIN') fetchPrograms();
  }, [user, fetchPrograms]);

  // ==================================================================
  // Fetch curriculum when program changes
  // ==================================================================
  const fetchCurriculum = useCallback(async (programId: string) => {
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
  }, [token]);

  useEffect(() => {
    if (selectedProgram) fetchCurriculum(selectedProgram);
  }, [selectedProgram, fetchCurriculum]);

  // ──────────────────────────────────────────────────────────────
  // Computed: group curriculum by year → semester
  // ──────────────────────────────────────────────────────────────
  const groupedCurriculum = useMemo(() => {
    const groups: Record<number, Record<SemesterType, CurriculumEntry[]>> = {};

    let filtered = [...curriculum];

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.courseCode.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.prerequisites.some(p => p.toLowerCase().includes(q))
      );
    }

    // Apply year filter
    if (filterYear !== 'all') {
      filtered = filtered.filter(item => item.yearLevel === filterYear);
    }

    // Apply semester filter
    if (filterSemester !== 'all') {
      filtered = filtered.filter(item => item.semester === filterSemester);
    }

    // Group
    filtered.forEach(item => {
      if (!groups[item.yearLevel]) {
        groups[item.yearLevel] = { 1: [], 2: [], 3: [] };
      }
      groups[item.yearLevel][item.semester].push(item);
    });

    return groups;
  }, [curriculum, searchQuery, filterYear, filterSemester]);

  // Calculate units
  const calculateUnits = (entries: CurriculumEntry[]) =>
    entries.reduce((sum, item) => sum + (item.totalUnits || 0), 0);

  const handleSave = async () => {
    if (!form.courseCode.trim() || !form.subjectName.trim() || !selectedProgram) return;

    // Optional: warn about mid-year in early years
    if (form.semester === 3 && form.yearLevel <= 2) {
      if (!window.confirm(
        "Mid-Year subjects are uncommon in 1st and 2nd year.\nDo you want to continue?"
      )) {
        return;
      }
    }

    try {
      const payload = {
        programId: selectedProgram,
        courseCode: form.courseCode.trim().toUpperCase(),
        subjectName: form.subjectName.trim(),
        yearLevel: form.yearLevel,
        semester: form.semester,
        lec: form.lec,
        lab: form.lab,
        totalUnits: form.totalUnits,
        lecHours: form.lecHours,
        labHours: form.labHours,
        totalHours: form.totalHours,
        prerequisites: form.prerequisites
      };

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
        body: JSON.stringify(payload)
      });

      resetForm();
      fetchCurriculum(selectedProgram);
    } catch (err) {
      alert("Failed to save curriculum entry.");
    }
  };

  const deleteEntry = async (id: string) => {
    if (!window.confirm("Remove this subject?")) return;
    try {
      await fetch(`/api/admin/curriculum/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCurriculum(selectedProgram);
    } catch (err) {
      alert("Failed to delete entry.");
    }
  };

  const startEdit = (entry: CurriculumEntry) => {
    setEditingId(entry.id);
    setForm({
      courseCode: entry.courseCode,
      subjectName: entry.subjectName,
      yearLevel: entry.yearLevel,
      semester: entry.semester,
      lec: entry.lec || 0,
      lab: entry.lab || 0,
      totalUnits: entry.totalUnits || 0,
      lecHours: entry.lecHours || 0,
      labHours: entry.labHours || 0,
      totalHours: entry.totalHours || 0,
      prerequisites: [...entry.prerequisites]
    });
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({
      courseCode: '',
      subjectName: '',
      yearLevel: 1,
      semester: 1,
      lec: 3,
      lab: 0,
      totalUnits: 3,
      lecHours: 3,
      labHours: 0,
      totalHours: 3,
      prerequisites: []
    });
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-600">
            ACCESS DENIED
          </h1>
          <p className="text-2xl text-cyan-400">Admin access required</p>
        </div>
      </div>
    );
  }

  const selectedProgramName = programs.find(p => p.id === selectedProgram)?.title || '';

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-10">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
            {t.curriculum.title}
          </h1>
          <p className="text-xl text-muted-foreground">
            {selectedProgramName ? `${selectedProgramName} ${accessibilitySettings.language === 'fil' ? 'Kurikulum' : 'Curriculum'}` : (accessibilitySettings.language === 'fil' ? 'Pumili ng programa upang magsimula' : 'Select a program to begin')}
          </p>
        </div>

        {/* Program Selector */}
        <div className="bg-card/70 backdrop-blur-xl rounded-2xl border border-border p-6 shadow-xl">
          <label className="block text-lg font-semibold mb-3">{accessibilitySettings.language === 'fil' ? 'Programa' : 'Program'}</label>
          <select
            value={selectedProgram}
            onChange={e => setSelectedProgram(e.target.value)}
            className="w-full px-5 py-4 bg-background border border-border rounded-xl focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30 transition-all"
          >
            <option value="">{accessibilitySettings.language === 'fil' ? 'Pumili ng Programa...' : 'Select Program...'}</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>
                {p.title} {p.abbreviation ? `(${p.abbreviation})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Filters */}
        {selectedProgram && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card/50 backdrop-blur-lg rounded-2xl border border-border p-6">
            <div>
              <label className="block text-sm font-medium mb-1.5">{accessibilitySettings.language === 'fil' ? 'Maghanap' : 'Search'}</label>
              <input
                type="text"
                placeholder={accessibilitySettings.language === 'fil' ? 'Code, pangalan ng asignatura, prerequisite...' : 'Code, subject name, prerequisite...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Year Level</label>
              <select
                value={filterYear}
                onChange={e => setFilterYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-cyan-500 transition-all"
              >
                <option value="all">{accessibilitySettings.language === 'fil' ? 'Lahat ng Taon' : 'All Years'}</option>
                {[1,2,3,4].map(y => (
                  <option key={y} value={y}>{YEAR_LABELS[y as keyof typeof YEAR_LABELS]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Semester</label>
              <select
                value={filterSemester}
                onChange={e => setFilterSemester(e.target.value === 'all' ? 'all' : Number(e.target.value) as SemesterType)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-cyan-500 transition-all"
              >
                <option value="all">{accessibilitySettings.language === 'fil' ? 'Lahat ng Semestre' : 'All Semesters'}</option>
                <option value={1}>{accessibilitySettings.language === 'fil' ? '1st Semestre' : '1st Semester'}</option>
                <option value={2}>{accessibilitySettings.language === 'fil' ? '2nd Semestre' : '2nd Semester'}</option>
                <option value={3}>{accessibilitySettings.language === 'fil' ? 'Mid-Year' : 'Mid-Year'}</option>
              </select>
            </div>
          </div>
        )}

        {/* Add / Edit Form */}
        {selectedProgram && (
          <div className="bg-card/70 backdrop-blur-xl rounded-2xl border border-border p-6 lg:p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <BookOpen className="w-7 h-7 text-cyan-400" />
                {editingId ? (accessibilitySettings.language === 'fil' ? 'I-edit ang Asignatura' : 'Edit Subject') : (accessibilitySettings.language === 'fil' ? 'Magdagdag ng Bagong Asignatura' : 'Add New Subject')}
              </h2>

              {isAdding && (
                <button
                  onClick={resetForm}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={28} />
                </button>
              )}
            </div>

            {isAdding ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* Course Code */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">{accessibilitySettings.language === 'fil' ? 'Course Code' : 'Course Code'}</label>
                  <input
                    value={form.courseCode}
                    onChange={e => setForm({ ...form, courseCode: e.target.value.toUpperCase() })}
                    placeholder={accessibilitySettings.language === 'fil' ? 'hal. CS 101' : 'e.g. CS 101'}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-cyan-500 transition-all"
                  />
                </div>

                {/* Subject Name */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium mb-1.5">{accessibilitySettings.language === 'fil' ? 'Pangalan ng Asignatura' : 'Subject Name'}</label>
                  <input
                    value={form.subjectName}
                    onChange={e => setForm({ ...form, subjectName: e.target.value })}
                    placeholder={accessibilitySettings.language === 'fil' ? 'hal. Introduction to Computing' : 'e.g. Introduction to Computing'}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-cyan-500 transition-all"
                  />
                </div>

                {/* Year Level */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">{accessibilitySettings.language === 'fil' ? 'Antas ng Taon' : 'Year Level'}</label>
                  <select
                    value={form.yearLevel}
                    onChange={e => setForm({ ...form, yearLevel: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-cyan-500 transition-all"
                  >
                    {[1,2,3,4].map(y => (
                      <option key={y} value={y}>
                        {YEAR_LABELS[y as keyof typeof YEAR_LABELS]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">{accessibilitySettings.language === 'fil' ? 'Semestre' : 'Semester'}</label>
                  <select
                    value={form.semester}
                    onChange={e => setForm({ ...form, semester: Number(e.target.value) as SemesterType })}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-cyan-500 transition-all"
                  >
                    <option value={1}>{accessibilitySettings.language === 'fil' ? '1st Semestre' : '1st Semester'}</option>
                    <option value={2}>{accessibilitySettings.language === 'fil' ? '2nd Semestre' : '2nd Semester'}</option>
                    <option value={3}>{accessibilitySettings.language === 'fil' ? 'Mid-Year' : 'Mid-Year'}</option>
                  </select>
                </div>

                {/* Lecture Units */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Lec Units</label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={form.lec}
                    onChange={e => {
                      const lec = Number(e.target.value) || 0;
                      const totalUnits = lec + form.lab;
                      setForm({ ...form, lec, totalUnits, lecHours: lec, totalHours: lec + form.labHours });
                    }}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-cyan-500 transition-all"
                  />
                </div>

                {/* Lab Units */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Lab Units</label>
                  <input
                    type="number"
                    min={0}
                    max={12}
                    value={form.lab}
                    onChange={e => {
                      const lab = Number(e.target.value) || 0;
                      const totalUnits = form.lec + lab;
                      setForm({ ...form, lab, totalUnits, labHours: lab * 3, totalHours: form.lecHours + (lab * 3) });
                    }}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-cyan-500 transition-all"
                  />
                </div>

                {/* Total Units (Read-only) */}
                <div>
                  <label className="block text-sm font-medium mb-1.5">Total Units</label>
                  <input
                    type="number"
                    value={form.totalUnits}
                    readOnly
                    className="w-full px-4 py-3 bg-muted border border-border rounded-xl cursor-not-allowed"
                  />
                </div>

                {/* Prerequisites */}
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium mb-1.5">Prerequisites (comma separated)</label>
                  <input
                    value={form.prerequisites.join(', ')}
                    onChange={e => {
                      const arr = e.target.value
                        .split(',')
                        .map(s => s.trim())
                        .filter(Boolean);
                      setForm({ ...form, prerequisites: arr });
                    }}
                    placeholder="e.g. CS 101, MATH 101"
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-cyan-500 transition-all"
                  />
                </div>

                {/* Save Button */}
                <div className="col-span-full flex justify-end gap-4 mt-4">
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!form.courseCode.trim() || !form.subjectName.trim()}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Check size={20} />
                    {editingId ? 'Update Subject' : 'Add Subject'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-xl font-medium hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
              >
                <Plus size={22} />
                Add New Subject
              </button>
            )}
          </div>
        )}

        {/* Curriculum Content */}
        {selectedProgram && (
          <div className="space-y-6">
            {fetching ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
              </div>
            ) : Object.keys(groupedCurriculum).length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-2xl mb-3">No subjects found</p>
                <p>Try adjusting filters or add your first subject</p>
              </div>
            ) : (
              Object.entries(groupedCurriculum)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([yearStr, semesters]) => {
                  const year = Number(yearStr);
                  const yearTotal = 
                    calculateUnits(semesters[1]) +
                    calculateUnits(semesters[2]) +
                    calculateUnits(semesters[3]);

                  const isExpanded = expandedYears.has(year);

                  return (
                    <div
                      key={year}
                      className="bg-card/60 backdrop-blur-xl rounded-2xl border border-border overflow-hidden shadow-xl"
                    >
                      {/* Year Header */}
                      <button
                        onClick={() => {
                          const newSet = new Set(expandedYears);
                          if (newSet.has(year)) {
                            newSet.delete(year);
                          } else {
                            newSet.add(year);
                          }
                          setExpandedYears(newSet);
                        }}
                        className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-slate-900/40 to-slate-800/40 hover:from-slate-800/60 hover:to-slate-700/60 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          {isExpanded ? (
                            <ChevronDown className="w-7 h-7 text-cyan-400" />
                          ) : (
                            <ChevronRight className="w-7 h-7 text-cyan-400" />
                          )}
                          <h3 className="text-2xl font-bold">
                            {YEAR_LABELS[year as keyof typeof YEAR_LABELS]}
                          </h3>
                          <span className="text-lg text-cyan-300 font-medium">
                            ({yearTotal} units)
                          </span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-6 space-y-8">
                          {[1, 2, 3].map(sem => {
                            const entries = semesters[sem as SemesterType] || [];
                            if (entries.length === 0) return null;

                            const semTotal = calculateUnits(entries);

                            return (
                              <div key={sem} className="space-y-4">
                                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                                  <h4 className="text-xl font-semibold text-cyan-300">
                                    {SEMESTER_LABELS[sem as keyof typeof SEMESTER_LABELS]}
                                  </h4>
                                  <span className="text-lg font-medium">
                                    {semTotal} units
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                                  {entries.map(entry => (
                                    <div
                                      key={entry.id}
                                      className="bg-background/70 border border-border/70 rounded-xl p-5 hover:border-cyan-500/50 transition-all group"
                                    >
                                      <div className="flex justify-between items-start mb-3">
                                        <div>
                                          <div className="font-mono font-bold text-lg text-cyan-300">
                                            {entry.courseCode}
                                          </div>
                                          <div className="text-base font-medium mt-0.5">
                                            {entry.subjectName}
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="text-xl font-bold text-purple-300">
                                            {entry.totalUnits}
                                          </div>
                                          <div className="text-xs text-muted-foreground">units</div>
                                          <div className="text-xs text-cyan-400 mt-1">
                                            Lec: {entry.lec} / Lab: {entry.lab}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Prerequisites */}
                                      {entry.prerequisites.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                          {entry.prerequisites.map((pre, i) => (
                                            <span
                                              key={i}
                                              className="px-2.5 py-1 bg-purple-950/60 text-purple-300 text-xs rounded-md border border-purple-700/40"
                                            >
                                              {pre}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <div className="text-sm text-muted-foreground mt-3 italic">
                                          No prerequisites
                                        </div>
                                      )}

                                      {/* Actions */}
                                      <div className="flex justify-end gap-3 mt-4 opacity-70 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => startEdit(entry)}
                                          className="p-2 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 transition-colors"
                                        >
                                          <Edit2 size={18} />
                                        </button>
                                        <button
                                          onClick={() => deleteEntry(entry.id)}
                                          className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 transition-colors"
                                        >
                                          <Trash2 size={18} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        )}
      </div>
    </div>
  );
}