export type MatchLevel = "high" | "medium" | "low";

export const matchStyles: Record<MatchLevel, { label: string; textColor: string; bg: string }> = {
  high: { label: "High match", textColor: "text-accent", bg: "bg-accent-soft" },
  medium: { label: "Medium match", textColor: "text-[color:var(--color-match-medium)]", bg: "bg-[rgba(245,158,11,0.14)]" },
  low: { label: "Low match", textColor: "text-muted", bg: "bg-surface-2" },
};

/**
 * Heuristic: assign a match level based on how many trait_drivers are listed.
 * 3+ → high, 2 → medium, 1 → low.
 * Backend doesn't return a match score, so we infer one for the UI.
 */
export function matchLevelFor(traitDrivers: string[]): MatchLevel {
  if (traitDrivers.length >= 3) return "high";
  if (traitDrivers.length === 2) return "medium";
  return "low";
}

export const mediumLabels: Record<string, { label: string; icon: string }> = {
  books: { label: "Books", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20V5H6.5A2.5 2.5 0 0 0 4 7.5v12ZM4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5H6.5A2.5 2.5 0 0 0 4 19.5Z" },
  films: { label: "Films", icon: "M2 6h20v12H2zM2 12h20M7 6v12M17 6v12" },
  music: { label: "Music", icon: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm12-3a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" },
  activities: { label: "Activities", icon: "M13 10V3L4 14h7v7l9-11h-7Z" },
};

export const moodLabels: Record<string, string> = {
  reflective: "Reflective",
  uplifting: "Uplifting",
  intense: "Intense",
  playful: "Playful",
};
