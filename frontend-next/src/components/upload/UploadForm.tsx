"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

export type InputMode = "text" | "url" | "pdf";

export type UploadFormSubmit = {
  mode: InputMode;
  text?: string;
  url?: string;
  file?: File;
};

type UploadFormProps = {
  onSubmit: (input: UploadFormSubmit) => Promise<void>;
  loading?: boolean;
};

const MIN_CHARS = 200;
const MAX_CHARS = 50000;

export function UploadForm({ onSubmit, loading = false }: UploadFormProps) {
  const [mode, setMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canSubmit = (() => {
    if (loading) return false;
    if (mode === "text") return text.length >= MIN_CHARS && text.length <= MAX_CHARS;
    if (mode === "url") return /^https?:\/\/.+/.test(url.trim());
    if (mode === "pdf") return file !== null;
    return false;
  })();

  const helperText = (() => {
    if (mode === "text") {
      if (text.length < MIN_CHARS) return "Paste at least " + (MIN_CHARS - text.length) + " more characters.";
      if (text.length > MAX_CHARS) return "Too long. Maximum is " + MAX_CHARS.toLocaleString() + " characters.";
      return "Ready to apply this to your life.";
    }
    if (mode === "url") {
      if (!url.trim()) return "Paste a URL starting with http:// or https://";
      if (!canSubmit) return "URL format does not look valid.";
      return "Ready to fetch and analyze.";
    }
    if (mode === "pdf") {
      if (!file) return "Select a PDF file to upload.";
      return file.name + " - " + (file.size / 1024).toFixed(0) + " KB";
    }
    return "";
  })();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    if (mode === "text") await onSubmit({ mode, text: text.trim() });
    else if (mode === "url") await onSubmit({ mode, url: url.trim() });
    else if (mode === "pdf" && file) await onSubmit({ mode, file });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f && f.type === "application/pdf") setFile(f);
    else if (f) alert("Please select a PDF file.");
  };

  return (
    <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
      <div className="flex gap-1 p-1 bg-surface-2 rounded-[12px] mb-4 w-fit">
        <TabButton active={mode === "text"} onClick={() => setMode("text")}>Paste text</TabButton>
        <TabButton active={mode === "url"} onClick={() => setMode("url")}>From URL</TabButton>
        <TabButton active={mode === "pdf"} onClick={() => setMode("pdf")}>Upload PDF</TabButton>
      </div>

      {mode === "text" ? (
        <div>
          <p className="text-muted text-[13px] mb-3 leading-relaxed">A CV, job description, article, essay - anything you are trying to understand or make a decision about.</p>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the content here..." disabled={loading} className="w-full min-h-[220px] p-4 rounded-[12px] bg-surface-2 border border-[color:var(--color-border-subtle)] text-text text-[14px] leading-relaxed font-sans placeholder:text-faint resize-y outline-none focus:border-accent transition-colors disabled:opacity-60" />
        </div>
      ) : null}

      {mode === "url" ? (
        <div>
          <p className="text-muted text-[13px] mb-3 leading-relaxed">Paste any article URL. We fetch the page and extract the main text.</p>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/article" disabled={loading} className="w-full p-3.5 rounded-[12px] bg-surface-2 border border-[color:var(--color-border-subtle)] text-text text-[14px] font-sans placeholder:text-faint outline-none focus:border-accent transition-colors disabled:opacity-60" />
        </div>
      ) : null}

      {mode === "pdf" ? (
        <div>
          <p className="text-muted text-[13px] mb-3 leading-relaxed">Upload a PDF - your CV, a research paper, a job posting saved as PDF.</p>
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} disabled={loading} className="hidden" />
          <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading} className="w-full p-6 rounded-[12px] bg-surface-2 border-2 border-dashed border-[color:var(--color-border-subtle)] hover:border-accent transition-colors flex flex-col items-center gap-2 disabled:opacity-60">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
            <div className="text-text text-[14px] font-semibold">{file ? file.name : "Click to select a PDF"}</div>
            <div className="text-faint text-[12px]">PDF only, up to ~10 MB</div>
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between mt-4 gap-3 flex-wrap">
        <span className={cn("text-[12.5px]", canSubmit ? "text-accent" : "text-faint")}>{helperText}</span>
        <button type="button" onClick={handleSubmit} disabled={!canSubmit} className={cn("px-5 py-2.5 rounded-[11px] font-semibold text-[14px] transition-all duration-150", canSubmit ? "bg-accent text-[#022] hover:opacity-90 active:scale-95" : "bg-surface-2 text-faint cursor-not-allowed")}>
          {loading ? "Working..." : "Apply to my life"}
        </button>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("px-4 py-1.5 rounded-[9px] text-[13px] font-semibold transition-colors", active ? "bg-accent text-[#022]" : "text-muted hover:text-text")}>
      {children}
    </button>
  );
}
