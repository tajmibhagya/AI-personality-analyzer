"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const MIN_CHARS = 200;
const MAX_CHARS = 10000;

type AnalyzeFormProps = {
  onSubmit: (text: string) => Promise<void>;
  loading?: boolean;
};

export function AnalyzeForm({ onSubmit, loading = false }: AnalyzeFormProps) {
  const [text, setText] = useState("");

  const charCount = text.length;
  const isTooShort = charCount < MIN_CHARS;
  const isTooLong = charCount > MAX_CHARS;
  const canSubmit = !isTooShort && !isTooLong && !loading;

  const counterColor = isTooLong
    ? "text-[color:var(--color-trait-neuroticism)]"
    : isTooShort
    ? "text-faint"
    : "text-accent";

  const helperText = isTooLong
    ? `Too long — ${charCount.toLocaleString()} characters. Maximum is ${MAX_CHARS.toLocaleString()}.`
    : isTooShort
    ? `Paste at least ${MIN_CHARS - charCount} more characters for a reliable analysis.`
    : "Looks good. Click Analyze when ready.";

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onSubmit(text.trim());
  };

  return (
    <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-[18px]">Paste your writing</h2>
        <span className={cn("text-[12.5px] font-semibold tabular-nums", counterColor)}>
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </span>
      </div>

      <p className="text-muted text-[13px] mb-3 leading-relaxed">
        A journal entry, blog post, long message, or any writing where you used
        your natural voice. The more authentic, the better the analysis.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start pasting here..."
        disabled={loading}
        className={cn(
          "w-full min-h-[200px] p-4 rounded-[12px]",
          "bg-surface-2 border border-[color:var(--color-border-subtle)]",
          "text-text text-[14px] leading-relaxed font-sans",
          "placeholder:text-faint",
          "resize-y outline-none",
          "focus:border-accent transition-colors",
          loading && "opacity-60 cursor-not-allowed"
        )}
      />

      <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
        <span className={cn("text-[12.5px]", counterColor)}>{helperText}</span>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "px-5 py-2.5 rounded-[11px] font-semibold text-[14px]",
            "transition-all duration-150",
            canSubmit
              ? "bg-accent text-[#022] hover:opacity-90 active:scale-95"
              : "bg-surface-2 text-faint cursor-not-allowed"
          )}
        >
          {loading ? "Analyzing..." : "Analyze my writing"}
        </button>
      </div>
    </div>
  );
}