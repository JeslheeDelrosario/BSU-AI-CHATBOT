import { useState, useEffect } from "react";
import {
  Search,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import api from "../lib/api";

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
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [votedFAQs, setVotedFAQs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFAQs();
    fetchCategories();
  }, []);

  const fetchFAQs = async () => {
    try {
      const res = await api.get("/faqs/public");
      setFaqs(res.data.faqs || []);
    } catch (err) {
      console.error("Failed to fetch FAQs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/faqs/public/categories");
      setCategories(["All", ...(res.data.categories || [])]);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const handleVote = async (faqId: string, helpful: boolean) => {
    if (votedFAQs.has(faqId)) {
      return;
    }

    try {
      await api.post(`/faqs/public/${faqId}/vote`, { helpful });
      setVotedFAQs((prev) => new Set(prev).add(faqId));

      setFaqs((prev) =>
        prev.map((faq) =>
          faq.id === faqId
            ? {
                ...faq,
                helpful: faq.helpful + (helpful ? 1 : 0),
                notHelpful: faq.notHelpful + (helpful ? 0 : 1),
              }
            : faq,
        ),
      );
    } catch (err) {
      console.error("Failed to vote:", err);
    }
  };

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "All" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedFAQs = filteredFAQs.reduce(
    (acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push(faq);
      return acc;
    },
    {} as Record<string, FAQ[]>,
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        {/* Header - Enhanced with better contrast */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-cyan-100 to-blue-100 dark:from-cyan-950/50 dark:to-blue-950/50 rounded-2xl shadow-lg">
              <HelpCircle
                className="w-16 h-16 text-cyan-600 dark:text-cyan-400"
                strokeWidth={1.5}
              />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Find answers to common questions about BSU College of Science
          </p>
        </div>

        {/* Search and Filter - Enhanced visibility */}
        <div className="bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Category Filter - Improved contrast and hover states */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/30 dark:shadow-cyan-500/20"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State - Better visibility */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">
              Loading FAQs...
            </p>
          </div>
        )}

        {/* No Results - Improved messaging */}
        {!loading && filteredFAQs.length === 0 && (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
            <HelpCircle className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              No FAQs found
            </p>
            <p className="text-gray-500 dark:text-gray-500 mt-2">
              Try adjusting your search or filter
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-6 px-6 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* FAQ List - Enhanced visibility */}
        {!loading &&
          Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
            <div key={category} className="mb-10">
              {selectedCategory === "All" && (
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-8 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-full"></div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {category}
                  </h2>
                  <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                    {categoryFAQs.length}
                  </span>
                </div>
              )}

              <div className="space-y-4">
                {categoryFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {/* Question Header - Improved click area and contrast */}
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === faq.id ? null : faq.id)
                      }
                      className="w-full px-5 sm:px-6 py-4 flex items-start justify-between gap-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                    >
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                          {faq.question}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="font-medium">{faq.helpful}</span>
                            <span className="sr-only">helpful votes</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <ThumbsDown className="w-4 h-4" />
                            <span className="font-medium">
                              {faq.notHelpful}
                            </span>
                            <span className="sr-only">not helpful votes</span>
                          </span>
                          <span className="text-gray-500 dark:text-gray-500">
                            {faq.viewCount} views
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        {expandedId === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 dark:text-gray-600 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors" />
                        )}
                      </div>
                    </button>

                    {/* Answer Content - Enhanced readability */}
                    {expandedId === faq.id && (
                      <div className="px-5 sm:px-6 pb-6 border-t border-gray-100 dark:border-gray-800">
                        <div className="pt-5 pb-4">
                          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                              {faq.answer}
                            </p>
                          </div>
                        </div>

                        {/* Vote Buttons - Improved styling and feedback */}
                        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Was this helpful?
                          </span>
                          <button
                            onClick={() => handleVote(faq.id, true)}
                            disabled={votedFAQs.has(faq.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              votedFAQs.has(faq.id)
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                : "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/50 border border-green-200 dark:border-green-900"
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Yes ({faq.helpful})
                          </button>
                          <button
                            onClick={() => handleVote(faq.id, false)}
                            disabled={votedFAQs.has(faq.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                              votedFAQs.has(faq.id)
                                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                : "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 border border-red-200 dark:border-red-900"
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                            No ({faq.notHelpful})
                          </button>
                          {votedFAQs.has(faq.id) && (
                            <span className="text-xs text-gray-500 dark:text-gray-500 italic">
                              Thank you for your feedback!
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

        {/* Help Footer - Enhanced CTA visibility */}
        {!loading && filteredFAQs.length > 0 && (
          <div className="mt-12 text-center bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30 border border-cyan-200 dark:border-cyan-800 rounded-2xl p-8 shadow-lg">
            <div className="flex justify-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              <GraduationCap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              Can't find what you're looking for? Try our AI Tutor for
              personalized assistance.
            </p>
            <a
              href="/ai-tutor"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-cyan-500/30 dark:shadow-cyan-500/20"
            >
              <Sparkles className="w-5 h-5" />
              Ask TISA
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
