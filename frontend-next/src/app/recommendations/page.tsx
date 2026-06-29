"use client";

import { useEffect, useState, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { MediumSelector } from "@/components/recommendations/MediumSelector";
import { MoodSelector } from "@/components/recommendations/MoodSelector";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { usePersonalityStore } from "@/lib/store/personality";
import { useHydration } from "@/lib/store/useHydration";
import { recommend } from "@/lib/api";
import type { Medium, Mood, Recommendation } from "@/lib/api";

export default function RecommendationsPage() {
  const hydrated = useHydration();
  const personality = usePersonalityStore((s) => s.personality);

  const [medium, setMedium] = useState<Medium>("books");
  const [mood, setMood] = useState<Mood>(null);
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecs = useCallback(async (excludeIds: string[] = []) => {
    if (!personality) return;
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await recommend({ personality, medium, mood, exclude_ids: excludeIds });
    setLoading(false);
    if (apiError) { setError(apiError); return; }
    if (data && data.recommendations) {
      setRecs(data.recommendations);
      setSeenIds((prev) => Array.from(new Set([...prev, ...data.recommendations.map((r) => r.id)])));
    }
  }, [personality, medium, mood]);

  // Auto-fetch whenever medium or mood changes
  useEffect(() => {
    if (!hydrated || !personality) return;
    setRecs([]);
    setSeenIds([]);
    fetchRecs([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, personality, medium, mood]);

  const handleShuffle = () => fetchRecs(seenIds);
  const handleChangeMedium = (m: Medium) => setMedium(m);
  const handleChangeMood = (m: Mood) => setMood(m);

  return (
    <AppLayout>
          <div className="mb-6">
            <h1 className="font-display text-[32px] leading-tight">Recommendations</h1>
            <p className="text-muted text-[15px] mt-1.5">Books, films, music, and activities matching to your personality profile.</p>
          </div>

          {hydrated && !personality ? (
            <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-8 text-center">
              <div className="font-display text-[18px] mb-2">Analyze your writing first</div>
              <p className="text-muted text-[13.5px] mb-5 max-w-md mx-auto">Recommendations are tuned to your personality. Head to the Analyzer, paste a paragraph of your writing, then come back here.</p>
              <a href="/analyzer" className="inline-block px-5 py-2.5 bg-accent text-[#022] rounded-[11px] text-[14px] font-semibold hover:opacity-90 transition-opacity">Go to Analyzer</a>
            </div>
          ) : null}

          {hydrated && personality ? (
            <>
              <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5 mb-5">
                <div className="mb-4">
                  <div className="text-faint text-[11px] uppercase tracking-wider mb-2">Pick a medium</div>
                  <MediumSelector value={medium} onChange={handleChangeMedium} />
                </div>
                <div>
                  <div className="text-faint text-[11px] uppercase tracking-wider mb-2">Mood (optional)</div>
                  <MoodSelector value={mood} onChange={handleChangeMood} />
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5 animate-pulse">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-11 h-11 rounded-[11px] bg-surface-2 flex-none" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-surface-2 rounded w-3/4" />
                          <div className="h-3 bg-surface-2 rounded w-1/2" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-surface-2 rounded" />
                        <div className="h-3 bg-surface-2 rounded" />
                        <div className="h-3 bg-surface-2 rounded w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {!loading && error ? (
                <div className="bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.3)] rounded-[14px] p-4 mb-5">
                  <div className="font-semibold text-[14px] text-[color:var(--color-trait-neuroticism)] mb-1">Could not load recommendations</div>
                  <div className="text-[13px] text-muted">{error}</div>
                  <div className="text-[12px] text-faint mt-2">Make sure your FastAPI backend is running at http://127.0.0.1:8001.</div>
                </div>
              ) : null}

              {!loading && !error && recs.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recs.map((rec, i) => (<RecommendationCard key={rec.id} rec={rec} index={i} />))}
                  </div>
                  <div className="flex justify-center mt-6">
                    <button type="button" onClick={handleShuffle} className="px-5 py-2.5 bg-surface border border-[color:var(--color-border-subtle)] hover:bg-surface-2 text-text rounded-[11px] text-[14px] font-semibold transition-colors flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21v-5h5M21 3v5h-5M3 16a9 9 0 0 0 15-6.7M21 8a9 9 0 0 0-15 6.7" /></svg>
                      Show me different ones
                    </button>
                  </div>
                </>
              ) : null}

              {!loading && !error && recs.length === 0 ? (
                <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-8 text-center">
                  <div className="text-muted text-[14px]">No recommendations returned. Try a different medium or mood.</div>
                </div>
              ) : null}
            </>
          ) : null}
        </AppLayout>
  );
}
