import type { LinguisticFeatures } from "./analysis-types";

const SENSATIONAL = [
  "shocking",
  "shocked",
  "unbelievable",
  "miracle",
  "secret",
  "exposed",
  "you won't believe",
  "breaking",
  "urgent",
  "banned",
  "conspiracy",
  "cover-up",
  "coverup",
  "hoax",
  "destroyed",
  "slams",
  "insane",
  "terrifying",
  "outrageous",
  "100%",
  "cure",
  "instantly",
  "wake up",
  "they don't want you to know",
  "mainstream media",
  "share before it's deleted",
];

const HEDGING = [
  "reportedly",
  "allegedly",
  "sources say",
  "rumored",
  "claims",
  "some say",
  "it is believed",
  "unconfirmed",
];

const ATTRIBUTION = [
  "according to",
  "said in a statement",
  "told reuters",
  "told the associated press",
  "spokesperson",
  "official said",
  "published in",
  "study",
  "researchers",
  "data from",
];

function countMatches(haystack: string, needles: string[]): string[] {
  const found: string[] = [];
  for (const n of needles) if (haystack.includes(n)) found.push(n);
  return found;
}

export function extractFeatures(headline: string, content: string): LinguisticFeatures {
  const full = `${headline}\n${content}`;
  const lower = full.toLowerCase();
  const words = full.split(/\s+/).filter(Boolean);
  const letters = full.replace(/[^a-zA-Z]/g, "");
  const caps = full.replace(/[^A-Z]/g, "");

  return {
    wordCount: words.length,
    capsRatio: letters.length ? +(caps.length / letters.length).toFixed(3) : 0,
    exclamationCount: (full.match(/!/g) || []).length,
    questionCount: (full.match(/\?/g) || []).length,
    sensationalTerms: countMatches(lower, SENSATIONAL),
    hedgingTerms: countMatches(lower, HEDGING),
    attributionTerms: countMatches(lower, ATTRIBUTION),
    numericClaims: (full.match(/\b\d[\d,.]*\s*(%|percent|million|billion|crore|lakh)?\b/g) || [])
      .length,
    quoteCount: (full.match(/["“”]/g) || []).length,
    headlineAllCaps:
      headline.replace(/[^a-zA-Z]/g, "").length > 8 &&
      headline === headline.toUpperCase(),
  };
}

/**
 * Deterministic lexical/stylistic credibility score (0-100, higher = more credible).
 * This is the Lightweight Model Mode scorer. It is rule-based, fully reproducible,
 * and is never presented as a trained transformer result.
 */
export function lightweightCredibility(f: LinguisticFeatures): number {
  // Deliberately conservative: style cues can only pull the score into the
  // uncertain band, never deep into "fake" territory. Hedging words
  // ("reportedly", "allegedly") are standard journalism and are NOT penalised.
  let score = 62;
  score -= Math.min(22, f.sensationalTerms.length * 7);
  score -= Math.min(8, f.exclamationCount * 2);
  score -= f.headlineAllCaps ? 8 : 0;
  score -= f.capsRatio > 0.25 ? 6 : 0;
  score += Math.min(18, f.attributionTerms.length * 5);
  score += f.quoteCount >= 2 ? 5 : 0;
  score += f.wordCount > 120 ? 5 : f.wordCount < 25 ? -6 : 0;
  return Math.max(20, Math.min(98, Math.round(score)));
}
