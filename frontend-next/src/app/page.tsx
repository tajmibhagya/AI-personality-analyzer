import { TopNav } from "@/components/nav/TopNav";
import { Container } from "@/components/layout/Container";
import { HeroStrip } from "@/components/dashboard/HeroStrip";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { TraitInsightCard } from "@/components/dashboard/TraitInsightCard";
import { RightColumn } from "@/components/dashboard/RightColumn";
import { HealthCheck } from "@/components/HealthCheck";
import { mockDashboard } from "@/lib/mock-dashboard";

export default function Home() {
  const d = mockDashboard;

  return (
    <>
      <TopNav />
      <main>
        <Container className="py-6">
          <HeroStrip userName={d.userName} />

          <QuickActions />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-display text-[18px]">Your Big Five - explained</h2>
                <a href="/analyzer" className="text-accent text-[13px] font-semibold hover:underline">See full breakdown</a>
              </div>
              {d.traits.map((trait) => (
                <TraitInsightCard key={trait.name} trait={trait} />
              ))}
            </div>

            <div className="lg:col-span-5">
              <RightColumn streakDays={d.streakDays} recs={d.recommendations} />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[color:var(--color-border-subtle)] flex justify-center">
            <HealthCheck />
          </div>
        </Container>
      </main>
    </>
  );
}
