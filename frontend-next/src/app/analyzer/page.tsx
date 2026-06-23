"use client";

import { useState } from "react";
import { TopNav } from "@/components/nav/TopNav";
import { Container } from "@/components/layout/Container";
import { AnalyzeForm } from "@/components/analyzer/AnalyzeForm";
import { PersonalityRadar } from "@/components/analyzer/PersonalityRadar";
import { EmotionDisplay } from "@/components/analyzer/EmotionDisplay";
import { TraitBars } from "@/components/dashboard/TraitBars";
import { usePersonalityStore } from "@/lib/store/personality";
import { useHydration } from "@/lib/store/useHydration";
import { analyze } from "@/lib/api";

export default function AnalyzerPage() {
  const hydrated = useHydration();
  const personality = usePersonalityStore((s) => s.personality);
  const emotion = usePersonalityStore((s) => s.emotion);
  const lastAnalyzedAt = usePersonalityStore((s) => s.lastAnalyzedAt);
  const setAnalysis = usePersonalityStore((s) => s.setAnalysis);
  const clearAnalysis = usePersonalityStore((s) => s.clearAnalysis);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (text: string) => {
    setLoading(true);
    setError(null);
    const { data, error: apiError } = await analyze(text);
    setLoading(false);
    if (apiError) { setError(apiError); return; }
    if (data && data.personality) {
      setAnalysis({ personality: data.personality, emotion: data.emotion, text });
    }
  };

  const traitRows = hydrated && personality ? [
    { name: "Openness", score: Math.round(personality.Openness * 100), colorVar: "var(--color-trait-openness)" },
    { name: "Conscientiousness", score: Math.round(personality.Conscientiousness * 100), colorVar: "var(--color-trait-conscientiousness)" },
    { name: "Extraversion", score: Math.round(personality.Extraversion * 100), colorVar: "var(--color-trait-extraversion)" },
    { name: "Agreeableness", score: Math.round(personality.Agreeableness * 100), colorVar: "var(--color-trait-agreeableness)" },
    { name: "Neuroticism", score: Math.round(personality.Neuroticism * 100), colorVar: "var(--color-trait-neuroticism)" },
  ] : null;

  const topTrait = traitRows ? (() => {
    const top = [...traitRows].sort((a, b) => b.score - a.score)[0];
    return { name: top.name, description: "Your highest scoring trait at " + top.score + "%." };
  })() : { name: "-", description: "Analyze your writing to see your top trait." };

  const lastAnalyzedText = lastAnalyzedAt ? (() => {
    const minutes = Math.floor((Date.now() - lastAnalyzedAt) / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return minutes + " minute" + (minutes === 1 ? "" : "s") + " ago";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + " hour" + (hours === 1 ? "" : "s") + " ago";
    const days = Math.floor(hours / 24);
    return days + " day" + (days === 1 ? "" : "s") + " ago";
  })() : null;

  return (
    <>
      <TopNav />
      <main>
        <Container className="py-8">
          <div className="mb-6 flex items-end justify-between flex-wrap gap-3">
            <div>
              <h1 className="font-display text-[32px] leading-tight">Analyzer</h1>
              <p className="text-muted text-[15px] mt-1.5">Paste your writing below. We analyze Big Five personality and emotional tone.</p>
            </div>
            {hydrated && lastAnalyzedText ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-muted text-[13px] bg-surface border border-[color:var(--color-border-subtle)] px-3.5 py-2 rounded-[11px]">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Last analyzed {lastAnalyzedText}
                </div>
                <button type="button" onClick={() => clearAnalysis()} className="text-faint hover:text-text text-[12.5px] font-medium transition-colors">Reset</button>
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 space-y-5">
              <AnalyzeForm onSubmit={handleAnalyze} loading={loading} />

              {error ? (
                <div className="bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.3)] rounded-[14px] p-4">
                  <div className="font-semibold text-[14px] text-[color:var(--color-trait-neuroticism)] mb-1">Analysis failed</div>
                  <div className="text-[13px] text-muted">{error}</div>
                  <div className="text-[12px] text-faint mt-2">Make sure your FastAPI backend is running at http://127.0.0.1:8001.</div>
                </div>
              ) : null}

              {personality && hydrated ? (
                <div className="mp-animate-in space-y-5">
                  <PersonalityRadar personality={personality} />
                  <TraitBars traits={traitRows!} topTrait={topTrait} />
                </div>
              ) : null}

              {!personality && hydrated ? (
                <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-8 text-center">
                  <div className="text-faint text-[14px]">Paste a paragraph above and click Analyze to see your Big Five profile.</div>
                </div>
              ) : null}
            </div>

            <div className="lg:col-span-5 space-y-5">
              {emotion && hydrated ? (
                <div className="mp-animate-in">
                  <EmotionDisplay emotion={emotion} />
                </div>
              ) : (
                <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
                  <h2 className="font-display text-[16px] mb-2">Emotional tone</h2>
                  <p className="text-muted text-[13.5px] leading-relaxed">After your first analysis, the dominant emotion and a full breakdown will appear here.</p>
                </div>
              )}

              <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
                <h2 className="font-display text-[16px] mb-2">How it works</h2>
                <ol className="text-muted text-[13.5px] space-y-2.5 list-decimal list-inside leading-relaxed">
                  <li>Paste at least 200 characters of natural writing.</li>
                  <li>A BERT model estimates Big Five traits.</li>
                  <li>A separate model tags emotional tone.</li>
                  <li>Results appear within a few seconds.</li>
                </ol>
                <p className="text-faint text-[12.5px] mt-4 leading-relaxed">Estimates are probabilistic, not diagnostic.</p>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
