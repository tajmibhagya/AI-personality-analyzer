"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { matchLevelFor, matchStyles } from "@/lib/recommendation-styles";
import type { Recommendation } from "@/lib/api";

type RecommendationCardProps = {
  rec: Recommendation;
  index: number;
};

function subtitleFor(metadata: Record<string, unknown>): string {
  const parts: string[] = [];
  if (typeof metadata.author === "string") parts.push("by " + metadata.author);
  if (typeof metadata.artist === "string") parts.push("by " + metadata.artist);
  if (typeof metadata.director === "string") parts.push("dir. " + metadata.director);
  if (typeof metadata.year === "number" || typeof metadata.year === "string") parts.push(String(metadata.year));
  if (typeof metadata.category === "string" && parts.length === 0) {
    parts.push((metadata.category as string).replace(/_/g, " "));
  }
  return parts.join(" - ");
}

function detailsFor(metadata: Record<string, unknown>): Array<[string, string]> {
  const fields: Array<[string, unknown]> = [
    ["Category", metadata.category],
    ["Genre", metadata.genre],
    ["Time commitment", metadata.time_commitment],
    ["Social level", metadata.social_level],
    ["Energy level", metadata.energy_level],
    ["Where to find", metadata.where_to_find],
    ["Pages", metadata.pages],
    ["Runtime", metadata.runtime],
  ];
  return fields
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => [k, String(v).replace(/_/g, " ")] as [string, string]);
}

export function RecommendationCard({ rec, index }: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const level = matchLevelFor(rec.trait_drivers ?? []);
  const badge = matchStyles[level];
  const subtitle = subtitleFor(rec.metadata ?? {});
  const details = detailsFor(rec.metadata ?? {});
  const sourceUrl = typeof rec.metadata?.source_url === "string" ? rec.metadata.source_url as string : null;
  const searchQuery = encodeURIComponent([rec.title, rec.metadata?.author || rec.metadata?.director || rec.metadata?.artist || ""].filter(Boolean).join(" "));
  const googleUrl = `https://www.google.com/search?q=${searchQuery}`;

  return (
    <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5 transition-all hover:-translate-y-0.5 hover:border-[color:var(--color-accent)]/30 mp-animate-in" style={{ animationDelay: index * 80 + "ms" }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-11 h-11 rounded-[11px] bg-accent-soft flex items-center justify-center flex-none">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
              <path d="M12 2l2.2 5.6L20 9l-5 4.3L16.5 20 12 16.5 7.5 20 9 13.3 4 9l5.8-1.4Z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[17px] leading-tight">{rec.title}</h3>
            {subtitle ? <div className="text-muted text-[12.5px] mt-1">{subtitle}</div> : null}
          </div>
        </div>
        <span className={cn("text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-[7px] flex-none", badge.textColor, badge.bg)}>{badge.label}</span>
      </div>

      <p className="text-text text-[13.5px] leading-relaxed mb-3">{rec.why}</p>

      {rec.trait_drivers && rec.trait_drivers.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {rec.trait_drivers.map((t) => (
            <span key={t} className="text-[11px] font-semibold text-muted bg-surface-2 px-2 py-0.5 rounded-[6px]">{t}</span>
          ))}
        </div>
      ) : null}

      {details.length > 0 || sourceUrl ? (
        <div className="border-t border-[color:var(--color-border-subtle)] pt-3 mt-3">
          <button type="button" onClick={() => setExpanded(!expanded)} className="text-faint text-[12.5px] font-semibold hover:text-text transition-colors flex items-center gap-1">
            {expanded ? "Hide details" : "More details"}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          {expanded ? (
            <div className="mt-3 space-y-2">
              {details.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 text-[12.5px]">
                  <span className="text-faint">{k}</span>
                  <span className="text-text text-right">{v}</span>
                </div>
              ))}
              <a href={googleUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-accent text-[12.5px] font-semibold hover:underline mb-3">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              Search on Google
            </a>
          {sourceUrl ? (
                <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="block mt-3 text-accent text-[12.5px] font-semibold hover:underline">View source</a>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
