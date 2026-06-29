"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { RightColumn } from "@/components/dashboard/RightColumn";
import { mockDashboard } from "@/lib/mock-dashboard";
import { usePersonalityStore } from "@/lib/store/personality";
import { useHydration } from "@/lib/store/useHydration";
import { CreativeIQGame } from "@/components/discover/CreativeIQGame";
import type { Personality } from "@/lib/api";

function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)); }

function normalize(p: Personality): Record<string, number> {
  return Object.fromEntries(Object.entries(p).map(([k, v]) => [k, sigmoid(v)]));
}

const POP_AVG: Record<string, number> = {
  Openness: 0.60, Conscientiousness: 0.58, Extraversion: 0.55,
  Agreeableness: 0.62, Neuroticism: 0.50,
};

function getRarity(norm: Record<string, number>): number {
  const diffs = Object.keys(POP_AVG).map((k) => Math.abs((norm[k] || 0.5) - POP_AVG[k]));
  const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  return Math.round(Math.min(avg * 500, 99));
}

function getCommStyle(norm: Record<string, number>) {
  const high = Object.entries(norm).filter(([, v]) => v > 0.6).map(([k]) => k);
  const low = Object.entries(norm).filter(([, v]) => v < 0.4).map(([k]) => k);
  const style = high.includes("Extraversion") ? "Direct and expressive" : low.includes("Extraversion") ? "Thoughtful and measured" : "Balanced and adaptive";
  const motivator = high.includes("Conscientiousness") ? "Clear goals and structured plans" : high.includes("Openness") ? "Novel ideas and creative freedom" : "Autonomy and meaningful work";
  const friction = high.includes("Neuroticism") ? "Ambiguity and sudden changes" : low.includes("Agreeableness") ? "Over-collaboration and consensus pressure" : "Repetitive tasks without clear purpose";
  return { style, motivator, friction };
}

function getMoodInsight(norm: Record<string, number>, emotion: Record<string, number> | null) {
  if (!emotion) return null;
  const topEmotion = Object.entries(emotion).sort(([, a], [, b]) => b - a)[0]?.[0] || "neutral";
  const n = norm.Neuroticism || 0.5;
  const e = norm.Extraversion || 0.5;
  if (topEmotion === "joy" && e > 0.55) return "Your energy is high and outward-facing right now. Good moment for collaboration or creative output.";
  if (topEmotion === "joy" && e < 0.45) return "Feeling good but quietly. Use this clarity for focused solo work rather than group interaction.";
  if (topEmotion === "sadness" && n > 0.55) return "Your sensitivity is amplified right now. Avoid high-stakes decisions. Journaling or a walk might help more than pushing through.";
  if (topEmotion === "fear" && n > 0.55) return "Anxiety is running high relative to your baseline. Small, concrete next steps work better than big-picture thinking right now.";
  if (topEmotion === "anger") return "Something has activated your boundaries. That energy can be useful — channel it into advocacy or problem-solving rather than reaction.";
  if (topEmotion === "neutral" && n < 0.45) return "Emotionally steady right now. This is a good window for analytical work or making decisions you have been putting off.";
  return "Your emotional state and personality are in a balanced window. A good time for reflective or creative work.";
}

const traitColors: Record<string, string> = {
  Openness: "var(--color-trait-openness)",
  Conscientiousness: "var(--color-trait-conscientiousness)",
  Extraversion: "var(--color-trait-extraversion)",
  Agreeableness: "var(--color-trait-agreeableness)",
  Neuroticism: "var(--color-trait-neuroticism)",
};

