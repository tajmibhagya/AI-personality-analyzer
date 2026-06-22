import { TopNav } from "@/components/nav/TopNav";
import { Container } from "@/components/layout/Container";

export default function AnalyzerPage() {
  return (
    <>
      <TopNav />
      <main>
        <Container className="py-12">
          <h1 className="font-display text-4xl">Analyzer</h1>
          <p className="text-muted mt-3">
            Coming in Phase N4 — text input + Big Five analysis.
          </p>
        </Container>
      </main>
    </>
  );
}