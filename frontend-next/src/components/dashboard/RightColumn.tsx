import type { Recommendation } from "@/lib/mock-dashboard";

const matchStyles = {
  high: {
    label: "High match",
    text: "text-accent",
    bg: "bg-accent-soft",
  },
  medium: {
    label: "Medium match",
    text: "text-[color:var(--color-match-medium)]",
    bg: "bg-[rgba(245,158,11,0.14)]",
  },
  low: {
    label: "Low match",
    text: "text-muted",
    bg: "bg-surface-2",
  },
} as const;

function StreakSection({ days }: { days: number }) {
  // Build an array of 7 booleans — true if that day is "active"
  const cells = Array.from({ length: 7 }, (_, i) => i < days);

  return (
    <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
      <div className="flex items-center justify-between mb-3.5">
        <h3 className="font-display text-[15px]">7-day streak</h3>
        <span className="text-accent text-[13px] font-semibold">
          {days} / 7 days
        </span>
      </div>
      <div className="flex gap-1.5">
        {cells.map((on, i) => (
          <div
            key={i}
            className="flex-1 h-6 rounded-[6px] border border-[color:var(--color-border-subtle)]"
            style={{
              background: on
                ? "var(--color-accent)"
                : "var(--color-surface-2)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function RecCard({ rec }: { rec: Recommendation }) {
  const style = matchStyles[rec.match];

  return (
    <div className="flex items-start gap-3 p-4 rounded-[13px] hover:bg-surface-2 transition-colors cursor-pointer">
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
          <path d={rec.iconPath} />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display text-[14px] font-bold leading-tight">
          {rec.title}
        </div>
        <div className="text-muted text-[12.5px] mt-1 leading-snug">
          {rec.subtitle}
        </div>
        <span
          className={`inline-block mt-2 text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[7px] ${style.text} ${style.bg}`}
        >
          {style.label}
        </span>
      </div>
    </div>
  );
}

function RecsSection({ recs }: { recs: Recommendation[] }) {
  return (
    <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-3">
      <div className="flex items-center justify-between px-2 py-2 mb-1">
        <h3 className="font-display text-[15px]">Top picks for you</h3>
        <a href="/recommendations" className="text-accent text-[13px] font-semibold hover:underline">
          See all
        </a>
      </div>
      <div className="flex flex-col gap-1">
        {recs.map((r) => (
          <RecCard key={r.title} rec={r} />
        ))}
      </div>
    </div>
  );
}

function CtaCard() {
  return (
    <div className="bg-accent rounded-[18px] p-5 text-[#04201f]">
      <div className="font-display font-bold text-[17px] text-[#022]">
        Get your AI report
      </div>
      <div className="text-[13px] leading-snug mt-2 text-[rgba(2,40,38,0.78)]">
        A complete personality breakdown as a shareable PDF.
      </div>
      <button
        type="button"
        className="mt-4 px-4 py-2 bg-[#022] text-accent rounded-[10px] text-[13px] font-semibold hover:opacity-90 transition-opacity"
      >
        Download report →
      </button>
    </div>
  );
}

type RightColumnProps = {
  streakDays: number;
  recs: Recommendation[];
};

export function RightColumn({ streakDays, recs }: RightColumnProps) {
  return (
    <div className="space-y-5">
      <StreakSection days={streakDays} />
      <RecsSection recs={recs} />
      <CtaCard />
    </div>
  );
}