import { TopNav } from "@/components/nav/TopNav";
import { Container } from "@/components/layout/Container";

export default function UploadPage() {
  return (
    <>
      <TopNav />
      <main>
        <Container className="py-12">
          <h1 className="font-display text-4xl">Upload</h1>
          <p className="text-muted mt-3">
            Coming in Phase N6 — PDF / URL / text upload for life advice.
          </p>
        </Container>
      </main>
    </>
  );
}