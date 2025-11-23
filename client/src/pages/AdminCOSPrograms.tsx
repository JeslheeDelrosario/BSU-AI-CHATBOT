// client/src/pages/admin/COSPrograms.tsx
import { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { GraduationCap, Plus, Trash2, Loader2 } from 'lucide-react';
import api  from '../lib/api';

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

  
  // Fetch all programs from server
  const fetchPrograms = async () => {
    setFetching(true);
    try {
      const res = await api.get('/admin/cos-programs'); // <-- api adds token automatically
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

  // Add a new program
  const addProgram = async () => {
    if (!newTitle.trim()) return; // prevent empty titles
    setLoading(true);
    try {
      // Use your api helper so JWT is sent automatically
      await api.post('/admin/cos-programs', {
        title: newTitle.trim(),
        abbreviation: newAbbr.trim() || null,
      });

      // Clear input fields
      setNewTitle('');
      setNewAbbr('');

      // Refresh program list
      fetchPrograms();
    } catch (err) {
      alert("Failed to add program. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a program
  const deleteProgram = async (id: string) => {
  if (!confirm('Are you sure you want to delete this program?')) return;

  try {
    await api.delete(`/admin/cos-programs/${id}`); // <-- uses JWT automatically
    fetchPrograms(); // refresh list
  } catch (err) {
    console.error(err);
    alert("Failed to delete program.");
  }
};


  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl mb-6 text-red-400 font-bold">Restricted Access</div>
          <p className="text-green-300 text-xl sm:text-2xl font-bold">Admin Access Required</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] p-5 sm:p-6 lg:p-8 pb-24">
      <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-50 mb-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <GraduationCap className="w-12 h-12 sm:w-14 sm:h-14 text-green-400" />
            <span>Manage COS Programs</span>
          </h1>
          <p className="text-green-300 text-base sm:text-lg">Bulacan State University • College of Science</p>
        </div>

        {/* Add New Program */}
        <div className="bg-green-900/50 backdrop-blur-2xl rounded-3xl border border-green-700/60 shadow-2xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-green-100 mb-6 sm:mb-8 flex items-center gap-3">
            <Plus className="w-7 h-7 sm:w-8 sm:h-8 text-green-400" />
            Add New Program
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <input
              type="text"
              placeholder="Full Program Title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addProgram()}
              className="px-5 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-4 focus:ring-green-500/50 text-base sm:text-lg transition-all"
            />
            <input
              type="text"
              placeholder="Abbreviation"
              value={newAbbr}
              onChange={(e) => setNewAbbr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addProgram()}
              className="px-5 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100 placeholder-green-400 focus:outline-none focus:ring-4 focus:ring-green-500/50 text-base sm:text-lg transition-all"
            />
            <button
              onClick={addProgram}
              disabled={loading || !newTitle.trim()}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-green-950 font-bold text-lg sm:text-xl rounded-2xl shadow-2xl hover:from-green-400 hover:to-emerald-500 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 col-span-1 sm:col-span-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6 sm:w-7 sm:h-7" /> Add Program
                </>
              )}
            </button>
          </div>
        </div>

        {/* Current Programs List */}
        <div className="bg-green-900/50 backdrop-blur-2xl rounded-3xl border border-green-700/60 shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 bg-green-800/40 border-b border-green-700/50">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-100">
              Current Official Programs ({programs.length})
            </h2>
            <p className="text-green-300 mt-2 text-sm sm:text-base">Visible to students • Used by TISA AI</p>
          </div>

          {fetching ? (
            <div className="p-16 sm:p-20 text-center">
              <Loader2 className="w-14 h-14 sm:w-16 sm:h-16 text-green-400 animate-spin mx-auto" />
              <p className="text-green-300 mt-4 text-xl">Loading programs...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="p-16 sm:p-20 text-center">
              <div className="text-5xl sm:text-6xl mb-6 text-green-400">No programs found</div>
              <p className="text-green-300 text-lg sm:text-xl">Start by adding the first program above</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 sm:p-8">
              {programs.map((p) => (
                <div
                  key={p.id}
                  className="bg-green-800/50 backdrop-blur-xl rounded-2xl border border-green-700/60 p-6 sm:p-8 hover:border-green-500 hover:shadow-2xl transition-all duration-300 group relative"
                >
                  <div className="pr-12 sm:pr-14">
                    <h3 className="text-xl sm:text-2xl font-bold text-green-100 leading-tight">{p.title}</h3>
                    {p.abbreviation && <p className="text-green-300 text-lg font-semibold mt-2">{p.abbreviation}</p>}
                  </div>

                  <button
                    onClick={() => deleteProgram(p.id)}
                    className="absolute top-6 right-6 p-3 sm:p-4 bg-red-600/30 text-red-400 border border-red-600/50 rounded-xl hover:bg-red-600/50 hover:text-red-300 transform hover:scale-110 transition-all duration-300"
                    title="Delete Program"
                  >
                    <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  <div className="mt-6 bg-green-700/40 rounded-xl px-4 py-3 text-green-200 text-sm font-medium text-center">
                    Active 
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
