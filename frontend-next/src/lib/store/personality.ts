import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Personality, Emotion, LifeReflection } from "@/lib/api";

type RecommendationItem = {
  title: string;
  author_director?: string;
  year?: number;
  description: string;
  why?: string;
  traits?: string[];
};

type StoredRecommendations = {
  books: RecommendationItem[];
  films: RecommendationItem[];
  music: RecommendationItem[];
  activities: RecommendationItem[];
  savedAt: number;
};

type PersonalityStore = {
  personality: Personality | null;
  emotion: Emotion | null;
  lastAnalyzedText: string | null;
  lastAnalyzedAt: number | null;
  lastReflection: LifeReflection | null;
  lastReflectionAt: number | null;
  lastRecommendations: StoredRecommendations | null;
  userName: string;

  setAnalysis: (args: { personality: Personality; emotion: Emotion; text: string }) => void;
  setReflection: (reflection: LifeReflection) => void;
  setRecommendations: (recs: StoredRecommendations) => void;
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
      lastRecommendations: null,
      userName: "You",

      setAnalysis: ({ personality, emotion, text }) =>
        set({ personality, emotion, lastAnalyzedText: text, lastAnalyzedAt: Date.now() }),

      setReflection: (reflection) =>
        set({ lastReflection: reflection, lastReflectionAt: Date.now() }),

      setRecommendations: (recs) =>
        set({ lastRecommendations: recs }),

      clearAnalysis: () =>
        set({
          personality: null,
          emotion: null,
          lastAnalyzedText: null,
          lastAnalyzedAt: null,
          lastReflection: null,
          lastReflectionAt: null,
          lastRecommendations: null,
        }),

      setUserName: (name) => set({ userName: name }),
      hasAnalysis: () => get().personality !== null,
    }),
    {
      name: "mindprofile-personality",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
