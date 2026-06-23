"use client";

type TextPreviewProps = {
  text: string;
  source: string;
  onConfirm: () => void;
  onReset: () => void;
  loading?: boolean;
};

export function TextPreview({ text, source, onConfirm, onReset, loading = false }: TextPreviewProps) {
  const preview = text.length > 800 ? text.slice(0, 800) + "..." : text;
  const wordCount = text.trim().split(/\s+/).length;

  return (
    <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5 mp-animate-in">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <div className="text-faint text-[11px] uppercase tracking-wider mb-1">Extracted from {source}</div>
          <div className="font-display text-[17px]">Does this look right?</div>
        </div>
        <span className="text-faint text-[12.5px]">{wordCount.toLocaleString()} words</span>
      </div>

      <div className="bg-surface-2 rounded-[12px] p-4 mb-4 max-h-[220px] overflow-y-auto">
        <p className="text-muted text-[13.5px] leading-relaxed whitespace-pre-wrap">{preview}</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button type="button" onClick={onConfirm} disabled={loading} className="px-5 py-2.5 bg-accent text-[#022] rounded-[11px] text-[14px] font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? "Reflecting..." : "Yes, apply this to my life"}
        </button>
        <button type="button" onClick={onReset} disabled={loading} className="px-5 py-2.5 bg-surface-2 border border-[color:var(--color-border-subtle)] hover:bg-surface text-text rounded-[11px] text-[14px] font-semibold transition-colors disabled:opacity-60">
          Start over
        </button>
      </div>
    </div>
  );
}
