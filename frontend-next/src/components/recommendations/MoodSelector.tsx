"use client";

import { cn } from "@/lib/utils";
import { moodLabels } from "@/lib/recommendation-styles";
import type { Mood } from "@/lib/api";

type MoodSelectorProps = {
  value: Mood;
  onChange: (mood: Mood) => void;
};

const moods: Array<{ value: Mood; label: string }> = [
  { value: null, label: "Any mood" },
  { value: "reflective", label: moodLabels.reflective },
  { value: "uplifting", label: moodLabels.uplifting },
  { value: "intense", label: moodLabels.intense },
  { value: "playful", label: moodLabels.playful },
];

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  return (
    <div className="grid grid-cols-5 gap-2 w-full">
      {moods.map((m) => {
        const isActive = value === m.value;
        return (
          <button key={m.value ?? "any"} type="button" onClick={() => onChange(m.value)} className={cn("py-2 rounded-[8px] text-[12.5px] font-semibold transition-all duration-150 hover:scale-[1.04] text-center w-full", isActive ? "bg-accent-soft text-accent ring-1 ring-[color:var(--color-accent)]/60 hover:bg-accent/20 hover:ring-[color:var(--color-accent)]" : "bg-surface-2 text-muted hover:text-text hover:bg-surface")}>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
