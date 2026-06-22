"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandBlock } from "./BrandBlock";
import { NavTab } from "./NavTab";
import { MegaMenu } from "./MegaMenu";
import { ThemeToggle } from "./ThemeToggle";

const HomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.8 12 3l9 6.8V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.2L18 9l-4.5 1.8L12 15l-1.5-4.2L6 9l4.5-1.8Z" />
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 15V4m0 0L8 8m4-4 4 4M5 20h14" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12l2 2 4.5-4.5M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z" />
  </svg>
);

const PeopleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm11 9v-1a4 4 0 0 0-3-3.9M16 4.1A3.5 3.5 0 0 1 16 11" />
  </svg>
);

type TabKey = "Home" | "Analyzer" | "Upload" | "Recommendations" | "Community";

const tabs: Array<{
  key: TabKey;
  label: string;
  href: string;
  icon: React.ReactNode;
  hasMenu?: boolean;
}> = [
  { key: "Home", label: "Home", href: "/", icon: <HomeIcon /> },
  { key: "Analyzer", label: "Analyzer", href: "/analyzer", icon: <SparkleIcon />, hasMenu: true },
  { key: "Upload", label: "Upload", href: "/upload", icon: <UploadIcon /> },
  { key: "Recommendations", label: "Recommendations", href: "/recommendations", icon: <CheckCircleIcon /> },
  { key: "Community", label: "Community", href: "/community", icon: <PeopleIcon /> },
];

export function TopNav() {
  const pathname = usePathname();
  const [megaOpen, setMegaOpen] = useState(false);

  const isTabActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-bg/85 backdrop-blur-lg border-b border-[color:var(--color-border-subtle)]">
      <div className="max-w-[1340px] mx-auto flex items-center gap-5 px-7 py-3">
        <BrandBlock />

        <nav
          className="flex-1 flex justify-center items-center gap-1 relative"
          onMouseLeave={() => setMegaOpen(false)}
        >
          {tabs.map((t) => (
            <Link key={t.key} href={t.href}>
              <NavTab
                label={t.label}
                icon={t.icon}
                hasMenu={t.hasMenu}
                active={isTabActive(t.href)}
                onMouseEnter={() => setMegaOpen(t.hasMenu === true)}
              />
            </Link>
          ))}

          {megaOpen && (
            <MegaMenu
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            />
          )}
        </nav>

        <div className="flex items-center gap-3 flex-none">
          <div className="flex items-center gap-2 bg-surface-2 border border-[color:var(--color-border-subtle)] rounded-[11px] px-3 py-2 w-[210px]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted flex-none">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              placeholder="Search insights..."
              className="bg-transparent outline-none text-[13px] text-text placeholder:text-faint flex-1 min-w-0"
            />
          </div>

          <ThemeToggle />

          <button
            type="button"
            className="w-9 h-9 rounded-full bg-accent text-[#022] font-bold text-sm flex items-center justify-center flex-none hover:opacity-90 transition-opacity"
            aria-label="User menu"
          >
            P
          </button>
        </div>
      </div>
    </header>
  );
}