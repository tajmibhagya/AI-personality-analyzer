import { TopNav } from "@/components/nav/TopNav";
import { Container } from "@/components/layout/Container";

export default function RecommendationsPage() {
  return (
    <>
      <TopNav />
      <main>
        <Container className="py-12">
          <h1 className="font-display text-4xl">Recommendations</h1>
          <p className="text-muted mt-3">
            Coming in Phase N5 — books, films, music, and activities tuned to
            your personality.
          </p>
        </Container>
      </main>
    </>
  );
}