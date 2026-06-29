"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[rgba(244,63,94,0.14)] flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--color-trait-neuroticism)]"><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
        </div>
        <h2 className="font-display text-[20px] mb-2">Something went wrong</h2>
        <p className="text-muted text-[13.5px] mb-5 leading-relaxed">An unexpected error happened while rendering this page. The issue has been logged. Try reloading - if it persists, head back home.</p>
        {error.digest ? <div className="text-faint text-[11px] font-mono bg-surface-2 rounded-[8px] py-1.5 px-2 mb-4 break-all">Error ID: {error.digest}</div> : null}
        <div className="flex gap-2 justify-center">
          <button type="button" onClick={reset} className="px-4 py-2 bg-accent text-[#022] rounded-[10px] text-[13.5px] font-semibold hover:opacity-90 transition-opacity">Try again</button>
          <a href="/" className="px-4 py-2 bg-surface-2 border border-[color:var(--color-border-subtle)] text-text rounded-[10px] text-[13.5px] font-semibold hover:bg-surface transition-colors">Go home</a>
        </div>
      </div>
    </div>
  );
}
