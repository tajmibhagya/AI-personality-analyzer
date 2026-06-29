import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Personality, Emotion, LifeReflection } from "@/lib/api";

type PersonalityStore = {
  personality: Personality | null;
  emotion: Emotion | null;
  lastAnalyzedText: string | null;
  lastAnalyzedAt: number | null;
  lastReflection: LifeReflection | null;
  lastReflectionAt: number | null;
  userName: string;

  setAnalysis: (args: { personality: Personality; emotion: Emotion; text: string }) => void;
  setReflection: (reflection: LifeReflection) => void;
  clearAnalysis: () => void;
  setUserName: (name: string) => void;
  hasAnalysis: () => boolean;
};

export const usePersonalityStore = create<PersonalityStore>()(
  persist(
    (set, get) => ({
      personality: null,
      emotion: null,
      lastAnalyzedText: null,
      lastAnalyzedAt: null,
      lastReflection: null,
      lastReflectionAt: null,
      userName: "You",

      setAnalysis: ({ personality, emotion, text }) =>
        set({ personality, emotion, lastAnalyzedText: text, lastAnalyzedAt: Date.now() }),

      setReflection: (reflection) =>
        set({ lastReflection: reflection, lastReflectionAt: Date.now() }),

      clearAnalysis: () =>
        set({ personality: null, emotion: null, lastAnalyzedText: null, lastAnalyzedAt: null, lastReflection: null, lastReflectionAt: null }),

      setUserName: (name) => set({ userName: name }),
      hasAnalysis: () => get().personality !== null,
    }),
    {
      name: "mindprofile-personality",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
