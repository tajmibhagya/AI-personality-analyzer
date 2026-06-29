"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type SideAction = {
  href: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
};

const actions: SideAction[] = [
  {
    href: "/",
    label: "People",
    subtitle: "Back to dashboard",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    href: "/analyzer",
    label: "Take Test",
    subtitle: "Analyze your personality",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
  },
  {
    href: "/upload",
    label: "Upload CV",
    subtitle: "Get AI insights",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>,
  },
  {
    href: "/recommendations",
    label: "Recommendations",
    subtitle: "Personalized for you",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.2 5.6L20 9l-5 4.3L16.5 20 12 16.5 7.5 20 9 13.3 4 9l5.8-1.4Z" /></svg>,
  },
  {
    href: "/discover",
    label: "Discover",
    subtitle: "Streak, picks, and your report",
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" /></svg>,
  },
];

export function SideQuickActions() {
  const pathname = usePathname();

  return (
    <div className="space-y-3">
      {actions.map((a) => {
        const isActive = pathname === a.href;
        return (
          <Link key={a.href} href={a.href} className={"block rounded-[16px] p-4 transition-all hover:-translate-y-0.5 group " + (isActive ? "bg-accent-soft border border-[color:var(--color-accent)]/40" : "bg-surface border border-[color:var(--color-border-subtle)] hover:border-[color:var(--color-accent)]/40 hover:bg-surface-2")}>
            <div className={"w-10 h-10 rounded-[10px] flex items-center justify-center mb-3 " + (isActive ? "bg-accent text-[#022]" : "bg-accent-soft text-accent")}>{a.icon}</div>
            <div className={"font-display text-[15px] mb-0.5 " + (isActive ? "text-accent" : "text-text group-hover:text-accent transition-colors")}>{a.label}</div>
            <div className="text-muted text-[12px]">{a.subtitle}</div>
          </Link>
        );
      })}
    </div>
  );
}
