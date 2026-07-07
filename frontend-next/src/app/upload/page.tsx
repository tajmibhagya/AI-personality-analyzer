"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePersonalityStore } from "@/lib/store/personality";
import { useHydration } from "@/lib/store/useHydration";
import { extractText, applyToLife } from "@/lib/api";
import type { LifeReflection } from "@/lib/api";

type Stage = "idle" | "extracting" | "preview" | "reflecting" | "done" | "error";
type Mode = "text" | "url" | "pdf";

export default function UploadPage() {
  const hydrated = useHydration();
  const personality = usePersonalityStore((s) => s.personality);
  const saveReflectionToStore = usePersonalityStore((s) => s.setReflection);

  const [stage, setStage] = useState<Stage>("idle");
  const [mode, setMode] = useState<Mode>("text");
  const [inputText, setInputText] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [reflection, setReflection] = useState<LifeReflection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    setStage("extracting");
    setError(null);
    let source: Parameters<typeof extractText>[0];
    if (mode === "text") {
      if (!inputText || inputText.trim().length < 50) { setError("Please provide more content (at least 50 characters)."); setStage("error"); return; }
      source = { kind: "raw", text: inputText.trim() };
    } else if (mode === "url") {
      if (!inputUrl.trim() || !/^https?:\/\/.+/.test(inputUrl.trim())) { setError("Please enter a valid URL starting with http:// or https://"); setStage("error"); return; }
      source = { kind: "url", url: inputUrl.trim() };
    } else {
      if (!inputFile) { setError("Please select a PDF file."); setStage("error"); return; }
      source = { kind: "pdf", file: inputFile };
    }
    const { data, error: apiError } = await extractText(source);
    if (apiError) { setError(apiError); setStage("error"); return; }
    if (data && data.text && data.text.length > 0) {
      setExtractedText(data.text);
      setCharCount(data.char_count || data.text.length);
      setStage("preview");
    } else {
      setError("Could not extract text from this source. Try pasting the text directly.");
      setStage("error");
    }
  };

  const handleApply = async () => {
    if (!personality) { setError("No personality found. Go to Analyzer first."); setStage("error"); return; }
    setStage("reflecting");
    setError(null);
    const { data, error: apiError } = await applyToLife({ article_text: extractedText, personality });
    if (apiError) { setError(apiError); setStage("error"); return; }
    if (data && (data.summary || (data.takeaways_for_you && data.takeaways_for_you.length > 0))) {
      setReflection(data);
      saveReflectionToStore(data);
      setStage("done");
    } else {
      setError("Reflection returned empty. The article may be too short or the model timed out. Try again.");
      setStage("error");
    }
  };

  const handleReset = () => {
    setStage("idle");
    setInputText("");
    setInputUrl("");
    setInputFile(null);
    setExtractedText("");
    setCharCount(0);
    setReflection(null);
    setError(null);
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-[32px] leading-tight">Apply to my life</h1>
        <p className="text-muted text-[15px] mt-1.5 max-w-2xl">Upload an article, paste a URL, or paste text. We will suggest how its ideas might apply to you given your personality.</p>
      </div>

      {hydrated && !personality ? (
        <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-8 text-center">
          <div className="font-display text-[18px] mb-2">Analyze your writing first</div>
          <p className="text-muted text-[13.5px] mb-5 max-w-md mx-auto">The reflection is personalized to your Big Five profile. Head to the Analyzer first, then come back here.</p>
          <a href="/analyzer" className="inline-block px-5 py-2.5 bg-accent text-[#022] rounded-[11px] text-[14px] font-semibold hover:opacity-90 transition-opacity">Go to Analyzer</a>
        </div>
      ) : null}

      {hydrated && personality ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 space-y-4">

            {stage === "idle" || stage === "extracting" || stage === "error" ? (
              <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
                <div className="flex gap-1 p-1 bg-surface-2 rounded-[12px] mb-4 w-fit">
                  {(["text", "url", "pdf"] as Mode[]).map((m) => (
                    <button key={m} type="button" onClick={() => { setMode(m); setError(null); }} className={"px-4 py-1.5 rounded-[9px] text-[13px] font-semibold transition-colors " + (mode === m ? "bg-accent text-[#022]" : "text-muted hover:text-text")}>
                      {m === "text" ? "Paste text" : m === "url" ? "From URL" : "Upload PDF"}
                    </button>
                  ))}
                </div>

                {mode === "text" ? (
                  <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Paste the content here..." disabled={stage === "extracting"} rows={8} className="w-full p-4 rounded-[12px] bg-surface-2 border border-[color:var(--color-border-subtle)] text-text text-[14px] leading-relaxed placeholder:text-faint resize-y outline-none focus:border-accent transition-colors disabled:opacity-60 w-full" />
                ) : null}

                {mode === "url" ? (
                  <div>
                    <p className="text-muted text-[13px] mb-3">Paste any article URL. We fetch the page and extract the main text.</p>
                    <input type="url" value={inputUrl} onChange={(e) => setInputUrl(e.target.value)} placeholder="https://example.com/article" disabled={stage === "extracting"} className="w-full p-3.5 rounded-[12px] bg-surface-2 border border-[color:var(--color-border-subtle)] text-text text-[14px] placeholder:text-faint outline-none focus:border-accent transition-colors disabled:opacity-60" />
                  </div>
                ) : null}

                {mode === "pdf" ? (
                  <div>
                    <p className="text-muted text-[13px] mb-3">Upload a PDF - your CV, a research paper, a job posting saved as PDF.</p>
                    <label className="block w-full p-8 rounded-[12px] bg-surface-2 border-2 border-dashed border-[color:var(--color-border-subtle)] hover:border-accent transition-colors cursor-pointer text-center">
                      <input type="file" accept="application/pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setInputFile(f); }} />
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted mx-auto mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                      <div className="text-text text-[14px] font-semibold">{inputFile ? inputFile.name : "Click to select a PDF"}</div>
                      <div className="text-faint text-[12px] mt-1">PDF only</div>
                    </label>
                  </div>
                ) : null}

                {stage === "error" && error ? (
                  <div className="mt-3 bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.3)] rounded-[12px] p-3 text-[13px] text-[color:var(--color-trait-neuroticism)]">{error}</div>
                ) : null}

                <div className="mt-4 flex justify-end">
                  <button type="button" onClick={handleExtract} disabled={stage === "extracting"} className="px-5 py-2.5 bg-accent text-[#022] rounded-[11px] text-[14px] font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    {stage === "extracting" ? "Extracting..." : "Apply to my life"}
                  </button>
                </div>
              </div>
            ) : null}

            {stage === "preview" ? (
              <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5 space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                  <span className="text-[13px] font-semibold">Extracted {charCount.toLocaleString()} characters</span>
                </div>
                <p className="text-muted text-[13.5px] leading-relaxed">{extractedText.slice(0, 300)}{extractedText.length > 300 ? "..." : ""}</p>
                <div className="flex gap-2.5">
                  <button type="button" onClick={handleApply} className="px-5 py-2.5 bg-accent text-[#022] rounded-[11px] text-[14px] font-semibold hover:opacity-90 transition-opacity">Yes, apply this to my life</button>
                  <button type="button" onClick={handleReset} className="px-4 py-2.5 bg-surface-2 border border-[color:var(--color-border-subtle)] text-muted rounded-[11px] text-[14px] font-semibold hover:text-text transition-colors">Try different content</button>
                </div>
              </div>
            ) : null}

            {stage === "reflecting" ? (
              <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-8 text-center">
                <div className="w-10 h-10 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto mb-4" />
                <div className="font-display text-[16px] mb-1">Shaping insights around your personality...</div>
                <p className="text-muted text-[13px]">Reading your content through your personality profile. This takes around 10 to 20 seconds.</p>
              </div>
            ) : null}

            {stage === "done" && reflection ? (
              <div className="space-y-4">
                <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-[8px] bg-accent-soft flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" /></svg>
                    </div>
                    <h2 className="font-display text-[18px]">In one paragraph</h2>
                  </div>
                  <p className="text-text text-[14.5px] leading-relaxed">{reflection.summary}</p>
                </div>

                {reflection.takeaways_for_you && reflection.takeaways_for_you.length > 0 ? (
                  <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-[8px] bg-[rgba(34,197,94,0.14)] flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                      </div>
                      <h2 className="font-display text-[18px]">Takeaways for you</h2>
                    </div>
                    <ul className="space-y-3">
                      {reflection.takeaways_for_you.map((t, i) => (
                        <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-text">
                          <span className="text-accent font-bold flex-none mt-0.5">{i + 1}.</span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {reflection.where_this_might_be_hard && reflection.where_this_might_be_hard.length > 0 ? (
                  <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-[8px] bg-[rgba(245,158,11,0.14)] flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-[color:var(--color-trait-agreeableness)]"><path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /></svg>
                      </div>
                      <h2 className="font-display text-[18px]">Where this might be hard for you</h2>
                    </div>
                    <ul className="space-y-3">
                      {reflection.where_this_might_be_hard.map((w, i) => (
                        <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-text">
                          <span className="text-[color:var(--color-trait-agreeableness)] font-bold flex-none mt-0.5">!</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {reflection.reflection_questions && reflection.reflection_questions.length > 0 ? (
                  <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-6">
                    <div className="flex items-center gap-2 mb-4">
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
                ) : null}

                {reflection.caveat ? (
                  <div className="bg-surface-2 border border-[color:var(--color-border-subtle)] rounded-[14px] p-4">
                    <div className="text-faint text-[11px] uppercase tracking-wider mb-1">Note</div>
                    <p className="text-muted text-[12.5px] leading-relaxed">{reflection.caveat}</p>
                  </div>
                ) : null}

                <button type="button" onClick={handleReset} className="text-faint hover:text-text text-[13px] font-semibold transition-colors flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8M3 3v5h5" /></svg>
                  Apply something else
                </button>
              </div>
            ) : null}

          </div>

          <div className="lg:col-span-5">
            <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5 lg:sticky lg:top-24">
              <h2 className="font-display text-[16px] mb-2">Why this works differently</h2>
              <p className="text-muted text-[13.5px] leading-relaxed mb-4">Most advice is written for an average person. This is shaped around your actual personality scores, so what you read is relevant to you specifically.</p>
              <div className="space-y-3 text-[13px]">
                <div className="flex gap-2.5"><div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[11px] font-bold flex-none">1</div><div className="text-muted leading-relaxed pt-0.5">We pull the key content from what you share.</div></div>
                <div className="flex gap-2.5"><div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[11px] font-bold flex-none">2</div><div className="text-muted leading-relaxed pt-0.5">We read it through your personality profile.</div></div>
                <div className="flex gap-2.5"><div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[11px] font-bold flex-none">3</div><div className="text-muted leading-relaxed pt-0.5">You get insights, honest blind spots, and questions shaped around who you are.</div></div>
              </div>
              <p className="text-faint text-[11.5px] mt-5 leading-relaxed">Not a therapist or career coach. A thinking partner that knows your personality.</p>
            </div>
          </div>
        </div>
      ) : null}
    </AppLayout>
  );
}
