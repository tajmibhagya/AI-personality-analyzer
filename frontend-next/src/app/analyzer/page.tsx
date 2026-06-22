import { TopNav } from "@/components/nav/TopNav";
import { Container } from "@/components/layout/Container";
import { TraitBars } from "@/components/dashboard/TraitBars";
import { mockDashboard } from "@/lib/mock-dashboard";

export default function AnalyzerPage() {
  const d = mockDashboard;

  return (
    <>
      <TopNav />
      <main>
        <Container className="py-8">
          <div className="mb-6">
            <h1 className="font-display text-[32px] leading-tight">
              Analyzer
            </h1>
            <p className="text-muted text-[15px] mt-1.5">
              Your Big Five scores at a glance. In Phase N4 you&apos;ll be
              able to paste new text and get an updated analysis here.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7">
              <TraitBars traits={d.traits} topTrait={d.topTrait} />
            </div>
            <div className="lg:col-span-5">
              <div className="bg-surface border border-[color:var(--color-border-subtle)] rounded-[18px] p-5">
                <h2 className="font-display text-[16px] mb-2">
                  What&apos;s coming
                </h2>
                <p className="text-muted text-[13.5px] leading-relaxed">
                  In Phase N4, this page will include:
                </p>
                <ul className="text-muted text-[13.5px] mt-3 space-y-2 list-disc list-inside">
                  <li>A text input to paste new writing</li>
                  <li>A radar chart visualization of your traits</li>
                  <li>Emotional tone analysis below the radar</li>
                  <li>A history of past analyses</li>
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}