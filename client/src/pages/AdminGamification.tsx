// client/src/pages/AdminGamification.tsx
import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Trophy, Plus, Trash2, Edit2, Save, X, Zap, BarChart2, CheckCircle, RefreshCw, Settings, Target, Clock } from 'lucide-react';

interface AchievementDef {
  id: string; type: string; title: string; description: string; icon: string;
  points: number; requirementType: string; requirementValue: number; isActive: boolean;
  _count?: { Achievements: number };
}
interface LeaderboardConfig {
  id: string; name: string; metric: string; courseId: string | null; topN: number; isActive: boolean;
}
interface Course { id: string; title: string; }

const ACHIEVEMENT_TYPES = ['FIRST_COURSE','FIVE_COURSES','TEN_COURSES','COURSE_COMPLETION','PERFECT_SCORE','QUIZ_MASTER','STREAK','DEDICATED_LEARNER','CORRECT_ANSWERS_100','CORRECT_ANSWERS_500','MILESTONE','SPEED_LEARNER','EARLY_BIRD','NIGHT_OWL','HELPFUL_PEER','LEADERBOARD_TOP1','LEADERBOARD_TOP3','MODULE_COMPLETE','RANK_NEWCOMER','RANK_LEARNER','RANK_EXPLORER','RANK_ACHIEVER','RANK_SCHOLAR','RANK_EXPERT','RANK_MASTER_SCHOLAR'];
const REQUIREMENT_TYPES = [{value:'COURSE_COMPLETION',label:'Courses Completed'},{value:'LESSON_COMPLETION',label:'Lessons Completed'},{value:'CORRECT_ANSWERS',label:'Correct Answers'},{value:'PERFECT_SCORE',label:'Perfect Scores (100%)'},{value:'STREAK',label:'Day Streak'},{value:'ENROLLMENT',label:'Courses Enrolled'},{value:'TIME_SPENT',label:'Time Spent (Hours)'},{value:'FIRST_LOGIN',label:'First Login'},{value:'LESSONS_BROWSED',label:'Lessons Browsed'},{value:'RANK_COMPOSITE',label:'Composite (Courses×100 + Hours)'},{value:'ALL_COURSES',label:'All Courses + Min Hours'}];
const LEADERBOARD_METRICS = [{value:'COURSE_COMPLETION',label:'Course Completions'},{value:'QUIZ_SCORE',label:'Average Quiz Score'},{value:'CORRECT_ANSWERS',label:'Correct Answers'},{value:'COMPLETION_TIME',label:'Fastest Completion Time'},{value:'ACHIEVEMENT_POINTS',label:'Achievement Points'}];

const emptyAchForm = { type: ACHIEVEMENT_TYPES[0], title: '', description: '', icon: '🏆', points: 10, requirementType: 'COURSE_COMPLETION', requirementValue: 1 };
const emptyLbForm = { name: '', metric: 'COURSE_COMPLETION', courseId: '', topN: 10 };

