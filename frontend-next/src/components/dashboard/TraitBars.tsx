import type { TraitRow } from "@/lib/mock-dashboard";

type TraitBarsProps = {
  traits: TraitRow[];
  topTrait: { name: string; description: string };
};

export function TraitBars({ traits, topTrait }: TraitBarsProps) {
  return (
    <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-[16px]">Your Big Five</h2>
        <span className="text-faint text-[12px] uppercase tracking-wider">
          Updated today
        </span>
      </div>

      <div className="space-y-3.5">
        {traits.map((trait) => (
          <div key={trait.name}>
            <div className="flex justify-between text-[13px] mb-1.5">
              <span className="text-text">{trait.name}</span>
              <span className="text-muted tabular-nums">{trait.score}</span>
            </div>
            <div className="h-2 rounded-[6px] bg-surface-2 overflow-hidden">
              <div
                className="h-full rounded-[6px] transition-[width] duration-700"
                style={{
                  width: `${trait.score}%`,
                  background: trait.colorVar,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Top trait callout */}
      <div className="flex items-center gap-3 bg-surface-2 rounded-[13px] p-3.5 mt-5">
        <div className="w-9 h-9 rounded-[9px] bg-accent-soft flex items-center justify-center flex-none">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
          >
            <path d="M12 2l2.2 5.6L20 9l-5 4.3L16.5 20 12 16.5 7.5 20 9 13.3 4 9l5.8-1.4Z" />
          </svg>
        </div>
        <div>
          <div className="text-[13.5px] font-bold">
            Your top trait — {topTrait.name}
          </div>
          <div className="text-[12.5px] text-muted">{topTrait.description}</div>
        </div>
      </div>
    </div>
  );
}