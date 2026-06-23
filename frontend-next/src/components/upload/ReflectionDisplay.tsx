"use client";

import type { LifeReflection } from "@/lib/api";

type ReflectionDisplayProps = {
  reflection: LifeReflection;
  onReset: () => void;
};

export function ReflectionDisplay({ reflection, onReset }: ReflectionDisplayProps) {
  return (
    <div className="space-y-4 mp-animate-in">
      <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-[8px] bg-accent-soft flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" /></svg>
          </div>
          <h2 className="font-display text-[18px]">In one paragraph</h2>
        </div>
        <p className="text-text text-[14.5px] leading-relaxed">{reflection.summary}</p>
      </div>

      <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-[8px] bg-[rgba(34,197,94,0.14)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--color-trait-agreeableness)]"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
          </div>
          <h2 className="font-display text-[18px]">Takeaways for you</h2>
        </div>
        <ul className="space-y-2.5">
          {reflection.takeaways_for_you.map((t, i) => (
            <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-text">
              <span className="text-accent font-bold flex-none">{i + 1}.</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-[8px] bg-[rgba(245,158,11,0.14)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--color-trait-agreeableness)]"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /></svg>
          </div>
          <h2 className="font-display text-[18px]">Where this might be hard for you</h2>
        </div>
        <ul className="space-y-2.5">
          {reflection.where_this_might_be_hard.map((w, i) => (
            <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-text">
              <span className="text-[color:var(--color-trait-agreeableness)] font-bold flex-none">!</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-[8px] bg-[rgba(139,92,246,0.14)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--color-trait-extraversion)]"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" /></svg>
          </div>
          <h2 className="font-display text-[18px]">Reflection questions</h2>
        </div>
        <ul className="space-y-3">
          {reflection.reflection_questions.map((q, i) => (
            <li key={i} className="text-text text-[14.5px] leading-relaxed italic border-l-2 border-[color:var(--color-trait-extraversion)] pl-4">{q}</li>
          ))}
        </ul>
      </div>

      {reflection.caveat ? (
        <div className="bg-surface-2 border border-[color:var(--color-border-subtle)] rounded-[14px] p-4">
          <div className="text-faint text-[11px] uppercase tracking-wider mb-1">Caveat</div>
          <p className="text-muted text-[12.5px] leading-relaxed">{reflection.caveat}</p>
        </div>
      ) : null}

      <div className="pt-2">
        <button type="button" onClick={onReset} className="text-faint hover:text-text text-[13px] font-semibold transition-colors flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5" /></svg>
          Apply something else
        </button>
      </div>
    </div>
  );
}