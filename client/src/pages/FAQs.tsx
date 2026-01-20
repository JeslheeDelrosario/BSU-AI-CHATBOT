import { useState, useEffect } from 'react';
import { Search, HelpCircle, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../lib/api';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  viewCount: number;
  helpful: number;
  notHelpful: number;
  order: number;
}

export default function FAQs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [votedFAQs, setVotedFAQs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFAQs();
    fetchCategories();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await api.get('/faqs/public');
      setFaqs(res.data.faqs || []);
    } catch (err) {
      console.error('Failed to fetch FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/faqs/public/categories');
      setCategories(['All', ...(res.data.categories || [])]);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleVote = async (faqId: string, helpful: boolean) => {
    if (votedFAQs.has(faqId)) {
      return;
    }

    try {
      await api.post(`/faqs/public/${faqId}/vote`, { helpful });
      setVotedFAQs(prev => new Set(prev).add(faqId));
      
      setFaqs(prev => prev.map(faq => 
        faq.id === faqId 
          ? { ...faq, helpful: faq.helpful + (helpful ? 1 : 0), notHelpful: faq.notHelpful + (helpful ? 0 : 1) }
          : faq
      ));
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div className="min-h-screen text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-10 lg:py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-cyan-500/20 rounded-2xl">
              <HelpCircle className="w-16 h-16 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground">
            Find answers to common questions about BSU College of Science
          </p>
        </div>

        {/* Search and Filter */}
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 shadow-2xl">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                      : 'bg-white/5 border border-white/10 text-foreground hover:bg-white/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading FAQs...</p>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No FAQs found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or filter</p>
          </div>
        )}

        {/* FAQ List */}
        {!loading && Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
          <div key={category} className="mb-8">
            {selectedCategory === 'All' && (
              <h2 className="text-2xl font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                {category}
              </h2>
            )}
            
            <div className="space-y-4">
              {categoryFAQs.map(faq => (
                <div
                  key={faq.id}
                  className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all"
                >
                  {/* Question Header */}
                  <button
                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 flex items-start justify-between gap-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {faq.question}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {faq.helpful}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsDown className="w-4 h-4" />
                          {faq.notHelpful}
                        </span>
                        <span>{faq.viewCount} views</span>
                      </div>
                    </div>
                    {expandedId === faq.id ? (
                      <ChevronUp className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {/* Answer Content */}
                  {expandedId === faq.id && (
                    <div className="px-6 pb-6 border-t border-white/10">
                      <div className="pt-4 pb-4">
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                          {faq.answer}
                        </p>
                      </div>

                      {/* Vote Buttons */}
                      <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                        <span className="text-sm text-gray-400">Was this helpful?</span>
                        <button
                          onClick={() => handleVote(faq.id, true)}
                          disabled={votedFAQs.has(faq.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            votedFAQs.has(faq.id)
                              ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                              : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          Yes
                        </button>
                        <button
                          onClick={() => handleVote(faq.id, false)}
                          disabled={votedFAQs.has(faq.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            votedFAQs.has(faq.id)
                              ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          No
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Help Footer */}
        {!loading && filteredFAQs.length > 0 && (
          <div className="mt-12 text-center backdrop-blur-2xl bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-4">
              Can't find what you're looking for? Try our AI Tutor for personalized assistance.
            </p>
            <a
              href="/ai-tutor"
              className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-cyan-500/50"
            >
              Ask TISA
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
