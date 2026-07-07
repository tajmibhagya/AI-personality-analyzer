"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { TraitInsightCard } from "@/components/dashboard/TraitInsightCard";
import { mockDashboard } from "@/lib/mock-dashboard";
import { usePersonalityStore } from "@/lib/store/personality";
import { useHydration } from "@/lib/store/useHydration";
import type { TraitRow } from "@/lib/mock-dashboard";
import type { Personality } from "@/lib/api";

function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)); }

function buildLiveTraits(p: Personality): TraitRow[] {
  const desc: Record<string, { short: string; high: string; moderate: string; low: string }> = {
    Openness: {
      short: "Curiosity, imagination, and openness to new ideas",
      high: "You thrive on novelty and abstract ideas. Art, travel, unconventional thinking energize you.",
      moderate: "You appreciate new ideas in measured doses, balancing curiosity with what is familiar.",
      low: "You prefer the tried and tested, finding comfort in routine and familiar approaches.",
    },
    Conscientiousness: {
      short: "Organization, discipline, and goal-directed behavior",
      high: "You are reliably organized, plan ahead, and follow through on commitments.",
      moderate: "You are organized when it matters but stay flexible when needed.",
      low: "You go with the flow, valuing spontaneity over structured planning.",
    },
    Extraversion: {
      short: "Energy drawn from social interaction and the outside world",
      high: "You are energized by people and external engagement. Solitude can feel draining.",
      moderate: "You enjoy people but also recharge in quieter moments.",
      low: "You are energized by solitude and find deep one-on-ones more meaningful than groups.",
    },
    Agreeableness: {
      short: "Warmth, cooperation, and trust in others",
      high: "You lean toward harmony, care about how others feel, and value cooperation.",
      moderate: "You are generally cooperative but stand firm when something matters to you.",
      low: "You are direct and willing to challenge, prioritizing honesty over harmony.",
    },
    Neuroticism: {
      short: "Sensitivity to stress and negative emotions",
      high: "You feel things deeply. Emotions can be intense, and stress hits hard.",
      moderate: "You handle stress reasonably but can be sensitive to bigger challenges.",
      low: "You are emotionally steady, and stress tends to roll off you.",
    },
  };
  const colors: Record<string, string> = {
    Openness: "var(--color-trait-openness)",
    Conscientiousness: "var(--color-trait-conscientiousness)",
    Extraversion: "var(--color-trait-extraversion)",
    Agreeableness: "var(--color-trait-agreeableness)",
    Neuroticism: "var(--color-trait-neuroticism)",
  };
  const tier = (s: number) => (s >= 0.6 ? "high" : s >= 0.4 ? "moderate" : "low");
  return (Object.keys(desc) as Array<keyof Personality>).map((name) => {
    const raw = p[name];
    const score = sigmoid(raw);
    const t = tier(score) as "high" | "moderate" | "low";
    return { name: name as string, score: Math.round(score * 100), colorVar: colors[name], shortDescription: desc[name].short, yourDescription: desc[name][t] };
  });
}

export default function Home() {
  const hydrated = useHydration();
  const personality = usePersonalityStore((s) => s.personality);

  const traits = hydrated && personality ? buildLiveTraits(personality) : mockDashboard.traits;

  return (
    <AppLayout>
      <div className="mb-5 flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-display text-[22px]">Your Big Five - explained</h2>
        <a href="/analyzer" className="text-accent text-[13px] font-semibold hover:underline">See full breakdown</a>
      </div>
      <div className="space-y-4">
        {traits.map((trait) => (<TraitInsightCard key={trait.name} trait={trait} />))}
      </div>
    </AppLayout>
  );
}
