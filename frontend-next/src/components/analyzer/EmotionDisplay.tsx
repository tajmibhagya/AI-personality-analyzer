import type { Emotion } from "@/lib/api";

type EmotionDisplayProps = {
  emotion: Emotion;
};

// Capitalize first letter of an emotion name (e.g. "neutral" -> "Neutral")
function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Map common emotion names to colors. Falls back to muted for unknown ones.
function colorFor(emotionName: string): string {
  const lookup: Record<string, string> = {
    joy: "var(--color-trait-agreeableness)",
    sadness: "var(--color-trait-conscientiousness)",
    anger: "var(--color-trait-neuroticism)",
    fear: "var(--color-trait-extraversion)",
    disgust: "#a855f7",
    surprise: "var(--color-trait-openness)",
    neutral: "var(--color-faint)",
    love: "#ec4899",
  };
  return lookup[emotionName.toLowerCase()] || "var(--color-muted)";
}

export function EmotionDisplay({ emotion }: EmotionDisplayProps) {
  // Sort emotions by score, descending
  const entries = Object.entries(emotion).sort((a, b) => b[1] - a[1]);
  const [topName, topScore] = entries[0];

  return (
    <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-[16px]">Emotional tone</h2>
        <span className="text-faint text-[12px] uppercase tracking-wider">
          From your writing
        </span>
      </div>

      {/* Dominant emotion card */}
      <div className="bg-surface-2 rounded-[13px] p-4 mb-4 flex items-center justify-between">
        <div>
          <div className="text-faint text-[11px] uppercase tracking-wider mb-1">
            Dominant emotion
          </div>
          <div className="font-display text-[24px]">{cap(topName)}</div>
        </div>
        <div className="text-right">
          <div
            className="text-[28px] font-bold tabular-nums"
            style={{ color: colorFor(topName) }}
          >
            {(topScore * 100).toFixed(0)}%
          </div>
          <div className="text-faint text-[11px] uppercase tracking-wider">
            Confidence
          </div>
        </div>
      </div>

      {/* All emotion bars */}
      <div className="space-y-2.5">
        {entries.map(([name, score]) => {
          const pct = score * 100;
          return (
            <div key={name}>
              <div className="flex justify-between text-[13px] mb-1">
                <span className="text-text">{cap(name)}</span>
                <span className="text-muted tabular-nums">{pct.toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-[6px] bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-[6px] transition-[width] duration-700"
                  style={{
                    width: `${pct}%`,
                    background: colorFor(name),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}