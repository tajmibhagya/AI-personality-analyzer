"use client";

import { cn } from "@/lib/utils";
import { mediumLabels } from "@/lib/recommendation-styles";
import type { Medium } from "@/lib/api";

type MediumSelectorProps = {
  value: Medium;
  onChange: (medium: Medium) => void;
};

const mediums: Medium[] = ["books", "films", "music", "activities"];

export function MediumSelector({ value, onChange }: MediumSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {mediums.map((m) => {
        const info = mediumLabels[m];
        const isActive = value === m;
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={cn("flex items-center gap-2 px-4 py-2 rounded-[11px] text-[13.5px] font-semibold transition-colors duration-150", isActive ? "bg-accent text-[#022]" : "bg-surface border border-[color:var(--color-border-subtle)] text-muted hover:bg-surface-2 hover:text-text")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={info.icon} />
            </svg>
            {info.label}
          </button>
        );
      })}
    </div>
  );
}
