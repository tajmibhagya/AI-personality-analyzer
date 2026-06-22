import { Button } from "@/components/ui/button";
import { HealthCheck } from "@/components/HealthCheck";
import { TopNav } from "@/components/nav/TopNav";
import { Container } from "@/components/layout/Container";

export default function Home() {
  return (
    <>
      <TopNav />
      <main>
        <Container className="py-12">
          <div className="text-center space-y-6 max-w-2xl mx-auto">
            <h1 className="font-display text-6xl">MindProfile AI</h1>
            <p className="text-muted text-lg">
              Big Five personality from your writing, plus personality-aware
              recommendations and reflections.
            </p>
            <div className="flex justify-center">
              <HealthCheck />
            </div>
            <div className="pt-4">
              <Button size="lg">Get Started</Button>
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}