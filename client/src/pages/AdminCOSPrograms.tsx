// client/src/pages/admin/COSPrograms.tsx
// CLEAN BLACK CYBERPUNK DESIGN — NO BACKGROUND ORBS — SAME LOGIC

import { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { GraduationCap, Plus, Trash2, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface Program {
  id: string;
  title: string;
  abbreviation?: string | null;
}

export default function COSPrograms() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newAbbr, setNewAbbr] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchPrograms = async () => {
    setFetching(true);
    try {
      const res = await api.get('/admin/cos-programs');
      setPrograms(res.data || []);
    } catch (err) {
      console.error("Failed to fetch programs:", err);
      setPrograms([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchPrograms();
    }
  }, [user]);

  const addProgram = async () => {
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      await api.post('/admin/cos-programs', {
        title: newTitle.trim(),
        abbreviation: newAbbr.trim() || null,
      });
      setNewTitle('');
      setNewAbbr('');
      fetchPrograms();
    } catch (err) {
      alert("Failed to add program. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProgram = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    try {
      await api.delete(`/admin/cos-programs/${id}`);
      fetchPrograms();
    } catch (err) {
      console.error(err);
      alert("Failed to delete program.");
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-6xl font-black bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent mb-6">
            Restricted Access
          </h1>
          <p className="text-2xl text-cyan-400 font-bold">Admin Access Required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Header */}
      <div className="max-w-6xl mx-auto p-6 lg:p-10 text-center mb-12">
        <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 flex flex-col lg:flex-row items-center justify-center gap-6">
          <GraduationCap className="w-16 h-16 lg:w-20 lg:h-20 text-cyan-400" />
          <span>Manage COS Programs</span>
        </h1>
        <p className="text-xl text-gray-400">
          Bulacan State University • College of Science
        </p>
      </div>

      <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-10">

        {/* Add New Program Card */}
        <div className="bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl p-8 lg:p-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8 flex items-center gap-4">
            <Plus className="w-10 h-10 text-cyan-400" />
            Add New Program
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="text"
              placeholder="Full Program Title (e.g. Bachelor of Science in Information Technology)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addProgram()}
              className="px-8 py-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 text-lg transition-all backdrop-blur-xl"
            />
            <input
              type="text"
              placeholder="Abbreviation (e.g. BSIT)"
              value={newAbbr}
              onChange={(e) => setNewAbbr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addProgram()}
              className="px-8 py-6 bg-white/5 border border-white/20 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 text-lg transition-all backdrop-blur-xl"
            />
            <button
              onClick={addProgram}
              disabled={loading || !newTitle.trim()}
              className="px-10 py-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 gap-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-7 h-7 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-7 h-7" />
                  Add Program
                </>
              )}
            </button>
          </div>
        </div>

        {/* Current Programs List */}
        <div className="bg-white/5 backdrop-blur-3xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-8 lg:p-10 border-b border-white/10 bg-white/5">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Current Official Programs
              <span className="text-cyan-400 ml-4">({programs.length})</span>
            </h2>
            <p className="text-gray-400 mt-2 text-lg">
              Visible to students • Used by TISA AI
            </p>
          </div>

          {fetching ? (
            <div className="p-20 text-center">
              <Loader2 className="w-20 h-20 text-cyan-400 animate-spin mx-auto" />
              <p className="text-2xl text-gray-400 mt-6">Loading programs...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="p-20 text-center">
              <div className="text-6xl mb-8 text-gray-600">No programs found</div>
              <p className="text-2xl text-gray-400">Start by adding your first program above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-10">
              {programs.map((p) => (
                <div
                  key={p.id}
                  className="group relative bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-500"
                >
                  <button
                    onClick={() => deleteProgram(p.id)}
                    className="absolute top-6 right-6 p-3 bg-red-600/20 border border-red-600/40 rounded-xl text-red-400 hover:bg-red-600/40 hover:text-red-300 transform hover:scale-110 transition-all"
                    title="Delete Program"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>

                  <h3 className="text-2xl lg:text-3xl font-bold text-white pr-12 leading-tight">
                    {p.title}
                  </h3>
                  {p.abbreviation && (
                    <p className="text-xl lg:text-2xl font-bold text-cyan-400 mt-3">
                      {p.abbreviation}
                    </p>
                  )}

                  <div className="mt-8 inline-block px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/40 rounded-xl text-cyan-300 font-semibold">
                    Active Program
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}