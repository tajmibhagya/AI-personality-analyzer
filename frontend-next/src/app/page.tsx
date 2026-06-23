"use client";

import { TopNav } from "@/components/nav/TopNav";
import { Container } from "@/components/layout/Container";
import { HeroStrip } from "@/components/dashboard/HeroStrip";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TraitInsightCard } from "@/components/dashboard/TraitInsightCard";
import { RightColumn } from "@/components/dashboard/RightColumn";
import { HealthCheck } from "@/components/HealthCheck";
import { mockDashboard } from "@/lib/mock-dashboard";
import { usePersonalityStore } from "@/lib/store/personality";
import { useHydration } from "@/lib/store/useHydration";
import type { TraitRow } from "@/lib/mock-dashboard";
import type { Personality } from "@/lib/api";

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
    const score = p[name];
    const t = tier(score) as "high" | "moderate" | "low";
    return {
      name: name as string,
      score: Math.round(score * 100),
      colorVar: colors[name],
      shortDescription: desc[name].short,
      yourDescription: desc[name][t],
    };
  });
}

export default function Home() {
  const hydrated = useHydration();
  const personality = usePersonalityStore((s) => s.personality);
  const userName = usePersonalityStore((s) => s.userName);

  const traits = hydrated && personality ? buildLiveTraits(personality) : mockDashboard.traits;
  const displayName = hydrated && personality ? userName : mockDashboard.userName;
  const hasRealData = hydrated && personality !== null;

  return (
    <>
      <TopNav />
      <main>
        <Container className="py-6">
          <HeroStrip userName={displayName} />

          {!hasRealData && hydrated ? (
            <div className="bg-accent-soft border border-[color:var(--color-accent)]/30 rounded-[14px] p-4 mb-5 flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div className="font-semibold text-[14px] text-accent">Sample data shown</div>
                <div className="text-muted text-[12.5px] mt-0.5">Analyze your writing to see your real Big Five profile here.</div>
              </div>
              <a href="/analyzer" className="px-4 py-2 bg-accent text-[#022] rounded-[10px] text-[13px] font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">Analyze now</a>
            </div>
          ) : null}

          <QuickActions />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-[18px]">Your Big Five - explained</h2>
                <a href="/analyzer" className="text-accent text-[13px] font-semibold hover:underline">See full breakdown</a>
              </div>
              {traits.map((trait) => (<TraitInsightCard key={trait.name} trait={trait} />))}
            </div>
            <div className="lg:col-span-5">
              <RightColumn streakDays={mockDashboard.streakDays} recs={mockDashboard.recommendations} />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[color:var(--color-border-subtle)] flex justify-center">
            <HealthCheck />
          </div>
        </Container>
      </main>
    </>
  );
}
