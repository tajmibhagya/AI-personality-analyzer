import type { TraitRow } from "@/lib/mock-dashboard";

export function TraitInsightCard({ trait }: { trait: TraitRow }) {
  // Convert numeric score to a qualitative level for the header
  const level =
    trait.score >= 75
      ? "High"
      : trait.score >= 55
      ? "Moderate-high"
      : trait.score >= 45
      ? "Average"
      : trait.score >= 25
      ? "Moderate-low"
      : "Low";

  return (
    <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
      {/* Top row — name + level pill */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div
            className="w-2.5 h-2.5 rounded-full flex-none"
            style={{ background: trait.colorVar }}
          />
          <h3 className="font-display text-[16px]">{trait.name}</h3>
        </div>
        <span
          className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px]"
          style={{
            background: "var(--color-accent-soft)",
            color: trait.colorVar,
          }}
        >
          {level}
        </span>
      </div>

      {/* Short description — what the trait is */}
      <div className="text-faint text-[12px] uppercase tracking-wider mt-2 mb-1">
        What it means
      </div>
      <p className="text-muted text-[13px] leading-snug">
        {trait.shortDescription}
      </p>

      {/* Personalized description — what their score means */}
      <div className="text-faint text-[12px] uppercase tracking-wider mt-4 mb-1">
        What it looks like for you
      </div>
      <p className="text-text text-[13.5px] leading-relaxed">
        {trait.yourDescription}
      </p>
    </div>
  );
}