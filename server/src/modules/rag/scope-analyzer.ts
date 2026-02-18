// server/src/modules/rag/scope-analyzer.ts
/**
 * Query Scope Analysis Module
 * Determines if a query is within BSU COS knowledge scope
 */

import { detectLanguage } from '../../utils/language-detector';

export interface ScopeAnalysisResult {
  isInScope: boolean;
  confidence: number;
  category: string;
  reason: string;
}

/**
 * Analyze if query is within BSU COS scope
 */
export function analyzeQueryScope(userMessage: string): ScopeAnalysisResult {
  const lowerMsg = userMessage.toLowerCase();

  // PRIORITY 0: BSU COS Keywords (Check FIRST to avoid false language rejections)
  const keywordResult = detectBSUKeywords(lowerMsg);
  if (keywordResult.isMatch) {
    return {
      isInScope: true,
      confidence: keywordResult.confidence,
      category: 'bsu_cos',
      reason: keywordResult.reason
    };
  }

  // PRIORITY 1: Faculty/People Queries
  const facultyResult = detectFacultyQuery(lowerMsg);
  if (facultyResult.isMatch) {
    return {
      isInScope: true,
      confidence: 0.9,
      category: 'faculty',
      reason: facultyResult.reason
    };
  }

  // PRIORITY 2: Out-of-Scope Topics
  const outOfScopeResult = detectOutOfScopeTopic(lowerMsg);
  if (outOfScopeResult.isMatch) {
    return {
      isInScope: false,
      confidence: 0.95,
      category: outOfScopeResult.category,
      reason: outOfScopeResult.reason
    };
  }

  // PRIORITY 3: Language Detection (Check AFTER BSU keywords)
  const langResult = detectLanguage(userMessage);
  if (!langResult.isEnglishOrFilipino) {
    return {
      isInScope: false,
      confidence: langResult.confidence,
      category: 'unsupported_language',
      reason: langResult.detectedLanguage 
        ? `Query is in ${langResult.detectedLanguage}. Only English and Filipino (Tagalog) are supported.`
        : 'Query appears to be in a foreign language. Only English and Filipino (Tagalog) are supported.'
    };
  }

  // PRIORITY 4: Greetings
  if (isGreeting(lowerMsg)) {
    return {
      isInScope: true,
      confidence: 1.0,
      category: 'greeting',
      reason: 'Simple greeting'
    };
  }

  // PRIORITY 5: Short queries (allow RAG to determine)
  if (lowerMsg.length < 50 && !lowerMsg.includes('http') && !lowerMsg.includes('www')) {
    return {
      isInScope: true,
      confidence: 0.5,
      category: 'unclear_but_safe',
      reason: 'Short query that might be BSU COS related. Allowing RAG retrieval to determine relevance.'
    };
  }

  // Default: Uncertain
  return {
    isInScope: false,
    confidence: 0.6,
    category: 'unknown',
    reason: 'Query does not contain recognizable BSU COS keywords. Cannot verify if within scope.'
  };
}

/**
 * Detect faculty/people queries
 */
function detectFacultyQuery(lowerMsg: string): { isMatch: boolean; reason: string } {
  const facultyPatterns = [
    /who\s+is\s+([a-z]+(?:\s+[a-z]+)*)/i,
    /sino\s+(?:si|ang)\s+([a-z]+(?:\s+[a-z]+)*)/i,
    /tell\s+me\s+about\s+([a-z]+(?:\s+[a-z]+)*)/i,
    /about\s+([a-z]+(?:\s+[a-z]+)*)/i,
    /(?:prof|professor|dr|dean|chair)\s+([a-z]+(?:\s+[a-z]+)*)/i
  ];

  for (const pattern of facultyPatterns) {
    const match = lowerMsg.match(pattern);
    if (match) {
      const namePart = match[1] || match[2] || '';
      const words = namePart.trim().split(/\s+/);
      if (words.length >= 1 && words.length <= 4 && words.every(w => /^[a-z]+$/i.test(w))) {
        return {
          isMatch: true,
          reason: `Query appears to be asking about a person (${namePart}), likely a faculty member.`
        };
      }
    }
  }

  return { isMatch: false, reason: '' };
}

/**
 * Detect out-of-scope topics
 */
