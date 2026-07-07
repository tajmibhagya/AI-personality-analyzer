"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type NavTabProps = {
  href: string;
  active?: boolean;
  hasDropdown?: boolean;
  children: ReactNode;
};

export function NavTab({ href, active = false, hasDropdown = false, children }: NavTabProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-1.5 px-3.5 py-2 rounded-[11px] text-[13.5px] font-semibold whitespace-nowrap transition-colors duration-150", active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-text")}>
      {children}
      {hasDropdown ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
      ) : null}
    </Link>
  );
}
