"use client";

import { useState, useEffect, useCallback } from "react";
import type { Personality } from "@/lib/api";

type Question = {
  id: number;
  type: "pattern" | "oddone" | "analogy" | "association" | "visual";
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

const QUESTIONS: Question[] = [
  { id: 1, type: "pattern", question: "What comes next? 2, 4, 8, 16, ___", options: ["24", "32", "28", "20"], answer: "32", explanation: "Each number doubles." },
  { id: 2, type: "oddone", question: "Which one does NOT belong?", options: ["Apple", "Orange", "Carrot", "Grape"], answer: "Carrot", explanation: "Carrot is a vegetable. The rest are fruits." },
  { id: 3, type: "analogy", question: "Hot is to Cold as Day is to ___", options: ["Sun", "Night", "Morning", "Dark"], answer: "Night", explanation: "Hot and Cold are opposites. Day and Night are opposites." },
  { id: 4, type: "association", question: "What links these three words? BANK, RIVER, FLOW", options: ["Money", "Water", "Stream", "Current"], answer: "Current", explanation: "Current works in all three contexts." },
  { id: 5, type: "pattern", question: "What comes next? Z, X, V, T, ___", options: ["S", "R", "Q", "P"], answer: "R", explanation: "Every other letter backwards: Z, X, V, T, R." },
  { id: 6, type: "oddone", question: "Which one does NOT belong?", options: ["Piano", "Violin", "Trumpet", "Guitar"], answer: "Trumpet", explanation: "Piano, Violin, Guitar have strings. Trumpet is a wind instrument." },
  { id: 7, type: "analogy", question: "Author is to Book as Composer is to ___", options: ["Song", "Orchestra", "Symphony", "Piano"], answer: "Symphony", explanation: "An author creates a book. A composer creates a symphony." },
  { id: 8, type: "association", question: "What links these three words? LIGHT, MORNING, BREAK", options: ["Dawn", "Fast", "Day", "Sun"], answer: "Fast", explanation: "Breakfast, fast (speed), fast (abstain from food)." },
  { id: 9, type: "pattern", question: "What comes next? 1, 1, 2, 3, 5, 8, ___", options: ["11", "12", "13", "14"], answer: "13", explanation: "Fibonacci: each number = sum of two before it." },
  { id: 10, type: "visual", question: "3 squares and 2 triangles — how many sides combined?", options: ["16", "18", "20", "14"], answer: "18", explanation: "3x4 + 2x3 = 12 + 6 = 18." },
];

function getResultProfile(score: number, personality: Personality | null): { title: string; color: string; desc: string } {
  const norm = (v: number) => 1 / (1 + Math.exp(-v));
  const openness = personality ? norm(personality.Openness) : 0.5;
  const conscientiousness = personality ? norm(personality.Conscientiousness) : 0.5;
  if (score >= 9) {
    if (openness > 0.6) return { title: "Creative Genius", color: "#0ea5a4", desc: "Your openness and speed combine into rare lateral thinking. You see connections others miss." };
    return { title: "Pattern Master", color: "#3b82f6", desc: "Rapid precision. You process logical sequences faster than most." };
  }
  if (score >= 7) {
    if (conscientiousness > 0.6) return { title: "Sharp Analyst", color: "#a78bfa", desc: "Methodical and fast. Your discipline lets you cut through noise quickly." };
    return { title: "Quick Thinker", color: "#0ea5a4", desc: "Strong snap judgement. You trust your instincts and they usually pay off." };
  }
  if (score >= 5) {
    if (openness > 0.55) return { title: "Lateral Thinker", color: "#f59e0b", desc: "You approach problems from unexpected angles. Speed will come with practice." };
    return { title: "Steady Reasoner", color: "#6b7280", desc: "Solid logical foundation. You prefer thinking it through over rushing." };
  }
  return { title: "Deep Processor", color: "#f43f5e", desc: "You think carefully. Speed games are not your natural mode - and that is not a bad thing." };
}

type Stage = "intro" | "playing" | "done";

export function CreativeIQGame({ personality }: { personality: Personality | null }) {
  const [stage, setStage] = useState<Stage>("intro");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(10).fill(null));

  const endGame = useCallback(() => { setStage("done"); }, []);

  useEffect(() => {
    if (stage !== "playing") return;
    if (timeLeft <= 0) { endGame(); return; }
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [stage, timeLeft, endGame]);

  const handleAnswer = (option: string) => {
    if (selected) return;
    setSelected(option);
    const correct = option === QUESTIONS[current].answer;
    if (correct) setScore((s) => s + 1);
    const newAnswers = [...answers];
    newAnswers[current] = option;
    setAnswers(newAnswers);
    setTimeout(() => {
      if (current + 1 >= QUESTIONS.length) { endGame(); return; }
      setCurrent((c) => c + 1);
      setSelected(null);
    }, 400);
  };

  const handleStart = () => {
    setStage("playing");
    setTimeLeft(30);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setAnswers(Array(10).fill(null));
  };

  const handleReset = () => {
    setStage("intro");
    setScore(0);
    setCurrent(0);
    setTimeLeft(30);
    setSelected(null);
    setAnswers(Array(10).fill(null));
  };

  const result = getResultProfile(score, personality);
  const timerColor = timeLeft <= 10 ? "#f43f5e" : timeLeft <= 20 ? "#f59e0b" : "#0ea5a4";
  const timerPct = (timeLeft / 30) * 100;
  const circumference = 2 * Math.PI * 17;

  return (
    <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[20px] overflow-hidden">
      <div className="p-5 border-b border-[color:var(--color-border-subtle)] flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-accent-soft flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        </div>
        <div>
          <h3 className="font-display text-[16px]">Creative IQ Challenge</h3>
          <p className="text-faint text-[11.5px]">10 questions &middot; 30 seconds &middot; snap thinking only</p>
        </div>
      </div>

      {stage === "intro" ? (
        <div className="p-6 text-center">
          <div className="text-[48px] mb-3">🧠</div>
          <h4 className="font-display text-[20px] mb-2">Ready to test your snap thinking?</h4>
          <p className="text-muted text-[13.5px] leading-relaxed max-w-sm mx-auto mb-6">10 questions. 30 seconds total. Patterns, analogies, odd-one-out, and word links. Pick fast - there is no time to overthink.</p>
          <div className="grid grid-cols-3 gap-3 mb-6 max-w-xs mx-auto">
            <div className="bg-surface-2 rounded-[12px] p-3 text-center"><div className="font-display text-[22px] text-accent">10</div><div className="text-faint text-[11px]">Questions</div></div>
            <div className="bg-surface-2 rounded-[12px] p-3 text-center"><div className="font-display text-[22px] text-accent">30s</div><div className="text-faint text-[11px]">Total time</div></div>
            <div className="bg-surface-2 rounded-[12px] p-3 text-center"><div className="font-display text-[22px] text-accent">3s</div><div className="text-faint text-[11px]">Per question</div></div>
          </div>
          <p className="text-faint text-[11px] mb-5 max-w-xs mx-auto">A fun creative challenge, not a scientific IQ test. Your result is crossed with your Big Five for a personalised profile.</p>
          <button type="button" onClick={handleStart} className="px-8 py-3 bg-accent text-[#022] rounded-[12px] font-display text-[16px] hover:opacity-90 active:scale-95 transition-all">Start challenge</button>
        </div>
      ) : null}

      {stage === "playing" ? (
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-faint text-[12px]">{current + 1} / {QUESTIONS.length}</span>
              <div className="w-32 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                <div className="h-1.5 rounded-full bg-accent transition-all duration-300" style={{ width: `${(current / QUESTIONS.length) * 100}%` }} />
              </div>
            </div>
            <div className="relative w-10 h-10">
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="17" fill="none" stroke="#1e293b" strokeWidth="3" />
                <circle cx="20" cy="20" r="17" fill="none" stroke={timerColor} strokeWidth="3" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - timerPct / 100)} strokeLinecap="round" transform="rotate(-90 20 20)" style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-display text-[13px]" style={{ color: timerColor }}>{timeLeft}</span>
            </div>
          </div>

          <div className="bg-surface-2 rounded-[14px] p-5 mb-4">
            <div className="text-faint text-[10.5px] uppercase tracking-wider mb-2">{QUESTIONS[current].type === "pattern" ? "Pattern" : QUESTIONS[current].type === "oddone" ? "Odd one out" : QUESTIONS[current].type === "analogy" ? "Analogy" : QUESTIONS[current].type === "association" ? "Word link" : "Visual"}</div>
            <p className="font-display text-[17px] leading-snug">{QUESTIONS[current].question}</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {QUESTIONS[current].options.map((opt) => {
              const isSelected = selected === opt;
              const isCorrect = selected && opt === QUESTIONS[current].answer;
              const isWrong = isSelected && opt !== QUESTIONS[current].answer;
              return (
                <button key={opt} type="button" onClick={() => handleAnswer(opt)} disabled={!!selected} className={"p-3.5 rounded-[12px] text-[14px] font-semibold text-left transition-all duration-150 " + (isCorrect ? "bg-[rgba(34,197,94,0.2)] border border-[rgba(34,197,94,0.5)] text-[#16a34a]" : isWrong ? "bg-[rgba(244,63,94,0.15)] border border-[rgba(244,63,94,0.4)] text-[#f43f5e]" : "bg-surface border border-[color:var(--color-border-subtle)] hover:border-[color:var(--color-accent)]/50 hover:bg-accent-soft hover:text-accent")}>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {stage === "done" ? (
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-[36px]" style={{ background: result.color + "20" }}>
              {score >= 9 ? "🏆" : score >= 7 ? "⭐" : score >= 5 ? "💡" : "🌱"}
            </div>
            <h4 className="font-display text-[24px] mb-1" style={{ color: result.color }}>{result.title}</h4>
            <p className="text-muted text-[13.5px] leading-relaxed max-w-sm mx-auto">{result.desc}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5 text-center">
            <div className="bg-surface-2 rounded-[12px] p-3"><div className="font-display text-[28px]" style={{ color: result.color }}>{score}</div><div className="text-faint text-[11px]">Correct</div></div>
            <div className="bg-surface-2 rounded-[12px] p-3"><div className="font-display text-[28px] text-text">{Math.round((score / 10) * 100)}%</div><div className="text-faint text-[11px]">Accuracy</div></div>
            <div className="bg-surface-2 rounded-[12px] p-3"><div className="font-display text-[28px] text-text">{30 - timeLeft}s</div><div className="text-faint text-[11px]">Time used</div></div>
          </div>

          <div className="bg-surface-2 rounded-[14px] p-4 mb-4">
            <div className="text-faint text-[10.5px] uppercase tracking-wider mb-3">Question breakdown</div>
            <div className="flex gap-1.5 flex-wrap">
              {QUESTIONS.map((q, i) => {
                const ans = answers[i];
                const correct = ans === q.answer;
                const skipped = ans === null;
                return (
                  <div key={i} className={"w-7 h-7 rounded-[6px] flex items-center justify-center text-[11px] font-bold " + (skipped ? "bg-surface text-faint border border-[color:var(--color-border-subtle)]" : correct ? "bg-[rgba(34,197,94,0.2)] text-[#16a34a]" : "bg-[rgba(244,63,94,0.15)] text-[#f43f5e]")}>
                    {skipped ? i + 1 : correct ? "v" : "x"}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-surface-2 rounded-[14px] p-4 mb-5 max-h-48 overflow-y-auto">
            <div className="text-faint text-[10.5px] uppercase tracking-wider mb-3">Answers explained</div>
            <div className="space-y-2.5">
              {QUESTIONS.map((q, i) => (
                <div key={i} className="text-[12px]">
                  <span className={"font-bold mr-1.5 " + (answers[i] === q.answer ? "text-[#16a34a]" : "text-[#f43f5e]")}>{i + 1}.</span>
                  <span className="text-text">{q.question.slice(0, 40)}{q.question.length > 40 ? "..." : ""}</span>
                  <span className="text-faint ml-1.5">Answer: {q.answer}. {q.explanation}</span>
                </div>
              ))}
            </div>
          </div>

          <button type="button" onClick={handleReset} className="w-full py-2.5 bg-accent text-[#022] rounded-[12px] font-semibold text-[14px] hover:opacity-90 active:scale-95 transition-all">Try again</button>
        </div>
      ) : null}
    </div>
  );
}
