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
    <div className="flex flex-wrap gap-1.5">
      {moods.map((m) => {
        const isActive = value === m.value;
        return (
          <button
            key={m.value ?? "any"}
            type="button"
            onClick={() => onChange(m.value)}
            className={cn("px-3 py-1.5 rounded-[8px] text-[12.5px] font-semibold transition-colors duration-150", isActive ? "bg-accent-soft text-accent" : "bg-surface-2 text-muted hover:text-text")}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
