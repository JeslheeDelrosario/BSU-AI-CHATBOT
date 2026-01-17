// server/src/utils/language-detector.ts
/**
 * Modular Language Detection Utility
 * Fast detection for 100+ languages
 */

import {
  UNICODE_SCRIPT_LANGUAGES,
  FILIPINO_PATTERNS,
  LATIN_SCRIPT_LANGUAGES,
  ACCENTED_CHARS_PATTERN,
  ACCENTED_CHARS_THRESHOLD,
  ACCENTED_CHARS_CONFIDENCE,
  type LanguagePattern
} from '../config/language-detection.config';

export interface LanguageDetectionResult {
  isEnglishOrFilipino: boolean;
  detectedLanguage: string | null;
  confidence: number;
  reason: string;
}

/**
 * Main language detection function
 * Returns whether the text is in English or Filipino
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  const lowerText = text.toLowerCase();

  // Step 1: Check for non-Latin scripts (highest confidence)
  const unicodeResult = detectUnicodeScript(text);
  if (unicodeResult) {
    return {
      isEnglishOrFilipino: false,
      detectedLanguage: unicodeResult.name,
      confidence: unicodeResult.confidence,
      reason: `Detected ${unicodeResult.name} characters`
    };
  }

  // Step 2: Check for Latin-script foreign languages (including PH regional languages)
  // IMPORTANT: Check this BEFORE Filipino to catch regional languages
  const latinResult = detectLatinScriptLanguage(lowerText);
  if (latinResult) {
    return {
      isEnglishOrFilipino: false,
      detectedLanguage: latinResult.name,
      confidence: latinResult.confidence,
      reason: `Detected ${latinResult.name} keywords`
    };
  }

  // Step 3: Check if Filipino/Tagalog (allow through)
  // This comes AFTER regional language check to avoid false positives
  const isFilipino = FILIPINO_PATTERNS.test(lowerText);
  if (isFilipino) {
    return {
      isEnglishOrFilipino: true,
      detectedLanguage: 'Filipino',
      confidence: 0.9,
      reason: 'Contains Filipino/Tagalog words'
    };
  }

  // Step 4: Check for accented characters (European languages)
  const accentResult = detectAccentedLanguage(text, lowerText);
  if (accentResult) {
    return {
      isEnglishOrFilipino: false,
      detectedLanguage: 'European language',
      confidence: accentResult.confidence,
      reason: 'High density of accented characters'
    };
  }

  // Default: Assume English
  return {
    isEnglishOrFilipino: true,
    detectedLanguage: 'English',
    confidence: 0.7,
    reason: 'No foreign language patterns detected'
  };
}

/**
 * Detect non-Latin scripts using Unicode ranges
 */
function detectUnicodeScript(text: string): LanguagePattern | null {
  for (const lang of UNICODE_SCRIPT_LANGUAGES) {
    if (lang.unicodeRanges) {
      for (const range of lang.unicodeRanges) {
        if (range.test(text)) {
          return lang;
        }
      }
    }
  }
  return null;
}

/**
 * Detect Latin-script foreign languages using keyword patterns
 */
function detectLatinScriptLanguage(lowerText: string): LanguagePattern | null {
  for (const lang of LATIN_SCRIPT_LANGUAGES) {
    for (const pattern of lang.patterns) {
      if (pattern.test(lowerText)) {
        return lang;
      }
    }
  }
  return null;
}

/**
 * Detect European languages by accented character density
 */
function detectAccentedLanguage(text: string, lowerText: string): { confidence: number } | null {
  if (!ACCENTED_CHARS_PATTERN.test(text)) {
    return null;
  }

  const wordCount = lowerText.split(/\s+/).length;
  
  // Only check for short messages (long technical documents may have accented terms)
  if (wordCount >= 15) {
    return null;
  }

  const accentedWords = text.match(/\b\w*[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ]\w*\b/gi) || [];
  const accentedWordCount = accentedWords.length;
  
  // If more than threshold of words have accents, likely foreign language
  if (accentedWordCount / wordCount > ACCENTED_CHARS_THRESHOLD) {
    return { confidence: ACCENTED_CHARS_CONFIDENCE };
  }

  return null;
}

/**
 * Quick check if text is likely English or Filipino
 * Used for fast filtering before full detection
 */
export function isLikelyEnglishOrFilipino(text: string): boolean {
  // Quick check for obvious non-Latin scripts
  const hasNonLatin = /[\u0400-\u04FF\u0590-\u05FF\u0600-\u06FF\u0900-\u097F\u0E00-\u0E7F\u1000-\u109F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(text);
  if (hasNonLatin) {
    return false;
  }

  // Quick check for Filipino
  if (FILIPINO_PATTERNS.test(text.toLowerCase())) {
    return true;
  }

  // Default to true for further checking
  return true;
}
