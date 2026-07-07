import { Container } from "@/components/layout/Container";
import { SideQuickActions } from "@/components/dashboard/SideQuickActions";

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <header className="bg-surface border-b border-[color:var(--color-border-subtle)] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-accent flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#022]"><path d="M12 2l2.2 5.6L20 9l-5 4.3L16.5 20 12 16.5 7.5 20 9 13.3 4 9l5.8-1.4Z" /></svg>
            </div>
            <div>
              <div className="font-display text-[16px] font-bold text-text">MindProfile AI</div>
              <div className="text-faint text-[11px]">Let's release your inner mind</div>
            </div>
          </div>
        </header>
        <main>
        <Container className="py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <aside className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
              <SideQuickActions />
            </aside>

            <div className="lg:col-span-9">
              {children}
            </div>
          </div>
        </Container>
      </main>
    </>
  );
}
