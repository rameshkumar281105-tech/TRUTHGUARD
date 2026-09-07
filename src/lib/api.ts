import type { AnalysisResult } from "./analysis-types";

export interface HistoryItem {
  id: string;
  headline: string;
  prediction: "REAL" | "FAKE" | "UNCERTAIN";
  confidence: number;
  risk_score: number;
  created_at: string;
  source_name: string | null;
}

export interface HistoryResponse {
  items: HistoryItem[];
  total: number;
  page: number;
  perPage: number;
}

export interface StatsResponse {
  total: number;
  real: number;
  fake: number;
  uncertain: number;
  avgConfidence: number;
  avgRisk: number;
  lightweightRuns: number;
  activity: { date: string; REAL: number; FAKE: number; UNCERTAIN: number }[];
}

export interface HealthResponse {
  status: "online" | "degraded";
  database: boolean;
  aiGateway: boolean;
  modelMode: "full" | "lightweight";
  time: string;
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new Error("The server returned an unreadable response.");
  }
  if (!res.ok) {
    const msg =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body as T;
}

export interface AnalyzePayload {
  headline: string;
  content: string;
  sourceUrl?: string | undefined;
  sourceName?: string | undefined;
  author?: string | undefined;
  publicationDate?: string | undefined;
  imageDataUrl?: string | null;
}

export const api = {
  health: () => request<HealthResponse>("/api/health"),
  analyze: (payload: AnalyzePayload) =>
    request<AnalysisResult>("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  history: (params: Record<string, string>) =>
    request<HistoryResponse>(`/api/history?${new URLSearchParams(params).toString()}`),
  analysis: (id: string) => request<AnalysisResult>(`/api/history/${id}`),
  remove: (id: string) =>
    request<{ deleted: boolean }>(`/api/history/${id}`, { method: "DELETE" }),
  stats: () => request<StatsResponse>("/api/stats"),
};

export type { AnalysisResult };
