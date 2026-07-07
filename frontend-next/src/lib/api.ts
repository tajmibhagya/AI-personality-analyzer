/**
 * Typed API client for the MindProfile FastAPI backend.
 *
 * Every function returns { data, error } so callers don't need try/catch.
 */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

// ============================================================
// Types — mirror backend/schemas.py
// ============================================================
export type Personality = {
  Openness: number;
  Conscientiousness: number;
  Extraversion: number;
  Agreeableness: number;
  Neuroticism: number;
};

export type Emotion = Record<string, number>;

export type AnalyzeResponse = {
  personality: Personality;
  emotion: Emotion;
  text_stats?: { char_count: number; word_count: number };
  error?: string | null;
};

export type Medium = "books" | "films" | "music" | "activities";
export type Mood = "reflective" | "uplifting" | "intense" | "playful" | null;

export type Recommendation = {
  id: string;
  title: string;
  why: string;
  trait_drivers: string[];
  metadata: Record<string, unknown>;
};

export type RecommendResponse = {
  medium: string;
  recommendations: Recommendation[];
  error?: string | null;
};

export type LifeReflection = {
  summary: string;
  takeaways_for_you: string[];
  where_this_might_be_hard: string[];
  reflection_questions: string[];
  caveat: string;
  error?: string | null;
};

export type ApplyToLifeResponse = LifeReflection;

export type ExtractResponse = {
  text?: string;
  char_count?: number;
  error?: string;
};

export type Result<T> = { data: T | null; error: string | null };

// ============================================================
// Internal fetch wrapper
// ============================================================
async function call<T>(
  path: string,
  init: RequestInit = {},
  timeoutMs = 60000
): Promise<Result<T>> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return { data: null, error: `HTTP ${res.status}: ${txt || res.statusText}` };
    }

    const data = (await res.json()) as T;
    return { data, error: null };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { data: null, error: msg };
  } finally {
    clearTimeout(timer);
  }
}

// ============================================================
// Public API
// ============================================================
export async function health(): Promise<Result<{ status: string }>> {
  return call("/health");
}

export async function analyze(text: string): Promise<Result<AnalyzeResponse>> {
  return call("/analyze", {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function recommend(args: {
  personality: Personality;
  medium: Medium;
  mood?: Mood;
  exclude_ids?: string[];
}): Promise<Result<RecommendResponse>> {
  return call(
    "/recommend",
    {
      method: "POST",
      body: JSON.stringify({
        personality: args.personality,
        medium: args.medium,
        mood: args.mood ?? null,
        exclude_ids: args.exclude_ids ?? [],
      }),
    },
    120000
  );
}

export async function applyToLife(args: {
  personality: Personality;
  article_text: string;
}): Promise<Result<ApplyToLifeResponse>> {
  return call(
    "/apply-to-life",
    {
      method: "POST",
      body: JSON.stringify(args),
    },
    180000
  );
}

export async function extractText(
  source:
    | { kind: "url"; url: string }
    | { kind: "raw"; text: string }
    | { kind: "pdf"; file: File }
): Promise<Result<ExtractResponse>> {
  const fd = new FormData();
  if (source.kind === "pdf") fd.append("pdf", source.file);
  else if (source.kind === "url") fd.append("url", source.url);
  else fd.append("raw_text", source.text);

  try {
    const res = await fetch(`${API_URL}/extract`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok)
      return { data: null, error: `HTTP ${res.status}: ${res.statusText}` };
    return { data: (await res.json()) as ExtractResponse, error: null };
  } catch (e: unknown) {
    return { data: null, error: e instanceof Error ? e.message : String(e) };
  }
}

export const API_BASE = API_URL;
