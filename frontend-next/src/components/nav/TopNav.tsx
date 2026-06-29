"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BrandBlock } from "@/components/nav/BrandBlock";
import { NavTab } from "@/components/nav/NavTab";
import { MegaMenu } from "@/components/nav/MegaMenu";
import { ThemeToggle } from "@/components/nav/ThemeToggle";
import { Container } from "@/components/layout/Container";

const tabs = [
  { label: "Home", href: "/" },
  { label: "Analyzer", href: "/analyzer", hasMegaMenu: true },
  { label: "Upload", href: "/upload" },
  { label: "Recommendations", href: "/recommendations" },
  { label: "Community", href: "/community" },
];

export function TopNav() {
  const pathname = usePathname();
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-lg border-b border-[color:var(--color-border-subtle)]">
      <Container className="py-3 flex items-center justify-between gap-3">
        <BrandBlock />

        <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-2xl">
          {tabs.map((tab) => (
            <div key={tab.href} className="relative" onMouseEnter={() => tab.hasMegaMenu && setMegaOpen(true)} onMouseLeave={() => tab.hasMegaMenu && setMegaOpen(false)}>
              <NavTab href={tab.href} active={isActive(tab.href)} hasDropdown={tab.hasMegaMenu}>{tab.label}</NavTab>
              {tab.hasMegaMenu && megaOpen ? <MegaMenu /> : null}
            </div>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2.5">
          <div className="relative">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input type="search" placeholder="Search insights..." className="pl-9 pr-3 py-2 bg-surface border border-[color:var(--color-border-subtle)] rounded-[10px] text-[13px] text-text placeholder:text-faint outline-none focus:border-accent transition-colors w-[200px]" />
          </div>
          <ThemeToggle />
          <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-[13px]">P</div>
        </div>

        <button type="button" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu" className="lg:hidden p-2 rounded-[10px] hover:bg-surface text-text">
          {mobileOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
          )}
        </button>
      </Container>

      {mobileOpen ? (
        <div className="lg:hidden border-t border-[color:var(--color-border-subtle)] bg-bg">
          <Container className="py-3">
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => (
                <Link key={tab.href} href={tab.href} onClick={() => setMobileOpen(false)} className={"px-3 py-2.5 rounded-[10px] text-[14px] font-semibold transition-colors " + (isActive(tab.href) ? "bg-accent-soft text-accent" : "text-text hover:bg-surface")}>{tab.label}</Link>
              ))}
            </nav>
            <div className="mt-3 pt-3 border-t border-[color:var(--color-border-subtle)] flex items-center justify-between">
              <ThemeToggle />
              <div className="w-9 h-9 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-[13px]">P</div>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
