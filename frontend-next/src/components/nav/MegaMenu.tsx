"use client";

import { cn } from "@/lib/utils";

type MenuItem = {
  label: string;
  iconPath: string;
  isNew?: boolean;
};

const analyzeItems: MenuItem[] = [
  {
    label: "Personality Test",
    iconPath:
      "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11",
  },
  {
    label: "Writing Analysis",
    iconPath: "M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z",
  },
  {
    label: "Behavior Analysis",
    iconPath: "M3 3v18h18M7 14l3-3 3 3 5-6",
  },
  {
    label: "Voice Analysis",
    iconPath:
      "M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3ZM5 11a7 7 0 0 0 14 0M12 18v3",
    isNew: true,
  },
];

const discoverItems: MenuItem[] = [
  {
    label: "Career Match",
    iconPath:
      "M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2ZM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  },
  {
    label: "Skill Suggestions",
    iconPath:
      "M12 2l2.2 5.6L20 9l-5 4.3L16.5 20 12 16.5 7.5 20 9 13.3 4 9l5.8-1.4Z",
  },
  {
    label: "Growth Journey",
    iconPath: "M3 17l6-6 4 4 8-8M21 7v6M21 7h-6",
  },
  {
    label: "Compare Profiles",
    iconPath: "M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7",
  },
];

const insightsItems: MenuItem[] = [
  {
    label: "Personality Insights",
    iconPath:
      "M9.7 18h4.6M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.2 1 2V18h6v-1.3c0-.8.4-1.5 1-2A7 7 0 0 0 12 2Z",
  },
  {
    label: "Strengths & Gaps",
    iconPath: "M22 11.1V12a10 10 0 1 1-5.9-9.1M22 4 12 14.01l-3-3",
  },
  {
    label: "Emotional Tone",
    iconPath:
      "M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18Z",
  },
  {
    label: "Communication Style",
    iconPath: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z",
  },
];

function MenuLink({ item }: { item: MenuItem }) {
  return (
    <a
      href="#"
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-[10px]",
        "text-[13.5px] font-medium text-text",
        "hover:bg-surface-2 transition-colors"
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted flex-none"
      >
        <path d={item.iconPath} />
      </svg>
      <span>{item.label}</span>
      {item.isNew && (
        <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-accent bg-accent-soft px-1.5 py-0.5 rounded">
          New
        </span>
      )}
    </a>
  );
}

function MenuColumn({
  title,
  items,
}: {
  title: string;
  items: MenuItem[];
}) {
  return (
    <div>
      <div className="text-[11px] font-bold tracking-[0.12em] text-faint px-3 mb-2.5 mt-1">
        {title}
      </div>
      <div className="flex flex-col gap-0.5">
        {items.map((item) => (
          <MenuLink key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}

export function MegaMenu({
  onMouseEnter,
  onMouseLeave,
}: {
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "absolute top-[54px] left-1/2 -translate-x-1/2",
        "w-[920px] bg-elevated rounded-[18px] p-6",
        "border border-[color:var(--color-border-subtle)]",
        "z-[60]",
        "grid grid-cols-[1fr_1fr_1fr_1.15fr] gap-2"
      )}
      style={{
        boxShadow: "var(--shadow-mega)",
        animation: "mpfade 0.16s ease",
      }}
    >
      <MenuColumn title="ANALYZE" items={analyzeItems} />
      <MenuColumn title="DISCOVER" items={discoverItems} />
      <MenuColumn title="INSIGHTS" items={insightsItems} />

      <div className="bg-accent rounded-[14px] p-5 flex flex-col justify-between text-[#04201f]">
        <div>
          <div className="font-display font-bold text-base text-[#022]">
            Get your AI report
          </div>
          <div className="text-[13px] leading-snug mt-2 text-[rgba(2,40,38,0.78)]">
            Your complete personality breakdown as a shareable PDF.
          </div>
        </div>
        <button
          type="button"
          className="self-start mt-4 px-4 py-2 bg-[#022] text-accent rounded-[10px] text-[13px] font-semibold hover:opacity-90 transition-opacity"
        >
          Download report
        </button>
      </div>
    </div>
  );
}