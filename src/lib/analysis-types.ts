export type Verdict = "REAL" | "FAKE" | "UNCERTAIN";
export type RiskLevel = "Low" | "Moderate" | "High" | "Critical";

export interface LinguisticFeatures {
  wordCount: number;
  capsRatio: number;
  exclamationCount: number;
  questionCount: number;
  sensationalTerms: string[];
  hedgingTerms: string[];
  attributionTerms: string[];
  numericClaims: number;
  quoteCount: number;
  headlineAllCaps: boolean;
}

export interface TokenWeight {
  token: string;
  weight: number;
  direction: "credible" | "suspicious";
}

export interface TextAnalysis {
  prediction: Verdict;
  confidence: number;
  credibilityScore: number;
  importantTokens: TokenWeight[];
  suspiciousPhrases: string[];
  sentiment: string;
  linguisticPatterns: string[];
  claimIndicators: string[];
  sensationalismIndicators: string[];
  features: LinguisticFeatures;
  mode: "transformer" | "lightweight";
  reasoning: string;
}

export type ImageStatus = "AUTHENTIC-LOOKING" | "SUSPICIOUS" | "UNABLE TO DETERMINE";

export interface ImageAnalysis {
  available: boolean;
  status: ImageStatus;
  score: number | null;
  suspicionLevel: string;
  indicators: string[];
  consistency: string;
  explanation: string;
  previewUrl?: string | null;
}

export interface ClaimCheck {
  claim: string;
  status: "SUPPORTED" | "CONTRADICTED" | "UNVERIFIED";
  evidence: string;
  sourceTitle: string | null;
  sourceUrl: string | null;
  relevance: number;
}

export interface FactCheckResult {
  available: boolean;
  message: string | null;
  verdict?: Verdict | null;
  confidence?: number | null;
  claims: ClaimCheck[];
  evidenceScore: number | null;
  searchedQueries: string[];
}

export interface SourceCredibility {
  domain: string | null;
  https: boolean | null;
  sourceName: string | null;
  author: string | null;
  publicationDate: string | null;
  score: number | null;
  notes: string[];
}

export interface AnalysisResult {
  id?: string;
  createdAt?: string;
  headline: string;
  content: string;
  prediction: Verdict;
  confidence: number;
  riskScore: number;
  riskLevel: RiskLevel;
  scores: {
    text: number | null;
    image: number | null;
    evidence: number | null;
    source: number | null;
  };
  explanation: string;
  recommendation: { title: string; body: string };
  text: TextAnalysis;
  image: ImageAnalysis;
  factCheck: FactCheckResult;
  source: SourceCredibility;
  modelMode: "full" | "lightweight";
  fusionWeights: Record<string, number>;
}

export function riskLevelFor(score: number): RiskLevel {
  if (score <= 30) return "Low";
  if (score <= 60) return "Moderate";
  if (score <= 80) return "High";
  return "Critical";
}

export function recommendationFor(v: Verdict) {
  if (v === "REAL")
    return {
      title: "LOW RISK",
      body: "Evidence supports the content; normal editorial review recommended.",
    };
  if (v === "FAKE")
    return {
      title: "HIGH RISK",
      body: "Retrieved external evidence contradicts the claim; do not publish without further verification.",
    };
  return {
    title: "REQUIRES REVIEW",
    body: "Evidence is insufficient; perform additional manual verification.",
  };
}
