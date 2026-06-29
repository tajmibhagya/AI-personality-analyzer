import { Container } from "@/components/layout/Container";

export function Footer() {
  return (
    <footer className="mt-12 border-t border-[color:var(--color-border-subtle)] bg-bg">
      <Container className="py-5 flex items-center justify-center text-[12.5px] text-faint">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-[5px] bg-accent flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#022]"><path d="M12 2l2.2 5.6L20 9l-5 4.3L16.5 20 12 16.5 7.5 20 9 13.3 4 9l5.8-1.4Z" /></svg>
          </div>
          <span>MindProfile AI - Build your personality </span>
        </div>
      </Container>
    </footer>
  );
}