export default function DiscoverPage() {
  const hydrated = useHydration();
  const personality = usePersonalityStore((s) => s.personality);
  const emotion = usePersonalityStore((s) => s.emotion);

  if (!hydrated) return <AppLayout><div className="animate-pulse text-faint text-[13.5px]">Loading...</div></AppLayout>;

  if (!personality) {
    return (
      <AppLayout>
        <div className="mb-6">
          <h2 className="font-display text-[22px]">Discover</h2>
          <p className="text-muted text-[14px] mt-1">Your streak, picks, and personality insights.</p>
        </div>
        <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-8 text-center mb-5">
          <div className="font-display text-[18px] mb-2">Analyze first to unlock insights</div>
          <p className="text-muted text-[13.5px] mb-5">Your Discover page fills in once you have a personality profile.</p>
          <a href="/analyzer" className="inline-block px-5 py-2.5 bg-accent text-[#022] rounded-[11px] text-[14px] font-semibold hover:opacity-90 transition-opacity">Go to Analyzer</a>
        </div>
        <RightColumn streakDays={mockDashboard.streakDays} recs={mockDashboard.recommendations} />
      </AppLayout>
    );
  }

  const norm = normalize(personality);
  const rarity = getRarity(norm);
  const commStyle = getCommStyle(norm);
  const moodInsight = getMoodInsight(norm, emotion);
  const topTrait = Object.entries(norm).sort(([, a], [, b]) => b - a)[0];
  const lowestTrait = Object.entries(norm).sort(([, a], [, b]) => a - b)[0];

  return (
    <AppLayout>
      <div className="mb-6">
        <h2 className="font-display text-[22px]">Discover</h2>
        <p className="text-muted text-[14px] mt-1">Insights, picks, and patterns from your personality profile.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[8px] bg-accent-soft flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M12 2l2.2 5.6L20 9l-5 4.3L16.5 20 12 16.5 7.5 20 9 13.3 4 9l5.8-1.4Z" /></svg>
            </div>
            <h3 className="font-display text-[16px]">Profile rarity</h3>
          </div>
          <div className="flex items-end gap-3 mb-3">
            <span className="font-display text-[48px] leading-none text-accent">{rarity}%</span>
            <span className="text-muted text-[13px] mb-2">different from average</span>
          </div>
          <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden mb-3">
            <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${rarity}%` }} />
          </div>
          <p className="text-muted text-[12.5px] leading-relaxed">
            {rarity > 60 ? "Your Big Five combination is quite distinctive. You likely feel misunderstood in average-group settings." : rarity > 30 ? "Your profile has notable differences from the population average — common in people who've done significant self-work." : "Your profile sits close to population averages, which tends to mean high adaptability across different social contexts."}
          </p>
          <div className="mt-3 pt-3 border-t border-[color:var(--color-border-subtle)] grid grid-cols-2 gap-2">
            <div className="text-[12px]">
              <div className="text-faint uppercase tracking-wider mb-0.5">Highest trait</div>
              <div className="font-semibold" style={{ color: traitColors[topTrait[0]] }}>{topTrait[0]} ({Math.round(topTrait[1] * 100)}%)</div>
            </div>
            <div className="text-[12px]">
              <div className="text-faint uppercase tracking-wider mb-0.5">Lowest trait</div>
              <div className="font-semibold" style={{ color: traitColors[lowestTrait[0]] }}>{lowestTrait[0]} ({Math.round(lowestTrait[1] * 100)}%)</div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(139,92,246,0.14)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--color-trait-extraversion)]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <h3 className="font-display text-[16px]">Your communication style</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-surface-2 rounded-[10px] p-3">
              <div className="text-faint text-[10.5px] uppercase tracking-wider mb-1">Style</div>
              <div className="text-text text-[13.5px] font-semibold">{commStyle.style}</div>
            </div>
            <div className="bg-surface-2 rounded-[10px] p-3">
              <div className="text-faint text-[10.5px] uppercase tracking-wider mb-1">What motivates you</div>
              <div className="text-text text-[13.5px]">{commStyle.motivator}</div>
            </div>
            <div className="bg-surface-2 rounded-[10px] p-3">
              <div className="text-faint text-[10.5px] uppercase tracking-wider mb-1">What creates friction</div>
              <div className="text-text text-[13.5px]">{commStyle.friction}</div>
            </div>
          </div>
        </div>

        {moodInsight ? (
          <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-[8px] bg-[rgba(245,158,11,0.14)] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--color-trait-agreeableness)]"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></svg>
              </div>
              <h3 className="font-display text-[16px]">Right now insight</h3>
            </div>
            <p className="text-text text-[14px] leading-relaxed">{moodInsight}</p>
            <p className="text-faint text-[11.5px] mt-3">Based on your last emotion reading crossed with your Big Five profile.</p>
          </div>
        ) : null}

        <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-[8px] bg-[rgba(14,165,164,0.14)] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
            </div>
            <h3 className="font-display text-[16px]">Trait breakdown</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(norm).map(([trait, score]) => (
              <div key={trait}>
                <div className="flex justify-between text-[12.5px] mb-1">
                  <span className="font-semibold" style={{ color: traitColors[trait] }}>{trait}</span>
                  <span className="text-muted">{Math.round(score * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${Math.round(score * 100)}%`, background: traitColors[trait] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2">
        <RightColumn streakDays={mockDashboard.streakDays} recs={mockDashboard.recommendations} />
      </div>

      <div className="mt-4">
        <CreativeIQGame personality={personality} />
      </div>
    </AppLayout>
  );
}
