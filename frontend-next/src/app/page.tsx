import { Button } from "@/components/ui/button";
import { HealthCheck } from "@/components/HealthCheck";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-2xl">
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
    </main>
  );
}