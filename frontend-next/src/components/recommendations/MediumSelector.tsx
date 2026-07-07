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
    <div className="grid grid-cols-4 gap-3 w-full">
      {mediums.map((m) => {
        const info = mediumLabels[m];
        const isActive = value === m;
        return (
          <button key={m} type="button" onClick={() => onChange(m)} className={cn("flex items-center justify-center gap-2 py-3 rounded-[11px] text-[13.5px] font-semibold transition-all duration-150 hover:scale-[1.04] hover:shadow-md w-full", isActive ? "bg-accent text-[#022] hover:bg-accent/90 shadow-[0_0_12px_rgba(14,165,164,0.35)]" : "bg-surface border border-[color:var(--color-border-subtle)] text-muted hover:bg-surface-2 hover:text-text hover:border-[color:var(--color-accent)]/40")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={info.icon} /></svg>
            {info.label}
          </button>
        );
      })}
    </div>
  );
}
