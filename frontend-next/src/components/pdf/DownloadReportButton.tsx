"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { PDFDocument } from "@/components/pdf/PDFDocument";
import { usePersonalityStore } from "@/lib/store/personality";
import { useHydration } from "@/lib/store/useHydration";

type DownloadReportButtonProps = {
  variant?: "primary" | "secondary";
  className?: string;
};

export function DownloadReportButton({ variant = "primary", className = "" }: DownloadReportButtonProps) {
  const hydrated = useHydration();
  const personality = usePersonalityStore((s) => s.personality);
  const lastAnalyzedAt = usePersonalityStore((s) => s.lastAnalyzedAt);
  const reflection = usePersonalityStore((s) => s.lastReflection);
  const reflectionAt = usePersonalityStore((s) => s.lastReflectionAt);
  const userName = usePersonalityStore((s) => s.userName);

  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    if (generating) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <PDFDocument
          userName={userName || "You"}
          personality={personality}
          lastAnalyzedAt={lastAnalyzedAt}
          reflection={reflection}
          reflectionAt={reflectionAt}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "mindprofile-report.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Could not generate the PDF. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (!hydrated) return null;

  const disabled = generating || !personality;
  const label = generating ? "Building your report..." : !personality ? "Analyze first" : "Download report";

  if (variant === "secondary") {
    return (
      <button type="button" onClick={handleDownload} disabled={disabled} className={"px-4 py-2 bg-surface border border-[color:var(--color-border-subtle)] hover:bg-surface-2 text-text rounded-[10px] text-[13px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 " + className}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
        {label}
      </button>
    );
  }

  return (
    <button type="button" onClick={handleDownload} disabled={disabled} className={"px-5 py-2.5 bg-accent text-[#022] rounded-[11px] text-[14px] font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 " + className}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
      {label}
    </button>
  );
}
