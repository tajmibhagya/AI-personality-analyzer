"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import type { Personality } from "@/lib/api";

type PersonalityRadarProps = { personality: Personality };

export function PersonalityRadar({ personality }: PersonalityRadarProps) {
  const data = [
    { subject: "Openness", score: Math.round(personality.Openness * 100) },
    { subject: "Conscientiousness", score: Math.round(personality.Conscientiousness * 100) },
    { subject: "Extraversion", score: Math.round(personality.Extraversion * 100) },
    { subject: "Agreeableness", score: Math.round(personality.Agreeableness * 100) },
    { subject: "Neuroticism", score: Math.round(personality.Neuroticism * 100) },
  ];

  return (
    <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-[16px]">Big Five - at a glance</h2>
        <span className="text-faint text-[12px] uppercase tracking-wider">Radar view</span>
      </div>
      <div style={{ width: "100%", height: "340px", position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 20, right: 60, bottom: 20, left: 60 }}>
            <PolarGrid stroke="var(--color-border-subtle)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--color-muted)", fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "var(--color-faint)", fontSize: 10 }} tickCount={5} axisLine={false} />
            <Radar name="You" dataKey="score" stroke="var(--color-accent)" fill="var(--color-accent)" fillOpacity={0.35} strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
