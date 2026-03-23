// server/src/services/faq-cache.service.ts
// Redis caching service for FAQs and AI responses

import { CacheService } from './cache.service';
import { prisma } from '../lib/prisma';

interface CachedFAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

interface CachedAIResponse {
  response: string;
  timestamp: string;
  hitCount: number;
}

export class FAQCacheService {
  // Development flag to disable caching
  private static readonly CACHE_DISABLED = true; // Set to false to enable caching
  
  // Cache keys
  private static readonly FAQ_ALL_KEY = 'faq:all';
  private static readonly FAQ_BY_CATEGORY_PREFIX = 'faq:category:';
  private static readonly FAQ_SEARCH_PREFIX = 'faq:search:';
  private static readonly AI_RESPONSE_PREFIX = 'ai:response:';
  
  // TTL values (in seconds) - TEMPORARILY DISABLED FOR DEVELOPMENT
  private static readonly FAQ_TTL = 1; // 1 second (effectively disabled)
  private static readonly AI_RESPONSE_TTL = 1; // 1 second (effectively disabled)
  private static readonly SEARCH_CACHE_TTL = 1; // 1 second (effectively disabled)

  /**
   * Get all FAQs from cache or database
   */
  static async getAllFAQs(): Promise<CachedFAQ[]> {
    // Bypass cache if disabled
    if (this.CACHE_DISABLED) {
      console.log('[FAQCache] Cache disabled: fetching all FAQs from database');
      return await prisma.fAQ.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          category: true,
          question: true,
          answer: true,
          keywords: true
        },
        orderBy: [
          { helpful: 'desc' },
          { viewCount: 'desc' }
        ]
      });
    }

    // Try cache first
    const cached = await CacheService.get<CachedFAQ[]>(this.FAQ_ALL_KEY);
    if (cached) {
      console.log('[FAQCache] Cache hit: all FAQs');
      return cached;
    }

    // Fetch from database
    console.log('[FAQCache] Cache miss: fetching all FAQs from database');
    const faqs = await prisma.fAQ.findMany({
      where: { isPublished: true },
      select: {
        id: true,
        category: true,
        question: true,
        answer: true,
        keywords: true
      },
      orderBy: [
        { helpful: 'desc' },
        { viewCount: 'desc' }
      ]
    });

    // Cache the results
    await CacheService.set(this.FAQ_ALL_KEY, faqs, this.FAQ_TTL);
    return faqs;
  }

  /**
   * Get FAQs by category from cache or database
   */
  static async getFAQsByCategory(category: string): Promise<CachedFAQ[]> {
    const cacheKey = `${this.FAQ_BY_CATEGORY_PREFIX}${category.toLowerCase()}`;
    
    // Try cache first
    const cached = await CacheService.get<CachedFAQ[]>(cacheKey);
    if (cached) {
      console.log(`[FAQCache] Cache hit: category "${category}"`);
      return cached;
    }

    // Fetch from database
    console.log(`[FAQCache] Cache miss: fetching category "${category}" from database`);
    const faqs = await prisma.fAQ.findMany({
      where: { 
        isPublished: true,
        category: { contains: category, mode: 'insensitive' }
      },
      select: {
        id: true,
        category: true,
        question: true,
        answer: true,
        keywords: true
      }
    });

    // Cache the results
    await CacheService.set(cacheKey, faqs, this.FAQ_TTL);
    return faqs;
  }

  /**
   * Search FAQs with caching
   * Normalizes the query to create consistent cache keys
   */
  static async searchFAQs(keywords: string[]): Promise<CachedFAQ[]> {
    // Normalize keywords for cache key
    const normalizedKeywords = keywords
      .map(k => k.toLowerCase().trim())
      .filter(k => k.length > 0)
      .sort()
      .join('_');
    
    const cacheKey = `${this.FAQ_SEARCH_PREFIX}${normalizedKeywords}`;
    
    // Bypass cache if disabled
    if (!this.CACHE_DISABLED) {
      // Try cache first
      const cached = await CacheService.get<CachedFAQ[]>(cacheKey);
      if (cached) {
        console.log(`[FAQCache] Search cache hit: "${normalizedKeywords}"`);
        return cached;
      }
    }

    // Search in database
    console.log(`[FAQCache] Search cache miss: "${normalizedKeywords}"`);
    
    // Build comprehensive search conditions
    const searchConditions: any[] = [];
    
    // Search in question field
    keywords.forEach(keyword => {
      searchConditions.push({ question: { contains: keyword, mode: 'insensitive' as const } });
    });
    
    // Search in answer field
    keywords.forEach(keyword => {
      searchConditions.push({ answer: { contains: keyword, mode: 'insensitive' as const } });
    });
    
    // Search in keywords array
    if (keywords.length > 0) {
      searchConditions.push({ keywords: { hasSome: keywords } });
    }

    // Get all matching FAQs
    const faqs = await prisma.fAQ.findMany({
      where: {
        isPublished: true,
        OR: searchConditions
      },
      select: {
        id: true,
        category: true,
        question: true,
        answer: true,
        keywords: true
      },
      orderBy: [
        { helpful: 'desc' },
        { viewCount: 'desc' }
      ],
      take: 15
    });

    // Cache the results (only if caching is enabled)
    if (!this.CACHE_DISABLED) {
      await CacheService.set(cacheKey, faqs, this.SEARCH_CACHE_TTL);
    }
    return faqs;
  }

  /**
   * Get cached AI response for a similar question
   * Uses normalized question as cache key
   */
  static async getCachedAIResponse(question: string): Promise<CachedAIResponse | null> {
    // Bypass cache if disabled
    if (this.CACHE_DISABLED) {
      console.log('[FAQCache] Cache disabled: no AI response cache check');
      return null;
    }

    const normalizedQuestion = this.normalizeQuestion(question);
    const cacheKey = `${this.AI_RESPONSE_PREFIX}${normalizedQuestion}`;
    
    const cached = await CacheService.get<CachedAIResponse>(cacheKey);
    if (cached) {
      console.log(`[FAQCache] AI response cache hit: "${question.substring(0, 50)}..."`);
      // Increment hit count
      cached.hitCount++;
      await CacheService.set(cacheKey, cached, this.AI_RESPONSE_TTL);
      return cached;
    }
    
    return null;
  }

  /**
   * Cache an AI response for future similar questions
   */
  static async cacheAIResponse(question: string, response: string): Promise<void> {
    // Skip caching if disabled
    if (this.CACHE_DISABLED) {
      console.log('[FAQCache] Cache disabled: skipping AI response cache');
      return;
    }

    const normalizedQuestion = this.normalizeQuestion(question);
    const cacheKey = `${this.AI_RESPONSE_PREFIX}${normalizedQuestion}`;
    
    const cachedResponse: CachedAIResponse = {
      response,
      timestamp: new Date().toISOString(),
      hitCount: 0
    };
    
    await CacheService.set(cacheKey, cachedResponse, this.AI_RESPONSE_TTL);
    console.log(`[FAQCache] Cached AI response: "${question.substring(0, 50)}..."`);
  }

  /**
   * Normalize a question for cache key generation
   * Removes stop words, punctuation, and sorts words for consistent matching
   */
  private static normalizeQuestion(question: string): string {
    const stopWords = [
      'what', 'is', 'are', 'the', 'a', 'an', 'how', 'when', 'where', 'who', 'why',
      'can', 'do', 'does', 'i', 'my', 'me', 'about', 'tell', 'explain', 'please',
      'could', 'would', 'should', 'of', 'for', 'to', 'in', 'at', 'on', 'with'
    ];
    
    const words = question
      .toLowerCase()
      .replace(/[?.,!;:'\"()]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .sort();
    
    // Create a hash-like key from sorted words
    return words.join('_').substring(0, 100); // Limit key length
  }

  /**
   * Invalidate all FAQ caches (call when FAQs are updated)
   */
  static async invalidateFAQCache(): Promise<void> {
    console.log('[FAQCache] Invalidating all FAQ caches');
    await CacheService.deletePattern('faq:*');
  }

  /**
   * Invalidate AI response caches
   */
  static async invalidateAIResponseCache(): Promise<void> {
    console.log('[FAQCache] Invalidating all AI response caches');
    await CacheService.deletePattern('ai:response:*');
  }

  /**
   * Get cache statistics
   */
  static async getCacheStats(): Promise<{
    faqCacheExists: boolean;
    searchCacheCount: number;
    aiResponseCacheCount: number;
  }> {
    const faqCacheExists = await CacheService.exists(this.FAQ_ALL_KEY);
    
    // This is a simplified count - in production you might want more detailed stats
    return {
      faqCacheExists,
      searchCacheCount: 0, // Would need to count keys matching pattern
      aiResponseCacheCount: 0
    };
  }
}

export default FAQCacheService;