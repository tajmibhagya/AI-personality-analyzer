"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type NavTabProps = {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  hasMenu?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
};

export function NavTab({
  label,
  icon,
  active = false,
  hasMenu = false,
  onClick,
  onMouseEnter,
}: NavTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "flex items-center gap-2 px-3.5 py-2 rounded-[11px]",
        "text-sm font-semibold whitespace-nowrap",
        "transition-colors duration-150",
        active
          ? "bg-accent-soft text-accent"
          : "text-muted hover:bg-surface-2 hover:text-text"
      )}
    >
      {icon && (
        <span className="w-[18px] h-[18px] flex items-center justify-center">
          {icon}
        </span>
      )}
      <span>{label}</span>
      {hasMenu && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      )}
    </button>
  );
}