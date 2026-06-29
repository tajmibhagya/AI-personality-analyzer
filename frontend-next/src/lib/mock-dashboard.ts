/**
 * Structure matches what the /analyze + /recommend endpoints will eventually return.
 */

export type TraitRow = {
    name: string;
    score: number;
    colorVar: string;
    shortDescription: string;  // one-line label: what high vs low looks like
    yourDescription: string;   // personalized: what their score means
  };
  
export type Recommendation = {
    title: string;
    subtitle: string;
    iconPath: string;
    match: "high" | "medium" | "low";
  };
  
  export type DashboardData = {
    userName: string;
    initial: string;
    topTrait: { name: string; description: string };
    traits: TraitRow[];
    streakDays: number; // 0-7, how many of the last 7 days the user analyzed
    recommendations: Recommendation[];
  };
  
  
  export const mockDashboard: DashboardData = {
    userName: "Priya",
    initial: "P",
    topTrait: {
      name: "Extraversion",
      description: "Energetic, sociable, and at your best around people.",
    },
    traits: [
        {
          name: "Openness",
          score: 85,
          colorVar: "var(--color-trait-openness)",
          shortDescription: "Curiosity, imagination, and openness to new ideas",
          yourDescription:
            "You thrive on novelty — new ideas, art, travel, unconventional perspectives. You're likely the friend who suggests the experimental restaurant.",
        },
        {
          name: "Conscientiousness",
          score: 72,
          colorVar: "var(--color-trait-conscientiousness)",
          shortDescription: "Organization, discipline, and goal-directed behavior",
          yourDescription:
            "You're reliably organized and follow through on commitments. You plan ahead more than most, though you can still be spontaneous when it matters.",
        },
        {
          name: "Extraversion",
          score: 92,
          colorVar: "var(--color-trait-extraversion)",
          shortDescription: "Energy drawn from social interaction and the outside world",
          yourDescription:
            "You're energized by people. Group settings, conversations, and being around others recharge you. Long stretches of solitude can feel draining.",
        },
        {
          name: "Agreeableness",
          score: 78,
          colorVar: "var(--color-trait-agreeableness)",
          shortDescription: "Warmth, cooperation, and trust in others",
          yourDescription:
            "You lean toward harmony and care about how others feel. You'll usually go along to keep peace, though you can hold your ground when something matters.",
        },
        {
          name: "Neuroticism",
          score: 38,
          colorVar: "var(--color-trait-neuroticism)",
          shortDescription: "Sensitivity to stress and negative emotions",
          yourDescription:
            "You handle stress with relative steadiness. Setbacks bother you in the moment but don't usually spiral. Your emotional baseline is calm.",
        },
      ],
    streakDays: 5,
    recommendations: [
      {
        title: "Leadership Development",
        subtitle: "Build on your natural drive to inspire and lead.",
        iconPath: "M12 2l2.2 5.6L20 9l-5 4.3L16.5 20 12 16.5 7.5 20 9 13.3 4 9l5.8-1.4Z",
        match: "high",
      },
      {
        title: "Creative Problem Solving",
        subtitle: "Leverage openness and inventive thinking.",
        iconPath: "M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V18h6v-1.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z",
        match: "high",
      },
      {
        title: "Stress Management",
        subtitle: "Build emotional balance and resilience.",
        iconPath: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
        match: "medium",
      },
    ],
  };