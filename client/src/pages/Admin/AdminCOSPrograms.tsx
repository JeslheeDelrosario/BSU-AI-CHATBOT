// client/src/pages/AdminCOSPrograms.tsx
import { useState, useEffect } from 'react';
import { useAuth } from "../../contexts/AuthContext";
import { GraduationCap, Plus, Trash2, Loader2, Pencil } from 'lucide-react';
import api from '../../lib/api';

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
  const [loading, setLoading] = useState(false);               // global add loading
  const [fetching, setFetching] = useState(true);

  // Track which program is being edited + temporary values
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAbbr, setEditAbbr] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null); // per-program saving state

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
    if (!confirm('Are you sure you want to delete this program? This will also delete related curriculum entries.')) return;
    
    try {
      const res = await api.delete(`/admin/cos-programs/${id}`);
      alert(res.data.message || 'Program deleted successfully!');
      fetchPrograms();
    } catch (err: any) {
      console.error(err);
      const serverMsg = err.response?.data?.message || 'Failed to delete program.';
      alert(serverMsg);
    }
  };

  // Start editing a program
  const startEdit = (program: Program) => {
    setEditingProgramId(program.id);
    setEditTitle(program.title);
    setEditAbbr(program.abbreviation || '');
  };

  // Save edited program
  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) {
      alert("Title cannot be empty!");
      return;
    }

    setSavingId(id);

    try {
      await api.put(`/admin/cos-programs/${id}`, {
        title: editTitle.trim(),
        abbreviation: editAbbr.trim() || null,
      });

      // Update local state optimistically
      setPrograms(prev =>
        prev.map(p =>
          p.id === id
            ? { ...p, title: editTitle.trim(), abbreviation: editAbbr.trim() || null }
            : p
        )
      );

      // Small success feedback
      alert("Program updated successfully! ✓");

      // Reset editing state
      setEditingProgramId(null);
      setEditTitle('');
      setEditAbbr('');
    } catch (err: any) {
      console.error("Failed to update program:", err);
      alert(err.response?.data?.message || "Failed to update program. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingProgramId(null);
    setEditTitle('');
    setEditAbbr('');
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

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-10 lg:py-12 text-center mb-10">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <GraduationCap className="w-16 h-16 sm:w-20 sm:h-20 text-cyan-500" />
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent pb-1 md:pb-4 leading-tight md:leading-snug inline-block">
            Manage COS Programs
          </h1>
        </div>
        <p className="mt-4 text-lg sm:text-xl text-muted-foreground">
          Bulacan State University • College of Science
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12 space-y-10 lg:space-y-12">

        {/* Add New Program Card */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border shadow-xl p-8 lg:p-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-8 flex items-center gap-4">
            <Plus className="w-9 h-9 lg:w-10 lg:h-10 text-cyan-500" />
            Add New Program
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input
              type="text"
              placeholder="Full Program Title (e.g. Bachelor of Science in Information Technology)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addProgram()}
              className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all text-base lg:text-lg"
            />
            <input
              type="text"
              placeholder="Abbreviation (e.g. BSIT)"
              value={newAbbr}
              onChange={(e) => setNewAbbr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addProgram()}
              className="px-6 py-5 bg-card/60 border border-border rounded-2xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/20 transition-all text-base lg:text-lg"
            />
            <button
              onClick={addProgram}
              disabled={loading || !newTitle.trim()}
              className="
                px-8 py-5 
                bg-gradient-to-r from-cyan-600 via-cyan-500 to-purple-600 
                text-white font-bold text-lg rounded-2xl
                shadow-lg shadow-cyan-500/30
                hover:shadow-cyan-400/60 hover:shadow-2xl
                hover:brightness-110
                transform hover:scale-105 
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                flex items-center justify-center gap-3
                border border-cyan-400/30
                relative overflow-hidden
                before:absolute before:inset-0 before:bg-gradient-to-r 
                before:from-transparent before:via-white/10 before:to-transparent
                before:opacity-0 hover:before:opacity-100 before:transition-opacity
              "
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-6 h-6" />
                  Add Program
                </>
              )}
            </button>
          </div>
        </div>

        {/* Current Programs List */}
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border shadow-xl overflow-hidden">
          <div className="p-8 lg:p-10 border-b border-border bg-card/60">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Current Official Programs
              <span className="text-cyan-500 ml-4">({programs.length})</span>
            </h2>
            <p className="mt-2 text-muted-foreground text-lg">
              Visible to students • Used by TISA AI
            </p>
          </div>

          {fetching ? (
            <div className="p-16 lg:p-20 text-center">
              <Loader2 className="w-16 h-16 lg:w-20 lg:h-20 text-cyan-500 animate-spin mx-auto" />
              <p className="mt-6 text-xl lg:text-2xl text-muted-foreground">Loading programs...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="p-16 lg:p-20 text-center">
              <div className="text-5xl lg:text-6xl mb-6 text-muted-foreground/60">No programs found</div>
              <p className="text-lg lg:text-xl text-muted-foreground">
                Start by adding your first program above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 p-6 lg:p-10">
              {programs.map((p) => {
                const isEditing = editingProgramId === p.id;
                const isSaving = savingId === p.id;

                return (
                  <div
                    key={p.id}
                    className="group relative bg-card/60 border border-border rounded-3xl p-7 lg:p-8 backdrop-blur-xl hover:border-cyan-500/50 hover:bg-card/90 transition-all duration-300"
                  >
                    {/* Delete button */}
                    <button
                      onClick={() => deleteProgram(p.id)}
                      disabled={isEditing || isSaving}
                      className="absolute top-5 right-5 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all hover:scale-110 disabled:opacity-50"
                      title="Delete Program"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>

                    {/* Edit button (only visible when not editing) */}
                    {!isEditing && !isSaving && (
                      <button
                        onClick={() => startEdit(p)}
                        className="absolute top-5 right-20 p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 hover:bg-cyan-500/30 hover:text-cyan-300 transition-all hover:scale-110"
                        title="Edit Program"
                      >
                        <Pencil className="w-5 h-5" />
                      </button>
                    )}

                    {/* Title */}
                    <div className="mt-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(p.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                          className="w-full px-3 py-2 bg-white/10 border border-cyan-500/50 rounded-lg text-foreground text-2xl lg:text-3xl font-bold focus:outline-none focus:border-cyan-400"
                        />
                      ) : (
                        <h3 className="text-2xl lg:text-3xl font-bold text-foreground pr-28 leading-tight cursor-pointer hover:text-cyan-400 transition-colors"
                          onClick={() => startEdit(p)}
                        >
                          {p.title}
                        </h3>
                      )}
                    </div>

                    {/* Abbreviation */}
                    <div className="mt-3">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editAbbr}
                          onChange={(e) => setEditAbbr(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(p.id);
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          placeholder="e.g. BSIT"
                          className="w-full px-3 py-2 bg-white/10 border border-cyan-500/50 rounded-lg text-cyan-400 text-xl lg:text-2xl font-semibold focus:outline-none focus:border-cyan-400"
                        />
                      ) : (
                        p.abbreviation && (
                          <p className="text-xl lg:text-2xl font-semibold text-cyan-500 cursor-pointer hover:text-cyan-300 transition-colors"
                            onClick={() => startEdit(p)}
                          >
                            {p.abbreviation}
                          </p>
                        )
                      )}
                    </div>

                    {/* Save / Cancel buttons when editing */}
                    {isEditing && (
                      <div className="mt-6 flex gap-3">
                        <button
                          onClick={() => saveEdit(p.id)}
                          disabled={isSaving}
                          className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:brightness-110 transition-all disabled:opacity-60"
                        >
                          {isSaving ? (
                            <Loader2 className="w-5 h-5 animate-spin inline" />
                          ) : (
                            'Save'
                          )}
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-5 py-2 bg-gray-600/50 text-white rounded-lg hover:bg-gray-600/70 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {/* Status badge */}
                    {!isEditing && (
                      <div className="mt-6 inline-block px-5 py-2.5 bg-gradient-to-r from-cyan-600 via-cyan-500 to-purple-600 
                        text-white font-bold text-lg rounded-2xl
                        shadow-lg shadow-cyan-500/30
                        hover:shadow-cyan-400/60 hover:shadow-2xl
                        hover:brightness-110
                        transform hover:scale-105 
                        transition-all duration-300 font-medium text-sm lg:text-base">
                        Active Program
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}