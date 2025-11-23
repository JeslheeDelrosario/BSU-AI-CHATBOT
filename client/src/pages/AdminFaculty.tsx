// client/src/pages/AdminFaculty.tsx
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
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: 'Professor',
    subjectIds: [] as string[]
  });

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
    'Program Chair, BS Mathematics',
    'College Extension and Services Unit (CESU) Head',
    'College Extension and Services Unit (CESU)',
    'College Research Development Unit (CRDU) Head',
    'College Research Development Unit (CRDU)',
    'Student Internship Program Coordinator',
    'College Clerk',
    'Laboratory Technician',
    'Medical Laboratory Technician',
    'Laboratory Technician',
    'Computer Laboratory Technician',
    'Professor, Science',
    'Professor, Mathematics',
    'Faculty (Part-Time), Science',
    'Faculty (Part-Time), Mathematics',
    'Assistant Professor',
    'Instructor',
    'Lecturer'
  ];

   
  const fetchData = async () => {
    setFetching(true);
    try {
      const [facRes, subRes] = await Promise.all([
        fetch('/api/admin/faculty', {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch('/api/admin/subjects', {
          headers: { "Authorization": `Bearer ${token}` }
        })
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
          lastName: form.lastName.trim(),
          email: form.email.toLowerCase().trim(),
          position: form.position,
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
      firstName: f.firstName,
      lastName: f.lastName,
      email: f.email,
      position: f.position || 'Professor',
      subjectIds: f.subjects?.map((s: any) => s.id) || []
    });
    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({
      firstName: '',
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
      <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-5xl text-red-400 font-bold">Access Denied</p>
          <p className="text-green-300 text-2xl mt-4">Admin Only</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#06251a] via-[#063021] to-[#095535] p-5 sm:p-8 pb-24">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-green-50 mb-4">
            Manage Faculty Members
          </h1>
          <p className="text-green-300 text-lg">College of Science • Bulacan State University</p>
        </div>

        {/* Add / Edit Form */}
        {isAdding && (
          <div className="bg-green-900/60 backdrop-blur-2xl rounded-3xl border border-green-700/70 shadow-2xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-green-100 flex items-center gap-3">
                <UserPlus className="w-8 h-8 text-green-400" />
                {editingId ? 'Edit' : 'Add New'} Faculty Member
              </h2>
              <button onClick={resetForm} className="text-green-400 hover:text-green-300">
                <X className="w-7 h-7" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input placeholder="First Name" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="px-6 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100 placeholder-green-400 focus:ring-4 focus:ring-green-500/50" />
              <input placeholder="Last Name" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="px-6 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100 placeholder-green-400 focus:ring-4 focus:ring-green-500/50" />
              <input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="px-6 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100 placeholder-green-400 focus:ring-4 focus:ring-green-500/50" />
              
              <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="px-6 py-4 bg-green-800/60 border border-green-600 rounded-2xl text-green-100">
                {positions.map(pos => <option key={pos} value={pos}>{pos}</option>)}
              </select>
            </div>

            <div className="mt-6">
              <p className="text-green-200 font-semibold mb-4">Subjects Taught (Select all that apply)</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {subjects.map(sub => (
                  <label key={sub.id} className="flex items-center gap-3 p-4 bg-green-800/50 rounded-xl border border-green-700/50 cursor-pointer hover:bg-green-700/50 transition-all">
                    <input
                      type="checkbox"
                      checked={form.subjectIds.includes(sub.id)}
                      onChange={() => toggleSubject(sub.id)}
                      className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                    />
                    <span className="text-green-100 text-sm">{sub.code} - {sub.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button onClick={resetForm} className="px-8 py-4 bg-green-800/60 text-green-300 rounded-2xl hover:bg-green-700/60 transition-all">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-green-950 font-bold rounded-2xl shadow-xl hover:from-green-400 hover:to-emerald-500 transform hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6" />}
                {editingId ? 'Update' : 'Add'} Faculty
              </button>
            </div>
          </div>
        )}

        {/* Faculty List */}
        <div className="bg-green-900/50 backdrop-blur-2xl rounded-3xl border border-green-700/60 shadow-2xl overflow-hidden">
          <div className="p-6 sm:p-8 bg-green-800/40 border-b border-green-700/50 flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-green-100">
                Faculty Members ({faculty.length})
              </h2>
              <p className="text-green-300">College of Science • Active Teaching Staff</p>
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-green-950 font-bold rounded-2xl shadow-xl hover:from-green-400 hover:to-emerald-500 transform hover:scale-105 transition-all flex items-center gap-3"
            >
              <UserPlus className="w-6 h-6" />
              Add Faculty
            </button>
          </div>

          {fetching ? (
            <div className="p-20 text-center">
              <Loader2 className="w-16 h-16 text-green-400 animate-spin mx-auto" />
            </div>
          ) : faculty.length === 0 ? (
            <div className="p-20 text-center text-green-400">
              <p className="text-3xl mb-4">No faculty members yet</p>
              <p>Click "Add Faculty" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6 sm:p-8">
              {faculty.map((f: any) => (
                <div key={f.id} className="bg-green-800/50 backdrop-blur-xl rounded-2xl border border-green-700/60 p-6 hover:border-green-500 hover:shadow-2xl transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-green-100">
                        {f.firstName} {f.lastName}
                      </h3>
                      <p className="text-green-300 font-semibold">{f.position}</p>
                      <p className="text-green-400 text-sm mt-1">{f.email}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(f)} className="p-3 bg-blue-600/30 text-blue-400 border border-blue-600/50 rounded-xl hover:bg-blue-600/50">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => deleteFaculty(f.id)} className="p-3 bg-red-600/30 text-red-400 border border-red-600/50 rounded-xl hover:bg-red-600/50">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {f.subjects?.length > 0 && (
                    <div className="mt-4">
                      <p className="text-green-200 text-sm font-semibold mb-2">Teaches:</p>
                      <div className="flex flex-wrap gap-2">
                        {f.subjects.map((s: any) => (
                          <span key={s.id} className="px-3 py-1 bg-green-700/50 rounded-lg text-green-200 text-xs">
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