function detectOutOfScopeTopic(lowerMsg: string): { isMatch: boolean; category: string; reason: string } {
  const outOfScopePatterns = [
    { pattern: /regions?\s*(in|of)?\s*(the)?\s*philippines/i, category: 'geography' },
    { pattern: /provinces?\s*(in|of)/i, category: 'geography' },
    { pattern: /capital\s*(of|city)/i, category: 'geography' },
    { pattern: /population\s*(of)?/i, category: 'geography' },
    { pattern: /weather|forecast|temperature|climate\s+today/i, category: 'weather' },
    { pattern: /news|headline|current\s+events/i, category: 'news' },
    { pattern: /movie|film|actor|actress|celebrity|singer|band/i, category: 'entertainment' },
    { pattern: /song|music|album|concert/i, category: 'entertainment' },
    { pattern: /game|gaming|esports/i, category: 'entertainment' },
    { pattern: /basketball|football|soccer|volleyball|sports?\s+score/i, category: 'sports' },
    { pattern: /nba|pba|uaap|ncaa\s+(?!course)/i, category: 'sports' },
    { pattern: /recipe|how\s+to\s+cook|ingredients?\s+for/i, category: 'cooking' },
    { pattern: /restaurant|food\s+delivery/i, category: 'food' },
    { pattern: /buy|purchase|price\s+of|how\s+much\s+is/i, category: 'shopping' },
    { pattern: /lazada|shopee|amazon/i, category: 'shopping' },
    { pattern: /hotel|resort|travel|vacation|tourist\s+spot/i, category: 'travel' },
    { pattern: /flight|airline|booking/i, category: 'travel' },
    { pattern: /president|senator|mayor|election|politics|government\s+(?!requirement)/i, category: 'politics' },
    { pattern: /medicine|symptom|disease|doctor|hospital\s+(?!internship)/i, category: 'health' },
    { pattern: /iphone|android|samsung|laptop\s+(?!requirement)/i, category: 'tech_products' },
    { pattern: /who\s+invented\s+/i, category: 'trivia' },
    { pattern: /when\s+was\s+(?!bsu|bulacan|college)/i, category: 'trivia' },
    { pattern: /what\s+is\s+the\s+(capital|largest|smallest|tallest)/i, category: 'trivia' }
  ];

  for (const { pattern, category } of outOfScopePatterns) {
    if (pattern.test(lowerMsg)) {
      return {
        isMatch: true,
        category,
        reason: `Query appears to be about ${category}, which is outside BSU COS knowledge scope.`
      };
    }
  }

  return { isMatch: false, category: '', reason: '' };
}

/**
 * Detect BSU COS keywords
 */
function detectBSUKeywords(lowerMsg: string): { isMatch: boolean; confidence: number; reason: string } {
  const inScopeKeywords = [
    'bsu', 'bulacan state', 'college of science', 'cos',
    'program', 'curriculum', 'subject', 'course', 'faculty',
    'professor', 'teacher', 'instructor', 'dean', 'chairperson',
    'admission', 'enrollment', 'requirement', 'apply',
    'computer science', 'biology', 'food technology',
    'environmental science', 'mathematics', 'statistics',
    'medical technology', 'business applications',
    'career', 'job', 'graduate', 'degree', 'recommend',
    'semester', 'year level', 'prerequisite', 'units',
    'lab', 'lecture', 'thesis', 'ojt', 'internship',
    'tisa', 'tutor', 'study', 'learn', 'academic'
  ];

  const matchedKeywords = inScopeKeywords.filter(kw => lowerMsg.includes(kw));
  
  if (matchedKeywords.length > 0) {
    return {
      isMatch: true,
      confidence: Math.min(0.5 + (matchedKeywords.length * 0.1), 0.95),
      reason: `Query contains BSU COS related keywords: ${matchedKeywords.join(', ')}`
    };
  }

  return { isMatch: false, confidence: 0, reason: '' };
}

/**
 * Check if message is a greeting
 */
function isGreeting(lowerMsg: string): boolean {
  const greetings = ['hi', 'hello', 'hey', 'kumusta', 'good morning', 'good afternoon', 'good evening'];
  return greetings.some(g => lowerMsg.trim() === g || lowerMsg.trim() === g + '!');
}
