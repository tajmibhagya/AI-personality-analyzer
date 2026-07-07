import { Container } from "@/components/layout/Container";
import { SideQuickActions } from "@/components/dashboard/SideQuickActions";

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
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
