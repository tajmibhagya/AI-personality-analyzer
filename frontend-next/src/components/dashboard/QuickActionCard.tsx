"use client";

import { cn } from "@/lib/utils";

type QuickActionCardProps = {
  title: string;
  subtitle: string;
  iconPath: string;
  href?: string;
  onClick?: () => void;
};

export function QuickActionCard({
  title,
  subtitle,
  iconPath,
  onClick,
}: QuickActionCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group text-left",
        "bg-surface border border-[color:var(--color-border-subtle)]",
        "rounded-[14px] p-4",
        "transition-all duration-150",
        "hover:bg-surface-2 hover:-translate-y-0.5",
        "active:translate-y-0",
        "flex flex-col gap-3 min-h-[120px]"
      )}
    >
      <div className="w-10 h-10 rounded-[10px] bg-accent-soft flex items-center justify-center flex-none">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-accent"
        >
          <path d={iconPath} />
        </svg>
      </div>

      <div>
        <div className="font-display text-[15px] font-bold leading-tight">
          {title}
        </div>
        <div className="text-muted text-[12.5px] mt-1 leading-snug">
          {subtitle}
        </div>
      </div>
    </button>
  );
}