import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { HelpCircle, Plus, Edit2, Trash2, Eye, EyeOff, BarChart3, Loader2 } from 'lucide-react';
import api from '../lib/api';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  viewCount: number;
  helpful: number;
  notHelpful: number;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Analytics {
  totalFAQs: number;
  publishedFAQs: number;
  unpublishedFAQs: number;
  topViewed: Array<{ id: string; question: string; viewCount: number; category: string }>;
  topHelpful: Array<{ id: string; question: string; helpful: number; notHelpful: number; category: string }>;
  categoryCounts: Array<{ category: string; count: number }>;
}

export default function AdminFAQs() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPublished, setFilterPublished] = useState<string>('all');

  const [formData, setFormData] = useState({
    category: '',
    question: '',
    answer: '',
    keywords: '',
    isPublished: true,
    order: 0,
  });

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchFAQs();
      fetchAnalytics();
    }
  }, [user]);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (filterCategory) params.category = filterCategory;
      if (filterPublished !== 'all') params.published = filterPublished;

      const res = await api.get('/faqs/admin', { params });
      setFaqs(res.data.faqs || []);
    } catch (err) {
      console.error('Failed to fetch FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/faqs/admin/analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      const timer = setTimeout(() => {
        fetchFAQs();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, filterCategory, filterPublished]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category.trim() || !formData.question.trim() || !formData.answer.trim()) {
      alert('Category, question, and answer are required');
      return;
    }

    try {
      const payload = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      };

      if (editingFAQ) {
        await api.put(`/faqs/admin/${editingFAQ.id}`, payload);
      } else {
        await api.post('/faqs/admin', payload);
      }

      setShowForm(false);
      setEditingFAQ(null);
      setFormData({ category: '', question: '', answer: '', keywords: '', isPublished: true, order: 0 });
      fetchFAQs();
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to save FAQ:', err);
      alert('Failed to save FAQ. Please try again.');
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setFormData({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords.join(', '),
      isPublished: faq.isPublished,
      order: faq.order,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await api.delete(`/faqs/admin/${id}`);
      fetchFAQs();
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to delete FAQ:', err);
      alert('Failed to delete FAQ.');
    }
  };

  const togglePublish = async (faq: FAQ) => {
    try {
      await api.put(`/faqs/admin/${faq.id}`, { isPublished: !faq.isPublished });
      fetchFAQs();
      fetchAnalytics();
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  const categories = Array.from(new Set(faqs.map(f => f.category)));

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
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-12">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-cyan-500/20 rounded-2xl">
              <HelpCircle className="w-16 h-16 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Manage FAQs
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Create and manage frequently asked questions
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => {
              setShowForm(!showForm);
              setEditingFAQ(null);
              setFormData({ category: '', question: '', answer: '', keywords: '', isPublished: true, order: 0 });
            }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50"
          >
            <Plus className="w-5 h-5" />
            Add New FAQ
          </button>
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 px-6 py-3 bg-purple-500/20 border border-purple-500/50 text-purple-400 font-bold rounded-xl hover:bg-purple-500/30 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </button>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && analytics && (
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6">FAQ Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-3xl font-black text-cyan-400">{analytics.totalFAQs}</div>
                <div className="text-sm text-gray-400">Total FAQs</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-3xl font-black text-green-400">{analytics.publishedFAQs}</div>
                <div className="text-sm text-gray-400">Published</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="text-3xl font-black text-orange-400">{analytics.unpublishedFAQs}</div>
                <div className="text-sm text-gray-400">Unpublished</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Top Viewed</h3>
                <div className="space-y-2">
                  {analytics.topViewed.map((faq, idx) => (
                    <div key={faq.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{faq.question}</div>
                          <div className="text-xs text-gray-400">{faq.category}</div>
                        </div>
                        <div className="text-sm font-bold text-cyan-400">{faq.viewCount} views</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground mb-3">Most Helpful</h3>
                <div className="space-y-2">
                  {analytics.topHelpful.map((faq, idx) => (
                    <div key={faq.id} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{faq.question}</div>
                          <div className="text-xs text-gray-400">{faq.category}</div>
                        </div>
                        <div className="text-sm font-bold text-green-400">{faq.helpful} 👍</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Form */}
        {showForm && (
          <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Academic, Enrollment, Technical"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Order</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Question *</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the question"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Answer *</label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the answer"
                  rows={6}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="e.g., enrollment, admission, requirements"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="w-5 h-5 rounded border-white/10 bg-white/5 text-cyan-500 focus:ring-2 focus:ring-cyan-500/50"
                />
                <label htmlFor="isPublished" className="text-sm font-medium text-foreground">
                  Publish immediately
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50"
                >
                  {editingFAQ ? 'Update FAQ' : 'Create FAQ'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingFAQ(null);
                    setFormData({ category: '', question: '', answer: '', keywords: '', isPublished: true, order: 0 });
                  }}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-foreground font-bold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterPublished}
              onChange={(e) => setFilterPublished(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              <option value="all">All Status</option>
              <option value="true">Published</option>
              <option value="false">Unpublished</option>
            </select>
          </div>
        </div>

        {/* FAQ List */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading FAQs...</p>
          </div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-12 backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No FAQs found</p>
            <p className="text-gray-400 mt-2">Create your first FAQ to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map(faq => (
              <div
                key={faq.id}
                className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm font-medium rounded-lg">
                        {faq.category}
                      </span>
                      {!faq.isPublished && (
                        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm font-medium rounded-lg">
                          Unpublished
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">{faq.answer}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{faq.viewCount} views</span>
                      <span>{faq.helpful} helpful</span>
                      <span>{faq.notHelpful} not helpful</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => togglePublish(faq)}
                      className={`p-2 rounded-lg transition-colors ${
                        faq.isPublished
                          ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                      }`}
                      title={faq.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {faq.isPublished ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(faq)}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