export default function AdminGamification() {
  const [activeTab, setActiveTab] = useState<'achievements'|'leaderboards'>('achievements');
  const [definitions, setDefinitions] = useState<AchievementDef[]>([]);
  const [configs, setConfigs] = useState<LeaderboardConfig[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [showAchForm, setShowAchForm] = useState(false);
  const [achForm, setAchForm] = useState({...emptyAchForm});
  const [editingAchId, setEditingAchId] = useState<string|null>(null);
  const [savingAch, setSavingAch] = useState(false);
  const [showLbForm, setShowLbForm] = useState(false);
  const [lbForm, setLbForm] = useState({...emptyLbForm});
  const [editingLbId, setEditingLbId] = useState<string|null>(null);
  const [savingLb, setSavingLb] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [defRes, cfgRes, courseRes] = await Promise.all([api.get('/gamification/achievement-definitions'), api.get('/gamification/leaderboard-configs'), api.get('/courses')]);
      setDefinitions(defRes.data.definitions ?? []);
      setConfigs(cfgRes.data.configs ?? []);
      setCourses(courseRes.data.courses ?? []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSeedDefaults = async () => {
    try { setSeeding(true); await api.post('/gamification/achievement-definitions/seed'); await fetchAll(); }
    catch (err) { console.error(err); } finally { setSeeding(false); }
  };

  const openNewAchForm = () => { setAchForm({...emptyAchForm}); setEditingAchId(null); setShowAchForm(true); };
  const openEditAchForm = (d: AchievementDef) => { setAchForm({type:d.type,title:d.title,description:d.description,icon:d.icon,points:d.points,requirementType:d.requirementType,requirementValue:d.requirementValue}); setEditingAchId(d.id); setShowAchForm(true); };

  const handleSaveAch = async () => {
    try {
      setSavingAch(true);
      if (editingAchId) await api.put(`/gamification/achievement-definitions/${editingAchId}`, achForm);
      else await api.post('/gamification/achievement-definitions', achForm);
      setShowAchForm(false); await fetchAll();
    } catch (err: any) { alert(err?.response?.data?.error ?? 'Failed to save'); } finally { setSavingAch(false); }
  };

  const handleDeleteAch = async (id: string) => {
    if (!confirm('Delete this achievement definition?')) return;
    try { await api.delete(`/gamification/achievement-definitions/${id}`); await fetchAll(); } catch (err) { console.error(err); }
  };

  const handleToggleAch = async (d: AchievementDef) => {
    try { await api.put(`/gamification/achievement-definitions/${d.id}`, {isActive: !d.isActive}); await fetchAll(); } catch (err) { console.error(err); }
  };

  const openNewLbForm = () => { setLbForm({...emptyLbForm}); setEditingLbId(null); setShowLbForm(true); };
  const openEditLbForm = (c: LeaderboardConfig) => { setLbForm({name:c.name,metric:c.metric,courseId:c.courseId??'',topN:c.topN}); setEditingLbId(c.id); setShowLbForm(true); };

  const handleSaveLb = async () => {
    try {
      setSavingLb(true);
      const payload = {...lbForm, courseId: lbForm.courseId || null};
      if (editingLbId) await api.put(`/gamification/leaderboard-configs/${editingLbId}`, payload);
      else await api.post('/gamification/leaderboard-configs', payload);
      setShowLbForm(false); await fetchAll();
    } catch (err: any) { alert(err?.response?.data?.error ?? 'Failed to save'); } finally { setSavingLb(false); }
  };

  const handleDeleteLb = async (id: string) => {
    if (!confirm('Delete this leaderboard?')) return;
    try { await api.delete(`/gamification/leaderboard-configs/${id}`); await fetchAll(); } catch (err) { console.error(err); }
  };

  const handleToggleLb = async (c: LeaderboardConfig) => {
    try { await api.put(`/gamification/leaderboard-configs/${c.id}`, {isActive: !c.isActive}); await fetchAll(); } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"/></div>;

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-purple-500";

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent flex items-center gap-3">
              <Settings className="w-10 h-10 text-purple-400"/>Gamification Config
            </h1>
            <p className="text-slate-600 dark:text-gray-400 mt-2">Manage achievements, badges, and leaderboard criteria</p>
          </div>
          <button onClick={handleSeedDefaults} disabled={seeding} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 shadow-lg">
            <RefreshCw className={`w-4 h-4 ${seeding?'animate-spin':''}`}/>{seeding?'Seeding...':'Seed Defaults'}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[{v:definitions.length,l:'Achievement Types',c:'purple'},{v:definitions.filter(d=>d.isActive).length,l:'Active',c:'green'},{v:configs.length,l:'Leaderboards',c:'cyan'},{v:definitions.reduce((s,d)=>s+(d._count?.Achievements??0),0),l:'Badges Awarded',c:'yellow'}].map(({v,l,c})=>(
            <div key={l} className={`bg-${c}-500/10 border border-${c}-500/20 rounded-2xl p-4 text-center`}>
              <p className={`text-2xl font-black text-${c}-400`}>{v}</p>
              <p className="text-xs text-slate-500 dark:text-gray-500 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {[{id:'achievements',label:`Achievements (${definitions.length})`,icon:<Trophy className="w-5 h-5"/>,active:'from-purple-500/30 to-pink-500/20 border-purple-500/50 text-purple-400'},{id:'leaderboards',label:`Leaderboards (${configs.length})`,icon:<BarChart2 className="w-5 h-5"/>,active:'from-cyan-500/30 to-blue-500/20 border-cyan-500/50 text-cyan-400'}].map(tab=>(
          <button key={tab.id} onClick={()=>setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all ${activeTab===tab.id?`bg-gradient-to-r ${tab.active} border`:'bg-white/5 border border-white/10 text-slate-600 dark:text-gray-400 hover:bg-white/10'}`}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── ACHIEVEMENTS ── */}
      {activeTab==='achievements' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={openNewAchForm} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold hover:opacity-90 shadow-lg">
              <Plus className="w-5 h-5"/>New Achievement
            </button>
          </div>

          {showAchForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-card border border-border rounded-3xl p-8 w-full max-w-lg shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">{editingAchId?'Edit Achievement':'New Achievement'}</h2>
                  <button onClick={()=>setShowAchForm(false)} className="text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Type</label>
                      <select value={achForm.type} onChange={e=>setAchForm(f=>({...f,type:e.target.value}))} disabled={!!editingAchId} className={inputCls}>
                        {ACHIEVEMENT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Icon (emoji)</label>
                      <input value={achForm.icon} onChange={e=>setAchForm(f=>({...f,icon:e.target.value}))} className={inputCls} placeholder="🏆"/>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Title</label>
                    <input value={achForm.title} onChange={e=>setAchForm(f=>({...f,title:e.target.value}))} className={inputCls} placeholder="Achievement title"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Description</label>
                    <textarea value={achForm.description} onChange={e=>setAchForm(f=>({...f,description:e.target.value}))} rows={2} className={`${inputCls} resize-none`} placeholder="What does this badge represent?"/>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Points</label>
                      <input type="number" min={0} value={achForm.points} onChange={e=>setAchForm(f=>({...f,points:parseInt(e.target.value)||0}))} className={inputCls}/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Requirement</label>
                      <select value={achForm.requirementType} onChange={e=>setAchForm(f=>({...f,requirementType:e.target.value}))} className={inputCls}>
                        {REQUIREMENT_TYPES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Value</label>
                      <input type="number" min={1} value={achForm.requirementValue} onChange={e=>setAchForm(f=>({...f,requirementValue:parseInt(e.target.value)||1}))} className={inputCls}/>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={()=>setShowAchForm(false)} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-slate-600 dark:text-gray-400 rounded-2xl font-semibold hover:bg-white/10">Cancel</button>
                  <button onClick={handleSaveAch} disabled={savingAch||!achForm.title||!achForm.description} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl font-semibold hover:opacity-90 disabled:opacity-50">
                    <Save className="w-4 h-4"/>{savingAch?'Saving...':'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {definitions.length===0 ? (
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
              <Trophy className="w-16 h-16 mx-auto text-slate-600 mb-3"/>
              <p className="text-slate-600 dark:text-gray-400">No achievement definitions yet. Click "Seed Defaults" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {definitions.map(def=>(
                <div key={def.id} className={`backdrop-blur-2xl bg-white/5 border rounded-2xl p-5 flex items-center gap-4 transition-all ${def.isActive?'border-white/10':'border-white/5 opacity-60'}`}>
                  <div className="text-4xl flex-shrink-0">{def.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white">{def.title}</h3>
                      <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full">{def.type}</span>
                      {!def.isActive && <span className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full">Inactive</span>}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-gray-400 mt-0.5">{def.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-gray-500">
                      <span>⭐ {def.points} pts</span>
                      <span>🎯 {def.requirementType}: {def.requirementValue}</span>
                      <span>👥 {def._count?.Achievements??0} earned</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={()=>handleToggleAch(def)} title={def.isActive?'Deactivate':'Activate'} className={`p-2 rounded-xl transition-all ${def.isActive?'bg-green-500/20 text-green-400 hover:bg-green-500/30':'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}><CheckCircle className="w-4 h-4"/></button>
                    <button onClick={()=>openEditAchForm(def)} className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={()=>handleDeleteAch(def.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LEADERBOARDS ── */}
      {activeTab==='leaderboards' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={openNewLbForm} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-semibold hover:opacity-90 shadow-lg">
              <Plus className="w-5 h-5"/>New Leaderboard
            </button>
          </div>

          {showLbForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-card border border-border rounded-3xl p-8 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">{editingLbId?'Edit Leaderboard':'New Leaderboard'}</h2>
                  <button onClick={()=>setShowLbForm(false)} className="text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Name</label>
                    <input value={lbForm.name} onChange={e=>setLbForm(f=>({...f,name:e.target.value}))} className={inputCls} placeholder="e.g. Top Quiz Scorers"/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Metric</label>
                    <select value={lbForm.metric} onChange={e=>setLbForm(f=>({...f,metric:e.target.value}))} className={inputCls}>
                      {LEADERBOARD_METRICS.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Course (optional)</label>
                    <select value={lbForm.courseId} onChange={e=>setLbForm(f=>({...f,courseId:e.target.value}))} className={inputCls}>
                      <option value="">All Courses</option>
                      {courses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-gray-400 mb-1">Top N</label>
                    <input type="number" min={3} max={50} value={lbForm.topN} onChange={e=>setLbForm(f=>({...f,topN:parseInt(e.target.value)||10}))} className={inputCls}/>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={()=>setShowLbForm(false)} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-slate-600 dark:text-gray-400 rounded-2xl font-semibold hover:bg-white/10">Cancel</button>
                  <button onClick={handleSaveLb} disabled={savingLb||!lbForm.name} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-semibold hover:opacity-90 disabled:opacity-50">
                    <Save className="w-4 h-4"/>{savingLb?'Saving...':'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {configs.length===0 ? (
            <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-12 text-center">
              <BarChart2 className="w-16 h-16 mx-auto text-slate-600 mb-3"/>
              <p className="text-slate-600 dark:text-gray-400">No leaderboards configured yet. Create one to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {configs.map(cfg=>(
                <div key={cfg.id} className={`backdrop-blur-2xl bg-white/5 border rounded-2xl p-5 flex items-center gap-4 transition-all ${cfg.isActive?'border-white/10':'border-white/5 opacity-60'}`}>
                  <div className="p-3 bg-cyan-500/20 rounded-xl flex-shrink-0">
                    {cfg.metric==='QUIZ_SCORE'?<Target className="w-6 h-6 text-cyan-400"/>:cfg.metric==='COMPLETION_TIME'?<Clock className="w-6 h-6 text-cyan-400"/>:cfg.metric==='ACHIEVEMENT_POINTS'?<Zap className="w-6 h-6 text-cyan-400"/>:<Trophy className="w-6 h-6 text-cyan-400"/>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 dark:text-white">{cfg.name}</h3>
                      <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">{cfg.metric}</span>
                      {!cfg.isActive && <span className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded-full">Inactive</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 dark:text-gray-500">
                      <span>Top {cfg.topN} users</span>
                      <span>{cfg.courseId ? `Course-specific` : 'All courses'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={()=>handleToggleLb(cfg)} title={cfg.isActive?'Deactivate':'Activate'} className={`p-2 rounded-xl transition-all ${cfg.isActive?'bg-green-500/20 text-green-400 hover:bg-green-500/30':'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}><CheckCircle className="w-4 h-4"/></button>
                    <button onClick={()=>openEditLbForm(cfg)} className="p-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={()=>handleDeleteLb(cfg.id)} className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-xl"><Trash2 className="w-4 h-4"/></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
