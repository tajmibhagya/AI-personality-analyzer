"use client";

import { useState } from "react";
import { TopNav } from "@/components/nav/TopNav";
import { Container } from "@/components/layout/Container";
import { UploadForm } from "@/components/upload/UploadForm";
import { TextPreview } from "@/components/upload/TextPreview";
import { ReflectionDisplay } from "@/components/upload/ReflectionDisplay";
import { usePersonalityStore } from "@/lib/store/personality";
import { useHydration } from "@/lib/store/useHydration";
import { extract, applyToLife } from "@/lib/api";
import type { UploadFormSubmit } from "@/components/upload/UploadForm";
import type { LifeReflection } from "@/lib/api";

type Stage = "idle" | "extracting" | "preview" | "reflecting" | "done" | "error";

export default function UploadPage() {
  const hydrated = useHydration();
  const personality = usePersonalityStore((s) => s.personality);

  const [stage, setStage] = useState<Stage>("idle");
  const [extractedText, setExtractedText] = useState<string>("");
  const [sourceLabel, setSourceLabel] = useState<string>("");
  const [reflection, setReflection] = useState<LifeReflection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async (input: UploadFormSubmit) => {
    setStage("extracting");
    setError(null);
    let payload: { raw_text?: string; url?: string; file?: File } = {};
    let label = "";
    if (input.mode === "text" && input.text) { payload.raw_text = input.text; label = "pasted text"; }
    else if (input.mode === "url" && input.url) { payload.url = input.url; label = "URL: " + input.url; }
    else if (input.mode === "pdf" && input.file) { payload.file = input.file; label = "PDF: " + input.file.name; }
    const { data, error: apiError } = await extract(payload);
    if (apiError) { setError(apiError); setStage("error"); return; }
    if (data && data.text) { setExtractedText(data.text); setSourceLabel(label); setStage("preview"); }
    else { setError("Extraction returned no text."); setStage("error"); }
  };

  const handleApply = async () => {
    if (!personality) { setError("Personality not found. Analyze your writing first."); setStage("error"); return; }
    setStage("reflecting");
    setError(null);
    const { data, error: apiError } = await applyToLife({ text: extractedText, personality });
    if (apiError) { setError(apiError); setStage("error"); return; }
    if (data) { setReflection(data); setStage("done"); }
    else { setError("Reflection returned no data."); setStage("error"); }
  };

  const handleReset = () => { setStage("idle"); setExtractedText(""); setSourceLabel(""); setReflection(null); setError(null); };

  return (
    <>
      <TopNav />
      <main>
        <Container className="py-8">
          <div className="mb-6">
            <h1 className="font-display text-[32px] leading-tight">Apply to my life</h1>
            <p className="text-muted text-[15px] mt-1.5 max-w-2xl">Paste an article, a CV, a job description - anything you are processing. We extract the content and reflect it back through your personality.</p>
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
              <div className="lg:col-span-7 space-y-5">
                {stage === "idle" || stage === "extracting" || stage === "error" ? (<UploadForm onSubmit={handleExtract} loading={stage === "extracting"} />) : null}
                {stage === "error" && error ? (
                  <div className="bg-[rgba(244,63,94,0.08)] border border-[rgba(244,63,94,0.3)] rounded-[14px] p-4">
                    <div className="font-semibold text-[14px] text-[color:var(--color-trait-neuroticism)] mb-1">Something went wrong</div>
                    <div className="text-[13px] text-muted">{error}</div>
                    <button type="button" onClick={handleReset} className="mt-3 text-faint hover:text-text text-[12.5px] font-semibold transition-colors">Try again</button>
                  </div>
                ) : null}
                {stage === "preview" || stage === "reflecting" ? (<TextPreview text={extractedText} source={sourceLabel} onConfirm={handleApply} onReset={handleReset} loading={stage === "reflecting"} />) : null}
                {stage === "done" && reflection ? (<ReflectionDisplay reflection={reflection} onReset={handleReset} />) : null}
              </div>
              <div className="lg:col-span-5">
                <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5 sticky top-24">
                  <h2 className="font-display text-[16px] mb-2">How this is different</h2>
                  <p className="text-muted text-[13.5px] leading-relaxed mb-4">Generic advice tells you what worked for someone average. This tells you what is likely to work or be hard <span className="text-text font-semibold">for you</span> based on your actual personality scores.</p>
                  <div className="space-y-3 text-[13px]">
                    <div className="flex gap-2.5"><div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[11px] font-bold flex-none">1</div><div className="text-muted leading-relaxed pt-0.5">We extract clean text from your input.</div></div>
                    <div className="flex gap-2.5"><div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[11px] font-bold flex-none">2</div><div className="text-muted leading-relaxed pt-0.5">An LLM reads it through your Big Five profile.</div></div>
                    <div className="flex gap-2.5"><div className="w-6 h-6 rounded-full bg-accent-soft text-accent flex items-center justify-center text-[11px] font-bold flex-none">3</div><div className="text-muted leading-relaxed pt-0.5">You get takeaways, blind spots, and reflection prompts tuned to your traits.</div></div>
                  </div>
                  <p className="text-faint text-[11.5px] mt-5 leading-relaxed">Not a therapist or career coach. A reflection tool that knows your personality.</p>
                </div>
              </div>
            </div>
          ) : null}
        </Container>
      </main>
    </>
  );
}